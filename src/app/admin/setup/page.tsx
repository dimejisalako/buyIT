import type { Metadata } from "next";
import AdminSetupForm from "../../../components/AdminSetupForm";
import Shell from "../../../components/Shell";

export const metadata: Metadata = { title: "Admin setup", robots: { index: false } };

export default function AdminSetupPage() {
  return (
    <Shell width="max-w-md">
      <AdminSetupForm />
    </Shell>
  );
}
