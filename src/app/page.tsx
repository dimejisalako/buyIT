"use client";
import { useState } from "react";

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-6 px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Shop<span className="text-emerald-400">brow</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-amber-400/90 text-sm font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
              </svg>
              Coming Soon
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center">
            {/* Left column - Copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Now accepting early access signups
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Shop Amazon.
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 bg-clip-text text-transparent">
                  Delivered to Nigeria.
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                No more expensive shipping fees. We consolidate your Amazon purchases and deliver them to your doorstep in Nigeria. <span className="text-amber-400 font-semibold">$1.50 service fee</span> per item + shipping fees.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 mb-8">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white">$1.50</div>
                  <div className="text-slate-400 text-sm">Per Item + US Delivery</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white">Weekly</div>
                  <div className="text-slate-400 text-sm">Shipments to Nigeria</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white">By Weight</div>
                  <div className="text-slate-400 text-sm">Shipping Fees</div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Secure Payments
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                  No Hidden Fees
                </div>
              </div>
            </div>

            {/* Right column - Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Join the Interest List
                  </h2>
                  <p className="text-slate-400">
                    Be the first to know when we launch
                  </p>
                </div>

                {submitStatus.type === "success" ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">You&apos;re on the list!</h3>
                    <p className="text-slate-400 mb-4">{submitStatus.message}</p>
                    {submitStatus.position && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium">
                        You&apos;re #{submitStatus.position} on the waitlist
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+234 XXX XXX XXXX"
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        required
                      />
                    </div>

                    {/* Consent checkboxes */}
                    <div className="space-y-3 pt-2">
                      <p className="text-slate-400 text-sm font-medium">
                        How can we contact you?
                      </p>
                      
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            name="consentEmail"
                            checked={formData.consentEmail}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 bg-white/5 border border-white/20 rounded-md peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                            {formData.consentEmail && (
                              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-slate-300 text-sm">
                          I consent to receive updates via <strong>email</strong>
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            name="consentSms"
                            checked={formData.consentSms}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 bg-white/5 border border-white/20 rounded-md peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                            {formData.consentSms && (
                              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-slate-300 text-sm">
                          I consent to receive updates via <strong>SMS/text</strong>
                        </span>
                      </label>
                    </div>

                    {/* Terms checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            name="acceptedTerms"
                            checked={formData.acceptedTerms}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 bg-white/5 border border-white/20 rounded-md peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                            {formData.acceptedTerms && (
                              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-slate-300 text-sm">
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                          >
                            Terms & Conditions
                          </button>
                        </span>
                      </label>
                    </div>

                    {/* Error message */}
                    {submitStatus.type === "error" && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                        {submitStatus.message}
                      </div>
                    )}

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className={`w-full py-4 rounded-xl font-semibold text-lg transition-all transform ${
                        isFormValid && !isSubmitting
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/25"
                          : "bg-slate-700 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Joining...
                        </span>
                      ) : (
                        "Join the Interest List"
                      )}
                    </button>

                    <p className="text-center text-slate-500 text-xs">
                      We respect your privacy. Unsubscribe anytime.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
            <p>© 2026 Shopbrow. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowTermsModal(true)}
                className="hover:text-slate-300 transition-colors"
              >
                Terms & Conditions
              </button>
              <a href="mailto:support@shopbrow.com" className="hover:text-slate-300 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowTermsModal(false)}
          />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Terms & Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-slate-300 space-y-4">
              <h4 className="text-lg font-semibold text-white">1. Interest List Terms</h4>
              <p>
                By joining the Shopbrow interest list, you agree to receive communications about our service launch, 
                updates, and promotional offers through your selected contact methods (email and/or SMS).
              </p>

              <h4 className="text-lg font-semibold text-white">2. Service Description</h4>
              <p>
                Shopbrow is a shopping assistance service that helps Nigerian customers purchase products from 
                Amazon.com. We consolidate purchases and arrange delivery to Nigeria for a flat service fee.
              </p>

              <h4 className="text-lg font-semibold text-white">3. Data Collection & Privacy</h4>
              <p>
                We collect your name, email, and phone number solely for the purpose of contacting you about 
                our service. Your data is stored securely and will not be sold to third parties.
              </p>

              <h4 className="text-lg font-semibold text-white">4. Communication Consent</h4>
              <p>
                By checking the consent boxes, you authorize Shopbrow to contact you via your selected methods. 
                You can unsubscribe at any time by contacting us at support@shopbrow.com.
              </p>

              <h4 className="text-lg font-semibold text-white">5. SMS Terms</h4>
              <p>
                Message and data rates may apply for SMS communications. Message frequency varies based on 
                account activity and promotions.
              </p>

              <h4 className="text-lg font-semibold text-white">6. Changes to Terms</h4>
              <p>
                We reserve the right to modify these terms at any time. Continued participation in our 
                interest list after changes constitutes acceptance of the new terms.
              </p>

              <h4 className="text-lg font-semibold text-white">7. Contact Information</h4>
              <p>
                For any questions about these terms, please contact us at:<br />
                Email: support@shopbrow.com<br />
                Location: Lagos, Nigeria
              </p>
            </div>
            <div className="sticky bottom-0 bg-slate-900 border-t border-white/10 px-6 py-4">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
