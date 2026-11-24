import { randomBytes } from "crypto";
import { redis } from "./redis";
import type { Quote } from "./quote";
import type { RequestStatus } from "./status";

export { STATUSES } from "./status";
export type { RequestStatus } from "./status";

export interface OrderEvent {
  status: RequestStatus;
  at: string;
  note?: string; // shown to the customer, e.g. a carrier and tracking number
}

export interface ProductRequest {
  id: string;
  userId: string;
  title: string;
  asin: string;
  url: string;
  note?: string;
  quote?: Quote; // set by the admin once they have checked the item
  status: RequestStatus;
  paymentRef?: string;
  paidAt?: string;
  events: OrderEvent[];
  createdAt: string;
  updatedAt: string;
}

const KEY = "shopbrow:requests";

export async function addRequest(
  data: Pick<ProductRequest, "userId" | "title" | "asin" | "url" | "note">
): Promise<ProductRequest> {
  const now = new Date().toISOString();
  const req: ProductRequest = {
    ...data,
    id: "req_" + Date.now().toString(36) + randomBytes(3).toString("hex"),
    status: "new",
    events: [{ status: "new", at: now }],
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

// Fine at launch scale; add a per-user index when order volume grows.
export async function listRequestsByUser(userId: string): Promise<ProductRequest[]> {
  return (await listRequests()).filter((r) => r.userId === userId);
}

export async function updateRequest(
  id: string,
  patch: Partial<Pick<ProductRequest, "paymentRef" | "paidAt" | "quote" | "title">> & { status?: RequestStatus; note?: string }
): Promise<ProductRequest | null> {
  const existing = await getRequest(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const { note, ...fields } = patch;
  const updated: ProductRequest = { ...existing, ...fields, updatedAt: now };
  if (patch.status && patch.status !== existing.status) {
    updated.events = [...existing.events, { status: patch.status, at: now, note: note?.trim() || undefined }];
  } else if (note?.trim()) {
    updated.events = [...existing.events, { status: existing.status, at: now, note: note.trim() }];
  }
  await redis().hset(KEY, { [id]: updated });
  return updated;
}
