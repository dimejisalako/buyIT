import { redirect } from "next/navigation";

// Orders now live at /admin. This redirect keeps old bookmarks working and can be deleted.
export default function Page() {
  redirect("/admin");
}
