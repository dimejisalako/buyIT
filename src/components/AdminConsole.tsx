"use client";
import { useMemo, useState } from "react";
import { buildQuote, type Quote, type Rates } from "../lib/quote";
import type { ProductRequest } from "../lib/requests";
import { ACTION_LABEL, POST_PAYMENT, STATUS_LABEL, nextStatus, type RequestStatus } from "../lib/status";
import StatusBadge from "./StatusBadge";
import { errorBox, inputClass, ngn, okBox, primaryButton, secondaryButton, usd } from "./ui";

export type AdminOrder = ProductRequest & { customer: { id: string; name: string; email: string; phone: string } };
export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  orderCount: number;
  paidNgn: number;
}

type Filter = "action" | "all" | RequestStatus;
type Details = { title: string; priceUsd: number; weightLb: number; quantity: number };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

// Orders waiting on us: new ones to quote, paid ones to buy.
const needsAction = (s: RequestStatus) => s === "new" || s === "paid";

// Item details -> quote, with a live total so you can check the figures before sending.
function QuoteForm({
  order, rates, busy, onSend,
}: {
  order: AdminOrder;
  rates: Rates;
  busy: boolean;
  onSend: (details: Details) => void;
}) {
  const q = order.quote;
  const [title, setTitle] = useState(order.title);
  const [price, setPrice] = useState(q ? String(q.itemPriceUsd) : "");
  const [weight, setWeight] = useState(q ? String(q.weightLb) : "");
  const [quantity, setQuantity] = useState(q ? String(q.quantity) : "1");

  const valid = Number(price) > 0 && Number(weight) > 0 && Number.isInteger(Number(quantity)) && Number(quantity) >= 1 && title.trim().length >= 2;
  const preview: Quote | null = valid
    ? buildQuote({ itemPriceUsd: Number(price), weightLb: Number(weight), quantity: Number(quantity) }, rates)
    : null;

  return (
    <div className="space-y-3 rounded-xl bg-cream p-4">
      <p className="text-sm font-medium">{order.status === "quoted" ? "Update the quote" : "Prepare the quote"}</p>
      <label className="block text-sm">
        <span className="mb-1 block text-ink-soft">Item name</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={inputClass} />
      </label>
      <div className="grid grid-cols-3 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Price (USD)</span>
          <input type="number" min="0.01" step="0.01" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Weight (lb)</span>
          <input type="number" min="0.1" step="0.1" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Quantity</span>
          <input type="number" min="1" max="20" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} />
        </label>
      </div>
      {preview && (
        <p className="text-sm">
          Customer total: <strong>{ngn(preview.totalNgn)}</strong>{" "}
          <span className="text-ink-soft">({usd(preview.totalUsd)}; tax {usd(preview.lines[1].usd)}, shipping {usd(preview.lines[2].usd)}, duty {usd(preview.lines[3].usd)})</span>
        </p>
      )}
      <button
        type="button"
        disabled={busy || !valid}
        onClick={() => onSend({ title: title.trim(), priceUsd: Number(price), weightLb: Number(weight), quantity: Number(quantity) })}
        className={primaryButton + " !py-2.5 text-sm"}
      >
        {order.status === "quoted" ? "Update and re-send quote" : "Send quote"}
      </button>
    </div>
  );
}

