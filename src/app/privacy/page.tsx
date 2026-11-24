import type { Metadata } from "next";
import Shell from "../../components/Shell";
import { contact } from "../../lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  const { email, whatsapp } = contact();
  const reach = [email, whatsapp && "WhatsApp +" + whatsapp].filter(Boolean).join(" or ") || "the contact details in the site footer";

  return (
    <Shell width="max-w-2xl">
      <article className="space-y-6 text-sm leading-relaxed text-ink-soft [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink">
        <h1 className="text-2xl font-semibold text-ink">Privacy policy</h1>
        <p>Last updated: 2026. This explains what we collect when you use Shopbrow and what we do with it.</p>

        <section>
          <h2>What we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Your name, email address and phone number when you create an account.</li>
            <li>Your password, stored only as a salted hash. We can&apos;t read it.</li>
            <li>The items you request, their prices and weights, your notes, and the status and history of your orders.</li>
            <li>Payment status. When you pay online, card and bank details are handled by our payment provider and are not stored by us.</li>
          </ul>
        </section>

        <section>
          <h2>How we use it</h2>
          <p>We use your information to run your account, buy and ship your items, tell you about your orders, and keep the service secure. We use your email and phone number to contact you about your orders. We don&apos;t sell your information and we don&apos;t send you marketing without asking.</p>
        </section>

        <section>
          <h2>Who we share it with</h2>
          <p>We share information only with the services we need to run the site: our hosting and database providers, our payment provider, our email provider, and shipping and customs partners who need your name and delivery details to deliver your order. We may disclose information if the law requires it.</p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>We use one essential cookie to keep you signed in. We don&apos;t use advertising cookies.</p>
        </section>

        <section>
          <h2>Keeping and deleting your data</h2>
          <p>We keep your account and order records for as long as your account is open and as needed for accounting and legal reasons. You can ask us to correct or delete your account information at any time, and we will, except where we must keep records.</p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>For questions or requests about your information, reach us at {reach}.</p>
        </section>
      </article>
    </Shell>
  );
}
