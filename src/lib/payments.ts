import { claim, getRequest, updateRequest, type ProductRequest } from "./requests";
import type { PaystackTxn } from "./paystack";
import { notifyStatus } from "./notify";
import { siteUrl, trackUrl } from "./site";

// Marks a request paid if (and only if) the transaction matches what we quoted. Idempotent.
export async function settlePayment(txn: PaystackTxn, request?: Request): Promise<ProductRequest | null> {
  const id = txn.metadata?.requestId;
  if (txn.status !== "success" || !id) return null;

  const req = await getRequest(id);
  if (!req || req.status !== "quoted") return req; // already settled, or not payable
  if (txn.reference !== req.paymentRef) return null;
  if (txn.currency !== "NGN" || txn.amount !== req.quote.totalNgn * 100) {
    console.error(`[payments] amount mismatch for ${id}:`, txn.amount, txn.currency);
    return null;
  }

  if (!(await claim(`paid:${id}`))) return getRequest(id); // another call is settling it

  const paid = await updateRequest(id, { status: "paid", paidAt: new Date().toISOString() });
  if (paid) await notifyStatus(paid, "paid", trackUrl(siteUrl(request), paid.id, paid.token));
  return paid;
}
