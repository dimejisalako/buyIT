import { claim } from "./redis";
import { getRequest, updateRequest, type ProductRequest } from "./requests";
import { getUserById, publicUser } from "./users";
import { paymentsEnabled, verifyTransaction, type PaystackTxn } from "./paystack";
import { notifyStatus } from "./notify";
import { orderUrl, siteUrl } from "./site";

// Marks a request paid if (and only if) the transaction matches what we quoted. Idempotent.
export async function settlePayment(txn: PaystackTxn, request?: Request): Promise<ProductRequest | null> {
  const id = txn.metadata?.requestId;
  if (txn.status !== "success" || !id) return null;

  const req = await getRequest(id);
  if (!req || req.status !== "quoted" || !req.quote) return req; // already settled, or not payable
  if (txn.reference !== req.paymentRef) return null;
  if (txn.currency !== "NGN" || txn.amount !== req.quote.totalNgn * 100) {
    console.error("[payments] amount mismatch for " + id + ":", txn.amount, txn.currency);
    return null;
  }

  if (!(await claim("paid:" + id))) return getRequest(id); // another call is settling it

  const paid = await updateRequest(id, { status: "paid", paidAt: new Date().toISOString(), note: "Paid online" });
  if (paid) {
    const user = await getUserById(paid.userId);
    if (user) await notifyStatus(paid, publicUser(user), "paid", undefined, orderUrl(siteUrl(request), paid.id));
  }
  return paid;
}

// After the customer returns from Paystack, confirm the payment without waiting for the webhook.
export async function refreshPayment(req: ProductRequest): Promise<ProductRequest> {
  if (req.status !== "quoted" || !req.paymentRef || !paymentsEnabled()) return req;
  try {
    const txn = await verifyTransaction(req.paymentRef);
    return (await settlePayment(txn)) ?? req;
  } catch (error) {
    console.error("[payments] verify error:", error);
    return req;
  }
}
