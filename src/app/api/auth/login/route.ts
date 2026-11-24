import { NextResponse } from "next/server";
import { clientIp, createSession, sameOrigin, withSessionCookie } from "../../../../lib/auth";
import { DUMMY_HASH, verifyPassword } from "../../../../lib/password";
import { rateLimited } from "../../../../lib/redis";
import { getUserByEmail, normalizeEmail } from "../../../../lib/users";

const bad = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return bad("Forbidden", 403);
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");
    if (!email || !password || password.length > 200) return bad("Incorrect email or password.", 401);

    // Limit guessing per address and per IP.
    if (
      (await rateLimited("login-ip:" + clientIp(request), 30, 900)) ||
      (await rateLimited("login-email:" + email, 10, 900))
    ) {
      return bad("Too many attempts. Please wait a few minutes and try again.", 429);
    }

    const user = await getUserByEmail(email);
    // Always do the hashing work so timing doesn't reveal whether an email exists.
    const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) return bad("Incorrect email or password.", 401);

    const token = await createSession(user.id, user.sv);
    return withSessionCookie(NextResponse.json({ success: true, role: user.role }), token);
  } catch (error) {
    console.error("Login error:", error);
    return bad("Something went wrong. Please try again.", 500);
  }
}
