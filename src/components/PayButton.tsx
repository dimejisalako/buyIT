"use client";
import { useState } from "react";
import { errorBox, primaryButton } from "./ui";

export default function PayButton({ id, label }: { id: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/pay/" + id, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) window.location.href = data.url;
      else setError(data.error || "Couldn't start payment.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <p role="alert" className={errorBox}>{error}</p>}
      <button onClick={pay} disabled={busy} className={primaryButton + " w-full"}>
        {busy ? "Opening secure checkout…" : label}
      </button>
      <p className="text-center text-xs text-ink-soft">Secure payment by Paystack. Card, bank transfer or USSD.</p>
    </div>
  );
}
