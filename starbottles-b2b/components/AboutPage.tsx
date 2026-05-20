"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { CompanyStats, PageContent } from "@/lib/api";

// ─── Shared helpers ───────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const fadeScale = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.95 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
});

// ─── SECTION 1 — Hero ────────────────────────────────────────────────────────
function Hero({ stats }: { stats?: CompanyStats }) {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden pt-28 pb-20 bg-brand-darker">
      {/* Layered background treatment */}
      <div className="absolute inset-0">
        {/* Diagonal gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(14,18,73,1) 0%, rgba(20,25,98,0.95) 35%, rgba(27,33,120,0.3) 70%, rgba(14,18,73,1) 100%)",
          }}
        />
        {/* Geometric grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        {/* Top-right ambient orb */}
        <div
          className="absolute -top-40 -right-40 w-[900px] h-[700px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(42,50,160,0.18) 0%, transparent 60%)",
          }}
        />
        {/* Bottom-left ambient orb */}
        <div
          className="absolute -bottom-20 -left-40 w-[600px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(27,33,120,0.12) 0%, transparent 65%)",
          }}
        />
      </div>

      {/* Large watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span
          className="font-poppins font-black text-[22vw] leading-none"
          style={{ color: "rgba(42,50,160,0.04)", letterSpacing: "-0.05em" }}
        >
          STAR
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <motion.div {...fadeUp(0)} className="flex items-center gap-4 mb-10">
            <div className="h-px w-16 bg-gradient-to-r from-brand-light to-transparent" />
            <span className="font-inter text-xs font-semibold text-brand-light/80 uppercase tracking-[0.25em]">
              Our Story
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 {...fadeUp(0.07)} className="font-poppins font-black leading-[1.02] mb-10">
            <span className="block text-5xl md:text-6xl lg:text-[5.5rem] text-white">
              Packaging India&apos;s
            </span>
            <span
              className="block text-5xl md:text-6xl lg:text-[5.5rem] mt-1"
              style={{
                WebkitTextStroke: "1.5px rgba(42,50,160,0.6)",
                color: "transparent",
              }}
            >
              Best Brands
            </span>
            <span className="block text-5xl md:text-6xl lg:text-[5.5rem] text-brand-light mt-1">
              Since 1967.
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.14)}
            className="font-inter text-white/45 text-lg md:text-xl leading-relaxed max-w-2xl mb-12"
          >
            From a single warehouse in Thrissur to a pan-India supply network — over 50 years
            making premium packaging accessible to every Indian brand, from first-time
            founders to Fortune 500 manufacturers.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.2)} className="flex flex-wrap gap-4 mb-20">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2.5 bg-brand hover:bg-brand-light text-white font-poppins font-semibold text-sm px-8 py-4 rounded-2xl transition-all duration-300 shadow-[0_4px_30px_rgba(27,33,120,0.5)] hover:shadow-[0_8px_40px_rgba(27,33,120,0.6)]"
            >
              Browse Products
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/15 hover:border-brand-light/40 text-white/70 hover:text-white font-inter font-semibold text-sm px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-white/5 backdrop-blur-sm"
            >
              Get in Touch
            </Link>
          </motion.div>

          {/* Stat strip */}
          <motion.div {...fadeUp(0.26)}>
            <div className="inline-flex flex-wrap items-stretch rounded-2xl overflow-hidden border border-white/[0.06] backdrop-blur-md bg-white/[0.02]">
              {[
                { value: stats ? String(stats.established) : "1967", label: "Established" },
                { value: stats ? `${stats.clients.value}${stats.clients.suffix}` : "2200+", label: "Clients" },
                { value: stats ? `${stats.skus.value}${stats.skus.suffix}` : "1500+", label: "SKUs" },
                { value: stats ? `${stats.states.value}${stats.states.suffix}` : "18+", label: "States" },
                { value: "15yrs", label: "Experience" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={`px-7 py-5 text-center ${i > 0 ? "border-l border-white/[0.06]" : ""}`}
                >
                  <p className="font-poppins font-black text-2xl text-white leading-none tracking-tight">
                    {s.value}
                  </p>
                  <p className="font-inter text-[10px] text-white/30 mt-1.5 uppercase tracking-[0.15em]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 5%, rgba(27,33,120,0.6) 30%, rgba(42,50,160,0.8) 50%, rgba(27,33,120,0.6) 70%, transparent 95%)",
        }}
      />
    </section>
  );
}

