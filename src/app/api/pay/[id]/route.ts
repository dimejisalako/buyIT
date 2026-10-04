import { NextResponse } from "next/server";
import { getRequest, tokenMatches, updateRequest, rateLimited } from "../../../../lib/requests";
import { initializeTransaction, paymentsEnabled } from "../../../../lib/paystack";
import { siteUrl, trackUrl } from "../../../../lib/site";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await request.json().catch(() => ({ t: null }));

  const req = await getRequest(id);
  if (!req || !tokenMatches(req, t)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (req.status !== "quoted") return NextResponse.json({ error: "This request isn't ready for payment." }, { status: 409 });
  if (!paymentsEnabled()) return NextResponse.json({ error: "Online payment isn't available yet. We'll contact you." }, { status: 503 });
  if (await rateLimited(`pay:${id}`, 10, 3600)) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });

  try {
    // A fresh reference per attempt; only the latest one can settle the request.
    const reference = `${req.id}_${Date.now().toString(36)}`;
    const txn = await initializeTransaction({
      email: req.email,
      amountKobo: req.quote.totalNgn * 100,
      reference,
      callbackUrl: trackUrl(siteUrl(request), req.id, req.token),
      requestId: req.id,
    });
    await updateRequest(id, { paymentRef: reference });
    return NextResponse.json({ url: txn.authorization_url });
  } catch (error) {
    console.error("Pay init error:", error);
    return NextResponse.json({ error: "Couldn't start payment. Please try again." }, { status: 502 });
  }
}
