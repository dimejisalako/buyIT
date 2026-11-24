import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { notifyStatus } from "../../../../lib/notify";
import { buildQuote } from "../../../../lib/quote";
import { getRequest, updateRequest } from "../../../../lib/requests";
import { orderUrl, siteUrl } from "../../../../lib/site";
import { STATUSES, transitionError, type RequestStatus } from "../../../../lib/status";
import { getUserById, publicUser } from "../../../../lib/users";

const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

// Move an order to a new status, optionally with a note (e.g. a tracking number). The customer is emailed.
// To quote, send `details` (item name, price, weight, quantity) together with status "quoted":
// the total is worked out on the server. While an order is unpaid, sending details again re-quotes it.
// "paid" can only be set by Paystack, or here with offline: true to record a bank transfer.
export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;
  try {
    const { id, status, note, offline, details } = await request.json();
    if (typeof id !== "string" || !STATUSES.includes(status as RequestStatus)) return fail("Invalid order or status.");
    if (status === "paid" && offline !== true) return fail("Paid is set by Paystack. Use the bank-transfer button to record an offline payment.");
    const cleanNote = typeof note === "string" ? note.trim().slice(0, 300) : "";

    const existing = await getRequest(id);
    if (!existing) return fail("Order not found.", 404);
    const to = status as RequestStatus;

    // Item details from the admin -> a fresh quote.
    let quote = existing.quote;
    let title = existing.title;
    if (details) {
      if (existing.paidAt) return fail("This order is already paid, so its quote can't be changed.", 409);
      const price = Number(details.priceUsd);
      const weight = Number(details.weightLb);
      const quantity = Number(details.quantity ?? 1);
      const name = String(details.title ?? "").trim();
      if (name.length < 2 || name.length > 120) return fail("Please enter the item name.");
      if (!(price > 0 && price < 10000)) return fail("Please enter the item price in USD.");
      if (!(weight > 0 && weight < 150)) return fail("Please enter the weight in pounds.");
      if (!(Number.isInteger(quantity) && quantity >= 1 && quantity <= 20)) return fail("Quantity must be between 1 and 20.");
      quote = buildQuote({ itemPriceUsd: price, weightLb: weight, quantity });
      title = name;
    }

    const problem = transitionError({ status: existing.status, paidAt: existing.paidAt, hasQuote: !!quote }, to);
    if (problem) return fail(problem, 409);

    const base = details ? { quote, title } : {};
    const updated = await updateRequest(
      id,
      to === "paid"
        ? { ...base, status: to, paidAt: new Date().toISOString(), note: cleanNote || "Paid by bank transfer" }
        : { ...base, status: to, note: cleanNote }
    );
    if (!updated) return fail("Order not found.", 404);

    // Email on a status change, or when an already-sent quote is revised.
    if (to !== existing.status || (details && to === "quoted")) {
      const owner = await getUserById(updated.userId);
      if (owner) {
        await notifyStatus(updated, publicUser(owner), to, cleanNote || (details && to === "quoted" && existing.status === "quoted" ? "Your quote was updated." : undefined), orderUrl(siteUrl(request), updated.id));
      }
    }
    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Admin update error:", error);
    return fail("Failed to update the order.", 500);
  }
}
