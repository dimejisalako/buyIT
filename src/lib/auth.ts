import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redis } from "./redis";
import { getUserById, publicUser, type PublicUser } from "./users";

export const COOKIE = "sb_session";
const TTL_SECONDS = 60 * 60 * 24 * 30;

const sessionKey = (token: string) => "shopbrow:session:" + createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string, sv: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await redis().set(sessionKey(token), userId + "|" + sv, { ex: TTL_SECONDS });
  return token;
}

export function withSessionCookie(res: NextResponse, token: string): NextResponse {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
  return res;
}

export function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

export async function destroyCurrentSession(): Promise<void> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (token) await redis().del(sessionKey(token));
}

// The signed-in user for this request, or null. Never throws (e.g. if Redis is unreachable).
export async function getCurrentUser(): Promise<PublicUser | null> {
  // Read cookies outside the try/catch: Next signals "this page is dynamic" by throwing from here.
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const value = await redis().get<string>(sessionKey(token));
    if (!value) return null;
    const [userId, sv] = String(value).split("|");
    const user = await getUserById(userId);
    if (!user || String(user.sv) !== sv) return null;
    return publicUser(user);
  } catch (error) {
    console.error("[auth] session lookup failed:", error);
    return null;
  }
}

// Blocks cross-site form posts: if the browser sent an Origin, it must match our host.
export function sameOrigin(request: Request): boolean {
  if (request.method === "GET" || request.method === "HEAD") return true;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (request.headers.get("host") ?? new URL(request.url).host);
  } catch {
    return false;
  }
}

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

export async function requireUser(request: Request): Promise<PublicUser | NextResponse> {
  if (!sameOrigin(request)) return fail("Forbidden", 403);
  const user = await getCurrentUser();
  return user ?? fail("Please log in.", 401);
}

export async function requireAdmin(request: Request): Promise<PublicUser | NextResponse> {
  const user = await requireUser(request);
  if (user instanceof NextResponse) return user;
  return user.role === "admin" ? user : fail("Forbidden", 403);
}

export function secretMatches(provided: string | undefined | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Only allow redirects to paths on this site.
export const safeNext = (next: string | undefined | null, fallback = "/account") =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;

export const clientIp = (request: Request) =>
  (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
