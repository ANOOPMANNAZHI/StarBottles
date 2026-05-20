"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Browse & Select",
    description:
      "Explore our range of 100+ packaging SKUs across PET, HDPE, and PP. Filter by product type, size, and material to find the perfect fit for your brand.",
    icon: "🔍",
    cta: { label: "View Products", href: "/products" },
  },
  {
    number: "02",
    title: "Request a Quote",
    description:
      "Fill in your requirements — product type, quantity, and branding needs. Our team reviews your request and responds within 24 business hours.",
    icon: "📋",
    cta: { label: "Get a Quote", href: "/contact" },
  },
  {
    number: "03",
    title: "Receive & Scale",
    description:
      "Approve samples, confirm your order, and receive delivery anywhere in India. As your business grows, we scale with you — same quality, better pricing.",
    icon: "🚀",
    cta: null,
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-16 lg:py-20 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #080e1e 0%, #0E1249 60%, #0a1628 100%)" }}>
      {/* Centered radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(27,33,120,0.15) 0%, transparent 55%)" }}
      />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] text-brand-light font-inter text-xs font-bold px-5 py-2 rounded-full mb-6 tracking-[0.2em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-light animate-pulse" />
            How It Works
          </span>
          <h2 className="font-poppins font-extrabold text-4xl md:text-5xl lg:text-[3.25rem] text-white mb-5 leading-tight">
            From Browse to Bulk
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/30 to-white/50">In 3 Simple Steps</span>
          </h2>
          <p className="font-inter text-white/35 text-lg max-w-xl mx-auto leading-relaxed">
            We&apos;ve made B2B packaging procurement simple, transparent, and fast.
          </p>
        </motion.div>

        {/* Steps */}
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-[calc(33.33%+16px)] right-[calc(33.33%+16px)] h-px z-0">
            <motion.div
              className="h-full"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ originX: 0, background: "linear-gradient(90deg, rgba(42,50,160,0.6), rgba(42,50,160,0.3), rgba(42,50,160,0.6))" }}
            />
          </div>

          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="group relative rounded-2xl p-8 lg:p-9 h-full flex flex-col backdrop-blur-sm transition-all duration-400 bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] hover:border-brand-light/30 hover:from-white/[0.08] hover:to-white/[0.04]"
                style={{
                  boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
                }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-light/0 to-transparent group-hover:via-brand-light/40 transition-all duration-500" />

                {/* Number + icon row */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/30 to-brand-light/20 border border-brand/20 flex items-center justify-center font-poppins font-extrabold text-brand-light text-lg flex-shrink-0 group-hover:from-brand group-hover:to-brand-light group-hover:border-brand-light group-hover:text-white transition-all duration-400 group-hover:shadow-lg group-hover:shadow-brand/30">
                      {step.number}
                    </div>
                    {/* Glow behind number on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-brand/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                  </div>
                  <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {step.icon}
                  </div>
                </div>

                <h3 className="font-poppins font-bold text-xl text-white mb-3 group-hover:text-brand-light/90 transition-colors duration-300">{step.title}</h3>
                <p className="font-inter text-white/35 text-sm leading-relaxed flex-1">{step.description}</p>

                {step.cta && (
                  <Link
                    href={step.cta.href}
                    className="mt-7 inline-flex items-center gap-2 font-inter text-sm font-semibold text-brand-light/80 hover:text-white transition-colors group/link"
                  >
                    {step.cta.label}
                    <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