// ─── SECTION 2 — Story + Timeline ────────────────────────────────────────────
const milestones = [
  { year: "1967", event: "Founded in Thrissur, Kerala — Star Bottles & Glassware Stores established on Railway Station Road, supplying bottles and glassware to pharmaceutical companies." },
  { year: "1984", event: "Expanded into plastic manufacturing, broadening the product range beyond glass packaging." },
  { year: "1998", event: "Packaging operations scaled up; portfolio grows to serve pharmaceutical, cosmetic, and FMCG industries." },
  { year: "2004", event: "PET container manufacturing begins, adopting advanced technology for precision packaging." },
  { year: "2006", event: "Tailor-made packaging solutions launched, supplying major regional and national brands." },
  { year: "2009", event: "Entered closures and dispensing solutions, offering complete end-to-end packaging." },
  { year: "2025", event: "State-of-the-art extrusion blow moulding facility commissioned, expanding manufacturing capacity." },
];

function Story() {
  const [activeMilestone, setActiveMilestone] = useState(6);

  return (
    <section className="py-28 lg:py-36 bg-white relative overflow-hidden">
      {/* Subtle background year watermark */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -left-10 font-poppins font-black pointer-events-none select-none leading-none"
        style={{ fontSize: "26vw", color: "rgba(27,33,120,0.025)", letterSpacing: "-0.05em" }}
        aria-hidden
      >
        1967
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-28 items-start">
          {/* Left: text */}
          <div>
            <motion.div {...fadeUp(0)} className="flex items-center gap-4 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-brand to-transparent" />
              <span className="font-inter text-xs font-semibold text-brand uppercase tracking-[0.25em]">
                Company Background
              </span>
            </motion.div>

            <motion.h2
              {...fadeUp(0.06)}
              className="font-poppins font-black text-4xl md:text-5xl text-gray-900 leading-[1.08] mb-10"
            >
              A Thrissur Story,
              <br />
              <span className="bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                An India Legacy.
              </span>
            </motion.h2>

            <motion.div
              {...fadeUp(0.12)}
              className="space-y-6 font-inter text-gray-500 text-[1.05rem] leading-[1.8]"
            >
              <p>
                Founded over 50 years ago, Star Bottles stands as one of Kerala&apos;s most
                trusted names in plastic and glass packaging. From a humble beginning, we have
                grown into a leading manufacturer and supplier, serving industries that touch
                everyday life — cosmetics, pharmaceuticals, food &amp; beverages, and homecare.
              </p>
              <p>
                By combining advanced technology with decades of expertise, we help brands
                deliver products that are both functional and beautiful — while reducing their
                environmental footprint.
              </p>
              <p>
                Our journey is built on relationships — with customers who trust our consistency,
                with partners who share our values, and with communities we continue to serve
                with pride.
              </p>
            </motion.div>

            {/* Core values chips */}
            <motion.div {...fadeUp(0.18)} className="flex flex-wrap gap-2.5 mt-10">
              {["Quality First", "Transparent Pricing", "Reliable Delivery", "Customer Obsession"].map(
                (v) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-2 font-inter text-xs font-semibold text-brand-dark bg-brand-pale/70 border border-brand/15 px-4 py-2 rounded-full"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                    {v}
                  </span>
                )
              )}
            </motion.div>
          </div>

          {/* Right: interactive timeline */}
          <motion.div {...fadeUp(0.1)} className="relative">
            <div className="sticky top-28">
              <p className="font-inter text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] mb-8">
                Our Journey
              </p>
              <div className="relative">
                {/* Vertical accent line */}
                <div
                  className="absolute left-[19px] top-3 bottom-3 w-[2px]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(27,33,120,0.15) 0%, rgba(27,33,120,0.06) 100%)",
                  }}
                />

                <div className="space-y-1">
                  {milestones.map((m, i) => (
                    <button
                      key={m.year}
                      onMouseEnter={() => setActiveMilestone(i)}
                      onClick={() => setActiveMilestone(i)}
                      className="w-full flex items-start gap-6 text-left group py-3.5 pr-4"
                    >
                      {/* Dot */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          activeMilestone === i
                            ? "bg-brand shadow-[0_0_24px_rgba(27,33,120,0.35)] scale-110"
                            : "bg-gray-50 border border-gray-100 group-hover:bg-brand-pale group-hover:border-brand/20"
                        }`}
                      >
                        <span
                          className={`font-poppins font-bold text-xs transition-colors duration-300 ${
                            activeMilestone === i
                              ? "text-white"
                              : "text-gray-400 group-hover:text-brand"
                          }`}
                        >
                          {m.year.slice(2)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <p
                          className={`font-poppins font-bold text-sm transition-colors duration-300 ${
                            activeMilestone === i
                              ? "text-brand"
                              : "text-gray-400 group-hover:text-gray-700"
                          }`}
                        >
                          {m.year}
                        </p>
                        <p
                          className={`font-inter text-sm leading-relaxed transition-all duration-300 mt-1 ${
                            activeMilestone === i
                              ? "text-gray-700 opacity-100"
                              : "text-gray-400 opacity-70 group-hover:text-gray-600 group-hover:opacity-100"
                          }`}
                        >
                          {m.event}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 3 — Mission · Vision · Values ───────────────────────────────────
function MissionVision() {
  return (
    <section className="py-28 lg:py-36 relative overflow-hidden bg-brand-darker">
      {/* Layered background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(170deg, rgba(14,18,73,1) 0%, rgba(20,25,98,0.95) 50%, rgba(14,18,73,1) 100%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[700px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(27,33,120,0.12) 0%, transparent 65%)",
          }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div {...fadeUp(0)} className="text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-brand-light/50" />
            <span className="font-inter text-xs font-semibold text-brand-light/70 uppercase tracking-[0.25em]">
              What Drives Us
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-brand-light/50" />
          </div>
          <h2 className="font-poppins font-black text-4xl md:text-[3.25rem] text-white leading-tight">
            Mission. Vision. Values.
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mission */}
          <motion.div
            {...fadeScale(0.06)}
            className="relative rounded-3xl p-9 overflow-hidden group"
            style={{
              background:
                "linear-gradient(145deg, rgba(27,33,120,0.25) 0%, rgba(27,33,120,0.08) 100%)",
              border: "1px solid rgba(42,50,160,0.25)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "radial-gradient(circle, rgba(42,50,160,0.25) 0%, transparent 70%)",
                transform: "translate(30%, -30%)",
              }}
            />
            <div className="w-12 h-12 rounded-2xl bg-brand/25 border border-brand/30 flex items-center justify-center text-brand-light mb-6">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="font-inter text-[10px] font-bold text-brand-light uppercase tracking-[0.3em] mb-4">
              Mission
            </p>
            <p className="font-poppins font-bold text-white text-xl leading-snug">
              To be India&apos;s most reliable B2B packaging partner — delivering quality, consistency,
              and trust with every order.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            {...fadeScale(0.12)}
            className="rounded-3xl p-9 group hover:bg-white/[0.06] transition-colors duration-500"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 mb-6 group-hover:text-brand-light group-hover:border-brand/30 transition-all duration-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <p className="font-inter text-[10px] font-bold text-white/35 uppercase tracking-[0.3em] mb-4">
              Vision
            </p>
            <p className="font-poppins font-bold text-white/80 text-xl leading-snug">
              A future where every Indian brand — from startup to enterprise — has access to
              world-class packaging at competitive prices.
            </p>
          </motion.div>

          {/* Values */}
          <motion.div
            {...fadeScale(0.18)}
            className="rounded-3xl p-9 group hover:bg-white/[0.06] transition-colors duration-500"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 mb-6 group-hover:text-brand-light group-hover:border-brand/30 transition-all duration-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <p className="font-inter text-[10px] font-bold text-white/35 uppercase tracking-[0.3em] mb-5">
              Core Values
            </p>
            <div className="space-y-4">
              {[
                { title: "Quality First", desc: "Every product is tested before it ships." },
                { title: "Transparency", desc: "No hidden costs. Honest timelines." },
                { title: "Customer Focus", desc: "Your success is our success." },
                { title: "Innovation", desc: "Always evolving our product range." },
              ].map((v) => (
                <div key={v.title} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-light/60 mt-2.5 flex-shrink-0" />
                  <div>
                    <p className="font-poppins font-semibold text-white/80 text-sm">{v.title}</p>
                    <p className="font-inter text-white/35 text-xs mt-0.5">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 4 — Products & Services ────────────────────────────────────────
const productCategories = [
  {
    title: "Plastic & Glass Packaging",
    desc: "PET bottles, PET jars, HDPE containers & glass jars",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: "Caps, Closures & Dispensers",
    desc: "Pumps, sprayers, flip-tops, trigger closures & more",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Customized Solutions",
    desc: "Bespoke shapes, sizes & branding to fit your product",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
  },
  {
    title: "Eco-Conscious Solutions",
    desc: "Recyclable materials & sustainable packaging choices",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.249 2.249 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643" />
      </svg>
    ),
  },
];

function ProductsServices() {
  return (
    <section className="py-28 lg:py-36 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — copy */}
          <div>
            <motion.p
              {...fadeUp(0)}
              className="font-inter text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-4"
            >
              What We Offer
            </motion.p>
            <motion.h2
              {...fadeUp(0.08)}
              className="font-poppins font-bold text-[2.4rem] lg:text-[3rem] leading-[1.1] tracking-tight text-gray-900 mb-6"
            >
              Products &amp;{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(120deg, #1B2178 0%, #2A32A0 100%)" }}
              >
                Services
              </span>
            </motion.h2>
            <motion.p
              {...fadeUp(0.14)}
              className="font-inter text-base text-gray-500 leading-relaxed max-w-lg"
            >
              We offer a complete range of plastic and glass packaging products and components
              including PET bottles, PET jars, HDPE containers, caps, closures, dispensers,
              and glass jars in customized shapes and sizes.
            </motion.p>
          </div>

          {/* Right — 2×2 card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {productCategories.map((cat, i) => (
              <motion.div
                key={cat.title}
                {...fadeScale(0.1 + i * 0.07)}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-brand/20 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAEBF5] flex items-center justify-center text-brand mb-4 group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                  {cat.icon}
                </div>
                <p className="font-poppins font-semibold text-gray-900 text-sm mb-1">{cat.title}</p>
                <p className="font-inter text-xs text-gray-400 leading-relaxed">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 5 — Manufacturing Expertise ─────────────────────────────────────
const qualityPillars = [
  "Functional and durable",
  "Safe for various product types",
  "Visually appealing and brand-aligned",
  "Sustainable and cost-effective",
];

const materials = ["PET", "HDPE", "LDPE", "PP"];

function ManufacturingExpertise() {
  return (
    <section className="py-28 lg:py-36" style={{ background: "#f7f8fc" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — copy */}
          <div>
            <motion.p
              {...fadeUp(0)}
              className="font-inter text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-4"
            >
              How We Build
            </motion.p>
            <motion.h2
              {...fadeUp(0.08)}
              className="font-poppins font-bold text-[2.4rem] lg:text-[3rem] leading-[1.1] tracking-tight text-gray-900 mb-6"
            >
              Manufacturing{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(120deg, #1B2178 0%, #2A32A0 100%)" }}
              >
                Expertise
              </span>
            </motion.h2>
            <motion.p
              {...fadeUp(0.14)}
              className="font-inter text-base text-gray-500 leading-relaxed max-w-lg mb-10"
            >
              Most advanced manufacturing process with PET, HDPE, LDPE, and PP materials, we ensure
              every container meets global standards. From design to dispatch, our skilled team
              delivers consistent quality and reliability in every product.
            </motion.p>

            <div className="space-y-0 divide-y divide-gray-100">
              {qualityPillars.map((pillar, i) => (
                <motion.div
                  key={pillar}
                  {...fadeUp(0.18 + i * 0.07)}
                  className="flex items-center gap-4 py-4"
                >
                  <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="font-inter font-semibold text-gray-800 text-sm">{pillar}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — dark accent card */}
          <motion.div
            {...fadeScale(0.15)}
            className="rounded-3xl p-10 lg:p-12 relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #141962 0%, #1B2178 50%, #2A32A0 100%)",
            }}
          >
            {/* Background grid */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative z-10">
              <p className="font-inter text-xs font-semibold tracking-[0.18em] uppercase text-white/40 mb-6">
                Materials We Work With
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                {materials.map((mat) => (
                  <span
                    key={mat}
                    className="font-poppins font-bold text-2xl text-white/90 tracking-tight"
                  >
                    {mat}
                    <span className="text-white/20 ml-3 text-xl">·</span>
                  </span>
                ))}
              </div>

              <div className="h-px bg-white/10 mb-8" />

              <div className="grid grid-cols-2 gap-5">
                {[
                  { num: "100%", label: "Quality Checked" },
                  { num: "Global", label: "Standards Met" },
                  { num: "Expert", label: "Skilled Team" },
                  { num: "End-to-End", label: "Design to Dispatch" },
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.05] border border-white/10 rounded-2xl p-4">
                    <p className="font-poppins font-bold text-white text-lg leading-none mb-1">{item.num}</p>
                    <p className="font-inter text-white/40 text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 6 — Why Choose Us ───────────────────────────────────────────────
const whyReasons = [
  {
    title: "50+ years of packaging expertise",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: "Trusted by leading regional and national brands",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: "End-to-end support — from concept to container",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    title: "Flexible production to meet large and small orders",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" />
      </svg>
    ),
  },
  {
    title: "Proven commitment to quality, innovation, and trust",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

function WhyChooseUs() {
  return (
    <section className="py-28 lg:py-36 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — heading */}
          <div>
            <motion.p
              {...fadeUp(0)}
              className="font-inter text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-4"
            >
              Why Choose Us
            </motion.p>
            <motion.h2
              {...fadeUp(0.08)}
              className="font-poppins font-bold text-[2.4rem] lg:text-[3rem] leading-[1.15] tracking-tight text-gray-900 mb-8"
            >
              Because we understand{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(120deg, #1B2178 0%, #2A32A0 100%)" }}
              >
                what&apos;s inside
              </span>{" "}
              matters most
            </motion.h2>
            <motion.div {...fadeUp(0.16)}>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 font-inter text-sm font-semibold text-brand hover:text-brand-dark transition-colors group"
              >
                Become a Partner
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </div>

          {/* Right — reasons list */}
          <div className="space-y-0 divide-y divide-gray-100">
            {whyReasons.map((reason, i) => (
              <motion.div
                key={reason.title}
                {...fadeUp(0.1 + i * 0.07)}
                className="group flex items-center gap-5 py-5 hover:pl-2 transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EAEBF5] flex items-center justify-center text-brand shrink-0 group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                  {reason.icon}
                </div>
                <span className="font-inter font-medium text-gray-700 text-sm leading-snug group-hover:text-gray-900 transition-colors duration-300">
                  {reason.title}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 5 — Industries + Geography ──────────────────────────────────────
const industries = [
  { label: "Cosmetics & Beauty", count: "300+ brands" },
  { label: "Pharma & Nutraceuticals", count: "80+ brands" },
  { label: "FMCG & Personal Care", count: "60+ brands" },
  { label: "Essential Oils & Wellness", count: "40+ brands" },
  { label: "Food & Beverage", count: "20+ brands" },
  { label: "Home Care", count: "15+ brands" },
];

function IndustriesAndReach() {
  return (
    <section className="py-28 lg:py-36 relative overflow-hidden bg-[#f7f8fc]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div {...fadeUp(0)} className="text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-brand/40" />
            <span className="font-inter text-xs font-semibold text-brand uppercase tracking-[0.25em]">
              Business Overview
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-brand/40" />
          </div>
          <h2 className="font-poppins font-black text-4xl md:text-5xl text-gray-900">
            Who We Serve
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Industries */}
          <motion.div
            {...fadeScale(0.06)}
            className="bg-white rounded-3xl p-9 border border-gray-100/80 shadow-[0_4px_40px_rgba(0,0,0,0.04)]"
          >
            <p className="font-poppins font-bold text-gray-900 text-xl mb-8">Industries Served</p>
            <div className="space-y-0">
              {industries.map((ind, i) => (
                <div
                  key={ind.label}
                  className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 group hover:px-2 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-inter text-[10px] font-bold text-gray-300 w-5 tracking-wider">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-inter text-sm font-medium text-gray-700 group-hover:text-brand transition-colors duration-300">
                      {ind.label}
                    </span>
                  </div>
                  <span className="font-inter text-xs font-semibold text-brand bg-brand-pale/60 px-3 py-1.5 rounded-full">
                    {ind.count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Geographic reach */}
          <motion.div
            {...fadeScale(0.1)}
            className="rounded-3xl p-9 relative overflow-hidden"
            style={{
              background: "linear-gradient(150deg, #0E1249 0%, #141962 50%, #1B2178 100%)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(42,50,160,0.25) 0%, transparent 65%)",
                transform: "translate(20%, -20%)",
              }}
            />

            <p className="relative z-10 font-inter text-[10px] font-bold text-brand-light/70 uppercase tracking-[0.3em] mb-3">
              Geographic Reach
            </p>
            <p className="relative z-10 font-poppins font-black text-white text-6xl mb-2 tracking-tight">
              18+
            </p>
            <p className="relative z-10 font-inter text-white/50 text-sm mb-10">
              States across India
            </p>

            {/* State chips */}
            <div className="relative z-10 flex flex-wrap gap-2 mb-10">
              {[
                "Kerala",
                "Tamil Nadu",
                "Karnataka",
                "Maharashtra",
                "Delhi",
                "Gujarat",
                "Telangana",
                "West Bengal",
                "Punjab",
                "Rajasthan",
                "UP",
                "MP",
              ].map((state) => (
                <span
                  key={state}
                  className="font-inter text-xs font-semibold text-white/60 border border-white/10 bg-white/[0.04] px-3.5 py-1.5 rounded-full hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300"
                >
                  {state}
                </span>
              ))}
              <span className="font-inter text-xs text-white/30 px-3 py-1.5">+ more</span>
            </div>

            {/* Logistics detail */}
            <div className="relative z-10 grid grid-cols-2 gap-3">
              {[
                { v: "7-10 days", l: "Average Delivery" },
                { v: "500 units", l: "Min. Order Qty" },
                { v: "Bulk ready", l: "Warehouse Stock" },
                { v: "24 hrs", l: "Quote Response" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl p-4 hover:bg-white/[0.08] transition-colors duration-300"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <p className="font-poppins font-bold text-white text-base">{s.v}</p>
                  <p className="font-inter text-white/35 text-xs mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 6 — Quality Promise ─────────────────────────────────────────────
const qualitySteps = [
  {
    step: "01",
    title: "Raw Material Sourcing",
    desc: "Virgin-grade PET, HDPE, and PP from certified Indian and imported sources only.",
  },
  {
    step: "02",
    title: "Production QC",
    desc: "Dimensional checks and visual inspection at every production stage.",
  },
  {
    step: "03",
    title: "Batch Testing",
    desc: "Leak, drop, and chemical resistance tests on every outgoing batch.",
  },
  {
    step: "04",
    title: "Delivery Inspection",
    desc: "Final count and packaging check before dispatch from our Thrissur warehouse.",
  },
];

function QualitySection() {
  return (
    <section className="py-28 lg:py-36 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Left */}
          <div>
            <motion.div {...fadeUp(0)} className="flex items-center gap-4 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-brand to-transparent" />
              <span className="font-inter text-xs font-semibold text-brand uppercase tracking-[0.25em]">
                Quality & Certifications
              </span>
            </motion.div>
            <motion.h2
              {...fadeUp(0.06)}
              className="font-poppins font-black text-4xl md:text-5xl text-gray-900 leading-tight mb-10"
            >
              Our Quality
              <br />
              <span className="bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                Promise.
              </span>
            </motion.h2>

            <motion.div
              {...fadeUp(0.12)}
              className="space-y-6 font-inter text-gray-500 text-[1.05rem] leading-[1.8] mb-12"
            >
              <p>
                Quality is not a department at StarBottles — it&apos;s the whole company. From the
                resins we source to the boxes we ship in, every step is governed by a documented
                quality process.
              </p>
              <p>
                We hold ISO certification and comply fully with BIS standards for packaging
                materials. All our PET, HDPE, and PP materials are BPA-free and food-grade
                compliant, making them suitable for everything from pharmaceutical syrups to
                premium skincare serums.
              </p>
            </motion.div>

            {/* Cert badges */}
            <motion.div {...fadeUp(0.18)} className="grid grid-cols-2 gap-3">
              {[
                { label: "ISO Certified", color: "text-green-700 bg-green-50/80 border-green-200/60" },
                { label: "BIS Compliant", color: "text-brand-dark bg-brand-pale/60 border-brand/15" },
                { label: "BPA-Free", color: "text-purple-700 bg-purple-50/80 border-purple-200/60" },
                { label: "Food-Grade", color: "text-amber-700 bg-amber-50/80 border-amber-200/60" },
              ].map((c) => (
                <div
                  key={c.label}
                  className={`flex items-center gap-3 border rounded-2xl px-5 py-4 ${c.color} transition-transform duration-300 hover:scale-[1.02]`}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-poppins font-semibold text-sm">{c.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: process steps */}
          <motion.div {...fadeUp(0.1)} className="space-y-0">
            {qualitySteps.map((s, i) => (
              <div
                key={s.step}
                className={`relative flex gap-7 pb-10 ${
                  i < qualitySteps.length - 1
                    ? "border-l-2 border-dashed border-brand/10 ml-5"
                    : "ml-5"
                }`}
              >
                {/* Step circle */}
                <div className="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-white border-2 border-brand flex items-center justify-center flex-shrink-0 shadow-[0_2px_12px_rgba(27,33,120,0.12)]">
                  <span className="font-poppins font-bold text-xs text-brand">{s.step}</span>
                </div>

                {/* Content */}
                <div className="pl-9">
                  <p className="font-poppins font-bold text-gray-900 text-base mb-1.5">{s.title}</p>
                  <p className="font-inter text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 7 — Testimonials ─────────────────────────────────────────────────
const testimonials = [
  {
    quote:
      "StarBottles has been our packaging partner since our first order. The dropper bottles are flawless — zero leakage, great finish, and fast delivery to Kochi every time. Can't imagine working with anyone else.",
    name: "Priya Menon",
    role: "Founder, LunaGlow Cosmetics",
    city: "Kochi",
    metric: "500+ orders since 2020",
    initials: "PM",
    color: "#1B2178",
  },
  {
    quote:
      "We source Boston Round bottles in bulk every month. Quality is consistent, pricing is fair, and they always deliver on time. The team is responsive and handles custom requirements without any hassle.",
    name: "Rajesh Kumar",
    role: "Purchase Manager, HealthFirst Pharma",
    city: "Hyderabad",
    metric: "20,000+ units/month",
    initials: "RK",
    color: "#7c3aed",
  },
  {
    quote:
      "Switched from another supplier two years ago and never looked back. The airless pump bottles are premium quality. Their team even helped us with custom labeling for our new product line.",
    name: "Arun Sharma",
    role: "CEO, NatureCare Wellness",
    city: "Mumbai",
    metric: "Client since 2022",
    initials: "AS",
    color: "#141962",
  },
];

function Testimonials() {
  return (
    <section className="py-28 lg:py-36 relative overflow-hidden bg-[#f7f8fc]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div {...fadeUp(0)} className="text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-brand/40" />
            <span className="font-inter text-xs font-semibold text-brand uppercase tracking-[0.25em]">
              Client Stories
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-brand/40" />
          </div>
          <h2 className="font-poppins font-black text-4xl md:text-5xl text-gray-900">
            Trusted by 500+ Businesses
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              {...fadeUp(i * 0.08)}
              className="group bg-white rounded-3xl p-8 border border-gray-100/80 hover:border-brand/20 transition-all duration-500 flex flex-col shadow-[0_2px_20px_rgba(0,0,0,0.03)]"
              whileHover={{
                y: -8,
                boxShadow: "0 20px 50px rgba(27,33,120,0.1)",
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-6">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="font-inter text-gray-600 text-sm leading-[1.75] flex-1 mb-7">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Footer */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-poppins font-bold text-sm text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                  style={{
                    background: `linear-gradient(135deg, ${t.color}cc, ${t.color})`,
                  }}
                >
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-poppins font-bold text-sm text-gray-900 truncate">{t.name}</p>
                  <p className="font-inter text-xs text-gray-400 truncate">
                    {t.role} / {t.city}
                  </p>
                </div>
                <span
                  className="font-inter text-[10px] font-semibold px-3 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap"
                  style={{ background: `${t.color}10`, color: t.color }}
                >
                  {t.metric}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 8 — Contact CTA ──────────────────────────────────────────────────
function ContactCTA() {
  return (
    <section className="py-28 lg:py-36 relative overflow-hidden bg-brand-darker">
      {/* Layered background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(145deg, #0E1249 0%, #141962 40%, #1B2178 80%, #0E1249 100%)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[700px] h-[600px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at top right, rgba(42,50,160,0.2) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[400px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at bottom left, rgba(27,33,120,0.15) 0%, transparent 65%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: CTA copy */}
          <div>
            <motion.p
              {...fadeUp(0)}
              className="font-inter text-[10px] font-bold text-brand-light/70 uppercase tracking-[0.3em] mb-5"
            >
              Ready to Partner?
            </motion.p>
            <motion.h2
              {...fadeUp(0.06)}
              className="font-poppins font-black text-4xl md:text-5xl text-white leading-tight mb-7"
            >
              Let&apos;s Build Your
              <br />
              Packaging Story
              <br />
              <span className="text-brand-light">Together.</span>
            </motion.h2>
            <motion.p
              {...fadeUp(0.12)}
              className="font-inter text-white/40 text-lg leading-relaxed mb-10 max-w-lg"
            >
              Join 500+ businesses that trust StarBottles. Tell us what you need — we&apos;ll
              respond within 24 hours with a quote tailored to your requirements.
            </motion.p>
            <motion.div {...fadeUp(0.18)} className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2.5 bg-brand hover:bg-brand-light text-white font-poppins font-semibold px-9 py-4.5 rounded-2xl transition-all duration-300 shadow-[0_4px_30px_rgba(27,33,120,0.5)] hover:shadow-[0_8px_40px_rgba(27,33,120,0.6)]"
              >
                Get a Quote
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="https://wa.me/918086850000?text=Hi%2C%20I%27m%20interested%20in%20packaging%20solutions%20from%20StarBottles."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#25D366]/10 border border-[#25D366]/25 hover:bg-[#25D366]/20 hover:border-[#25D366]/40 text-[#25D366] font-poppins font-semibold px-9 py-4.5 rounded-2xl transition-all duration-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Us
              </a>
            </motion.div>
          </div>

          {/* Right: frosted contact card */}
          <motion.div
            {...fadeScale(0.1)}
            className="rounded-3xl p-9 relative backdrop-blur-lg"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div className="flex items-center gap-2.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
              <span className="font-inter text-xs text-white/40">Mon - Sat / 9 AM - 6 PM IST</span>
            </div>

            <div className="space-y-6">
              {[
                {
                  label: "Phone",
                  value: "+91 80868 50000",
                  href: "tel:+918086850000",
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  ),
                },
                {
                  label: "Email",
                  value: "mail@starbottles.in",
                  href: "mailto:mail@starbottles.in",
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  ),
                },
                {
                  label: "Address",
                  value: "Station Avenue, R.S Road, Thrissur, Kerala — 680 001",
                  href: "https://maps.google.com",
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                },
              ].map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-start gap-4 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-brand-light/80 group-hover:text-white transition-all duration-300"
                    style={{
                      background: "rgba(27,33,120,0.2)",
                      border: "1px solid rgba(42,50,160,0.3)",
                    }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <p className="font-inter text-[10px] text-white/30 mb-1 uppercase tracking-wider">
                      {c.label}
                    </p>
                    <p className="font-inter text-sm text-white/70 group-hover:text-white transition-colors duration-300">
                      {c.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-8 pt-7 border-t border-white/[0.06]">
              <Link
                href="/contact"
                className="w-full flex items-center justify-center gap-2.5 font-poppins font-semibold text-sm text-white border border-white/10 hover:border-brand-light/40 hover:bg-white/[0.04] py-3.5 rounded-2xl transition-all duration-300"
              >
                View Full Contact Page
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function AboutPage({ stats, aboutContent }: { stats?: CompanyStats; aboutContent?: PageContent }) {
  return (
    <>
      <Hero stats={stats} />
      <Story />
      <MissionVision />
      <ProductsServices />
      <ManufacturingExpertise />
      <WhyChooseUs />
      <IndustriesAndReach />
      <QualitySection />
      <Testimonials />
      <ContactCTA />
    </>
  );
}
