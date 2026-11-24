import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminConsole, { type AdminCustomer, type AdminOrder } from "../../components/AdminConsole";
import Shell from "../../components/Shell";
import { getCurrentUser } from "../../lib/auth";
import { rates } from "../../lib/quote";
import { listRequests } from "../../lib/requests";
import { listUsers } from "../../lib/users";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin");
  if (me.role !== "admin") redirect("/account");

  const [requests, users] = await Promise.all([listRequests(), listUsers()]);
  const byId = new Map(users.map((u) => [u.id, u]));

  const orders: AdminOrder[] = requests.map((r) => {
    const u = byId.get(r.userId);
    return { ...r, customer: { id: r.userId, name: u?.name ?? "Unknown", email: u?.email ?? "", phone: u?.phone ?? "" } };
  });

  const customers: AdminCustomer[] = users
    .filter((u) => u.role === "customer")
    .map((u) => {
      const mine = requests.filter((r) => r.userId === u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone ?? "",
        createdAt: u.createdAt,
        orderCount: mine.length,
        paidNgn: mine.filter((r) => r.paidAt && r.quote).reduce((sum, r) => sum + (r.quote?.totalNgn ?? 0), 0),
      };
    });

  return (
    <Shell width="max-w-5xl">
      <AdminConsole initialOrders={orders} customers={customers} rates={rates()} />
    </Shell>
  );
}
