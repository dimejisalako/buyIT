import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/adminAuth";
import { getRequest, listRequests, updateRequest, STATUSES, type RequestStatus } from "../../../../lib/requests";
import { notifyStatus } from "../../../../lib/notify";
import { siteUrl, trackUrl } from "../../../../lib/site";

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

// Changing status emails the customer. "paid" can only be set by a verified payment, never by hand
// here, except when an admin records an offline payment (e.g. bank transfer) with offline: true.
export async function PATCH(request: Request) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const { id, status, offline } = await request.json();
    if (typeof id !== "string" || !STATUSES.includes(status as RequestStatus)) {
      return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
    }
    if (status === "paid" && offline !== true) {
      return NextResponse.json({ error: "Paid is set by Paystack. Pass offline: true to record a bank transfer." }, { status: 400 });
    }
    const existing = await getRequest(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.status === status) return NextResponse.json({ success: true, request: existing });

    const updated = await updateRequest(id, status === "paid" ? { status, paidAt: new Date().toISOString() } : { status });
    if (updated) await notifyStatus(updated, status, trackUrl(siteUrl(request), updated.id, updated.token));
    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
