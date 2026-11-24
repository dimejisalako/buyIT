import { NextResponse } from "next/server";
import { clientIp, createSession, sameOrigin, secretMatches, withSessionCookie } from "../../../../lib/auth";
import { PASSWORD_MAX, PASSWORD_MIN } from "../../../../lib/password";
import { rateLimited } from "../../../../lib/redis";
import { createUser, getUserByEmail, isEmail, normalizeEmail, setPassword } from "../../../../lib/users";

const bad = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

// Creates the admin account (or resets its password) using the ADMIN_KEY secret from the host's settings.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return bad("Forbidden", 403);
  try {
    if (!process.env.ADMIN_KEY) return bad("Admin setup is disabled. Set ADMIN_KEY on the server first.", 503);
    if (await rateLimited("admin-setup:" + clientIp(request), 5, 3600)) return bad("Too many attempts. Try again later.", 429);

    const body = await request.json();
    if (!secretMatches(String(body.adminKey ?? ""), process.env.ADMIN_KEY)) return bad("That admin key is not correct.", 403);

    const name = String(body.name ?? "").trim() || "Admin";
    const email = normalizeEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");
    if (!isEmail(email)) return bad("Please enter a valid email address.");
    if (password.length < PASSWORD_MIN) return bad("The password must be at least " + PASSWORD_MIN + " characters.");
    if (password.length > PASSWORD_MAX) return bad("That password is too long.");

    const existing = await getUserByEmail(email);
    const user = existing
      ? await setPassword(existing.id, password, "admin")
      : await createUser({ name, email, password, role: "admin", phone: String(body.phone ?? "") });
    if (!user) return bad("Couldn't create the admin account.", 500);

    const token = await createSession(user.id, user.sv);
    return withSessionCookie(NextResponse.json({ success: true }), token);
  } catch (error) {
    console.error("Admin setup error:", error);
    return bad("Something went wrong. Please try again.", 500);
  }
}
