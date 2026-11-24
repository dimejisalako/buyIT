"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-ink">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-ink-soft">That wasn&apos;t supposed to happen. Please try again, and if it keeps happening, contact us.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="rounded-xl bg-sage px-5 py-3 font-medium text-white hover:bg-sage-dark">Try again</button>
          <Link href="/" className="rounded-xl border border-line bg-white px-5 py-3 font-medium hover:border-sage">Home</Link>
        </div>
      </div>
    </div>
  );
}
