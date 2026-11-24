import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { notifyStatus } from "../../../../lib/notify";
import { getRequest, updateRequest } from "../../../../lib/requests";
import { orderUrl, siteUrl } from "../../../../lib/site";
import { STATUSES, transitionError, type RequestStatus } from "../../../../lib/status";
import { getUserById, publicUser } from "../../../../lib/users";

const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

// Move an order to a new status, optionally with a note (e.g. a tracking number). The customer is emailed.
// "paid" can only be set by Paystack, or here with offline: true to record a bank transfer.
export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;
  try {
    const { id, status, note, offline } = await request.json();
    if (typeof id !== "string" || !STATUSES.includes(status as RequestStatus)) return fail("Invalid order or status.");
    if (status === "paid" && offline !== true) return fail("Paid is set by Paystack. Use the bank-transfer button to record an offline payment.");
    const cleanNote = typeof note === "string" ? note.trim().slice(0, 300) : "";

    const existing = await getRequest(id);
    if (!existing) return fail("Order not found.", 404);
    const problem = transitionError(existing, status as RequestStatus);
    if (problem) return fail(problem, 409);

    const to = status as RequestStatus;
    const updated = await updateRequest(
      id,
      to === "paid"
        ? { status: to, paidAt: new Date().toISOString(), note: cleanNote || "Paid by bank transfer" }
        : { status: to, note: cleanNote }
    );
    if (!updated) return fail("Order not found.", 404);

    if (to !== existing.status) {
      const owner = await getUserById(updated.userId);
      if (owner) await notifyStatus(updated, publicUser(owner), to, cleanNote || undefined, orderUrl(siteUrl(request), updated.id));
    }
    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Admin update error:", error);
    return fail("Failed to update the order.", 500);
  }
}
