import { NextResponse } from "next/server";
import { clientIp, createSession, sameOrigin, withSessionCookie } from "../../../../lib/auth";
import { PASSWORD_MAX, PASSWORD_MIN } from "../../../../lib/password";
import { rateLimited } from "../../../../lib/redis";
import { createUser, isEmail, normalizeEmail } from "../../../../lib/users";

const bad = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return bad("Forbidden", 403);
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = normalizeEmail(String(body.email ?? ""));
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");

    if (name.length < 2 || name.length > 100) return bad("Please enter your full name.");
    if (!isEmail(email)) return bad("Please enter a valid email address.");
    if (phone.replace(/[^\d]/g, "").length < 7 || phone.length > 30) return bad("Please enter a phone number we can reach you on.");
    if (password.length < PASSWORD_MIN) return bad("Your password must be at least " + PASSWORD_MIN + " characters.");
    if (password.length > PASSWORD_MAX) return bad("That password is too long.");

    if (await rateLimited("signup:" + clientIp(request), 10, 3600)) return bad("Too many attempts. Please try again later.", 429);

    const user = await createUser({ name, email, phone, password });
    if (!user) return bad("An account with this email already exists. Try logging in.", 409);

    const token = await createSession(user.id, user.sv);
    return withSessionCookie(NextResponse.json({ success: true, role: user.role }), token);
  } catch (error) {
    console.error("Signup error:", error);
    return bad("Something went wrong. Please try again.", 500);
  }
}
