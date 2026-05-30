"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Banner } from "@/lib/api";

// ─── Fallback slide data ────────────────────────────────────────────────────
const FALLBACK_SLIDES = [
  {
    image: "https://shop.starbottles.in/wp-content/uploads/2025/11/M3.webp",
    videoUrl: null as string | null,
    eyebrow: "India's #1 B2B Packaging Partner",
    headline: "Premium Packaging\nfor Every Industry",
    description:
      "1500+ SKUs across PET, HDPE, PP and ABS — cosmetics, pharma, FMCG, and personal care. Bulk-ready, custom-brandable, delivered pan-India.",
    cta: { label: "Explore Catalogue", href: "/products" },
    ctaSecondary: { label: "Request a Quote", href: "/contact" },
  },
  {
    image: "https://shop.starbottles.in/wp-content/uploads/2025/11/M2.webp",
    videoUrl: null as string | null,
    eyebrow: "Custom OEM Solutions",
    headline: "Your Brand,\nOur Packaging",
    description:
      "Custom moulds, private-label printing, unique finishes — we build packaging from scratch for startups and enterprises alike.",
    cta: { label: "Browse Products", href: "/products" },
    ctaSecondary: { label: "Get Custom Quote", href: "/contact" },
  },
  {
    image: "https://shop.starbottles.in/wp-content/uploads/2025/11/M1.webp",
    videoUrl: null as string | null,
    eyebrow: "Trusted by 500+ Businesses",
    headline: "Quality You Can\nCount On",
    description:
      "ISO certified, BIS compliant, BPA-free. Every batch tested before dispatch. Serving 18+ states from Thrissur, Kerala since 1967.",
    cta: { label: "Explore Catalogue", href: "/products" },
    ctaSecondary: { label: "Contact Us", href: "/contact" },
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function getGoogleDriveId(url: string): string | null {
  const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

type MediaType = "image" | "video" | "youtube" | "googledrive";

function getMediaType(videoUrl: string | null): MediaType {
  if (!videoUrl) return "image";
  if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) return "youtube";
  if (videoUrl.includes("drive.google.com")) return "googledrive";
  return "video";
}

function bannerToSlide(b: Banner) {
  return {
    image: b.image_url,
    videoUrl: b.video_url ?? null,
    eyebrow: b.eyebrow || "",
    headline: b.title,
    description: b.subtitle || "",
    cta: { label: b.cta_text || "Explore Catalogue", href: b.cta_url || "/products" },
    ctaSecondary: { label: b.cta_secondary_text || "Contact Us", href: b.cta_secondary_url || "/contact" },
  };
}

const INTERVAL = 6000;
const spring = [0.22, 1, 0.36, 1] as const;

// ─── Background media renderer ───────────────────────────────────────────────
function SlideBackground({ slide }: { slide: typeof FALLBACK_SLIDES[0] }) {
  const mediaType = getMediaType(slide.videoUrl);

  if (mediaType === "youtube") {
    const videoId = getYouTubeId(slide.videoUrl!);
    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* Poster image shown while YouTube loads */}
        {slide.image && (
          <Image
            src={slide.image}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
        {videoId && (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&playlist=${videoId}&modestbranding=1`}
            allow="autoplay; encrypted-media"
            className="absolute pointer-events-none"
            style={{
              // Oversized and centred to hide letterbox bars & YouTube logo
              width: "177.78vh",   // 16/9 * 100vh
              minWidth: "100%",
              height: "56.25vw",  // 9/16 * 100vw
              minHeight: "100%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </div>
    );
  }

  if (mediaType === "video") {
    return (
      <div className="absolute inset-0">
        <video
          src={slide.videoUrl!}
          poster={slide.image}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  // Default: image
  if (!slide.image) return null;
  return (
    <Image
      src={slide.image}
      alt={slide.headline.replace("\n", " ")}
      fill
      className="object-cover"
      sizes="100vw"
      priority
    />
  );
}

// ─── Hero Component ──────────────────────────────────────────────────────────
export default function Hero({ banners }: { banners?: Banner[] }) {
  const slides = useMemo(
    () => banners && banners.length > 0 ? banners.map(bannerToSlide) : FALLBACK_SLIDES,
    [banners]
  );
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const slide = slides[current];
  const mediaType = getMediaType(slide.videoUrl);
  // Pause auto-advance on video slides — let the video loop naturally
  const isVideoSlide = mediaType === "video" || mediaType === "youtube";

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance — skipped for video slides
  useEffect(() => {
    if (paused || isVideoSlide) return;
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [paused, isVideoSlide, next]);

  return (
    <section
      className="relative min-h-[92vh] flex items-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background media ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <SlideBackground slide={slide} />
        </motion.div>
      </AnimatePresence>

      {/* ── Overlay gradient — hidden on video slides so the video is visible ── */}
      {!isVideoSlide && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(105deg, rgba(6,10,36,0.92) 0%, rgba(14,18,73,0.85) 35%, rgba(14,18,73,0.6) 55%, rgba(14,18,73,0.3) 75%, transparent 100%)",
            }}
          />
          {/* Bottom fade for seamless transition */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/60 to-transparent pointer-events-none" />
          {/* Grid overlay for texture */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </>
      )}

      {/* ── Content — hidden on video slides ── */}
      {!isVideoSlide && (
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-32 lg:py-40 w-full">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`eyebrow-${current}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: spring }}
                className="mb-8"
              >
                <span className="inline-flex items-center gap-2.5 bg-white/[0.06] backdrop-blur-md border border-white/[0.1] text-white/70 font-inter text-sm font-medium px-5 py-2.5 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  {slide.eyebrow}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Headline */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={`headline-${current}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, delay: 0.1, ease: spring }}
                className="font-poppins font-black text-[3rem] md:text-[4rem] lg:text-[5rem] text-white leading-[1.02] tracking-[-0.03em] mb-8 whitespace-pre-line"
              >
                {slide.headline}
              </motion.h1>
            </AnimatePresence>

            {/* Description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${current}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6, delay: 0.2, ease: spring }}
                className="font-inter text-lg text-white/50 leading-[1.7] max-w-lg mb-12"
              >
                {slide.description}
              </motion.p>
            </AnimatePresence>

            {/* CTAs */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`cta-${current}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, delay: 0.3, ease: spring }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href={slide.cta.href}
                  className="group relative inline-flex items-center justify-center gap-2.5 bg-brand hover:bg-brand-light text-white font-poppins font-semibold text-[15px] px-9 py-4 rounded-2xl transition-all duration-500
                    shadow-[0_4px_40px_rgba(27,33,120,0.5)] hover:shadow-[0_8px_60px_rgba(27,33,120,0.7)]
                    hover:-translate-y-0.5 overflow-hidden"
                >
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
                  <span className="relative">{slide.cta.label}</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300 relative"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href={slide.ctaSecondary.href}
                  className="group inline-flex items-center justify-center gap-2.5 bg-white/[0.06] border border-white/[0.12] text-white/80 hover:text-white font-poppins font-semibold text-[15px] px-9 py-4 rounded-2xl hover:bg-white/[0.1] hover:border-white/[0.2] transition-all duration-500 backdrop-blur-sm hover:-translate-y-0.5"
                >
                  {slide.ctaSecondary.label}
                  <svg
                    className="w-4 h-4 opacity-50 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Bottom scrim for controls legibility on video slides */}
      {isVideoSlide && (
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      )}

      {/* ── Slider controls ── */}
      <div className="absolute bottom-36 sm:bottom-28 left-0 right-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center gap-6">
          {/* Progress dots */}
          <div className="flex items-center gap-2.5">
            {slides.map((s, i) => {
              const type = getMediaType(s.videoUrl);
              return (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="relative h-1.5 rounded-full overflow-hidden transition-all duration-500"
                  style={{ width: current === i ? 48 : 12 }}
                  aria-label={`Go to slide ${i + 1}`}
                >
                  <span className="absolute inset-0 bg-white/20 rounded-full" />
                  {current === i && !isVideoSlide && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-white"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                      style={{ originX: 0 }}
                      key={`progress-${current}`}
                    />
                  )}
                  {current === i && isVideoSlide && (
                    <span className="absolute inset-0 rounded-full bg-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.12] hover:border-white/[0.2] transition-all duration-300"
              aria-label="Previous slide"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.12] hover:border-white/[0.2] transition-all duration-300"
              aria-label="Next slide"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Slide counter */}
          <span className="hidden sm:block font-inter text-xs text-white/25 tracking-wider">
            {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ── Trust strip at very bottom ── */}
      <div className="absolute bottom-8 left-0 right-0 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-6">
            {["ISO Certified", "BPA-Free", "2200+ Clients", "18+ States", "Low MOQ"].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-2 font-inter text-[11px] text-gray-500 font-medium"
              >
                <span className="w-1 h-1 rounded-full bg-brand/60" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
