import { sendEmail } from "./email";
import { STATUS_LABEL, type RequestStatus } from "./status";
import type { ProductRequest } from "./requests";

const sign = "\n\nThe Shopbrow team";

export async function notifyReceived(req: ProductRequest, link: string) {
  await sendEmail({
    to: req.email,
    subject: "We got your Shopbrow request",
    text: `Hi ${req.name},\n\nThanks for your request. We'll check the item and email you when your final quote is ready to pay. Nothing is charged until then.\n\nTrack it any time:\n${link}${sign}`,
  });
  const admin = process.env.ADMIN_EMAIL;
  if (admin) {
    await sendEmail({
      to: admin,
      subject: `New request ${req.id}: $${req.quote.totalUsd.toFixed(2)}`,
      text: `${req.name} <${req.email}>\n${req.url}\nQty ${req.quote.quantity}, total $${req.quote.totalUsd.toFixed(2)} / ₦${req.quote.totalNgn.toLocaleString()}\n${req.note ?? ""}`,
    });
  }
}

export async function notifyStatus(req: ProductRequest, status: RequestStatus, link: string) {
  const intro: Record<RequestStatus, string> = {
    new: "We received your request.",
    quoted: `Your quote is ready: ₦${req.quote.totalNgn.toLocaleString()} (about $${req.quote.totalUsd.toFixed(2)}). Review it and pay securely here.`,
    paid: "We received your payment. Thank you! We'll order your item next.",
    purchased: "We've ordered your item from Amazon.",
    shipped: "Your item is on its way to Nigeria. Shipments leave weekly.",
    delivered: "Your item has been delivered. Enjoy!",
    rejected: "Sorry, we couldn't fulfil this request. If you've paid, we'll be in touch about a refund.",
  };
  await sendEmail({
    to: req.email,
    subject: `Shopbrow: ${STATUS_LABEL[status]}`,
    text: `Hi ${req.name},\n\n${intro[status]}\n\n${link}${sign}`,
  });
}
