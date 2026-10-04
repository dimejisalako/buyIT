import { NextResponse } from "next/server";
import { getRequest, tokenMatches } from "../../../../lib/requests";
import { verifyTransaction, paymentsEnabled } from "../../../../lib/paystack";
import { settlePayment } from "../../../../lib/payments";

// Public, token-protected view of one request. Never returns the customer's contact details.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("t");

  let req = await getRequest(id);
  if (!req || !tokenMatches(req, token)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // After returning from Paystack, confirm the payment without waiting for the webhook.
  if (req.status === "quoted" && req.paymentRef && paymentsEnabled()) {
    try {
      const txn = await verifyTransaction(req.paymentRef);
      req = (await settlePayment(txn, request)) ?? req;
    } catch (error) {
      console.error("Verify error:", error);
    }
  }

  return NextResponse.json({
    id: req.id,
    url: req.url,
    status: req.status,
    quote: req.quote,
    paymentsEnabled: paymentsEnabled(),
    createdAt: req.createdAt,
    updatedAt: req.updatedAt,
  });
}
