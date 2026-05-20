"use client";

import { motion } from "framer-motion";
import type { Testimonial } from "@/lib/api";

const FALLBACK: Testimonial[] = [
  {
    id: 1,
    quote: "StarBottles has been our packaging partner for 3 years. Their airless pump bottles are perfect for our premium skincare line. Low MOQ and fast delivery make repeat orders effortless.",
    name: "Priya Menon",
    business: "Lustre Skin Co.",
    location: "Bengaluru, Karnataka",
    initials: "PM",
    rating: 5,
    metric: "3 years · 6 product lines",
  },
  {
    id: 2,
    quote: "We needed pharma-grade Boston round bottles with custom labelling on a tight timeline. StarBottles delivered on time and the quality passed all our QC checks. Highly recommended.",
    name: "Arvind Kapoor",
    business: "HealthFirst Nutraceuticals",
    location: "Pune, Maharashtra",
    initials: "AK",
    rating: 5,
    metric: "12,000+ units per quarter",
  },
  {
    id: 3,
    quote: "As a small FMCG brand, finding a supplier with low MOQ was critical. StarBottles was the only one who could supply 500 units of PP jars without huge minimums. Brilliant service.",
    name: "Fatima Shaikh",
    business: "Green Roots Organics",
    location: "Hyderabad, Telangana",
    initials: "FS",
    rating: 5,
    metric: "Started with just 500 units",
  },
];

export default function Testimonials({ items }: { items?: Testimonial[] }) {
  const testimonials = items && items.length > 0 ? items : FALLBACK;

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-white via-brand-pale/15 to-white relative overflow-hidden">
      {/* Top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/15 to-transparent" />

      {/* Background accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(ellipse, rgba(27,33,120,0.06) 0%, transparent 60%)" }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 bg-brand-pale text-brand-dark font-inter text-xs font-bold px-5 py-2 rounded-full mb-5 tracking-[0.15em] uppercase">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Client Stories
          </span>
          <h2 className="font-poppins font-extrabold text-4xl md:text-5xl text-gray-900 mb-4 leading-tight">
            Trusted by Businesses
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-400">Across India</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="group relative bg-white rounded-2xl p-8 lg:p-9 border border-gray-100/80 hover:border-brand/15 transition-all duration-400 flex flex-col cursor-default"
              style={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.02)",
              }}
            >
              {/* Hover shadow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{ boxShadow: "0 20px 60px rgba(27,33,120,0.10), 0 0 0 1px rgba(27,33,120,0.06)" }}
              />

              {/* Top accent */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand/0 to-transparent group-hover:via-brand/30 transition-all duration-500" />

              {/* Large quote mark */}
              <div className="mb-5">
                <svg className="w-10 h-10 text-brand/10 group-hover:text-brand/20 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                </svg>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <blockquote className="font-inter text-gray-600 text-[0.94rem] leading-[1.75] flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {t.metric && (
                <div className="inline-flex items-center gap-2 bg-brand/[0.05] rounded-lg px-3.5 py-2 mb-6 self-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                  <span className="font-inter text-xs text-brand-dark font-semibold">{t.metric}</span>
                </div>
              )}

              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-brand/20 transition-all duration-300">
                  <span className="font-poppins font-bold text-white text-sm">{t.initials}</span>
                </div>
                <div>
                  <p className="font-poppins font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="font-inter text-xs text-gray-400 mt-0.5">{t.business} · {t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
