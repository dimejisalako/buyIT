import { NextResponse } from "next/server";
import { validSignature, verifyTransaction, type PaystackTxn } from "../../../../lib/paystack";
import { settlePayment } from "../../../../lib/payments";

export async function POST(request: Request) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(raw) as { event: string; data: PaystackTxn };
    if (event.event === "charge.success") {
      // Re-verify with Paystack rather than trusting the payload alone.
      const txn = await verifyTransaction(event.data.reference);
      await settlePayment(txn, request);
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 }); // Paystack will retry
  }
  return NextResponse.json({ received: true });
}
