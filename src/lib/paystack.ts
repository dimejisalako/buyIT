import { createHmac, timingSafeEqual } from "crypto";

const API = process.env.PAYSTACK_API_URL || "https://api.paystack.co";
const secret = () => process.env.PAYSTACK_SECRET_KEY;
export const paymentsEnabled = () => Boolean(secret());

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!res.ok || !json.status) throw new Error(json.message || `Paystack error ${res.status}`);
  return json.data as T;
}

export interface PaystackTxn {
  status: string;
  reference: string;
  amount: number; // kobo
  currency: string;
  metadata?: { requestId?: string } | null;
}

export const initializeTransaction = (p: {
  email: string; amountKobo: number; reference: string; callbackUrl: string; requestId: string;
}) =>
  call<{ authorization_url: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: p.email,
      amount: p.amountKobo,
      currency: "NGN",
      reference: p.reference,
      callback_url: p.callbackUrl,
      metadata: { requestId: p.requestId },
    }),
  });

export const verifyTransaction = (reference: string) =>
  call<PaystackTxn>(`/transaction/verify/${encodeURIComponent(reference)}`);

export function validSignature(rawBody: string, signature: string | null): boolean {
  const key = secret();
  if (!key || !signature) return false;
  const expected = createHmac("sha512", key).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
