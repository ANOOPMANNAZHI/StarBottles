"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay },
});

const fadeScale = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.96 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay },
});

const PHONE_ICON = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const WA_ICON = (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
const EMAIL_ICON = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const LOCATION_ICON = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const DEFAULT_SETTINGS = {
  phone: "+91 80 86 85 00 00",
  phoneRaw: "918086850000",
  whatsapp: "918086850000",
  email: "mail@starbottles.in",
  businessHours: "Mon–Sat, 9 AM – 6 PM IST",
};

const HOURS = [
  { day: "Monday - Friday", time: "9:00 AM - 6:00 PM", open: true },
  { day: "Saturday", time: "9:00 AM - 2:00 PM", open: true },
  { day: "Sunday", time: "Closed", open: false },
];

function isCurrentlyOpen() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 6=Sat
  const hour = now.getHours() + now.getMinutes() / 60;
  if (day === 0) return false;
  if (day === 6) return hour >= 9 && hour < 14;
  return hour >= 9 && hour < 18;
}

export default function ContactPage() {
  const [form, setForm] = useState({ phone: "", name: "", email: "", business_type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/website/settings`, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((json) => {
        const s = json.data ?? json;
        setContactInfo({
          phone: s.contact_phone || DEFAULT_SETTINGS.phone,
          phoneRaw: s.contact_phone_raw || DEFAULT_SETTINGS.phoneRaw,
          whatsapp: s.whatsapp_number || DEFAULT_SETTINGS.whatsapp,
          email: s.contact_email || DEFAULT_SETTINGS.email,
          businessHours: s.business_hours || DEFAULT_SETTINGS.businessHours,
        });
      })
      .catch(() => {});
  }, []);

  const waLink = `https://wa.me/${contactInfo.whatsapp}?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20packaging%20products.`;

  // Format raw whatsapp number for display (e.g. "918086850000" → "+91 80 86 85 00 00")
  const waDisplay = contactInfo.whatsapp === contactInfo.phoneRaw
    ? contactInfo.phone
    : `+${contactInfo.whatsapp}`;

  const channels = [
    {
      id: "phone",
      icon: PHONE_ICON,
      label: "Phone",
      value: contactInfo.phone,
      sub: contactInfo.businessHours,
      href: `tel:+${contactInfo.phoneRaw}`,
      accentBg: "bg-brand-pale/80",
      accentText: "text-brand",
    },
    {
      id: "whatsapp",
      icon: WA_ICON,
      label: "WhatsApp",
      value: waDisplay,
      sub: "Fastest response - chat now",
      href: waLink,
      accentBg: "bg-green-50",
      accentText: "text-[#25D366]",
    },
    {
      id: "email",
      icon: EMAIL_ICON,
      label: "Email",
      value: contactInfo.email,
      sub: "Reply within 24 business hours",
      href: `mailto:${contactInfo.email}`,
      accentBg: "bg-blue-50",
      accentText: "text-blue-500",
    },
    {
      id: "locations",
      icon: LOCATION_ICON,
      label: "Our Locations",
      value: "2 Branches",
      sub: "Thrissur & Ernakulam",
      href: "#branches",
      accentBg: "bg-orange-50",
      accentText: "text-orange-500",
    },
  ];
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copyEmail(email: string, key: string) {
    navigator.clipboard.writeText(email);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const open = isCurrentlyOpen();

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative pt-36 pb-24 px-6 lg:px-8 overflow-hidden bg-brand-darker">
        {/* Layered background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, rgba(14,18,73,1) 0%, rgba(20,25,98,0.95) 40%, rgba(27,33,120,0.25) 75%, rgba(14,18,73,1) 100%)",
            }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
          {/* Ambient orbs */}
          <div
            className="absolute -top-32 -right-32 w-[700px] h-[600px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(42,50,160,0.2) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(27,33,120,0.15) 0%, transparent 60%)",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] text-brand-light/80 font-inter text-xs font-semibold px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <span
                className={`w-2 h-2 rounded-full ${open ? "bg-green-400" : "bg-gray-400"}`}
                style={open ? { boxShadow: "0 0 8px rgba(74,222,128,0.8)" } : {}}
              />
              {open ? "We're open now" : "Currently closed"}
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.08)}
            className="font-poppins font-black text-4xl md:text-5xl lg:text-[3.75rem] text-white mb-6 leading-[1.08]"
          >
            Get in Touch
            <br />
            <span className="text-brand-light">with Our Team</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.16)}
            className="font-inter text-white/40 text-lg max-w-2xl mb-14 leading-relaxed"
          >
            Whether you need a bulk quote, product samples, or just want to understand your
            options — we&apos;re here. Response guaranteed within 24 business hours.
          </motion.p>

          {/* Channel cards */}
          <motion.div {...fadeUp(0.22)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {channels.map((c) => {
              const isCopied = copiedKey === `channel-${c.id}`;
              if (c.id === "email") {
                return (
                  <button
                    key={c.id}
                    onClick={() => copyEmail(c.value, `channel-${c.id}`)}
                    className="group flex items-center gap-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.15] hover:shadow-[0_4px_24px_rgba(0,0,0,0.15)] text-left w-full"
                  >
                    <div className={`w-12 h-12 rounded-xl ${c.accentBg} ${c.accentText} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                      {isCopied ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : c.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-inter text-white/40 text-[10px] uppercase tracking-wider mb-0.5">
                        {isCopied ? "Copied!" : c.label}
                      </p>
                      <p className={`font-poppins font-semibold text-sm leading-tight truncate ${isCopied ? "text-green-400" : "text-white"}`}>
                        {c.value}
                      </p>
                      <p className="font-inter text-white/30 text-xs mt-0.5">{c.sub}</p>
                    </div>
                  </button>
                );
              }
              return (
                <a
                  key={c.id}
                  href={c.href}
                  target={c.id === "whatsapp" || c.id === "address" ? "_blank" : undefined}
                  rel={c.id === "whatsapp" || c.id === "address" ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.15] hover:shadow-[0_4px_24px_rgba(0,0,0,0.15)]"
                >
                  <div className={`w-12 h-12 rounded-xl ${c.accentBg} ${c.accentText} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    {c.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-inter text-white/40 text-[10px] uppercase tracking-wider mb-0.5">
                      {c.label}
                    </p>
                    <p className="font-poppins font-semibold text-white text-sm leading-tight truncate">
                      {c.value}
                    </p>
                    <p className="font-inter text-white/30 text-xs mt-0.5">{c.sub}</p>
                  </div>
                </a>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, rgba(27,33,120,0.5) 30%, rgba(42,50,160,0.7) 50%, rgba(27,33,120,0.5) 70%, transparent 95%)",
          }}
        />
      </section>

      {/* ── Branches ── */}
      <section id="branches" className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="mb-10">
            <p className="font-inter text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
              Our Branches
            </p>
            <h2 className="font-poppins font-bold text-2xl lg:text-3xl text-gray-900">
              Visit Us
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {[
              {
                name: "Thrissur Branch",
                phone: "+91 8086850000",
                phoneTel: "tel:+918086850000",
                email: "mail@starbottles.in",
                address: "39/126, CA Chambers, RS Road, Thrissur, Kerala, Pin: 680001",
                mapsHref: "https://maps.google.com/?q=39/126+CA+Chambers+RS+Road+Thrissur+Kerala+680001",
              },
              {
                name: "Ernakulam Branch",
                phone: "+91 8136935777",
                phoneTel: "tel:+918136935777",
                email: "om@starbottles.in",
                address: "Thattaanpady, Panvel Hwy, Amrita Nagar, Edappally, Ernakulam, Kochi, Kerala 682034",
                mapsHref: "https://maps.google.com/?q=Thattaanpady+Panvel+Hwy+Amrita+Nagar+Edappally+Ernakulam+Kochi+Kerala+682034",
              },
            ].map((branch, i) => {
              const emailKey = `branch-${i}`;
              const isEmailCopied = copiedKey === emailKey;
              return (
              <motion.div
                key={branch.name}
                {...fadeUp(0.08 + i * 0.1)}
                className="relative rounded-3xl p-8 lg:p-10 overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, #141962 0%, #1B2178 50%, #2A32A0 100%)",
                }}
              >
                {/* Grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                {/* Ambient orb */}
                <div
                  className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(42,50,160,0.35) 0%, transparent 70%)" }}
                />

                <div className="relative z-10">
                  {/* Branch badge */}
                  <span className="inline-flex items-center gap-2 font-inter text-xs font-semibold text-white/60 tracking-[0.15em] uppercase mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-light" />
                    {branch.name}
                  </span>

                  <div className="space-y-4">
                    {/* Phone */}
                    <a
                      href={branch.phoneTel}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors duration-200">
                        <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                      </div>
                      <span className="font-inter font-semibold text-white text-sm group-hover:text-white/80 transition-colors duration-200">
                        {branch.phone}
                      </span>
                    </a>

                    {/* Email — click to copy */}
                    <button
                      onClick={() => copyEmail(branch.email, emailKey)}
                      className="flex items-center gap-4 group text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors duration-200">
                        {isEmailCopied ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                        )}
                      </div>
                      <span className={`font-inter font-semibold text-sm transition-colors duration-200 ${isEmailCopied ? "text-green-400" : "text-white group-hover:text-white/80"}`}>
                        {isEmailCopied ? "Copied!" : branch.email}
                      </span>
                    </button>

                    {/* Address */}
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </div>
                      <span className="font-inter text-white/70 text-sm leading-relaxed">
                        {branch.address}
                      </span>
                    </div>
                  </div>

                  {/* Get Directions */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <a
                      href={branch.mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-inter text-xs font-semibold text-white/60 hover:text-white transition-colors duration-200 group"
                    >
                      Get Directions
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            );
            })}
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-24 lg:py-32 bg-[#f7f8fc]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
            {/* ── Left: Inquiry Form ── */}
            <div className="lg:col-span-3">
              <motion.div {...fadeUp(0)}>
                <h2 className="font-poppins font-bold text-2xl text-gray-900 mb-1.5">
                  Quick Inquiry
                </h2>
                <p className="font-inter text-gray-400 text-sm mb-8">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>
              </motion.div>

              <motion.div
                {...fadeScale(0.08)}
                className="bg-white rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.04)] border border-gray-100/80 p-9"
              >
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-18 h-18 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 w-[72px] h-[72px]">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-poppins font-bold text-xl text-gray-900 mb-3">Message Sent!</h3>
                    <p className="font-inter text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                      Thank you, <span className="font-medium text-gray-700">{form.name}</span>. Our
                      team will reach out at{" "}
                      <span className="text-brand font-medium">{form.email}</span> within 24 hours.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => {
                          setSubmitted(false);
                          setForm({ phone: "", name: "", email: "", business_type: "", message: "" });
                        }}
                        className="font-inter text-sm text-brand hover:text-brand-dark transition-colors"
                      >
                        Send another message
                      </button>
                      <Link
                        href="/products"
                        className="font-inter text-sm text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Browse products &rarr;
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-inter text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                          Mobile Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="e.g. 9876543210"
                          className="w-full border border-gray-200/80 bg-gray-50/50 rounded-xl px-4 py-3.5 font-inter text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block font-inter text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                          Name <span className="text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          className="w-full border border-gray-200/80 bg-gray-50/50 rounded-xl px-4 py-3.5 font-inter text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-inter text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                          Email <span className="text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@company.com"
                          className="w-full border border-gray-200/80 bg-gray-50/50 rounded-xl px-4 py-3.5 font-inter text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block font-inter text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                          Business Type <span className="text-gray-400 font-normal normal-case">(optional)</span>
                        </label>
                        <input
                          type="text"
                          name="business_type"
                          value={form.business_type}
                          onChange={handleChange}
                          placeholder="e.g. Retailer, Manufacturer"
                          className="w-full border border-gray-200/80 bg-gray-50/50 rounded-xl px-4 py-3.5 font-inter text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-inter text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                        Message <span className="text-gray-400 font-normal normal-case">(optional)</span>
                      </label>
                      <textarea
                        name="message"
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Any specific requirements or questions..."
                        className="w-full border border-gray-200/80 bg-gray-50/50 rounded-xl px-4 py-3.5 font-inter text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all duration-300 resize-none"
                      />
                    </div>

                    {error && (
                      <p className="font-inter text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3.5">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand hover:bg-brand-light disabled:opacity-60 disabled:cursor-not-allowed text-white font-poppins font-semibold text-base py-4 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(27,33,120,0.3)] hover:shadow-[0_8px_30px_rgba(27,33,120,0.4)] flex items-center justify-center gap-2.5"
                    >
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </>
                      )}
                    </button>

                    <p className="font-inter text-xs text-gray-400 text-center">
                      Need a detailed quote?{" "}
                      <Link href="/contact#quote" className="text-brand hover:underline font-medium">
                        Use our full quote form
                      </Link>
                    </p>
                  </form>
                )}
              </motion.div>
            </div>

            {/* ── Right: Map + Hours + Address ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Google Maps embed */}
              <motion.div {...fadeScale(0.06)} className="rounded-3xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.05)] border border-gray-100/80">
                <iframe
                  title="StarBottles Location — Thrissur, Kerala"
                  src="https://maps.google.com/maps?q=Thrissur,Kerala,India&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="280"
                  style={{ border: 0, display: "block" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <div className="bg-white px-6 py-5 flex items-center justify-between">
                  <div>
                    <p className="font-poppins font-semibold text-gray-900 text-sm">
                      StarBottles Warehouse
                    </p>
                    <p className="font-inter text-gray-400 text-xs mt-0.5">
                      Thrissur, Kerala 680 001
                    </p>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Thrissur,Kerala,India"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-inter text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
                  >
                    Get Directions
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </motion.div>

              {/* Business Hours */}
              <motion.div {...fadeScale(0.12)} className="bg-white rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-gray-100/80 p-7">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-brand-pale/70 flex items-center justify-center">
                    <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-poppins font-semibold text-gray-900 text-sm">
                    Business Hours
                  </h3>
                </div>
                <div className="space-y-0">
                  {HOURS.map((h) => (
                    <div
                      key={h.day}
                      className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0"
                    >
                      <span className="font-inter text-sm text-gray-600">{h.day}</span>
                      <span
                        className={`font-inter text-sm font-medium ${h.open ? "text-gray-900" : "text-gray-400"}`}
                      >
                        {h.time}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="font-inter text-xs text-gray-400">
                    IST (India Standard Time, UTC+5:30)
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Full Quote Form CTA ── */}
      <section className="py-20 bg-white border-t border-gray-100/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            {...fadeScale(0)}
            className="rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #0E1249 0%, #141962 50%, #1B2178 100%)",
            }}
          >
            {/* Background orb */}
            <div
              className="absolute top-0 right-0 w-[500px] h-[400px] pointer-events-none"
              style={{
                background: "radial-gradient(ellipse, rgba(42,50,160,0.2) 0%, transparent 65%)",
                transform: "translate(20%, -30%)",
              }}
            />

            <div className="relative z-10">
              <span className="inline-block bg-brand/20 border border-brand/25 text-brand-light font-inter text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4">
                Need a detailed quote?
              </span>
              <h3 className="font-poppins font-bold text-2xl md:text-3xl text-white mb-3">
                Request a Full Product Quote
              </h3>
              <p className="font-inter text-white/40 text-sm max-w-lg leading-relaxed">
                Specify product type, quantity, custom branding requirements, and delivery timeline.
                Our team will respond with detailed pricing within 24 hours.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <a
                href={`tel:+${contactInfo.phoneRaw}`}
                className="inline-flex items-center justify-center gap-2.5 bg-brand hover:bg-brand-light text-white font-poppins font-semibold text-sm px-7 py-4 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(27,33,120,0.4)]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us Now
              </a>
              <Link
                href="/#quote"
                className="inline-flex items-center justify-center gap-2.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] hover:border-white/[0.2] text-white font-poppins font-semibold text-sm px-7 py-4 rounded-2xl transition-all duration-300"
              >
                Full Quote Form
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
