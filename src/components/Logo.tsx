import Image from "next/image";
import Link from "next/link";

// Brand mark (hummingbird + price tag) beside the wordmark. Links home.
export default function Logo({ height = 52 }: { height?: number }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Shopbrow home">
      <Image src="/logo.png" alt="" width={Math.round(height * 1.42)} height={height} priority />
      <span className="text-xl font-semibold tracking-tight">
        Shop<span className="text-sage">brow</span>
      </span>
    </Link>
  );
}
