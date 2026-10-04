"use client";
import { useState } from "react";
import Link from "next/link";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-sage focus:outline-none focus:ring-4 focus:ring-sage/15";

function Check({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#5d7a68]"
      />
      <span>{children}</span>
    </label>
  );
}

const steps = [
  { n: "1", title: "Paste a link", body: "Copy any Amazon.com product link and send it to us." },
  { n: "2", title: "We buy and ship", body: "We purchase it, consolidate your orders and fly them out weekly." },
  { n: "3", title: "Pick up in Nigeria", body: "Pay in naira or dollars. We keep you updated at every step." },
];

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    consentEmail: false,
    consentSms: false,
    acceptedTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    position?: number;
  }>({ type: null, message: "" });
  const [showTermsModal, setShowTermsModal] = useState(false);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({
          type: "success",
          message: data.message,
          position: data.position,
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          consentEmail: false,
          consentSms: false,
          acceptedTerms: false,
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Something went wrong",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.phone &&
    (formData.consentEmail || formData.consentSms) &&
    formData.acceptedTerms;

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-xl font-semibold tracking-tight">
          Shop<span className="text-sage">brow</span>
        </span>
        <span className="text-sm text-ink-soft">Coming soon</span>
      </header>

      <main className="mx-auto grid max-w-5xl gap-14 px-6 pb-20 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:pt-16">
        <section>
          <p className="mb-5 text-sm font-medium text-sage">Early access is open</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Amazon, delivered to Nigeria. Without the stress.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            Paste a product link and we handle the rest: buying, consolidating and shipping to your door.
          </p>

          <Link href="/request" className="mt-8 inline-block text-sage underline underline-offset-4 hover:text-sage-dark">
            Already have an item in mind? Get a naira estimate
          </Link>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-8">
            <div>
              <dt className="text-sm text-ink-soft">Service fee</dt>
              <dd className="mt-1 font-medium">$1.50 per item</dd>
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

          <ol className="mt-12 space-y-6">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sm font-medium text-sage">
                  {step.n}
                </span>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-ink-soft">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="lg:pt-2">
          <div className="rounded-3xl border border-line bg-white p-8 shadow-[0_1px_2px_rgba(43,47,44,0.04),0_12px_32px_-12px_rgba(43,47,44,0.10)]">
            {submitStatus.type === "success" ? (
              <div className="py-6 text-center" role="status">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sage/10 text-sage">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">You&apos;re on the list</h2>
                <p className="mt-2 text-ink-soft">{submitStatus.message}</p>
                {submitStatus.position && (
                  <p className="mt-4 text-sm text-ink-soft">You&apos;re #{submitStatus.position}.</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold">Join the interest list</h2>
                  <p className="mt-1 text-ink-soft">We&apos;ll let you know when we launch.</p>
                </div>

                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Full name</label>
                  <input id="name" type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ada Okafor" autoComplete="name" className={inputClass} required />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
                  <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="ada@example.com" autoComplete="email" className={inputClass} required />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">Phone</label>
                  <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+234 800 000 0000" autoComplete="tel" className={inputClass} required />
                </div>

                <fieldset className="space-y-3 pt-1">
                  <legend className="mb-2 text-sm font-medium">How can we reach you?</legend>
                  <Check name="consentEmail" checked={formData.consentEmail} onChange={handleInputChange}>
                    Updates by email
                  </Check>
                  <Check name="consentSms" checked={formData.consentSms} onChange={handleInputChange}>
                    Updates by SMS
                  </Check>
                </fieldset>

                <Check name="acceptedTerms" checked={formData.acceptedTerms} onChange={handleInputChange}>
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-sage underline underline-offset-2 hover:text-sage-dark"
                  >
                    Terms &amp; Conditions
                  </button>
                </Check>

                {submitStatus.type === "error" && (
                  <p role="alert" className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
                    {submitStatus.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full rounded-xl bg-sage py-3.5 font-medium text-white hover:bg-sage-dark focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/25 disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
                >
                  {isSubmitting ? "Joining…" : "Join the list"}
                </button>
                <p className="text-center text-xs text-ink-soft">
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-ink-soft sm:flex-row">
          <p>© 2026 Shopbrow</p>
          <div className="flex gap-6">
            <button onClick={() => setShowTermsModal(true)} className="hover:text-ink">
              Terms &amp; Conditions
            </button>
            <a href="mailto:support@shopbrow.com" className="hover:text-ink">Contact</a>
          </div>
        </div>
      </footer>

      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Terms and Conditions">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowTermsModal(false)} />
          <div className="relative flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="text-lg font-semibold">Terms &amp; Conditions</h3>
              <button onClick={() => setShowTermsModal(false)} aria-label="Close" className="text-ink-soft hover:text-ink">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-ink-soft">
              <h4 className="font-medium text-ink">1. Interest List Terms</h4>
              <p>
                By joining the Shopbrow interest list, you agree to receive communications about our service launch, 
                updates, and promotional offers through your selected contact methods (email and/or SMS).
              </p>

              <h4 className="font-medium text-ink">2. Service Description</h4>
              <p>
                Shopbrow is a shopping assistance service that helps Nigerian customers purchase products from 
                Amazon.com. We consolidate purchases and arrange delivery to Nigeria for a flat service fee.
              </p>

              <h4 className="font-medium text-ink">3. Data Collection & Privacy</h4>
              <p>
                We collect your name, email, and phone number solely for the purpose of contacting you about 
                our service. Your data is stored securely and will not be sold to third parties.
              </p>

              <h4 className="font-medium text-ink">4. Communication Consent</h4>
              <p>
                By checking the consent boxes, you authorize Shopbrow to contact you via your selected methods. 
                You can unsubscribe at any time by contacting us at support@shopbrow.com.
              </p>

              <h4 className="font-medium text-ink">5. SMS Terms</h4>
              <p>
                Message and data rates may apply for SMS communications. Message frequency varies based on 
                account activity and promotions.
              </p>

              <h4 className="font-medium text-ink">6. Changes to Terms</h4>
              <p>
                We reserve the right to modify these terms at any time. Continued participation in our 
                interest list after changes constitutes acceptance of the new terms.
              </p>

              <h4 className="font-medium text-ink">7. Contact Information</h4>
              <p>
                For any questions about these terms, please contact us at:<br />
                Email: support@shopbrow.com<br />
                Location: Lagos, Nigeria
              </p>
            </div>
            <div className="border-t border-line px-6 py-4">
              <button onClick={() => setShowTermsModal(false)} className="w-full rounded-xl bg-sage py-3 font-medium text-white hover:bg-sage-dark">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