function OrderCard({ order, rates, onChange }: { order: AdminOrder; rates: Rates; onChange: (o: AdminOrder) => void }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const phoneDigits = order.customer.phone.replace(/[^\d]/g, "");
  const canQuote = !order.paidAt && (order.status === "new" || order.status === "quoted");
  // "new" is moved on by the quote form; a rejected order can be reopened if it has a quote.
  const next: RequestStatus | null =
    order.status === "new" ? null : order.status === "rejected" ? (order.quote ? "quoted" : null) : nextStatus(order.status);

  const send = async (status: RequestStatus, opts?: { offline?: boolean; confirmText?: string; details?: Details }) => {
    if (opts?.confirmText && !confirm(opts.confirmText)) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status, note, offline: opts?.offline, details: opts?.details }),
      });
      const data = await res.json();
      if (data.success) {
        onChange({ ...order, ...data.request });
        setNote("");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const last = order.events[order.events.length - 1];

  return (
    <li className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{order.title}</p>
          <a href={order.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-sage underline underline-offset-2">
            Open the Amazon link
          </a>
          <p className="mt-1 text-sm text-ink-soft">
            {order.customer.name} ·{" "}
            <a href={"mailto:" + order.customer.email} className="underline">{order.customer.email}</a>
            {phoneDigits && (
              <>
                {" · "}
                <a href={"tel:" + order.customer.phone} className="underline">{order.customer.phone}</a>
                {" · "}
                <a href={"https://wa.me/" + phoneDigits} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a>
              </>
            )}
          </p>
          {order.note && <p className="mt-1 text-sm">Customer note: &ldquo;{order.note}&rdquo;</p>}
        </div>
        <div className="text-right text-sm">
          <StatusBadge status={order.status} />
          {order.quote ? (
            <>
              <p className="mt-2 font-medium">{ngn(order.quote.totalNgn)}</p>
              <p className="text-ink-soft">${order.quote.totalUsd.toFixed(2)} · qty {order.quote.quantity}</p>
              <p className="text-ink-soft">{order.quote.weightLb * order.quote.quantity} lb</p>
            </>
          ) : (
            <p className="mt-2 text-ink-soft">No quote yet</p>
          )}
        </div>
      </div>

      {last && (
        <p className="mt-3 text-xs text-ink-soft">
          Last update: {STATUS_LABEL[last.status]}
          {last.note ? " (" + last.note + ")" : ""} · {when(last.at)} · {order.id}
        </p>
      )}

      <div className="mt-4 space-y-3 border-t border-line pt-4">
        {canQuote && (
          <QuoteForm
            key={order.quote ? order.quote.totalNgn : "none"}
            order={order}
            rates={rates}
            busy={busy}
            onSend={(details) => send("quoted", { details })}
          />
        )}

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Note to customer <span className="font-normal text-ink-soft">(optional, e.g. carrier and tracking number)</span></span>
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className={inputClass} placeholder="e.g. DHL 1234567890" />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {next && (
            <button
              disabled={busy}
              onClick={() =>
                next === "paid"
                  ? send("paid", { offline: true, confirmText: "Record a bank-transfer payment for this order? Only do this once the money has arrived." })
                  : send(next)
              }
              className={primaryButton + " !py-2.5 text-sm"}
            >
              {next === "paid" ? "Mark payment received (bank transfer)" : order.status === "rejected" ? "Reopen as quote" : ACTION_LABEL[next]}
            </button>
          )}
          {order.status !== "rejected" && order.status !== "delivered" && (
            <button
              disabled={busy}
              onClick={() => send("rejected", { confirmText: "Reject this order? The customer will be emailed." })}
              className={secondaryButton}
            >
              Reject
            </button>
          )}
          <button disabled={busy || !note.trim()} onClick={() => send(order.status)} className={secondaryButton}>
            Send note only
          </button>
          {order.paidAt && (
            <label className="ml-auto text-sm text-ink-soft">
              <span className="sr-only">Jump to status</span>
              <select
                disabled={busy}
                value=""
                onChange={(e) => e.target.value && send(e.target.value as RequestStatus)}
                className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink"
              >
                <option value="">Jump to…</option>
                {POST_PAYMENT.filter((s) => s !== order.status).map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </label>
          )}
        </div>
        {error && <p role="alert" className={errorBox}>{error}</p>}
      </div>
    </li>
  );
}

function CustomerRow({ c }: { c: AdminCustomer }) {
  const [busy, setBusy] = useState(false);
  const [temp, setTemp] = useState("");
  const [error, setError] = useState("");
  const phoneDigits = c.phone.replace(/[^\d]/g, "");

  const reset = async () => {
    if (!confirm("Reset the password for " + c.name + "? They will be signed out everywhere.")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/customers/" + c.id + "/reset-password", { method: "POST" });
      const data = await res.json();
      if (data.success) setTemp(data.temporaryPassword);
      else setError(data.error || "Something went wrong.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{c.name}</p>
          <p className="text-sm text-ink-soft">
            <a href={"mailto:" + c.email} className="underline">{c.email}</a>
            {phoneDigits && (
              <>
                {" · "}
                <a href={"tel:" + c.phone} className="underline">{c.phone}</a>
                {" · "}
                <a href={"https://wa.me/" + phoneDigits} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a>
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-ink-soft">Joined {when(c.createdAt)}</p>
        </div>
        <div className="text-right text-sm">
          <p>{c.orderCount} order{c.orderCount === 1 ? "" : "s"}</p>
          <p className="text-ink-soft">{ngn(c.paidNgn)} paid</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button onClick={reset} disabled={busy} className={secondaryButton}>Reset password</button>
        {error && <p role="alert" className={errorBox}>{error}</p>}
      </div>
      {temp && (
        <p role="status" className={okBox + " mt-3"}>
          Temporary password: <strong className="select-all font-mono">{temp}</strong>. Send it to the customer privately and ask them to change it. It won&apos;t be shown again.
        </p>
      )}
    </li>
  );
}

export default function AdminConsole({
  initialOrders, customers, rates,
}: { initialOrders: AdminOrder[]; customers: AdminCustomer[]; rates: Rates }) {
  const [orders, setOrders] = useState(initialOrders);
  const [tab, setTab] = useState<"orders" | "customers">("orders");
  const [filter, setFilter] = useState<Filter>("action");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length, action: orders.filter((o) => needsAction(o.status)).length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter === "action" ? !needsAction(o.status) : filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return [o.title, o.id, o.url, o.customer.name, o.customer.email, o.customer.phone].some((v) => v.toLowerCase().includes(q));
    });
  }, [orders, filter, query]);

  const filters: { key: Filter; label: string }[] = [
    { key: "action", label: "Needs action" },
    { key: "all", label: "All" },
    { key: "quoted", label: "Awaiting payment" },
    { key: "purchased", label: "Purchased" },
    { key: "received", label: "Received" },
    { key: "shipped", label: "Shipped" },
    { key: "arrived", label: "Arrived" },
    { key: "delivered", label: "Delivered" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Admin</h1>

      <div role="tablist" className="mt-4 flex gap-2 border-b border-line">
        {(["orders", "customers"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={"-mb-px border-b-2 px-4 py-2 text-sm font-medium " + (tab === t ? "border-sage text-ink" : "border-transparent text-ink-soft hover:text-ink")}
          >
            {t === "orders" ? "Orders (" + orders.length + ")" : "Customers (" + customers.length + ")"}
          </button>
        ))}
      </div>

      {tab === "orders" ? (
        <>
          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={"rounded-full border px-3 py-1.5 text-sm " + (filter === f.key ? "border-sage bg-sage/10 text-sage-dark" : "border-line bg-white text-ink-soft hover:border-sage")}
              >
                {f.label} <span className="text-xs opacity-70">{counts[f.key] ?? 0}</span>
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by item, link, customer, email, phone or order ID"
            aria-label="Search orders"
            className={inputClass + " mt-4"}
          />
          {shown.length === 0 ? (
            <p className="mt-8 text-center text-ink-soft">Nothing here{filter === "action" ? ". You're all caught up." : "."}</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {shown.map((o) => (
                <OrderCard key={o.id} order={o} rates={rates} onChange={(u) => setOrders((all) => all.map((x) => (x.id === u.id ? u : x)))} />
              ))}
            </ul>
          )}
        </>
      ) : customers.length === 0 ? (
        <p className="mt-8 text-center text-ink-soft">No customers yet.</p>
      ) : (
        <ul className="mt-5 space-y-4">{customers.map((c) => <CustomerRow key={c.id} c={c} />)}</ul>
      )}
    </div>
  );
}
