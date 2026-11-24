import Image from "next/image";
import Link from "next/link";

// The brand mark on its own (no wordmark). Links home.
export default function Logo({ height = 56 }: { height?: number }) {
  return (
    <Link href="/" className="inline-flex items-center" aria-label="Shopbrow home">
      <Image src="/logo.png" alt="Shopbrow" width={Math.round(height * 1.42)} height={height} priority />
    </Link>
  );
}
