import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RequestForm from "../../components/RequestForm";
import Shell from "../../components/Shell";
import { getCurrentUser } from "../../lib/auth";

export const metadata: Metadata = { title: "Request an item" };

export default async function RequestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/request");
  if (user.role === "admin") redirect("/admin");

  return (
    <Shell>
      <RequestForm />
    </Shell>
  );
}
