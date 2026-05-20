"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/api";

const R2_BASE = "https://pub-3ac8dfa528c245f39b68fb9600dd0cb9.r2.dev";

function CategoryImage({ slug, staticSrc, alt }: { slug?: string; staticSrc?: string; alt: string }) {
  const [src, setSrc] = useState(slug ? `${R2_BASE}/${slug}/1.jpg` : (staticSrc ?? ""));
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return staticSrc && !failed ? (
      <Image src={staticSrc} alt={alt} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw" />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center bg-brand-pale/40">
        <svg className="w-10 h-10 text-brand/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
      onError={() => {
        if (slug && src !== (staticSrc ?? "")) {
          // R2 failed — try static fallback
          setSrc(staticSrc ?? "");
          if (!staticSrc) setFailed(true);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

const spring = [0.22, 1, 0.36, 1] as const;

const FALLBACK_CATEGORIES = [
  {
    label: "Dropper Bottles",
    tagline: "Serums · Oils · Pharma",
    href: "/products?category=Dropper+Bottles",
    image: "https://shop.starbottles.in/wp-content/uploads/2026/01/dropper-bottle-05-removebg-preview.png",
    color: "#1B2178",
    lightBg: "#EAEBF5",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    count: "200+",
  },
  {
    label: "Pump Dispensers",
    tagline: "Skincare · Cosmetics",
    href: "/products?category=Pump+Dispensers",
    image: "https://shop.starbottles.in/wp-content/uploads/2025/11/SB-00814-OPENED-scaled.webp",
    color: "#7c3aed",
    lightBg: "#f3f0ff",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 0v6m0 0H8m4 0h4m-4 0v4m-6 4h12a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
      </svg>
    ),
    count: "150+",
  },
  {
    label: "Cosmetic Jars",
    tagline: "Creams · Balms · Gels",
    href: "/products?category=Cosmetic+Jars",
    image: "https://shop.starbottles.in/wp-content/uploads/2025/11/1-66-scaled.jpg",
    color: "#d97706",
    lightBg: "#fef3c7",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    count: "300+",
  },
  {
    label: "Pharma Bottles",
    tagline: "APIs · Syrups · Nutra",
    href: "/products?category=Pharma+Bottles",
    image: "https://shop.starbottles.in/wp-content/uploads/2025/09/1-5-scaled.jpg",
    color: "#dc2626",
    lightBg: "#fef2f2",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    count: "250+",
  },
  {
    label: "Spray Bottles",
    tagline: "Mists · Sanitizers",
    href: "/products?category=Spray+Bottles",
    image: "https://shop.starbottles.in/wp-content/uploads/2025/11/1-97-scaled.jpg",
    color: "#059669",
    lightBg: "#ecfdf5",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    count: "180+",
  },
  {
    label: "Custom Packaging",
    tagline: "Any Size · OEM",
    href: "/contact",
    image: "https://shop.starbottles.in/wp-content/uploads/2025/11/M3.webp",
    color: "#1B2178",
    lightBg: "#EAEBF5",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    count: "OEM",
  },
];

type DisplayCategory = (typeof FALLBACK_CATEGORIES)[0] & { slug?: string };

// Maps for enriching API categories with frontend-only visual data
const ICON_MAP: Record<string, typeof FALLBACK_CATEGORIES[0]["icon"]> = {};
const IMAGE_MAP: Record<string, string> = {};
const COLOR_MAP: Record<string, { color: string; lightBg: string }> = {};
const TAGLINE_MAP: Record<string, string> = {};

// Build lookup maps from fallback data
FALLBACK_CATEGORIES.forEach((cat) => {
  const key = cat.label.toLowerCase();
  ICON_MAP[key] = cat.icon;
  IMAGE_MAP[key] = cat.image;
  COLOR_MAP[key] = { color: cat.color, lightBg: cat.lightBg };
  TAGLINE_MAP[key] = cat.tagline;
});

const DEFAULT_ICON = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

function lightenColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.88).toString(16).padStart(2, "0");
  return `#${mix(r)}${mix(g)}${mix(b)}`;
}

function apiCategoryToDisplay(cat: Category): DisplayCategory {
  const key = cat.name.toLowerCase();
  const fallbackColors = COLOR_MAP[key] ?? { color: "#1B2178", lightBg: "#EAEBF5" };
  const color = cat.color || fallbackColors.color;
  return {
    label: cat.name,
    slug: cat.slug,
    tagline: cat.tagline || TAGLINE_MAP[key] || "",
    href: `/products?category=${encodeURIComponent(cat.name)}`,
    image: IMAGE_MAP[key] || "https://shop.starbottles.in/wp-content/uploads/2025/11/M3.webp",
    color,
    lightBg: cat.color ? lightenColor(cat.color) : fallbackColors.lightBg,
    icon: ICON_MAP[key] || DEFAULT_ICON,
    count: cat.product_count > 0 ? `${cat.product_count}+` : "New",
  };
}

function CategoryCard({ cat, index }: { cat: DisplayCategory; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: spring }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link href={cat.href} className="group block" aria-label={`Browse ${cat.label}`}>
        <motion.div
          animate={{ y: hovered ? -10 : 0 }}
          transition={{ duration: 0.35, ease: spring }}
          className="relative rounded-[22px] overflow-hidden"
          style={{
            boxShadow: hovered
              ? `0 24px 64px ${cat.color}25, 0 0 0 1px ${cat.color}20`
              : "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
            transition: "box-shadow 0.4s ease",
          }}
        >
          {/* Image section */}
          <div className="relative h-48 sm:h-56 overflow-hidden" style={{ background: cat.lightBg }}>
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none" style={{ background: `${cat.color}08` }} />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full pointer-events-none" style={{ background: `${cat.color}06` }} />

            <motion.div
              className="absolute inset-0"
              animate={{ scale: hovered ? 1.08 : 1, y: hovered ? -6 : 0 }}
              transition={{ duration: 0.5, ease: spring }}
            >
              <CategoryImage slug={cat.slug} staticSrc={cat.image} alt={cat.label} />
            </motion.div>

            {/* SKU count badge */}
            <div className="absolute top-3 right-3 z-10">
              <span className="font-inter text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
                style={{ background: `${cat.color}12`, color: cat.color }}
              >
                {cat.count} SKUs
              </span>
            </div>

            {/* Hover overlay */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ background: `linear-gradient(180deg, transparent 20%, ${cat.color}40 100%)` }}
                >
                  <motion.span
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="inline-flex items-center gap-2 bg-white text-gray-900 font-poppins font-bold text-xs px-5 py-2.5 rounded-full shadow-xl"
                  >
                    Explore
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="bg-white p-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                style={{ background: cat.lightBg, color: cat.color }}
              >
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-poppins font-bold text-[15px] text-gray-900 group-hover:text-brand transition-colors duration-200 leading-snug mb-1">
                  {cat.label}
                </h3>
                <p className="font-inter text-xs text-gray-400 leading-tight">{cat.tagline}</p>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-brand group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function CategoryGrid({ categories: apiCategories }: { categories?: Category[] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const displayCategories = useMemo(
    () => apiCategories && apiCategories.length > 0 ? apiCategories.map(apiCategoryToDisplay) : FALLBACK_CATEGORIES,
    [apiCategories]
  );

  return (
    <section ref={ref} className="py-16 lg:py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #f8f9fc 0%, #eef0f7 50%, #f8f9fc 100%)" }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/8 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/8 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(27,33,120,0.03) 0%, transparent 60%)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: spring }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-brand/40" />
            <span className="font-inter text-xs font-bold text-brand uppercase tracking-[0.25em]">Browse by Category</span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-brand/40" />
          </div>
          <h2 className="font-poppins font-black text-4xl md:text-5xl lg:text-[3.2rem] text-gray-900 leading-tight mb-5">
            Find the Right Packaging
          </h2>
          <p className="font-inter text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            1500+ SKUs across 6 categories — for every industry and application.
          </p>
        </motion.div>

        {/* Category grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
          {displayCategories.map((cat, i) => (
            <CategoryCard key={cat.label} cat={cat} index={i} />
          ))}
        </div>

        {/* Browse All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-14"
        >
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-brand-darker to-brand hover:from-brand hover:to-brand-dark text-white font-poppins font-bold text-sm px-10 py-4 rounded-2xl transition-all duration-400 shadow-[0_4px_24px_rgba(27,33,120,0.25)] hover:shadow-[0_8px_36px_rgba(27,33,120,0.35)] hover:-translate-y-0.5"
          >
            Browse All Products
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
