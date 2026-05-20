"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTABanner() {
  return (
    <section className="py-16 lg:py-20 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #080e1e 0%, #0E1249 40%, #1B2178 70%, #0E1249 100%)" }}>
      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(42,50,160,0.25) 0%, transparent 55%)" }}
        animate={{ scale: [1, 1.12, 1], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(27,33,120,0.2) 0%, transparent 55%)" }}
        animate={{ scale: [1, 1.15, 1], x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-light/20 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] text-brand-light font-inter text-xs font-bold px-5 py-2 rounded-full mb-7 tracking-[0.2em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-light animate-pulse" />
            Get Started Today
          </span>
          <h2 className="font-poppins font-extrabold text-4xl md:text-5xl lg:text-[3.5rem] text-white mb-6 leading-[1.1]">
            Ready to Upgrade
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/80 to-white">Your Packaging?</span>
          </h2>
          <p className="font-inter text-white/35 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Join 500+ businesses across India that trust StarBottles for premium, bulk-ready packaging. Request a quote today — response within 24 hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand to-brand-light hover:from-brand-light hover:to-brand text-white font-poppins font-bold text-base px-10 py-4 rounded-xl transition-all duration-400 shadow-[0_0_40px_rgba(27,33,120,0.4)] hover:shadow-[0_0_60px_rgba(42,50,160,0.5)]"
            >
              Request a Quote
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="tel:+918086850000"
              className="inline-flex items-center justify-center gap-2.5 bg-white/[0.05] border border-white/[0.1] text-white font-poppins font-semibold text-base px-10 py-4 rounded-xl hover:bg-white/[0.1] hover:border-white/[0.2] transition-all duration-300 backdrop-blur-sm"
            >
              <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +91 80 86 85 00 00
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-10 border-t border-white/[0.06]">
            {["2200+ Clients", "18+ States", "ISO Certified", "24hr Response"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 font-inter text-xs text-white/30 font-medium">
                <span className="w-1 h-1 rounded-full bg-brand-light/50" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
