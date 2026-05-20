"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { productImage, type Product } from "@/lib/api";

// ─── Tag color map ───────────────────────────────────────────────────────────
const tagColors: Record<string, string> = {
  "Best Seller": "bg-orange-100 text-orange-700",
  Premium: "bg-purple-100 text-purple-700",
  Versatile: "bg-blue-100 text-blue-700",
  "Eco-Friendly": "bg-green-100 text-green-700",
  Popular: "bg-brand-pale text-brand-dark",
  "Pharma Grade": "bg-red-50 text-red-700",
};

// ─── Standard white card (used in rows 2 and 3) ──────────────────────────────
function StandardCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="h-full"
    >
      <motion.div
        animate={{ y: hovered ? -8 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="group relative h-full bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100/80 flex flex-col"
        style={{
          boxShadow: hovered
            ? "0 16px 48px rgba(27,33,120,0.12), 0 0 0 1px rgba(27,33,120,0.12)"
            : "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.02)",
          transition: "box-shadow 0.4s ease",
        }}
      >
        {/* Category pill — top left */}
        <div className="absolute top-4 left-4 z-10">
          <span className="font-inter text-[11px] font-bold text-brand-dark bg-brand-pale px-3 py-1 rounded-full tracking-wide">
            {product.category}
          </span>
        </div>

        {/* Tag badge — top right */}
        <div className="absolute top-4 right-4 z-10">
          <span
            className={`text-[11px] font-inter font-bold px-2.5 py-1 rounded-full ${
              tagColors[product.tag] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {product.tag}
          </span>
        </div>

        {/* Image area */}
        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-50/80 to-brand-pale/10 shrink-0">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(27,33,120,1) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <motion.div
            className="absolute inset-0"
            animate={hovered ? { scale: 1.06, rotate: 1 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {productImage(product.image) && (
              <Image
                src={productImage(product.image)}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <h3 className="font-poppins font-bold text-[0.95rem] text-gray-900 group-hover:text-brand transition-colors duration-200 mb-2 leading-snug">
            {product.name}
          </h3>
          <p className="font-inter text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Size chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.sizes.map((size) => (
              <span
                key={size}
                className="text-[11px] font-inter font-medium bg-gray-50 text-gray-600 border border-gray-100 px-2.5 py-0.5 rounded-lg"
              >
                {size}
              </span>
            ))}
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
            <span className="font-inter text-xs text-gray-400">
              MOQ: <span className="text-gray-700 font-bold">{product.moq}</span>
            </span>
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 font-poppins text-sm font-bold text-brand hover:text-brand-dark transition-colors"
            >
              View Details
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Quick Quote badge — slides up on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-[68px] left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <Link
                href={`/contact?product=${encodeURIComponent(product.name)}`}
                className="pointer-events-auto inline-flex items-center gap-1.5 bg-gradient-to-r from-brand to-brand-light text-white font-inter font-bold text-xs px-4 py-2 rounded-full shadow-lg shadow-brand/25 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Quote
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Hero card — wide dark card for featured product ─────────────────────────
function HeroCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="h-full"
    >
      <motion.div
        animate={{ scale: hovered ? 1.01 : 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="group relative h-full overflow-hidden rounded-2xl cursor-pointer border border-white/[0.06]"
        style={{
          background: "linear-gradient(145deg, #0E1249 0%, #1B2178 60%, #2A32A0 100%)",
          boxShadow: hovered
            ? "0 24px 64px rgba(27,33,120,0.3), 0 0 0 1px rgba(42,50,160,0.3)"
            : "0 8px 32px rgba(0,0,0,0.2)",
          transition: "box-shadow 0.4s ease",
          minHeight: "320px",
        }}
      >
        {/* Glow overlay */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(ellipse at 70% 50%, rgba(42,50,160,0.2) 0%, transparent 60%)",
            opacity: hovered ? 1 : 0.3,
          }}
        />

        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row h-full">
          {/* Left: text content */}
          <div className="flex flex-col justify-center p-8 md:p-10 md:w-[55%]">
            {/* Category label */}
            <span className="font-inter text-[11px] font-bold text-brand-light/80 uppercase tracking-[0.2em] mb-4 block">
              {product.category}
            </span>

            {/* Tag badge */}
            <div className="mb-5">
              <span
                className={`text-[11px] font-inter font-bold px-3 py-1.5 rounded-full ${
                  tagColors[product.tag] ?? "bg-white/10 text-white/80"
                }`}
              >
                {product.tag}
              </span>
            </div>

            <h3 className="font-poppins font-extrabold text-2xl md:text-3xl text-white leading-tight mb-3">
              {product.name}
            </h3>
            <p className="font-inter text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              {product.description}
            </p>

            {/* Size chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className="text-[11px] font-inter font-medium text-white/70 border border-white/15 bg-white/[0.06] px-3 py-1 rounded-lg"
                >
                  {size}
                </span>
              ))}
            </div>

            {/* MOQ */}
            <p className="font-inter text-xs text-white/35 mb-7">
              MOQ: <span className="text-white/65 font-bold">{product.moq}</span>
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex items-center gap-2 bg-white text-brand-dark font-poppins font-bold text-sm px-6 py-3 rounded-xl hover:bg-brand-pale transition-colors duration-200 shadow-lg shadow-white/10"
              >
                View Details
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href={`/contact?product=${encodeURIComponent(product.name)}`}
                className="inline-flex items-center gap-2 text-white/60 hover:text-white font-inter font-semibold text-sm transition-colors duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Quote
              </Link>
            </div>
          </div>

          {/* Right: product image */}
          <div className="relative md:w-[45%] h-56 md:h-auto flex items-center justify-center p-6 md:p-8">
            <motion.div
              className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center"
              animate={{ scale: hovered ? 1.04 : 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                minHeight: "220px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(2px)",
              }}
            >
              {productImage(product.image) && (
                <Image
                  src={productImage(product.image)}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 80vw, 40vw"
                />
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Portrait card (right column of row 1) — white, portrait ─────────────────
function PortraitCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="h-full"
    >
      <motion.div
        animate={{ y: hovered ? -8 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="group relative h-full bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100/80 flex flex-col"
        style={{
          boxShadow: hovered
            ? "0 16px 48px rgba(27,33,120,0.12), 0 0 0 1px rgba(27,33,120,0.12)"
            : "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.02)",
          transition: "box-shadow 0.4s ease",
        }}
      >
        {/* Category pill */}
        <div className="absolute top-4 left-4 z-10">
          <span className="font-inter text-[11px] font-bold text-brand-dark bg-brand-pale px-3 py-1 rounded-full tracking-wide">
            {product.category}
          </span>
        </div>

        {/* Tag badge */}
        <div className="absolute top-4 right-4 z-10">
          <span
            className={`text-[11px] font-inter font-bold px-2.5 py-1 rounded-full ${
              tagColors[product.tag] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {product.tag}
          </span>
        </div>

        {/* Image area */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-50/80 to-brand-pale/10 shrink-0">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(27,33,120,1) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <motion.div
            className="absolute inset-0"
            animate={hovered ? { scale: 1.06, rotate: 1 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {productImage(product.image) && (
              <Image
                src={productImage(product.image)}
                alt={product.name}
                fill
                className="object-contain p-8"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <h3 className="font-poppins font-bold text-[0.95rem] text-gray-900 group-hover:text-brand transition-colors duration-200 mb-2 leading-snug">
            {product.name}
          </h3>
          <p className="font-inter text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.sizes.map((size) => (
              <span
                key={size}
                className="text-[11px] font-inter font-medium bg-gray-50 text-gray-600 border border-gray-100 px-2.5 py-0.5 rounded-lg"
              >
                {size}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
            <span className="font-inter text-xs text-gray-400">
              MOQ: <span className="text-gray-700 font-bold">{product.moq}</span>
            </span>
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 font-poppins text-sm font-bold text-brand hover:text-brand-dark transition-colors"
            >
              View Details
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Quick Quote badge */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-[68px] left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <Link
                href={`/contact?product=${encodeURIComponent(product.name)}`}
                className="pointer-events-auto inline-flex items-center gap-1.5 bg-gradient-to-r from-brand to-brand-light text-white font-inter font-bold text-xs px-4 py-2 rounded-full shadow-lg shadow-brand/25 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Quote
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function Products({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const allProducts = initialProducts.slice(0, 6);
  // Layout:
  // Row 1: allProducts[0] (hero 2/3) | allProducts[1] (portrait 1/3)
  // Row 2: allProducts[2], [3], [4]  (3 equal standard cards)
  // Row 3: allProducts[5] (1/3) | CTA (2/3)

  if (allProducts.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f1f2f8 50%, #f8fafc 100%)" }}>
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(27,33,120,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(27,33,120,0.04) 0%, transparent 60%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-start justify-between gap-6 mb-16"
        >
          {/* Left: heading block */}
          <div className="relative">
            {/* Large decorative number */}
            <span
              className="absolute -top-8 -left-2 font-poppins font-black text-8xl md:text-9xl text-brand/[0.04] select-none pointer-events-none leading-none"
              aria-hidden="true"
            >
              01
            </span>
            <div className="relative flex items-center gap-4 mb-4">
              <div className="w-1.5 h-12 bg-gradient-to-b from-brand via-brand-light to-brand/30 rounded-full shrink-0" />
              <div>
                <span className="block font-inter text-xs font-bold text-brand uppercase tracking-[0.2em] mb-1.5">
                  Our Product Range
                </span>
                <h2 className="font-poppins font-extrabold text-3xl md:text-4xl lg:text-[2.6rem] text-gray-900">
                  Packaging for Every Industry
                </h2>
              </div>
            </div>
            <p className="font-inter text-gray-500 text-base md:text-lg max-w-xl ml-5 leading-relaxed">
              From cosmetics to pharma — high-quality plastic packaging solutions,
              customizable, bulk-ready, and competitively priced.
            </p>
          </div>

          {/* Right: View All link */}
          <Link
            href="/products"
            className="hidden md:inline-flex items-center gap-2 font-inter text-sm font-bold text-brand hover:text-brand-dark transition-colors group shrink-0 mt-3 border border-brand/15 hover:border-brand/30 px-5 py-2.5 rounded-xl hover:bg-brand-pale/30"
          >
            View All Products
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>

        {/* Row 1: Hero card (2/3) + Portrait card (1/3) */}
        {allProducts[0] && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <HeroCard product={allProducts[0]} index={0} />
            </div>
            {allProducts[1] && (
              <div className="md:col-span-1">
                <PortraitCard product={allProducts[1]} index={1} />
              </div>
            )}
          </div>
        )}

        {/* Row 2: Three equal standard cards */}
        {(allProducts[2] || allProducts[3] || allProducts[4]) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {allProducts[2] && <StandardCard product={allProducts[2]} index={2} />}
            {allProducts[3] && <StandardCard product={allProducts[3]} index={3} />}
            {allProducts[4] && <StandardCard product={allProducts[4]} index={4} />}
          </div>
        )}

        {/* Row 3: Last product (1/3) + Wide CTA card (2/3) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {allProducts[5] && (
            <div className="sm:col-span-1">
              <StandardCard product={allProducts[5]} index={5} />
            </div>
          )}

          {/* Wide CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="sm:col-span-2"
          >
            <div
              className="h-full min-h-[200px] rounded-2xl flex flex-col items-start justify-between p-8 md:p-10 border border-brand/10 overflow-hidden relative"
              style={{
                background: "linear-gradient(145deg, #0E1249 0%, #1B2178 50%, #2A32A0 100%)",
              }}
            >
              {/* Background glow */}
              <div
                className="absolute right-0 top-0 w-80 h-80 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 60%)",
                  transform: "translate(30%, -30%)",
                }}
              />

              {/* Dot pattern */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              <div className="relative z-10">
                <p className="font-inter text-brand-light/70 text-[11px] font-bold uppercase tracking-[0.25em] mb-4">
                  Custom Solutions
                </p>
                <h3 className="font-poppins font-extrabold text-white text-xl md:text-2xl mb-3 max-w-md leading-snug">
                  Need a specific size, shape, or material?
                </h3>
                <p className="font-inter text-white/45 text-sm leading-relaxed max-w-sm">
                  We do custom runs, OEM packaging, and private-label solutions for any
                  industry — cosmetics, pharma, or FMCG.
                </p>
              </div>

              <Link
                href="/contact"
                className="relative z-10 mt-7 inline-flex items-center gap-2 bg-white text-brand-dark font-poppins font-bold text-sm px-7 py-3.5 rounded-xl hover:bg-brand-pale transition-colors duration-200 shadow-lg shadow-white/10"
              >
                Request Custom Quote
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* View All — mobile only */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex justify-center md:hidden"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 font-inter text-sm font-bold text-brand hover:text-brand-dark transition-colors group border border-brand/15 px-5 py-2.5 rounded-xl"
          >
            View All Products
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
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
    </section>
  );
}
