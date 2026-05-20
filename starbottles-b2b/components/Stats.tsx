"use client";

import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { CompanyStats } from "@/lib/api";

const FALLBACK_STATS = [
  { value: 500, suffix: "+", label: "Business Clients" },
  { value: 10, suffix: "M+", label: "Units Shipped" },
  { value: 1500, suffix: "+", label: "SKUs Available" },
  { value: 18, suffix: "+", label: "States Served" },
];

const STAT_ICONS = [
  // Business Clients
  <svg key="clients" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>,
  // Units Shipped
  <svg key="shipped" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>,
  // SKUs
  <svg key="skus" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>,
  // States
  <svg key="states" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>,
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export default function Stats({ stats }: { stats?: CompanyStats }) {
  const items = stats
    ? [
        { value: stats.clients.value, suffix: stats.clients.suffix, label: "Business Clients" },
        { value: stats.unitsShipped.value, suffix: stats.unitsShipped.suffix, label: "Units Shipped" },
        { value: stats.skus.value, suffix: stats.skus.suffix, label: "SKUs Available" },
        { value: stats.states.value, suffix: stats.states.suffix, label: "States Served" },
      ]
    : FALLBACK_STATS;

  return (
    <section className="relative bg-gradient-to-b from-white via-brand-pale/20 to-white py-16 lg:py-20 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand/[0.02] blur-[80px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <p className="font-inter text-xs uppercase tracking-[0.25em] text-brand/60 mb-3 font-medium">
            Our Impact
          </p>
          <h2 className="font-poppins font-bold text-3xl lg:text-4xl text-gray-900">
            Numbers that speak
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative bg-white rounded-3xl p-8 lg:p-10 text-center flex flex-col items-center justify-center border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(27,33,120,0.08)] hover:border-brand/10 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-pale to-brand-pale/40 flex items-center justify-center text-brand mb-5 group-hover:scale-110 group-hover:shadow-[0_4px_16px_rgba(27,33,120,0.12)] transition-all duration-500">
                {STAT_ICONS[i]}
              </div>

              {/* Number */}
              <p className="font-poppins font-bold text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-br from-brand-dark via-brand to-brand-light mb-2 group-hover:scale-105 transition-transform duration-500">
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>

              {/* Label */}
              <p className="font-inter text-xs text-gray-400 uppercase tracking-[0.15em] font-medium group-hover:text-brand/60 transition-colors duration-500">
                {stat.label}
              </p>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-12 h-[3px] bg-gradient-to-r from-brand to-brand-light rounded-full transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
