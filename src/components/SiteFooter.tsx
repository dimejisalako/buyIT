import Link from "next/link";
import { contact } from "../lib/site";

export default function SiteFooter() {
  const { email, whatsapp } = contact();

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-ink-soft sm:flex-row">
        <p>© {new Date().getFullYear()} Shopbrow</p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer">
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          {whatsapp && (
            <a href={"https://wa.me/" + whatsapp} className="hover:text-ink" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          )}
          {email && (
            <a href={"mailto:" + email} className="hover:text-ink">
              {email}
            </a>
          )}
        </nav>
      </div>
    </footer>
  );
}
