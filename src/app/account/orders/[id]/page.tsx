import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PayButton from "../../../../components/PayButton";
import Shell from "../../../../components/Shell";
import StatusBadge from "../../../../components/StatusBadge";
import { card, ngn, usd } from "../../../../components/ui";
import { getCurrentUser } from "../../../../lib/auth";
import { refreshPayment } from "../../../../lib/payments";
import { paymentsEnabled } from "../../../../lib/paystack";
import { getRequest } from "../../../../lib/requests";
import { STATUS_LABEL, TIMELINE } from "../../../../lib/status";

export const metadata: Metadata = { title: "Order" };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=" + encodeURIComponent("/account/orders/" + id));

  const found = await getRequest(id);
  if (!found || (found.userId !== user.id && user.role !== "admin")) notFound();
  const req = found.userId === user.id ? await refreshPayment(found) : found;

  const rejected = req.status === "rejected";
  const step = TIMELINE.indexOf(req.status);
  const instructions = process.env.PAYMENT_INSTRUCTIONS?.replace(/\\n/g, "\n");
  const online = paymentsEnabled();

  return (
    <Shell>
      <Link href={user.role === "admin" ? "/admin" : "/account"} className="text-sm text-ink-soft hover:text-ink">
        ← {user.role === "admin" ? "Back to admin" : "All orders"}
      </Link>

      <div className={card + " mt-4"}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">{req.title}</h1>
            <a href={req.url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-sm text-sage underline underline-offset-2">
              View on Amazon
            </a>
          </div>
          <StatusBadge status={req.status} />
        </div>

        {rejected ? (
          <p className="mt-5 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
            We couldn&apos;t fulfil this request. If you&apos;ve paid, we&apos;ll be in touch about a refund.
          </p>
        ) : (
          <ol className="mt-6 space-y-3">
            {TIMELINE.map((s, i) => (
              <li key={s} className="flex items-center gap-3 text-sm">
                <span className={"h-2.5 w-2.5 shrink-0 rounded-full " + (i <= step ? "bg-sage" : "bg-line")} />
                <span className={i <= step ? "text-ink" : "text-ink-soft"}>{STATUS_LABEL[s]}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {req.status === "quoted" && user.id === req.userId && (
        <div className={card + " mt-5 space-y-4"}>
          <h2 className="font-semibold">Pay for this order</h2>
          {online ? (
            <PayButton id={req.id} label={"Pay " + ngn(req.quote.totalNgn)} />
          ) : (
            <div className="space-y-3 text-sm">
              <p>Please pay <strong>{ngn(req.quote.totalNgn)}</strong> by bank transfer:</p>
              {instructions ? (
                <p className="whitespace-pre-line rounded-xl bg-sage/10 px-4 py-3 text-sage-dark">{instructions}</p>
              ) : (
                <p className="text-ink-soft">We&apos;ll send you our bank details shortly.</p>
              )}
              <p className="text-ink-soft">
                Use <strong className="text-ink">{req.id}</strong> as the payment reference. We&apos;ll mark your order as paid as soon as we see the transfer.
              </p>
            </div>
          )}
        </div>
      )}

      {req.status === "new" && (
        <p className="mt-5 rounded-xl bg-sage/10 px-4 py-3 text-sm text-sage-dark">
          We&apos;re checking your item. When it&apos;s ready you&apos;ll be able to pay here.
        </p>
      )}

      <div className={card + " mt-5"}>
        <h2 className="font-semibold">Your quote</h2>
        <dl className="mt-3 divide-y divide-line">
          {req.quote.lines.map((l) => (
            <div key={l.label} className="flex justify-between py-2 text-sm">
              <dt className="text-ink-soft">{l.label}</dt>
              <dd>{usd(l.usd)}</dd>
            </div>
          ))}
          <div className="flex justify-between py-3 font-medium">
            <dt>Total</dt>
            <dd>
              {ngn(req.quote.totalNgn)} <span className="text-sm font-normal text-ink-soft">({usd(req.quote.totalUsd)})</span>
            </dd>
          </div>
        </dl>
        <p className="text-xs text-ink-soft">
          Quantity {req.quote.quantity}. Tax, duty and shipping are estimates until we confirm your item. Naira at ₦{req.quote.ngnPerUsd.toLocaleString("en-NG")} per $1.
        </p>
      </div>

      <div className={card + " mt-5"}>
        <h2 className="font-semibold">Updates</h2>
        <ol className="mt-3 space-y-4">
          {[...req.events].reverse().map((e, i) => (
            <li key={i} className="text-sm">
              <p className="font-medium">{STATUS_LABEL[e.status]}</p>
              {e.note && <p className="mt-0.5 whitespace-pre-line text-ink">{e.note}</p>}
              <p className="mt-0.5 text-xs text-ink-soft">{when(e.at)}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-ink-soft">Reference {req.id}</p>
      </div>
    </Shell>
  );
}
