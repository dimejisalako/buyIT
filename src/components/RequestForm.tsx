"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { card, errorBox, inputClass, primaryButton } from "./ui";

export default function RequestForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, note }),
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
        <h1 className="text-2xl font-semibold">Paste your Amazon link</h1>
        <p className="mt-1 text-ink-soft">That&apos;s all we need. We&apos;ll check the item and send you your total in naira.</p>
      </div>

      <div>
        <label htmlFor="url" className="sr-only">Amazon link</label>
        <input
          id="url"
          name="url"
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste the link here"
          className={inputClass + " py-4 text-base"}
          autoFocus
          required
        />
        <p className="mt-2 text-xs text-ink-soft">
          On the Amazon app or website, tap <strong>Share</strong> and then <strong>Copy link</strong>.
        </p>
      </div>

      {showNote ? (
        <div>
          <label htmlFor="note" className="mb-1.5 block text-sm font-medium">
            Size, colour or anything else <span className="font-normal text-ink-soft">(optional)</span>
          </label>
          <textarea id="note" name="note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className={inputClass} />
        </div>
      ) : (
        <button type="button" onClick={() => setShowNote(true)} className="text-sm text-sage underline underline-offset-2 hover:text-sage-dark">
          Add a note (size, colour…)
        </button>
      )}

      {error && <p role="alert" className={errorBox}>{error}</p>}

      <button type="submit" disabled={busy || !url.trim()} className={primaryButton + " w-full"}>
        {busy ? "Sending…" : "Send link"}
      </button>
    </form>
  );
}
