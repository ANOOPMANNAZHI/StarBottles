"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { productImage, type Product } from "@/lib/api";

const spring = [0.22, 1, 0.36, 1] as const;

const tagColors: Record<string, { bg: string; text: string }> = {
  "Best Seller": { bg: "bg-amber-400", text: "text-amber-950" },
  Premium: { bg: "bg-violet-500", text: "text-white" },
  Versatile: { bg: "bg-sky-500", text: "text-white" },
  "Eco-Friendly": { bg: "bg-emerald-500", text: "text-white" },
  Popular: { bg: "bg-brand", text: "text-white" },
  "Pharma Grade": { bg: "bg-rose-500", text: "text-white" },
};

// ─── Quick View Modal ────────────────────────────────────────────────────────
function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-brand-darker/80 backdrop-blur-lg"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.4, ease: spring }}
          className="relative bg-white rounded-[28px] shadow-[0_30px_100px_rgba(14,18,73,0.35)] max-w-[720px] w-full max-h-[88vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-gray-100/80 hover:bg-gray-200 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all duration-200 hover:scale-110"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="grid md:grid-cols-2">
            <div
              className="relative aspect-square md:aspect-auto md:min-h-[400px] overflow-hidden rounded-t-[28px] md:rounded-l-[28px] md:rounded-tr-none"
              style={{ background: "linear-gradient(160deg, #f0f1f8 0%, #e8eaf5 40%, #dfe1f0 100%)" }}
            >
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #1B2178 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <img src={productImage(product.image)} alt={product.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default.png"; }} />
              {product.tag && (
                <span className={`absolute top-5 left-5 font-inter text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg ${tagColors[product.tag]?.bg ?? "bg-gray-700"} ${tagColors[product.tag]?.text ?? "text-white"}`}>
                  {product.tag}
                </span>
              )}
            </div>
            <div className="p-8 md:p-9 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-[2px] bg-brand rounded-full" />
                <span className="font-inter text-[11px] font-bold text-brand uppercase tracking-[0.15em]">{product.category}</span>
              </div>
              <h3 className="font-poppins font-extrabold text-2xl text-brand-darker leading-tight mb-4">{product.name}</h3>
              <p className="font-inter text-sm text-gray-500 leading-[1.7] mb-5 flex-1">{product.description}</p>
              {(product.capacity || product.shape || product.color) && (
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {product.capacity && (
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 ring-1 ring-gray-100">
                      <p className="font-inter text-[9px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-0.5">Capacity</p>
                      <p className="font-inter text-xs font-semibold text-brand-darker truncate">{product.capacity}</p>
                    </div>
                  )}
                  {product.shape && (
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 ring-1 ring-gray-100">
                      <p className="font-inter text-[9px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-0.5">Shape</p>
                      <p className="font-inter text-xs font-semibold text-brand-darker truncate">{product.shape}</p>
                    </div>
                  )}
                  {product.color && (
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 ring-1 ring-gray-100">
                      <p className="font-inter text-[9px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-0.5">Color</p>
                      <p className="font-inter text-xs font-semibold text-brand-darker truncate">{product.color}</p>
                    </div>
                  )}
                </div>
              )}
              {product.sizes.length > 0 && (
                <div className="mb-5">
                  <p className="font-inter text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2.5">Sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <span key={s} className="font-inter text-xs font-semibold bg-brand-pale/60 text-brand-dark px-3.5 py-1.5 rounded-lg ring-1 ring-brand/10">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {product.moq && (
                <div className="flex items-center gap-4 bg-gradient-to-r from-brand-pale/50 to-brand-pale/20 rounded-2xl px-5 py-4 mb-7 ring-1 ring-brand/[0.08]">
                  <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                  <div>
                    <p className="font-inter text-[10px] text-brand-dark/50 uppercase tracking-wider font-medium">Minimum Order</p>
                    <p className="font-poppins font-bold text-brand-darker text-lg">{product.moq}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Link href={`/products/${product.slug}`} onClick={onClose}
                  className="flex-1 inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand to-brand-dark text-white font-poppins font-bold text-sm py-4 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(27,33,120,0.3)] hover:shadow-[0_8px_30px_rgba(27,33,120,0.4)] hover:-translate-y-0.5">
                  View Details
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link href={`/contact?product=${encodeURIComponent(product.name)}`} onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 bg-gray-50 hover:bg-brand-pale/40 text-brand-dark font-poppins font-bold text-sm px-6 py-4 rounded-2xl transition-all duration-200 ring-1 ring-gray-200 hover:ring-brand/20">
                  Quote
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Slide Card ──────────────────────────────────────────────────────────────
function SlideCard({ product, onQuickView }: { product: Product; onQuickView: (p: Product) => void }) {
  const [hovered, setHovered] = useState(false);
  const tagStyle = tagColors[product.tag] ?? { bg: "bg-gray-600", text: "text-white" };

  return (
    <div
      className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px] group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={{ y: hovered ? -8 : 0 }}
        transition={{ duration: 0.35, ease: spring }}
        className="relative bg-white rounded-[22px] overflow-hidden flex flex-col h-full select-none"
        style={{
          boxShadow: hovered
            ? "0 24px 64px rgba(27,33,120,0.14), 0 0 0 1px rgba(27,33,120,0.1)"
            : "0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)",
          transition: "box-shadow 0.4s ease",
        }}
      >
        {/* Image */}
        <div className="relative h-64 overflow-hidden" style={{ background: "linear-gradient(160deg, #f4f5fb 0%, #eceef8 50%, #e6e8f4 100%)" }}>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #1B2178 1px, transparent 1px)", backgroundSize: "18px 18px" }}
          />
          <motion.div
            className="absolute inset-0"
            animate={{ scale: hovered ? 1.08 : 1, y: hovered ? -4 : 0 }}
            transition={{ duration: 0.5, ease: spring }}
          >
            <img src={productImage(product.image)} alt={product.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default.png"; }} />
          </motion.div>

          {product.tag && (
            <span className={`absolute top-4 left-4 z-10 font-inter text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md ${tagStyle.bg} ${tagStyle.text}`}>
              {product.tag}
            </span>
          )}

          {/* Quick View overlay */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 z-10 flex items-center justify-center"
                style={{ background: "linear-gradient(180deg, transparent 30%, rgba(14,18,73,0.45) 100%)" }}
              >
                <motion.button
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  onClick={() => onQuickView(product)}
                  className="inline-flex items-center gap-2 bg-white text-brand-dark font-poppins font-bold text-xs px-6 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:bg-brand-pale transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Quick View
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-inter text-[10px] font-bold text-brand uppercase tracking-[0.15em]">{product.category}</span>
            {product.material && (
              <>
                <span className="w-[3px] h-[3px] rounded-full bg-gray-300" />
                <span className="font-inter text-[10px] text-gray-400">{product.material}</span>
              </>
            )}
          </div>
          <h3 className="font-poppins font-bold text-base text-gray-900 group-hover:text-brand transition-colors duration-200 leading-snug mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="font-inter text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{product.description}</p>

          {product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {product.sizes.slice(0, 3).map((s) => (
                <span key={s} className="font-inter text-[10px] font-semibold bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md ring-1 ring-gray-100">{s}</span>
              ))}
              {product.sizes.length > 3 && (
                <span className="font-inter text-[10px] text-gray-400 px-1 py-1">+{product.sizes.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            {product.moq ? (
              <div>
                <p className="font-inter text-[9px] uppercase tracking-wider text-gray-400">MOQ</p>
                <p className="font-inter text-xs font-bold text-brand-dark">{product.moq}</p>
              </div>
            ) : <div />}
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1.5 font-inter text-xs font-bold text-brand hover:text-brand-dark transition-colors group/link"
            >
              Details
              <svg className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Featured Products Section ───────────────────────────────────────────────
export default function FeaturedProducts({ products }: { products: Product[] }) {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const featured = products.filter((p) => p.featured).length >= 6
    ? products.filter((p) => p.featured).slice(0, 8)
    : products.slice(0, 8);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, featured]);

  const [paused, setPaused] = useState(false);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 340;
    // If at the end, loop back to start
    if (dir === "right" && el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    }
  }, []);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (paused || featured.length === 0) return;
    const timer = setInterval(() => scroll("right"), 3000);
    return () => clearInterval(timer);
  }, [paused, scroll, featured.length]);

  if (featured.length === 0) return null;

  return (
    <>
      <section ref={sectionRef} className="py-16 lg:py-20 relative overflow-hidden bg-white">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/10 to-transparent" />
          <div className="absolute top-20 -right-40 w-[800px] h-[800px] rounded-full opacity-40"
            style={{ background: "radial-gradient(circle, rgba(27,33,120,0.04) 0%, transparent 60%)" }}
          />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-40"
            style={{ background: "radial-gradient(circle, rgba(42,50,160,0.03) 0%, transparent 60%)" }}
          />
        </div>

        <div className="relative">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: spring }}
            className="max-w-7xl mx-auto px-6 lg:px-8 mb-14"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-3 mb-5">
                  <div className="h-px w-10 bg-gradient-to-r from-transparent to-brand/40" />
                  <span className="font-inter text-xs font-bold text-brand uppercase tracking-[0.25em]">Featured Products</span>
                  <div className="h-px w-10 bg-gradient-to-l from-transparent to-brand/40" />
                </div>
                <h2 className="font-poppins font-black text-4xl md:text-5xl lg:text-[3.2rem] text-gray-900 leading-tight mb-4">
                  Our Best Sellers
                </h2>
                <p className="font-inter text-gray-500 text-lg max-w-lg leading-relaxed">
                  Handpicked from our catalogue of 1500+ SKUs — the packaging products businesses order most.
                </p>
              </div>

              {/* Navigation arrows */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-white ring-1 ring-gray-200 hover:ring-brand/30 hover:bg-brand-pale/30 hover:shadow-lg hover:shadow-brand/10 text-gray-600 hover:text-brand"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Scrollable carousel */}
          <div className="relative">
            {/* Left fade */}
            <div className={`absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? "opacity-100" : "opacity-0"}`}
              style={{ background: "linear-gradient(to right, white 20%, transparent)" }}
            />
            {/* Right fade */}
            <div className={`absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? "opacity-100" : "opacity-0"}`}
              style={{ background: "linear-gradient(to left, white 20%, transparent)" }}
            />

            <div
              ref={scrollRef}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="flex gap-6 overflow-x-auto scrollbar-hide px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {featured.map((product) => (
                <SlideCard key={product.id} product={product} onQuickView={setQuickView} />
              ))}

              {/* CTA card at end */}
              <div className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]">
                <div
                  className="h-full rounded-[22px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
                  style={{ background: "linear-gradient(150deg, #0E1249 0%, #1B2178 50%, #2A32A0 100%)", minHeight: "460px" }}
                >
                  <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                  />
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 60%)", transform: "translate(30%,-30%)" }} />

                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mx-auto mb-6">
                      <svg className="w-7 h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p className="font-inter text-[10px] font-bold text-brand-light/60 uppercase tracking-[0.25em] mb-3">Full Catalogue</p>
                    <h3 className="font-poppins font-bold text-white text-xl mb-3 leading-snug">
                      Explore All<br />1500+ Products
                    </h3>
                    <p className="font-inter text-white/35 text-sm leading-relaxed mb-8">
                      PET, HDPE, PP, Glass — for every industry.
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2.5 bg-white text-brand-dark font-poppins font-bold text-sm px-7 py-3.5 rounded-xl hover:bg-brand-pale transition-colors shadow-lg shadow-white/10"
                    >
                      View All
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
    </>
  );
}
