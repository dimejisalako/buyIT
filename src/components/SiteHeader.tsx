import Link from "next/link";
import { getCurrentUser } from "../lib/auth";
import Logo from "./Logo";
import LogoutButton from "./LogoutButton";

export default async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-5">
      <Logo />
      <nav className="flex items-center gap-4 text-sm sm:gap-6" aria-label="Main">
        {user ? (
          <>
            {user.role === "admin" ? (
              <Link href="/admin" className="text-ink-soft hover:text-ink">Admin</Link>
            ) : (
              <>
                <Link href="/request" className="hidden text-ink-soft hover:text-ink sm:inline">Request an item</Link>
                <Link href="/account" className="text-ink-soft hover:text-ink">My orders</Link>
              </>
            )}
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="text-ink-soft hover:text-ink">Log in</Link>
            <Link href="/signup" className="rounded-xl bg-sage px-4 py-2 font-medium text-white hover:bg-sage-dark">
              Get started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
