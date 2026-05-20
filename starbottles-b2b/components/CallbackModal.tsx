"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const emptyForm = { phone: "", name: "", email: "", business_type: "", message: "" };

export default function CallbackModal({ isOpen, onClose }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setForm(emptyForm);
        setErrors({});
        setSubmitted(false);
        setServerError("");
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

  const validate = () => {
    const e: Partial<typeof emptyForm> = {};
    if (!form.phone.trim()) e.phone = "Mobile number is required";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      const res = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof emptyForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((err) => ({ ...err, [key]: undefined }));
    },
  });

  const inputClass = (key: keyof typeof emptyForm) =>
    `w-full font-inter text-sm text-gray-800 bg-gray-50 border rounded-xl px-4 py-3 outline-none transition-all duration-200 placeholder:text-gray-400
    focus:bg-white focus:border-brand/60 focus:ring-2 focus:ring-brand/10
    ${errors[key] ? "border-red-400 bg-red-50/30" : "border-gray-200 hover:border-gray-300"}`;

  if (typeof document === "undefined") return null;

  return createPortal(
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
                    {submitted ? "Request Received!" : "Request a Call Back"}
                  </h3>
                  {!submitted && (
                    <p className="font-inter text-xs text-gray-400 mt-1">
                      We&apos;ll call you back within 24 hours
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all duration-200 ml-4 mt-0.5"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-7 py-6">
                {submitted ? (
                  <div className="flex flex-col items-center py-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-inter text-sm text-gray-600 leading-relaxed">
                      Thank you, <span className="font-semibold text-gray-800">{form.name}</span>!<br />
                      Our team will call you on <span className="font-semibold text-gray-800">{form.phone}</span> shortly.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-6 font-poppins font-semibold text-sm text-white bg-gradient-to-r from-brand to-brand-dark px-8 py-3 rounded-xl hover:shadow-[0_4px_16px_rgba(27,33,120,0.3)] transition-all duration-200"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Mobile Number */}
                    <div>
                      <label className="block font-inter text-xs font-medium text-gray-600 mb-1.5">
                        Mobile Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        className={inputClass("phone")}
                        {...field("phone")}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-500 font-inter">{errors.phone}</p>}
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block font-inter text-xs font-medium text-gray-600 mb-1.5">
                        Name <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        className={inputClass("name")}
                        {...field("name")}
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-500 font-inter">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block font-inter text-xs font-medium text-gray-600 mb-1.5">
                        Email <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="you@company.com"
                        className={inputClass("email")}
                        {...field("email")}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500 font-inter">{errors.email}</p>}
                    </div>

                    {/* Business Type */}
                    <div>
                      <label className="block font-inter text-xs font-medium text-gray-600 mb-1.5">
                        Business Type <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Retailer, Manufacturer, Distributor"
                        className={inputClass("business_type")}
                        {...field("business_type")}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block font-inter text-xs font-medium text-gray-600 mb-1.5">
                        Message <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Any specific requirements or questions…"
                        className={`${inputClass("message")} resize-none`}
                        {...field("message")}
                      />
                    </div>

                    {serverError && (
                      <p className="text-xs text-red-500 font-inter">{serverError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full font-poppins font-semibold text-sm text-white bg-gradient-to-r from-brand to-brand-dark py-3.5 rounded-xl
                        hover:shadow-[0_4px_20px_rgba(27,33,120,0.35)] transition-all duration-200
                        disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Submitting…
                        </>
                      ) : (
                        <>
                          Request Call Back
                          <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
