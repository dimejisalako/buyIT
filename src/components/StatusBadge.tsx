import { STATUS_LABEL, type RequestStatus } from "../lib/status";

const tone: Record<RequestStatus, string> = {
  new: "bg-line text-ink-soft",
  quoted: "bg-amber-100 text-amber-900",
  paid: "bg-sage/10 text-sage-dark",
  purchased: "bg-sage/10 text-sage-dark",
  received: "bg-sage/10 text-sage-dark",
  shipped: "bg-sage/15 text-sage-dark",
  arrived: "bg-sage/15 text-sage-dark",
  delivered: "bg-sage text-white",
  rejected: "bg-clay/10 text-clay",
};

export default function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={"inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium " + tone[status]}>
      {STATUS_LABEL[status]}
    </span>
  );
}
