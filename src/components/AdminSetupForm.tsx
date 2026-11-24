"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { card, errorBox, inputClass, primaryButton } from "./ui";

export default function AdminSetupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ adminKey: "", name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin");
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
        <h1 className="text-2xl font-semibold">Admin setup</h1>
        <p className="mt-1 text-ink-soft">
          Create your admin account, or reset its password. You&apos;ll need the <code>ADMIN_KEY</code> from your hosting settings.
        </p>
      </div>
      <div>
        <label htmlFor="adminKey" className="mb-1.5 block text-sm font-medium">Admin key</label>
        <input id="adminKey" name="adminKey" type="password" value={form.adminKey} onChange={set} autoComplete="off" className={inputClass} required />
      </div>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Your name</label>
        <input id="name" name="name" value={form.name} onChange={set} autoComplete="name" className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Admin email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={set} autoComplete="email" className={inputClass} required />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" value={form.password} onChange={set} autoComplete="new-password" minLength={8} className={inputClass} required />
        <p className="mt-1.5 text-xs text-ink-soft">At least 8 characters. Use a different password from your admin key.</p>
      </div>
      {error && <p role="alert" className={errorBox}>{error}</p>}
      <button type="submit" disabled={busy} className={primaryButton + " w-full"}>{busy ? "One moment…" : "Create admin account"}</button>
    </form>
  );
}
