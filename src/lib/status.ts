// Shared by server and client: no server-only imports here.
export type RequestStatus =
  | "new"
  | "quoted"
  | "paid"
  | "purchased"
  | "received"
  | "shipped"
  | "arrived"
  | "delivered"
  | "rejected";

export const STATUSES: RequestStatus[] = [
  "new",
  "quoted",
  "paid",
  "purchased",
  "received",
  "shipped",
  "arrived",
  "delivered",
  "rejected",
];

// The happy path, in order.
export const TIMELINE: RequestStatus[] = STATUSES.filter((s) => s !== "rejected");

// What the customer sees.
export const STATUS_LABEL: Record<RequestStatus, string> = {
  new: "Under review",
  quoted: "Ready to pay",
  paid: "Payment received",
  purchased: "Ordered from Amazon",
  received: "Arrived at our US address",
  shipped: "On its way to Nigeria",
  arrived: "Arrived in Nigeria",
  delivered: "Delivered",
  rejected: "Couldn't be fulfilled",
};

// What the admin's button says to move an order INTO that status.
export const ACTION_LABEL: Record<RequestStatus, string> = {
  new: "Reopen",
  quoted: "Send quote",
  paid: "Mark payment received",
  purchased: "Mark purchased",
  received: "Mark received in US",
  shipped: "Mark shipped",
  arrived: "Mark arrived in Nigeria",
  delivered: "Mark delivered",
  rejected: "Reject",
};

export const POST_PAYMENT: RequestStatus[] = ["purchased", "received", "shipped", "arrived", "delivered"];

export const nextStatus = (s: RequestStatus): RequestStatus | null => {
  const i = TIMELINE.indexOf(s);
  return i >= 0 && i < TIMELINE.length - 1 ? TIMELINE[i + 1] : null;
};

// Rules for admin-driven status changes. Payment is only ever set by Paystack or an explicit offline payment.
// Returns an error message, or null if the move is allowed.
export function transitionError(req: { status: RequestStatus; paidAt?: string }, to: RequestStatus): string | null {
  if (to === req.status) return null; // same status: just adds a note
  if (to === "rejected") return null;
  if (to === "new") return "A request can't go back to under review.";
  if (to === "quoted") return req.status === "new" || req.status === "rejected" ? null : "Only a new request can be quoted.";
  if (to === "paid") return req.status === "quoted" ? null : "Only a quoted request can be marked paid.";
  if (POST_PAYMENT.includes(to) && !req.paidAt) return "This order hasn't been paid yet.";
  return null;
}
