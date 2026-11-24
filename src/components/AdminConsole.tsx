"use client";
import { useMemo, useState } from "react";
import type { ProductRequest } from "../lib/requests";
import { ACTION_LABEL, POST_PAYMENT, STATUS_LABEL, nextStatus, type RequestStatus } from "../lib/status";
import StatusBadge from "./StatusBadge";
import { errorBox, inputClass, ngn, okBox, primaryButton, secondaryButton } from "./ui";

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

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

// Orders waiting on us: new ones to quote, paid ones to buy.
const needsAction = (s: RequestStatus) => s === "new" || s === "paid";

function OrderCard({ order, onChange }: { order: AdminOrder; onChange: (o: AdminOrder) => void }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const phoneDigits = order.customer.phone.replace(/[^\d]/g, "");
  const next: RequestStatus | null =
    order.status === "rejected" ? "quoted" : nextStatus(order.status);

  const send = async (status: RequestStatus, opts?: { offline?: boolean; confirmText?: string }) => {
    if (opts?.confirmText && !confirm(opts.confirmText)) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status, note, offline: opts?.offline }),
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
          <a href={order.url} target="_blank" rel="noopener noreferrer" className="text-sm text-sage underline underline-offset-2">
            Open on Amazon
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
          <p className="mt-2 font-medium">{ngn(order.quote.totalNgn)}</p>
          <p className="text-ink-soft">${order.quote.totalUsd.toFixed(2)} · qty {order.quote.quantity}</p>
          <p className="text-ink-soft">{order.quote.weightLb * order.quote.quantity} lb</p>
        </div>
      </div>

      {last && (
        <p className="mt-3 text-xs text-ink-soft">
          Last update: {STATUS_LABEL[last.status]}
          {last.note ? " (" + last.note + ")" : ""} · {when(last.at)} · {order.id}
        </p>
      )}

      <div className="mt-4 space-y-3 border-t border-line pt-4">
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
              {next === "paid" ? "Mark payment received (bank transfer)" : ACTION_LABEL[next]}
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

export default function AdminConsole({ initialOrders, customers }: { initialOrders: AdminOrder[]; customers: AdminCustomer[] }) {
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
      return [o.title, o.id, o.customer.name, o.customer.email, o.customer.phone].some((v) => v.toLowerCase().includes(q));
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
            placeholder="Search by item, customer, email, phone or order ID"
            aria-label="Search orders"
            className={inputClass + " mt-4"}
          />
          {shown.length === 0 ? (
            <p className="mt-8 text-center text-ink-soft">Nothing here{filter === "action" ? ". You're all caught up." : "."}</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {shown.map((o) => (
                <OrderCard key={o.id} order={o} onChange={(u) => setOrders((all) => all.map((x) => (x.id === u.id ? u : x)))} />
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
