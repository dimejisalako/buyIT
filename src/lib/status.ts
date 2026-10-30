// Shared by server and client: no server-only imports here.
export type RequestStatus = "new" | "quoted" | "paid" | "purchased" | "shipped" | "delivered" | "rejected";
export const STATUSES: RequestStatus[] = ["new", "quoted", "paid", "purchased", "shipped", "delivered", "rejected"];

export const TIMELINE: RequestStatus[] = ["new", "quoted", "paid", "purchased", "shipped", "delivered"];

export const STATUS_LABEL: Record<RequestStatus, string> = {
  new: "Received",
  quoted: "Ready to pay",
  paid: "Paid",
  purchased: "Ordered from Amazon",
  shipped: "On its way to Nigeria",
  delivered: "Delivered",
  rejected: "Couldn't be fulfilled",
};
