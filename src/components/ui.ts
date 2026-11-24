// Shared Tailwind class strings so every form and button looks the same.
export const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-sage focus:outline-none focus:ring-4 focus:ring-sage/15";

export const primaryButton =
  "rounded-xl bg-sage px-5 py-3 font-medium text-white hover:bg-sage-dark focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/25 disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft";

export const secondaryButton =
  "rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:border-sage hover:text-sage-dark focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/15 disabled:cursor-not-allowed disabled:opacity-50";

export const card =
  "rounded-3xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(43,47,44,0.04),0_12px_32px_-12px_rgba(43,47,44,0.10)] sm:p-8";

export const errorBox = "rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay";
export const okBox = "rounded-xl bg-sage/10 px-4 py-3 text-sm text-sage-dark";

export const usd = (n: number) => "$" + n.toFixed(2);
export const ngn = (n: number) => "₦" + n.toLocaleString("en-NG");
