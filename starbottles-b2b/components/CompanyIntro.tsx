"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { CompanyStats, PageContent } from "@/lib/api";

const differentiators = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: "1500+ SKUs",
    value: "Ready to Ship",
    desc: "The largest catalogue of plastic packaging in South India — dropper bottles, pumps, jars, sprays, and more, all in stock.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: "BIS & ISO Certified",
    value: "Quality First",
    desc: "Every batch is tested for leakage, chemical resistance, and dimensional accuracy before it leaves our facility.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "18+ States",
    value: "Pan-India Reach",
    desc: "Logistics network covering 18+ states — reliable, on-time bulk deliveries to cosmetic brands, pharma companies, and FMCG manufacturers.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    title: "Custom OEM",
    value: "Your Brand, Your Shape",
    desc: "From custom coloring and printing to entirely new mould designs — we build packaging that makes your brand unmistakable on the shelf.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function CompanyIntro({ stats, homeContent }: { stats?: CompanyStats; homeContent?: PageContent }) {
  const statsGrid = [
    { value: stats ? String(stats.established) : "1967", label: "Year Founded" },
    { value: stats ? `${stats.clients.value}${stats.clients.suffix}` : "2200+", label: "Active Clients" },
    { value: stats ? `${stats.skus.value}${stats.skus.suffix}` : "1500+", label: "SKUs in Stock" },
    { value: stats ? `${stats.states.value}${stats.states.suffix}` : "18+", label: "States Served" },
  ];
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-white via-brand-pale/20 to-white relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div
        className="absolute top-20 -left-20 w-[600px] h-[600px] rounded-full pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, rgba(27,33,120,0.07) 0%, transparent 60%)" }}
      />
      <div
        className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, rgba(27,33,120,0.05) 0%, transparent 60%)" }}
      />
      {/* Thin decorative line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/10 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

        {/* Top: two-column intro */}
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-24 items-center mb-24">

          {/* Left: overview paragraphs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-12 bg-gradient-to-b from-brand via-brand-light to-brand/30 rounded-full" />
              <span className="font-inter text-[13px] font-bold text-brand uppercase tracking-[0.2em]">
                Who We Are
              </span>
            </div>

            <h2 className="font-poppins font-extrabold text-4xl md:text-[2.75rem] lg:text-[3rem] text-gray-900 leading-[1.15] mb-8">
              Kerala&apos;s Leading{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">
                  B2B Packaging
                </span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-brand/8 rounded-sm -z-0" />
              </span>{" "}
              Partner
            </h2>

            <div className="space-y-5 font-inter text-gray-500 text-[1.0625rem] leading-[1.8]">
              <p>
                Founded over 50 years ago, Star Bottles stands as one of Kerala&apos;s most trusted
                names in plastic and glass packaging. From a humble beginning, we have grown into
                a leading manufacturer and supplier, serving industries that touch everyday life —
                cosmetics, pharmaceuticals, food &amp; beverages, and homecare.
              </p>
              <p>
                By combining advanced technology with decades of expertise, we help brands deliver
                products that are both functional and beautiful — while reducing their environmental
                footprint.
              </p>
              <p>
                Our journey is built on relationships — with customers who trust our consistency,
                with partners who share our values, and with communities we continue to serve
                with pride.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-10">
              <Link
                href="/about"
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-brand to-brand-light hover:from-brand-dark hover:to-brand text-white font-poppins font-semibold text-sm px-7 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:shadow-xl"
              >
                Learn More About Us
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 font-inter font-semibold text-sm text-gray-500 hover:text-brand border border-gray-200 hover:border-brand/30 px-6 py-3.5 rounded-xl transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Talk to Our Team
              </Link>
            </div>
          </motion.div>

          {/* Right: quick-fact card stack */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Main card */}
            <div
              className="rounded-3xl p-8 md:p-10 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(145deg, #0E1249 0%, #1B2178 50%, #2A32A0 100%)" }}
            >
              {/* Geometric pattern */}
              <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              {/* Top-right glow */}
              <div
                className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)",
                  transform: "translate(30%, -30%)",
                }}
              />
              {/* Bottom-left glow */}
              <div
                className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(42,50,160,0.4) 0%, transparent 60%)",
                  transform: "translate(-30%, 30%)",
                }}
              />

              <p className="relative z-10 font-inter text-white/60 text-xs font-bold uppercase tracking-[0.25em] mb-8">
                StarBottles at a Glance
              </p>

              <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
                {[
                  ...statsGrid,
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.08] hover:bg-white/[0.12] transition-colors duration-300"
                  >
                    <p className="font-poppins font-extrabold text-3xl md:text-[2.2rem] text-white leading-none tracking-tight">{stat.value}</p>
                    <p className="font-inter text-[11px] text-white/40 mt-2 uppercase tracking-wider font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div className="relative z-10 flex flex-wrap gap-2">
                {["ISO Certified", "BIS Compliant", "Made in India", "Pan-India Logistics"].map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-2 font-inter text-[11px] font-semibold text-white/70 bg-white/[0.06] border border-white/[0.08] px-3.5 py-2 rounded-full"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-5 -left-3 bg-white border border-gray-100 shadow-2xl shadow-brand/10 rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <p className="font-poppins font-bold text-gray-900 text-sm leading-tight">Thrissur, Kerala</p>
                <p className="font-inter text-xs text-gray-400 mt-0.5">Headquarters & Warehouse</p>
              </div>
            </div>

            {/* Top-right floating accent */}
            <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-gradient-to-br from-brand/20 to-brand-light/10 blur-2xl pointer-events-none" />
          </motion.div>
        </div>

        {/* Bottom: 4 differentiator cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {/* Heading */}
          <motion.div variants={itemVariants} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 font-inter text-xs font-bold text-brand uppercase tracking-[0.2em] mb-3">
              <span className="w-8 h-px bg-brand/40" />
              Why StarBottles
              <span className="w-8 h-px bg-brand/40" />
            </span>
            <h3 className="font-poppins font-extrabold text-3xl md:text-[2.2rem] text-gray-900 mt-2">
              Built for Scale, Obsessed with Quality
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentiators.map((d, idx) => (
              <motion.div
                key={d.title}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group relative bg-white rounded-2xl p-7 border border-gray-100/80 hover:border-brand/20 transition-all duration-400"
                style={{
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.02)",
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                  style={{ boxShadow: "0 16px 48px rgba(27,33,120,0.12), 0 0 0 1px rgba(27,33,120,0.08)" }}
                />

                {/* Top accent bar */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-brand/0 to-transparent group-hover:via-brand/40 transition-all duration-500" />

                {/* Number watermark */}
                <span className="absolute top-4 right-5 font-poppins font-black text-5xl text-brand/[0.04] group-hover:text-brand/[0.08] transition-colors duration-300 select-none pointer-events-none">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-brand-pale to-brand-pale/60 rounded-2xl flex items-center justify-center text-brand mb-5 group-hover:bg-gradient-to-br group-hover:from-brand group-hover:to-brand-light group-hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-brand/20">
                  {d.icon}
                </div>

                {/* Value chip */}
                <span className="inline-block font-inter text-[11px] font-bold text-brand bg-brand/[0.06] px-3 py-1 rounded-full mb-3 tracking-wide">
                  {d.value}
                </span>

                <h4 className="font-poppins font-bold text-gray-900 text-[1rem] mb-2.5 leading-snug">
                  {d.title}
                </h4>
                <p className="font-inter text-gray-500 text-[0.84rem] leading-relaxed">
                  {d.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
