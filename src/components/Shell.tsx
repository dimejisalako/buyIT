import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

// Standard page frame: header, centered content, footer.
export default function Shell({ children, width = "max-w-xl" }: { children: React.ReactNode; width?: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <SiteHeader />
      <main className={"mx-auto w-full flex-1 px-6 pb-16 pt-4 " + width}>{children}</main>
      <SiteFooter />
    </div>
  );
}
