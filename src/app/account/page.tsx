import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ChangePasswordForm from "../../components/ChangePasswordForm";
import Shell from "../../components/Shell";
import StatusBadge from "../../components/StatusBadge";
import { card, ngn, primaryButton } from "../../components/ui";
import { getCurrentUser } from "../../lib/auth";
import { listRequestsByUser, type ProductRequest } from "../../lib/requests";
import { POST_PAYMENT } from "../../lib/status";

export const metadata: Metadata = { title: "My orders" };

const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function OrderRow({ r }: { r: ProductRequest }) {
  return (
    <li>
      <Link
        href={"/account/orders/" + r.id}
        className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white px-5 py-4 hover:border-sage"
      >
        <div className="min-w-0">
          <p className="truncate font-medium">{r.title}</p>
          <p className="mt-0.5 text-sm text-ink-soft">
            {r.quote ? ngn(r.quote.totalNgn) + " · Qty " + r.quote.quantity : "Preparing your quote"} · {date(r.createdAt)}
          </p>
        </div>
        <StatusBadge status={r.status} />
      </Link>
    </li>
  );
}

function Section({ title, items }: { title: string; items: ProductRequest[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-soft">{title}</h2>
      <ul className="space-y-3">{items.map((r) => <OrderRow key={r.id} r={r} />)}</ul>
    </section>
  );
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  if (user.role === "admin") redirect("/admin");

  const orders = await listRequestsByUser(user.id);
  const by = (f: (r: ProductRequest) => boolean) => orders.filter(f);

  return (
    <Shell width="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My orders</h1>
          <p className="mt-1 text-ink-soft">Hi {user.name.split(" ")[0]}. Here&apos;s everything you&apos;ve requested.</p>
        </div>
        <Link href="/request" className={primaryButton}>Request an item</Link>
      </div>

      {orders.length === 0 ? (
        <div className={card + " mt-8 text-center"}>
          <h2 className="text-lg font-semibold">No orders yet</h2>
          <p className="mt-1 text-ink-soft">Paste an Amazon link and we&apos;ll send you the total in naira.</p>
          <Link href="/request" className={primaryButton + " mt-5 inline-block"}>Request your first item</Link>
        </div>
      ) : (
        <>
          <Section title="Ready to pay" items={by((r) => r.status === "quoted")} />
          <Section title="In progress" items={by((r) => r.status === "paid" || (POST_PAYMENT.includes(r.status) && r.status !== "delivered"))} />
          <Section title="Under review" items={by((r) => r.status === "new")} />
          <Section title="Delivered" items={by((r) => r.status === "delivered")} />
          <Section title="Closed" items={by((r) => r.status === "rejected")} />
        </>
      )}

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-soft">Your details</h2>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex gap-2"><dt className="w-16 text-ink-soft">Name</dt><dd>{user.name}</dd></div>
          <div className="flex gap-2"><dt className="w-16 text-ink-soft">Email</dt><dd>{user.email}</dd></div>
          <div className="flex gap-2"><dt className="w-16 text-ink-soft">Phone</dt><dd>{user.phone || "—"}</dd></div>
        </dl>
        <div className="mt-4"><ChangePasswordForm /></div>
      </section>
    </Shell>
  );
}
