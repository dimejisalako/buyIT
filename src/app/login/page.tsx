import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "../../components/AuthForm";
import Shell from "../../components/Shell";
import { getCurrentUser, safeNext } from "../../lib/auth";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(safeNext(next, user.role === "admin" ? "/admin" : "/account"));

  return (
    <Shell width="max-w-md">
      <AuthForm mode="login" next={next ? safeNext(next) : undefined} />
    </Shell>
  );
}
