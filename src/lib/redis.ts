import { Redis } from "@upstash/redis";

let client: Redis | null = null;
export const redis = () => (client ??= Redis.fromEnv());

// Fixed-window rate limit: returns true if the caller is over the limit.
export async function rateLimited(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
  const key = `shopbrow:rl:${bucket}`;
  const n = await redis().incr(key);
  if (n === 1) await redis().expire(key, windowSeconds);
  return n > limit;
}

// Returns true for exactly one caller per key within the window (makes settlement idempotent).
export async function claim(key: string, seconds = 300): Promise<boolean> {
  return (await redis().set(`shopbrow:claim:${key}`, 1, { nx: true, ex: seconds })) === "OK";
}
