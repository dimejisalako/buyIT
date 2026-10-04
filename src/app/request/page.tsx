"use client";
import { useState } from "react";
import Link from "next/link";

interface Quote {
  lines: { label: string; usd: number }[];
  totalUsd: number;
  totalNgn: number;
  ngnPerUsd: number;
}

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-sage focus:outline-none focus:ring-4 focus:ring-sage/15";

const usd = (n: number) => `$${n.toFixed(2)}`;

export default function RequestPage() {
  const [form, setForm] = useState({
    url: "", priceUsd: "", weightLb: "", quantity: "1", name: "", email: "", phone: "", note: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ id: string; quote: Quote } | null>(null);

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, priceUsd: Number(form.priceUsd), weightLb: Number(form.weightLb), quantity: Number(form.quantity) }),
      });
      const data = await res.json();
      if (data.success) setResult({ id: data.id, quote: data.quote });
      else setError(data.error || "Something went wrong.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Shop<span className="text-sage">brow</span>
        </Link>
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">Back</Link>
      </header>

      <main className="mx-auto max-w-xl px-6 pb-20 pt-6">
        {result ? (
          <div role="status" className="rounded-3xl border border-line bg-white p-8 shadow-[0_12px_32px_-12px_rgba(43,47,44,0.10)]">
            <h1 className="text-2xl font-semibold">Your estimate</h1>
            <p className="mt-1 text-ink-soft">We&apos;ll check the item and email you to confirm before you pay anything.</p>
            <dl className="mt-6 divide-y divide-line">
              {result.quote.lines.map((l) => (
                <div key={l.label} className="flex justify-between py-2.5 text-sm">
                  <dt className="text-ink-soft">{l.label}</dt>
                  <dd>{usd(l.usd)}</dd>
                </div>
              ))}
              <div className="flex justify-between py-3 font-medium">
                <dt>Total</dt>
                <dd>{usd(result.quote.totalUsd)}</dd>
              </div>
            </dl>
            <p className="rounded-xl bg-sage/10 px-4 py-3 text-sage-dark">
              About <strong>₦{result.quote.totalNgn.toLocaleString()}</strong>
              <span className="text-sm"> at ₦{result.quote.ngnPerUsd.toLocaleString()} per $1</span>
            </p>
            <p className="mt-4 text-xs text-ink-soft">Reference: {result.id}. Duty, tax and shipping are estimates and may change once we confirm the item.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 rounded-3xl border border-line bg-white p-8 shadow-[0_12px_32px_-12px_rgba(43,47,44,0.10)]">
            <div>
              <h1 className="text-2xl font-semibold">Request an item</h1>
              <p className="mt-1 text-ink-soft">Paste an Amazon link and get an estimate in naira.</p>
            </div>

            <div>
              <label htmlFor="url" className="mb-1.5 block text-sm font-medium">Amazon link</label>
              <input id="url" name="url" value={form.url} onChange={set} placeholder="https://www.amazon.com/dp/…" className={inputClass} required />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="priceUsd" className="mb-1.5 block text-sm font-medium">Price (USD)</label>
                <input id="priceUsd" name="priceUsd" type="number" min="0.01" step="0.01" value={form.priceUsd} onChange={set} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="weightLb" className="mb-1.5 block text-sm font-medium">Weight (lb)</label>
                <input id="weightLb" name="weightLb" type="number" min="0.1" step="0.1" value={form.weightLb} onChange={set} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium">Quantity</label>
                <input id="quantity" name="quantity" type="number" min="1" max="20" step="1" value={form.quantity} onChange={set} className={inputClass} required />
              </div>
            </div>
            <p className="-mt-2 text-xs text-ink-soft">Copy the price and approximate weight from the Amazon page. We verify both before charging you.</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Name</label>
                <input id="name" name="name" value={form.name} onChange={set} autoComplete="name" className={inputClass} required />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={set} autoComplete="email" className={inputClass} required />
              </div>
            </div>

            <div>
              <label htmlFor="note" className="mb-1.5 block text-sm font-medium">Anything we should know? <span className="font-normal text-ink-soft">(optional)</span></label>
              <textarea id="note" name="note" rows={2} value={form.note} onChange={set} className={inputClass} placeholder="Size, colour, delivery city…" />
            </div>

            {error && <p role="alert" className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-sage py-3.5 font-medium text-white hover:bg-sage-dark focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/25 disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
            >
              {busy ? "Working out your estimate…" : "Get my estimate"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
