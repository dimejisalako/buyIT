"use client";
import { useCallback, useEffect, useState } from "react";

import { STATUSES, type RequestStatus as Status } from "../../../lib/status";

interface Req {
  id: string; url: string; name: string; email: string; note?: string; status: Status; createdAt: string;
  quote: { quantity: number; totalUsd: number; totalNgn: number };
}

const KEY = "shopbrow-admin-key";

export default function AdminRequests() {
  const [adminKey, setAdminKey] = useState("");
  const [requests, setRequests] = useState<Req[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async (key: string) => {
    setError("");
    try {
      const res = await fetch("/api/admin/requests", { headers: { "x-admin-key": key } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      localStorage.setItem(KEY, key);
      setRequests(data.requests);
    } catch (e) {
      setRequests(null);
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) { setAdminKey(saved); load(saved); }
  }, [load]);

  const update = async (id: string, status: Status) => {
    let offline = false;
    if (status === "paid") {
      if (!confirm("Record an offline payment (e.g. bank transfer)? Online payments are marked paid automatically.")) return;
      offline = true;
    }
    const res = await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "x-admin-key": adminKey, "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, offline }),
    });
    if (res.ok) setRequests((rs) => rs && rs.map((r) => (r.id === id ? { ...r, status } : r)));
    else setError("Could not update status");
  };

  return (
    <div className="min-h-screen bg-cream px-6 py-10 text-ink">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Requests</h1>
        <p className="mt-1 text-sm text-ink-soft">Changing a status emails the customer. Set &ldquo;quoted&rdquo; once you&apos;ve checked the item, and they can pay.</p>

        {requests === null ? (
          <form onSubmit={(e) => { e.preventDefault(); load(adminKey); }} className="mt-6 flex max-w-sm gap-3">
            <input type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="Admin key" aria-label="Admin key"
              className="flex-1 rounded-xl border border-line bg-white px-4 py-3 focus:border-sage focus:outline-none focus:ring-4 focus:ring-sage/15" />
            <button className="rounded-xl bg-sage px-5 font-medium text-white hover:bg-sage-dark">Open</button>
          </form>
        ) : requests.length === 0 ? (
          <p className="mt-6 text-ink-soft">No requests yet.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {requests.map((r) => (
              <li key={r.id} className="rounded-2xl border border-line bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="block truncate text-sage underline underline-offset-2">{r.url}</a>
                    <p className="mt-1 text-sm text-ink-soft">
                      {r.name} · <a href={`mailto:${r.email}`} className="underline">{r.email}</a> · {new Date(r.createdAt).toLocaleString()}
                    </p>
                    {r.note && <p className="mt-1 text-sm">&ldquo;{r.note}&rdquo;</p>}
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">${r.quote.totalUsd.toFixed(2)} · ₦{r.quote.totalNgn.toLocaleString()}</p>
                    <p className="text-ink-soft">qty {r.quote.quantity}</p>
                  </div>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
                  Status
                  <select value={r.status} onChange={(e) => update(r.id, e.target.value as Status)}
                    className="rounded-lg border border-line bg-white px-2 py-1 text-ink">
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </li>
            ))}
          </ul>
        )}
        {error && <p role="alert" className="mt-4 text-sm text-clay">{error}</p>}
      </div>
    </div>
  );
}
