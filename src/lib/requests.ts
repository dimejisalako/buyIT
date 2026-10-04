import { Redis } from "@upstash/redis";
import type { Quote } from "./quote";

export type RequestStatus = "new" | "quoted" | "paid" | "purchased" | "shipped" | "delivered" | "rejected";
export const STATUSES: RequestStatus[] = ["new", "quoted", "paid", "purchased", "shipped", "delivered", "rejected"];

export interface ProductRequest {
  id: string;
  asin: string;
  url: string;
  name: string;
  email: string;
  phone?: string;
  note?: string;
  quote: Quote;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

let client: Redis | null = null;
const redis = () => (client ??= Redis.fromEnv());

const KEY = "shopbrow:requests";

export async function addRequest(
  data: Omit<ProductRequest, "id" | "status" | "createdAt" | "updatedAt">
): Promise<ProductRequest> {
  const now = new Date().toISOString();
  const req: ProductRequest = {
    ...data,
    id: `req_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    status: "new",
    createdAt: now,
    updatedAt: now,
  };
  await redis().hset(KEY, { [req.id]: req });
  return req;
}

export async function listRequests(): Promise<ProductRequest[]> {
  const all = await redis().hgetall<Record<string, ProductRequest>>(KEY);
  return Object.values(all ?? {}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setStatus(id: string, status: RequestStatus): Promise<ProductRequest | null> {
  const existing = await redis().hget<ProductRequest>(KEY, id);
  if (!existing) return null;
  const updated = { ...existing, status, updatedAt: new Date().toISOString() };
  await redis().hset(KEY, { [id]: updated });
  return updated;
}

// Fixed-window rate limit: returns true if the caller is over the limit.
export async function rateLimited(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
  const key = `shopbrow:rl:${bucket}`;
  const n = await redis().incr(key);
  if (n === 1) await redis().expire(key, windowSeconds);
  return n > limit;
}
