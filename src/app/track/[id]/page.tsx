"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { STATUS_LABEL, TIMELINE, type RequestStatus } from "../../../lib/status";

interface View {
  id: string;
  url: string;
  status: RequestStatus;
  paymentsEnabled: boolean;
  quote: { lines: { label: string; usd: number }[]; totalUsd: number; totalNgn: number; ngnPerUsd: number };
}

const usd = (n: number) => `$${n.toFixed(2)}`;

function Tracker() {
  const { id } = useParams<{ id: string }>();
  const token = useSearchParams().get("t") ?? "";
  const [view, setView] = useState<View | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/track/${id}?t=${encodeURIComponent(token)}`);
    if (res.ok) setView(await res.json());
    else setMissing(true);
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  const pay = async () => {
    setPaying(true);
    setError("");
    try {
      const res = await fetch(`/api/pay/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token }),
      });
      const data = await res.json();
      if (res.ok && data.url) window.location.href = data.url;
      else setError(data.error || "Couldn't start payment.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  if (missing) {
    return <p className="rounded-2xl border border-line bg-white p-8 text-ink-soft">We couldn&apos;t find that request. Check the link in your email.</p>;
  }
  if (!view) return <p className="text-ink-soft">Loading…</p>;

  const rejected = view.status === "rejected";
  const step = TIMELINE.indexOf(view.status);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-line bg-white p-8 shadow-[0_12px_32px_-12px_rgba(43,47,44,0.10)]">
        <p className="text-sm text-ink-soft">Request {view.id}</p>
        <h1 className="mt-1 text-2xl font-semibold">{STATUS_LABEL[view.status]}</h1>
        <a href={view.url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-sm text-sage underline underline-offset-2">
          {view.url}
        </a>

        {rejected ? (
          <p className="mt-5 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
            We couldn&apos;t fulfil this request. If you&apos;ve paid, we&apos;ll be in touch about a refund.
          </p>
        ) : (
          <ol className="mt-6 space-y-3">
            {TIMELINE.map((s, i) => (
              <li key={s} className="flex items-center gap-3 text-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${i <= step ? "bg-sage" : "bg-line"}`} />
                <span className={i <= step ? "text-ink" : "text-ink-soft"}>{STATUS_LABEL[s]}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="rounded-3xl border border-line bg-white p-8">
        <h2 className="font-semibold">Your quote</h2>
        <dl className="mt-3 divide-y divide-line">
          {view.quote.lines.map((l) => (
            <div key={l.label} className="flex justify-between py-2 text-sm">
              <dt className="text-ink-soft">{l.label}</dt>
              <dd>{usd(l.usd)}</dd>
            </div>
          ))}
          <div className="flex justify-between py-3 font-medium">
            <dt>Total</dt>
            <dd>₦{view.quote.totalNgn.toLocaleString()} <span className="text-sm font-normal text-ink-soft">({usd(view.quote.totalUsd)})</span></dd>
          </div>
        </dl>

        {view.status === "new" && (
          <p className="rounded-xl bg-sage/10 px-4 py-3 text-sm text-sage-dark">
            We&apos;re checking your item. We&apos;ll email you when your final quote is ready to pay.
          </p>
        )}

        {view.status === "quoted" && (
          <div className="space-y-3">
            {error && <p role="alert" className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}
            <button
              onClick={pay}
              disabled={paying}
              className="w-full rounded-xl bg-sage py-3.5 font-medium text-white hover:bg-sage-dark focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/25 disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
            >
              {paying ? "Opening secure checkout…" : `Pay ₦${view.quote.totalNgn.toLocaleString()}`}
            </button>
            <p className="text-center text-xs text-ink-soft">Secure payment by Paystack. Card, bank transfer or USSD.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Shop<span className="text-sage">brow</span>
        </Link>
      </header>
      <main className="mx-auto max-w-xl px-6 pb-20 pt-6">
        <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
          <Tracker />
        </Suspense>
      </main>
    </div>
  );
}
