import Link from "next/link";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { primaryButton, secondaryButton } from "../components/ui";
import { getCurrentUser } from "../lib/auth";
import { rates } from "../lib/quote";

const steps = [
  { title: "Paste a link", body: "Copy any Amazon.com product link and paste it in. That's all you do." },
  { title: "Get your total in naira", body: "We check the item, the weight and the shipping, and send you one clear total in naira." },
  { title: "Pay", body: "Pay your quote in naira. We don't buy anything until you've paid." },
  { title: "Track it to your door", body: "We order it, receive it in the US and ship to Nigeria every week. You'll see every step in your account." },
];

const faqs = [
  {
    q: "How long does delivery take?",
    a: "We ship to Nigeria in consolidated weekly shipments. After we order your item and it reaches our US address, it goes out in the next shipment. Your order page updates at every step, so you always know where it is.",
  },
  {
    q: "What does it cost?",
    a: "Your total is the item price, US sales tax, shipping by weight, estimated import duty, our service fee and a small payment fee, all converted to naira. You see the full breakdown before you pay.",
  },
  {
    q: "How do I pay?",
    a: "Once we've checked your item and sent your total, you pay in naira from your order page. Payment instructions are shown there.",
  },
  {
    q: "What can't I order?",
    a: "We can't ship illegal items, weapons, or items that airlines and carriers restrict, such as many batteries, aerosols, liquids and flammables. If we can't ship something, we'll tell you before you pay.",
  },
  {
    q: "What if the price changes or the item is unavailable?",
    a: "We check every request before you pay, so the total you see is based on the current price. If an item can't be bought, we'll tell you and you won't be charged.",
  },
  {
    q: "I forgot my password.",
    a: "Contact us and we'll reset it for you.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  const fee = rates().serviceFeeUsd;
  const cta = user ? (user.role === "admin" ? "/admin" : "/request") : "/signup";

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-10 sm:pt-16">
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Amazon, delivered to Nigeria. Without the stress.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Just paste a product link. We work out the price, weight and shipping, buy it, ship it and deliver it. You pay in naira and follow every step from your account.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={cta} className={primaryButton + " px-7 py-3.5"}>
              {user ? "Request an item" : "Create a free account"}
            </Link>
            <a href="#how-it-works" className={secondaryButton + " px-6 py-3.5 text-base"}>How it works</a>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-8">
            <div>
              <dt className="text-sm text-ink-soft">Service fee</dt>
              <dd className="mt-1 font-medium">${fee.toFixed(2)} per item</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Shipments</dt>
              <dd className="mt-1 font-medium">Weekly</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Shipping</dt>
              <dd className="mt-1 font-medium">By weight</dd>
            </div>
          </dl>
        </section>

        <section id="how-it-works" className="border-y border-line bg-white">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="text-2xl font-semibold">How it works</h2>
            <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage/10 text-sm font-medium text-sage-dark">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-medium">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-semibold">What you pay</h2>
          <p className="mt-2 max-w-xl text-ink-soft">No surprises. Your quote lists every line before you pay.</p>
          <ul className="mt-6 grid max-w-2xl gap-x-10 gap-y-3 text-sm sm:grid-cols-2">
            {[
              "The item price",
              "US sales tax (estimated)",
              "Shipping to Nigeria, by weight",
              "Import duty (estimated)",
              "Our $" + fee.toFixed(2) + " service fee per item",
              "A small payment processing fee",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section id="faq" className="border-t border-line bg-white">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="text-2xl font-semibold">Questions</h2>
            <div className="mt-6 divide-y divide-line border-y border-line">
              {faqs.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {f.q}
                    <span className="text-ink-soft transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold">Ready to shop?</h2>
          <p className="mt-2 text-ink-soft">Create an account and request your first item in a couple of minutes.</p>
          <Link href={cta} className={primaryButton + " mt-6 inline-block px-7 py-3.5"}>
            {user ? "Request an item" : "Get started"}
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
