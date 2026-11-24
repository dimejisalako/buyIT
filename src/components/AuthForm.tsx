"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { card, errorBox, inputClass, primaryButton } from "./ui";

export default function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const router = useRouter();
  const signup = mode === "signup";
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/" + mode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push(next || (data.role === "admin" ? "/admin" : "/account"));
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

  const other = (signup ? "/login" : "/signup") + (next ? "?next=" + encodeURIComponent(next) : "");

  return (
    <form onSubmit={submit} className={card + " space-y-5"}>
      <div>
        <h1 className="text-2xl font-semibold">{signup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-1 text-ink-soft">
          {signup ? "Track every order in one place." : "Log in to see your orders."}
        </p>
      </div>

      {signup && (
        <>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Full name</label>
            <input id="name" name="name" value={form.name} onChange={set} autoComplete="name" className={inputClass} required />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">Phone (WhatsApp if possible)</label>
            <input id="phone" name="phone" type="tel" value={form.phone} onChange={set} autoComplete="tel" placeholder="+234 800 000 0000" className={inputClass} required />
          </div>
        </>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={set} autoComplete="email" className={inputClass} required />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={set}
          autoComplete={signup ? "new-password" : "current-password"}
          minLength={signup ? 8 : undefined}
          className={inputClass}
          required
        />
        {signup && <p className="mt-1.5 text-xs text-ink-soft">At least 8 characters.</p>}
      </div>

      {error && <p role="alert" className={errorBox}>{error}</p>}

      <button type="submit" disabled={busy} className={primaryButton + " w-full"}>
        {busy ? "One moment…" : signup ? "Create account" : "Log in"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        {signup ? "Already have an account? " : "New here? "}
        <Link href={other} className="text-sage underline underline-offset-2 hover:text-sage-dark">
          {signup ? "Log in" : "Create an account"}
        </Link>
      </p>
      {!signup && (
        <p className="text-center text-xs text-ink-soft">Forgot your password? Contact us and we&apos;ll reset it for you.</p>
      )}
    </form>
  );
}
