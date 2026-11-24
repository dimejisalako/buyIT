import { redirect } from "next/navigation";

// Old tracking links now lead to the customer's account. This redirect can be deleted.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect("/account/orders/" + id);
}
