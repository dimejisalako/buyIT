import { NextResponse } from "next/server";
import { createSession, requireUser, withSessionCookie } from "../../../../lib/auth";
import { PASSWORD_MAX, PASSWORD_MIN, verifyPassword } from "../../../../lib/password";
import { rateLimited } from "../../../../lib/redis";
import { getUserById, setPassword } from "../../../../lib/users";

const bad = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

// Change your own password. Signs out every other device and keeps this one signed in.
export async function POST(request: Request) {
  const me = await requireUser(request);
  if (me instanceof NextResponse) return me;
  try {
    const body = await request.json();
    const current = String(body.current ?? "");
    const next = String(body.next ?? "");
    if (next.length < PASSWORD_MIN) return bad("Your new password must be at least " + PASSWORD_MIN + " characters.");
    if (next.length > PASSWORD_MAX) return bad("That password is too long.");
    if (await rateLimited("pwchange:" + me.id, 10, 900)) return bad("Too many attempts. Please try again later.", 429);

    const user = await getUserById(me.id);
    if (!user || !(await verifyPassword(current, user.passwordHash))) return bad("Your current password is incorrect.", 403);

    const updated = await setPassword(user.id, next);
    if (!updated) return bad("Something went wrong.", 500);
    const token = await createSession(updated.id, updated.sv);
    return withSessionCookie(NextResponse.json({ success: true }), token);
  } catch (error) {
    console.error("Password change error:", error);
    return bad("Something went wrong. Please try again.", 500);
  }
}
