"use client";
import { useState } from "react";
import { errorBox, inputClass, okBox, secondaryButton } from "./ui";

export default function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ current: "", next: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setDone(false);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        setForm({ current: "", next: "" });
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-sage underline underline-offset-2 hover:text-sage-dark">
        Change password
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 max-w-sm space-y-3">
      <div>
        <label htmlFor="current" className="mb-1 block text-sm font-medium">Current password</label>
        <input id="current" type="password" autoComplete="current-password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} className={inputClass} required />
      </div>
      <div>
        <label htmlFor="next" className="mb-1 block text-sm font-medium">New password</label>
        <input id="next" type="password" autoComplete="new-password" minLength={8} value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} className={inputClass} required />
      </div>
      {error && <p role="alert" className={errorBox}>{error}</p>}
      {done && <p role="status" className={okBox}>Password updated. Other devices have been signed out.</p>}
      <button type="submit" disabled={busy} className={secondaryButton}>{busy ? "Saving…" : "Update password"}</button>
    </form>
  );
}
