import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../../lib/auth";
import { getUserById, setPassword } from "../../../../../../lib/users";

// Sets a temporary password for a customer who is locked out (there is no email reset yet).
// The password is shown once to the admin, and the customer is signed out everywhere.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;
  const { id } = await params;

  const user = await getUserById(id);
  if (!user) return NextResponse.json({ success: false, error: "Customer not found." }, { status: 404 });
  if (user.role === "admin") return NextResponse.json({ success: false, error: "Admin passwords are reset from the admin setup page." }, { status: 400 });

  const temporary = randomBytes(9).toString("base64url");
  await setPassword(user.id, temporary);
  return NextResponse.json({ success: true, temporaryPassword: temporary });
}
