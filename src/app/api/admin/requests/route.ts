import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/adminAuth";
import { listRequests, setStatus, STATUSES, type RequestStatus } from "../../../../lib/requests";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export async function GET(request: Request) {
  if (!isAdmin(request)) return unauthorized();
  try {
    return NextResponse.json({ success: true, requests: await listRequests() });
  } catch (error) {
    console.error("Admin requests error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const { id, status } = await request.json();
    if (typeof id !== "string" || !STATUSES.includes(status as RequestStatus)) {
      return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
    }
    const updated = await setStatus(id, status);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
