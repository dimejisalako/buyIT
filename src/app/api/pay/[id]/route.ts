import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { initializeTransaction, paymentsEnabled } from "../../../../lib/paystack";
import { rateLimited } from "../../../../lib/redis";
import { getRequest, updateRequest } from "../../../../lib/requests";
import { orderUrl, siteUrl } from "../../../../lib/site";

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  if (user instanceof NextResponse) return user;
  const { id } = await params;

  const req = await getRequest(id);
  if (!req || req.userId !== user.id) return fail("Not found", 404);
  if (req.status !== "quoted" || !req.quote) return fail("This order isn't ready for payment.", 409);
  if (!paymentsEnabled()) return fail("Online payment isn't available yet. Please pay by bank transfer using the details shown.", 503);
  if (await rateLimited("pay:" + id, 10, 3600)) return fail("Too many attempts.", 429);

  try {
    // A fresh reference per attempt; only the latest one can settle the request.
    const reference = req.id + "_" + Date.now().toString(36);
    const txn = await initializeTransaction({
      email: user.email,
      amountKobo: req.quote.totalNgn * 100,
      reference,
      callbackUrl: orderUrl(siteUrl(request), req.id),
      requestId: req.id,
    });
    await updateRequest(id, { paymentRef: reference });
    return NextResponse.json({ success: true, url: txn.authorization_url });
  } catch (error) {
    console.error("Pay init error:", error);
    return fail("Couldn't start payment. Please try again.", 502);
  }
}
