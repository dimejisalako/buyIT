"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { card, errorBox, inputClass, primaryButton } from "./ui";

export default function RequestForm() {
  const router = useRouter();
  const [form, setForm] = useState({ url: "", title: "", priceUsd: "", weightLb: "", quantity: "1", note: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
        body: JSON.stringify({
          ...form,
          priceUsd: Number(form.priceUsd),
          weightLb: Number(form.weightLb),
          quantity: Number(form.quantity),
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/account/orders/" + data.id);
        router.refresh();
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={card + " space-y-5"}>
      <div>
        <h1 className="text-2xl font-semibold">Request an item</h1>
        <p className="mt-1 text-ink-soft">Paste an Amazon link. You&apos;ll see a naira estimate straight away.</p>
      </div>

      <div>
        <label htmlFor="url" className="mb-1.5 block text-sm font-medium">Amazon link</label>
        <input id="url" name="url" value={form.url} onChange={set} placeholder="https://www.amazon.com/dp/…" className={inputClass} required />
      </div>
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium">Item name</label>
        <input id="title" name="title" value={form.title} onChange={set} placeholder="e.g. Sony WH-1000XM5 headphones" maxLength={120} className={inputClass} required />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="priceUsd" className="mb-1.5 block text-sm font-medium">Price (USD)</label>
          <input id="priceUsd" name="priceUsd" type="number" min="0.01" step="0.01" inputMode="decimal" value={form.priceUsd} onChange={set} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="weightLb" className="mb-1.5 block text-sm font-medium">Weight (lb)</label>
          <input id="weightLb" name="weightLb" type="number" min="0.1" step="0.1" inputMode="decimal" value={form.weightLb} onChange={set} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium">Quantity</label>
          <input id="quantity" name="quantity" type="number" min="1" max="20" step="1" value={form.quantity} onChange={set} className={inputClass} required />
        </div>
      </div>
      <p className="-mt-2 text-xs text-ink-soft">
        Copy the price and approximate weight from the Amazon page (look under &ldquo;Product information&rdquo;). We check both before you pay anything.
      </p>

      <div>
        <label htmlFor="note" className="mb-1.5 block text-sm font-medium">
          Anything we should know? <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <textarea id="note" name="note" rows={2} value={form.note} onChange={set} maxLength={500} className={inputClass} placeholder="Size, colour, delivery city…" />
      </div>

      {error && <p role="alert" className={errorBox}>{error}</p>}

      <button type="submit" disabled={busy} className={primaryButton + " w-full"}>
        {busy ? "Working out your estimate…" : "Get my estimate"}
      </button>
    </form>
  );
}
