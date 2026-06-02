"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  productName?: string;
  productUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ContactMethodModal({ productName, productUrl, isOpen, onClose }: Props) {
  const [step, setStep] = useState<"select" | "phone" | "email">("select");
  const [form, setForm] = useState({ name: "", phone: "", email: "", business_type: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [waNumber, setWaNumber] = useState("918086850000");
  const [phoneDisplay, setPhoneDisplay] = useState("+91 80 86 85 00 00");
  const [phoneRaw, setPhoneRaw] = useState("918086850000");

  useEffect(() => {
    fetch(`${API_URL}/api/v1/website/settings`, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((json) => {
        const s = json.data ?? json;
        if (s.whatsapp_number) setWaNumber(s.whatsapp_number);
        if (s.contact_phone) setPhoneDisplay(s.contact_phone);
        if (s.contact_phone_raw) setPhoneRaw(s.contact_phone_raw);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep("select");
        setSubmitted(false);
        setForm({ name: "", phone: "", email: "", business_type: "", message: "" });
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const waMsg = productName
    ? `https://wa.me/${waNumber}?text=Hi%2C%20I'm%20interested%20in%20` +
      encodeURIComponent(productName) +
      `.%20Product%20Link%3A%20` +
      (productUrl ? encodeURIComponent((process.env.NEXT_PUBLIC_SITE_URL ?? "") + productUrl) : "") +
      `%20Could%20you%20provide%20more%20information%3F`
    : `https://wa.me/${waNumber}?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20packaging%20products.`;

  const handleShare = async () => {
    const url = productUrl
      ? `${process.env.NEXT_PUBLIC_SITE_URL}${productUrl}`
      : window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: productName
            ? `Check out ${productName} from StarBottles`
            : "Check out this product from StarBottles",
          url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, product: productName ?? "General Inquiry" }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-brand-darker/70 z-50 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Modal container */}
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.25)] w-full sm:max-w-md overflow-hidden"
              initial={{ y: 60, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle (mobile) */}
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-start justify-between px-7 pt-6 pb-5 border-b border-gray-100/80">
                <div>
                  <h3 className="font-poppins font-bold text-lg text-gray-900">
                    {step === "select" && "How would you like to connect?"}
                    {step === "phone" && "Request a Call Back"}
                    {step === "email" && (submitted ? "Inquiry Sent!" : "Email Inquiry")}
                  </h3>
                  {productName && step === "select" && (
                    <p className="font-inter text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" />
                      Re: {productName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  {step !== "select" && !submitted && (
                    <button
                      onClick={() => setStep("select")}
                      className="text-xs font-inter text-gray-400 hover:text-brand transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-brand-pale/30"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all duration-200"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-7">
                {/* SELECT STEP */}
                {step === "select" && (
                  <div className="space-y-3">
                    {/* Phone option */}
                    <button
                      onClick={() => setStep("phone")}
                      className="w-full flex items-center gap-4 p-4.5 rounded-2xl border border-gray-100/80 hover:border-brand/25 hover:bg-brand-pale/15 transition-all duration-300 text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-brand-pale/70 flex items-center justify-center flex-shrink-0 group-hover:bg-brand group-hover:text-white transition-all duration-300">
                        <svg className="w-5 h-5 text-brand group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-poppins font-bold text-sm text-gray-900 group-hover:text-brand transition-colors duration-300">
                          Phone Call
                        </p>
                        <p className="font-inter text-xs text-gray-400">Get a call back from our sales team</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-brand group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* WhatsApp option */}
                    <a
                      href={waMsg}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className="w-full flex items-center gap-4 p-4.5 rounded-2xl border border-gray-100/80 hover:border-[#25D366]/30 hover:bg-green-50/30 transition-all duration-300 text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#25D366] transition-all duration-300">
                        <svg className="w-6 h-6 text-[#25D366] group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-poppins font-bold text-sm text-gray-900 group-hover:text-[#25D366] transition-colors duration-300">
                          WhatsApp
                        </p>
                        <p className="font-inter text-xs text-gray-400">Chat with us - fast response</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-[#25D366] transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>

                    {/* Email option */}
                    <button
                      onClick={() => setStep("email")}
                      className="w-full flex items-center gap-4 p-4.5 rounded-2xl border border-gray-100/80 hover:border-blue-200/80 hover:bg-blue-50/20 transition-all duration-300 text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-all duration-300">
                        <svg className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-poppins font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                          Email Inquiry
                        </p>
                        <p className="font-inter text-xs text-gray-400">Send a detailed message</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Share product */}
                    <button
                      onClick={handleShare}
                      className="w-full flex items-center justify-center gap-2 py-3.5 font-inter text-xs text-gray-400 hover:text-brand transition-all duration-300 rounded-xl hover:bg-brand-pale/20"
                    >
                      {copied ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-500 font-medium">Link copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share product
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* PHONE STEP */}
                {step === "phone" && (
                  <div className="text-center py-6">
                    <div className="w-[72px] h-[72px] rounded-2xl bg-brand-pale/60 flex items-center justify-center mx-auto mb-5">
                      <svg className="w-7 h-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <p className="font-inter text-gray-500 text-sm mb-7">
                      Call us directly or let us call you back.
                    </p>
                    <a
                      href={`tel:+${phoneRaw}`}
                      className="block w-full bg-brand hover:bg-brand-light text-white font-poppins font-bold text-lg py-4.5 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(27,33,120,0.3)] hover:shadow-[0_8px_30px_rgba(27,33,120,0.4)] mb-4"
                    >
                      {phoneDisplay}
                    </a>
                    <p className="font-inter text-xs text-gray-400">
                      Mon - Sat, 9:00 AM - 6:00 PM IST
                    </p>
                  </div>
                )}

                {/* EMAIL STEP */}
                {step === "email" && !submitted && (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-inter text-[10px] font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">
                          Mobile Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          required
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="e.g. 9876543210"
                          className="w-full border border-gray-200/80 bg-gray-50/50 rounded-xl px-3.5 py-3 font-inter text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="font-inter text-[10px] font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">
                          Name <span className="text-gray-400 font-normal normal-case">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Your full name"
                          className="w-full border border-gray-200/80 bg-gray-50/50 rounded-xl px-3.5 py-3 font-inter text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-inter text-[10px] font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">
                          Email <span className="text-gray-400 font-normal normal-case">(optional)</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder="you@company.com"
                          className="w-full border border-gray-200/80 bg-gray-50/50 rounded-xl px-3.5 py-3 font-inter text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="font-inter text-[10px] font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">
                          Business Type <span className="text-gray-400 font-normal normal-case">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={form.business_type}
                          onChange={(e) => setForm((p) => ({ ...p, business_type: e.target.value }))}
                          placeholder="e.g. Retailer, Manufacturer"
                          className="w-full border border-gray-200/80 bg-gray-50/50 rounded-xl px-3.5 py-3 font-inter text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-inter text-[10px] font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">
                        Message <span className="text-gray-400 font-normal normal-case">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={form.message}
                        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                        placeholder="Any specific requirements or questions..."
                        className="w-full border border-gray-200/80 bg-gray-50/50 rounded-xl px-3.5 py-3 font-inter text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all duration-300 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand hover:bg-brand-light disabled:opacity-60 text-white font-poppins font-semibold py-4 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(27,33,120,0.3)] hover:shadow-[0_8px_30px_rgba(27,33,120,0.4)] flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending...
                        </>
                      ) : "Send Inquiry"}
                    </button>
                  </form>
                )}

                {step === "email" && submitted && (
                  <div className="text-center py-8">
                    <div className="w-[72px] h-[72px] bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="font-poppins font-bold text-lg text-gray-900 mb-3">
                      Inquiry Sent!
                    </h4>
                    <p className="font-inter text-sm text-gray-500 leading-relaxed">
                      Our team will respond within 24 business hours.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-5 font-inter text-sm text-brand hover:text-brand-dark transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
