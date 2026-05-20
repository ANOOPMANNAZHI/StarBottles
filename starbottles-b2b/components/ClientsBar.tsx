"use client";

import { motion } from "framer-motion";

const sectors = [
  { icon: "✨", label: "Cosmetics" },
  { icon: "💊", label: "Pharma" },
  { icon: "🛒", label: "FMCG" },
  { icon: "🧴", label: "Personal Care" },
  { icon: "🍃", label: "Food & Beverage" },
  { icon: "🏠", label: "Home Care" },
  { icon: "🧪", label: "Nutraceuticals" },
  { icon: "🌿", label: "Ayurveda" },
];

// Triple the array for seamless infinite loop
const allSectors = [...sectors, ...sectors, ...sectors];

export default function ClientsBar() {
  return (
    <section className="relative bg-white py-10 lg:py-12 overflow-hidden">
      {/* Top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="font-inter text-xs text-gray-400 uppercase tracking-[0.25em] font-medium">
            Trusted by businesses in
          </p>
        </motion.div>
      </div>

      <div className="relative">
        {/* Fade edges -- wider and smoother */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        <div className="flex flex-col gap-4">
          {/* Row 1 -- left to right */}
          <motion.div
            className="flex gap-4"
            animate={{ x: ["0%", "-33.333%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ width: "max-content" }}
          >
            {allSectors.map((sector, i) => (
              <div
                key={`r1-${i}`}
                className="group flex items-center gap-3 bg-gray-50/80 border border-gray-100 rounded-2xl px-6 py-3.5 whitespace-nowrap flex-shrink-0 hover:border-brand/20 hover:bg-brand-pale/30 hover:shadow-[0_4px_16px_rgba(27,33,120,0.06)] transition-all duration-300 cursor-default"
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                  {sector.icon}
                </span>
                <span className="font-inter font-medium text-sm text-gray-600 group-hover:text-brand-dark transition-colors duration-300">
                  {sector.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Row 2 -- right to left, offset */}
          <motion.div
            className="flex gap-4"
            animate={{ x: ["-33.333%", "0%"] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            style={{ width: "max-content" }}
          >
            {[...allSectors].reverse().map((sector, i) => (
              <div
                key={`r2-${i}`}
                className="group flex items-center gap-3 bg-gray-50/80 border border-gray-100 rounded-2xl px-6 py-3.5 whitespace-nowrap flex-shrink-0 hover:border-brand/20 hover:bg-brand-pale/30 hover:shadow-[0_4px_16px_rgba(27,33,120,0.06)] transition-all duration-300 cursor-default"
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                  {sector.icon}
                </span>
                <span className="font-inter font-medium text-sm text-gray-600 group-hover:text-brand-dark transition-colors duration-300">
                  {sector.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom border */}
      <div className="mt-14 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </section>
  );
}
