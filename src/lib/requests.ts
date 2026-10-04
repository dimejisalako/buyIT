import { Redis } from "@upstash/redis";
import { randomBytes, timingSafeEqual } from "crypto";
import type { Quote } from "./quote";
import { STATUSES, type RequestStatus } from "./status";

export { STATUSES };
export type { RequestStatus };

export interface ProductRequest {
  id: string;
  token: string; // secret held by the customer; required for public tracking and payment
  asin: string;
  url: string;
  name: string;
  email: string;
  phone?: string;
  note?: string;
  quote: Quote;
  status: RequestStatus;
  paymentRef?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

let client: Redis | null = null;
const redis = () => (client ??= Redis.fromEnv());

const KEY = "shopbrow:requests";

export async function addRequest(
  data: Omit<ProductRequest, "id" | "token" | "status" | "createdAt" | "updatedAt">
): Promise<ProductRequest> {
  const now = new Date().toISOString();
  const req: ProductRequest = {
    ...data,
    id: `req_${Date.now().toString(36)}${randomBytes(3).toString("hex")}`,
    token: randomBytes(18).toString("hex"),
    status: "new",
    createdAt: now,
    updatedAt: now,
  };
  await redis().hset(KEY, { [req.id]: req });
  return req;
}

export async function getRequest(id: string): Promise<ProductRequest | null> {
  return (await redis().hget<ProductRequest>(KEY, id)) ?? null;
}

export async function listRequests(): Promise<ProductRequest[]> {
  const all = await redis().hgetall<Record<string, ProductRequest>>(KEY);
  return Object.values(all ?? {}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateRequest(
  id: string,
  patch: Partial<Pick<ProductRequest, "status" | "paymentRef" | "paidAt">>
): Promise<ProductRequest | null> {
  const existing = await getRequest(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  await redis().hset(KEY, { [id]: updated });
  return updated;
}

export function tokenMatches(req: ProductRequest, token: string | null | undefined): boolean {
  if (!token) return false;
  const a = Buffer.from(req.token);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Fixed-window rate limit: returns true if the caller is over the limit.
export async function rateLimited(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
  const key = `shopbrow:rl:${bucket}`;
  const n = await redis().incr(key);
  if (n === 1) await redis().expire(key, windowSeconds);
  return n > limit;
}

// Returns true for exactly one caller per key within the window (used to make settlement idempotent).
export async function claim(key: string, seconds = 300): Promise<boolean> {
  return (await redis().set(`shopbrow:claim:${key}`, 1, { nx: true, ex: seconds })) === "OK";
}
