import type { Metadata } from "next";
import Shell from "../../components/Shell";
import { contact } from "../../lib/site";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  const { email, whatsapp } = contact();
  const reach = [email, whatsapp && "WhatsApp +" + whatsapp].filter(Boolean).join(" or ") || "the contact details in the site footer";

  return (
    <Shell width="max-w-2xl">
      <article className="space-y-6 text-sm leading-relaxed text-ink-soft [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink">
        <h1 className="text-2xl font-semibold text-ink">Terms of service</h1>
        <p>Last updated: 2026. By creating an account or placing a request you agree to these terms.</p>

        <section>
          <h2>1. What we do</h2>
          <p>Shopbrow is a personal shopping and forwarding service. You send us a link to an item on Amazon.com. After you pay, we buy the item on your behalf, receive it at a US address and ship it to Nigeria. We are not Amazon and are not affiliated with Amazon.</p>
        </section>

        <section>
          <h2>2. Requests and quotes</h2>
          <p>When you submit a request you send us a link to an item. We check the item, work out its price, weight and shipping, and send you a quote in naira. You are only charged once you pay a quote, and we only buy an item after you have paid. If the price or availability changes before you pay, we may update the quote or decline the request.</p>
        </section>

        <section>
          <h2>3. Your total</h2>
          <p>Your total is made up of the item price, US sales tax, shipping by weight, import duty, our service fee and payment processing fees, converted to naira at the rate shown on your quote. Tax and duty are estimates. Customs charges set by the authorities may differ from our estimate.</p>
        </section>

        <section>
          <h2>4. Items we can&apos;t ship</h2>
          <p>We don&apos;t ship illegal items, weapons, or goods that carriers or customs restrict or prohibit (for example many batteries, aerosols, liquids, flammables and perishables). We may decline any request. If we decline before you pay, you pay nothing. If we can&apos;t fulfil an order you have paid for, we will refund the amount you paid for it.</p>
        </section>

        <section>
          <h2>5. Shipping and delivery</h2>
          <p>We ship in consolidated weekly shipments. Delivery times are estimates and are not guaranteed, because they depend on carriers, customs and other factors outside our control. Your order page shows each step of your order.</p>
        </section>

        <section>
          <h2>6. Problems with an order</h2>
          <p>If an item arrives damaged, missing or not as ordered, contact us promptly with your order reference and we will look into it and work with you on a fair resolution. We are not responsible for delays or seizures by customs or other authorities.</p>
        </section>

        <section>
          <h2>7. Your account</h2>
          <p>Keep your password private and give us accurate contact details. You are responsible for activity on your account. We may suspend accounts that are used for fraud or abuse.</p>
        </section>

        <section>
          <h2>8. Liability</h2>
          <p>To the extent the law allows, our liability for any order is limited to the amount you paid us for that order.</p>
        </section>

        <section>
          <h2>9. Changes</h2>
          <p>We may update these terms. If we make a material change, we will tell you on the site. Continuing to use Shopbrow after a change means you accept it.</p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>Questions about these terms? Reach us at {reach}.</p>
        </section>
      </article>
    </Shell>
  );
}
