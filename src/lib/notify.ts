import { sendEmail } from "./email";
import { STATUS_LABEL, type RequestStatus } from "./status";
import type { ProductRequest } from "./requests";
import type { PublicUser } from "./users";

const sign = "\n\nThe Shopbrow team";

export async function notifyReceived(req: ProductRequest, user: PublicUser, link: string) {
  await sendEmail({
    to: user.email,
    subject: "We got your Shopbrow request",
    text:
      "Hi " + user.name + ",\n\nThanks for your request for " + req.title +
      ". We'll check the item and email you when your quote is ready to pay. Nothing is charged until then.\n\nFollow it any time:\n" +
      link + sign,
  });
  const admin = process.env.ADMIN_EMAIL;
  if (admin) {
    await sendEmail({
      to: admin,
      subject: "New request " + req.id + ": $" + req.quote.totalUsd.toFixed(2),
      text:
        user.name + " <" + user.email + ">\n" + req.title + "\n" + req.url + "\nQty " + req.quote.quantity +
        ", total $" + req.quote.totalUsd.toFixed(2) + " / N" + req.quote.totalNgn.toLocaleString() + "\n" + (req.note ?? ""),
    });
  }
}

export async function notifyStatus(req: ProductRequest, user: PublicUser, status: RequestStatus, note: string | undefined, link: string) {
  const intro: Record<RequestStatus, string> = {
    new: "We received your request.",
    quoted:
      "Your quote for " + req.title + " is ready: N" + req.quote.totalNgn.toLocaleString() +
      " (about $" + req.quote.totalUsd.toFixed(2) + "). Review it and pay here.",
    paid: "We received your payment for " + req.title + ". Thank you! We'll order it next.",
    purchased: "We've ordered " + req.title + " from Amazon.",
    received: req.title + " has arrived at our US address. It will ship to Nigeria in our next weekly shipment.",
    shipped: req.title + " is on its way to Nigeria.",
    arrived: req.title + " has arrived in Nigeria. We'll arrange delivery with you.",
    delivered: req.title + " has been delivered. Enjoy!",
    rejected: "Sorry, we couldn't fulfil your request for " + req.title + ". If you've paid, we'll be in touch about a refund.",
  };
  await sendEmail({
    to: user.email,
    subject: "Shopbrow: " + STATUS_LABEL[status],
    text: "Hi " + user.name + ",\n\n" + intro[status] + (note ? "\n\nNote from us: " + note : "") + "\n\n" + link + sign,
  });
}
