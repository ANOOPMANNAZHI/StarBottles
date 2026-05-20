"use client";

import { useState } from "react";

const productOptions = [
  "PET Dropper Bottles",
  "Airless Pump Bottles",
  "HDPE Wide-Mouth Jars",
  "PP Cosmetic Containers",
  "Spray Pump Bottles",
  "Boston Round Bottles",
  "Custom / Other",
];

export default function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    product: "",
    quantity: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #f0f1f8 0%, #EAEBF5 40%, #f0f1f8 100%)" }}>
      {/* Subtle background accents */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, rgba(27,33,120,0.06) 0%, transparent 60%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, rgba(27,33,120,0.04) 0%, transparent 60%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          {/* Left: Info */}
          <div className="lg:sticky lg:top-32">
            <span className="inline-flex items-center gap-2 bg-white text-brand-dark font-inter text-xs font-bold px-5 py-2 rounded-full mb-5 shadow-sm tracking-[0.15em] uppercase">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get a Quote
            </span>
            <h2 className="font-poppins font-extrabold text-3xl md:text-4xl lg:text-[2.6rem] text-gray-900 mb-5 leading-tight">
              Ready to Order?
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Let&apos;s Talk Packaging.</span>
            </h2>
            <p className="font-inter text-gray-500 text-lg mb-10 leading-relaxed">
              Fill in your requirements and our team will get back to you within 24 hours with a
              detailed quote and product samples if needed.
            </p>

            <div className="space-y-5">
              {[
                { icon: (
                  <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ), title: "Fast Response", desc: "Quote within 24 business hours" },
                { icon: (
                  <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ), title: "Low MOQ", desc: "Starting from 300 units per SKU" },
                { icon: (
                  <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ), title: "Custom Branding", desc: "Logo printing & colour options" },
                { icon: (
                  <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ), title: "Pan India Delivery", desc: "Reliable logistics across 18+ states" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100 group-hover:border-brand/20 group-hover:shadow-md group-hover:shadow-brand/5 transition-all duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-poppins font-bold text-gray-900 text-sm">{item.title}</p>
                    <p className="font-inter text-gray-500 text-sm mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-brand/10">
              <p className="font-inter text-sm text-gray-400 mb-2">Prefer to call?</p>
              <a
                href="tel:+918086850000"
                className="inline-flex items-center gap-2 font-poppins font-bold text-brand text-lg hover:text-brand-dark transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +91 80 86 85 00 00
              </a>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-3xl shadow-xl shadow-brand/5 p-8 lg:p-10 border border-gray-100/50">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-poppins font-extrabold text-xl text-gray-900 mb-2">Quote Request Sent!</h3>
                <p className="font-inter text-gray-500 leading-relaxed">
                  Thank you, {form.name}. Our team will reach out to you at{" "}
                  <span className="text-brand font-semibold">{form.email}</span> within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form header */}
                <div className="mb-2">
                  <h3 className="font-poppins font-bold text-lg text-gray-900">Request a Quote</h3>
                  <p className="font-inter text-sm text-gray-400 mt-1">All fields marked with * are required</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-inter text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Rahul Sharma"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand/10 transition-all duration-200 bg-gray-50/50 hover:border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block font-inter text-sm font-semibold text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Acme Cosmetics Pvt Ltd"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand/10 transition-all duration-200 bg-gray-50/50 hover:border-gray-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-inter text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="rahul@company.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand/10 transition-all duration-200 bg-gray-50/50 hover:border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block font-inter text-sm font-semibold text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand/10 transition-all duration-200 bg-gray-50/50 hover:border-gray-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-inter text-sm font-semibold text-gray-700 mb-2">
                      Product Interested In <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="product"
                      required
                      value={form.product}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-900 focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand/10 transition-all duration-200 bg-gray-50/50 hover:border-gray-300 appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
                    >
                      <option value="" disabled>Select a product</option>
                      {productOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-inter text-sm font-semibold text-gray-700 mb-2">
                      Estimated Quantity
                    </label>
                    <input
                      type="text"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="e.g. 5,000 units/month"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand/10 transition-all duration-200 bg-gray-50/50 hover:border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-inter text-sm font-semibold text-gray-700 mb-2">
                    Additional Requirements
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about custom sizes, colours, branding needs, or any other specifics..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand/10 transition-all duration-200 resize-none bg-gray-50/50 hover:border-gray-300"
                  />
                </div>

                {error && (
                  <p className="font-inter text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand to-brand-light hover:from-brand-dark hover:to-brand disabled:opacity-60 disabled:cursor-not-allowed text-white font-poppins font-bold text-base py-4 rounded-xl transition-all duration-300 shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30"
                >
                  {loading ? "Sending..." : "Send Quote Request"}
                </button>

                <p className="font-inter text-xs text-gray-400 text-center leading-relaxed">
                  By submitting, you agree to our privacy policy. We never share your data.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
