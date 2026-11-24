import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "../../components/AuthForm";
import Shell from "../../components/Shell";
import { getCurrentUser, safeNext } from "../../lib/auth";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(safeNext(next, user.role === "admin" ? "/admin" : "/account"));

  return (
    <Shell width="max-w-md">
      <AuthForm mode="signup" next={next ? safeNext(next) : undefined} />
    </Shell>
  );
}
