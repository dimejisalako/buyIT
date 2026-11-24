import Link from "next/link";
import Shell from "../components/Shell";
import { primaryButton } from "../components/ui";

export default function NotFound() {
  return (
    <Shell width="max-w-md">
      <div className="py-16 text-center">
        <h1 className="text-2xl font-semibold">We couldn&apos;t find that page</h1>
        <p className="mt-2 text-ink-soft">The link may be old, or the page may have moved.</p>
        <Link href="/" className={primaryButton + " mt-6 inline-block"}>Back to home</Link>
      </div>
    </Shell>
  );
}
