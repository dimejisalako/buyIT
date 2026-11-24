import { NextResponse } from "next/server";
import { clearSessionCookie, destroyCurrentSession, sameOrigin } from "../../../../lib/auth";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  try {
    await destroyCurrentSession();
  } catch (error) {
    console.error("Logout error:", error);
  }
  return clearSessionCookie(NextResponse.json({ success: true }));
}
