"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { SiteSettings, CompanyStats } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

// ─── Static link data ─────────────────────────────────────────────────────────
const productLinks = [
  { label: "PET Dropper Bottles", href: "/products/pet-dropper-bottles" },
  { label: "Airless Pump Bottles", href: "/products/airless-pump-bottles" },
  { label: "HDPE Wide-Mouth Jars", href: "/products/hdpe-wide-mouth-jars" },
  { label: "PP Cosmetic Containers", href: "/products/pp-cosmetic-containers" },
  { label: "Spray Pump Bottles", href: "/products/spray-pump-bottles" },
  { label: "Boston Round Bottles", href: "/products/boston-round-bottles" },
  { label: "Browse All Products →", href: "/products" },
];

const companyLinks = [
  { label: "About StarBottles", href: "/about" },
  { label: "Why Choose Us", href: "/about#quality" },
  { label: "Industries We Serve", href: "/about" },
  { label: "Sustainability", href: "/about#sustainability" },
  { label: "Contact Us", href: "/contact" },
];

const supportLinks = [
  { label: "Request a Quote", href: "/contact" },
  { label: "Download Catalogue", href: "/catalogue" },
  { label: "FAQs", href: "/about#faq" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
];

const certBadges = ["ISO Certified", "BIS Compliant", "BPA-Free", "Food-Grade PET"];

// Fallback contact info
const FALLBACK = {
  phone: "+91 8086850000",
  phoneRaw: "+918086850000",
  email: "mail@starbottles.in",
  whatsapp: "918086850000",
  address: "39/126, CA Chambers, RS Road, Thrissur, Kerala 680 001",
  hours: "Mon – Sat · 9 AM – 6 PM IST",
  instagram: "#",
  linkedin: "#",
  facebook: "#",
  twitter: "#",
};

function FooterLink({ label, href }: { label: string; href: string }) {
  const isExternal = href.startsWith("http");
  const isHighlighted = label.includes("→");
  const Comp = href.startsWith("/") || isHighlighted ? Link : "a";
  const extraProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <li>
      <Comp
        href={href}
        {...(extraProps as object)}
        className={`group inline-flex items-center gap-1.5 font-inter text-[13px] leading-relaxed transition-all duration-250 ${
          isHighlighted
            ? "text-white/70 hover:text-white font-semibold mt-1"
            : "text-white/40 hover:text-white/80"
        }`}
      >
        <span
          className={`w-0 group-hover:w-3 overflow-hidden transition-all duration-250 flex-shrink-0`}
        >
          <svg
            className="w-3 h-3 text-brand-light"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
        <span className="group-hover:translate-x-0.5 transition-transform duration-250 inline-block">
          {label}
        </span>
      </Comp>
    </li>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export default function Footer({ stats, settings: settingsProp }: { stats?: CompanyStats; settings?: SiteSettings }) {
  const [settings, setSettings] = useState<SiteSettings>(settingsProp || {});

  // Always fetch fresh settings client-side so social links and other dynamic fields
  // reflect updates immediately, even when the page is cached server-side for hours.
  useEffect(() => {
    fetch(`${API_URL}/api/v1/website/settings`, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((json) => setSettings(json.data ?? json))
      .catch(() => {});
  }, []);

  const phone = settings.contact_phone || FALLBACK.phone;
  const phoneRaw = settings.contact_phone_raw || FALLBACK.phoneRaw;
  const email = settings.contact_email || FALLBACK.email;
  const whatsapp = settings.whatsapp_number || FALLBACK.whatsapp;
  const address = settings.address || FALLBACK.address;
  const hours = settings.business_hours || FALLBACK.hours;
  const instagramUrl = settings.instagram_url || FALLBACK.instagram;
  const linkedinUrl = settings.linkedin_url || FALLBACK.linkedin;
  const facebookUrl = settings.facebook_url || FALLBACK.facebook;
  const twitterUrl = settings.twitter_url || FALLBACK.twitter;

  // Build mini stats from API stats or fallback
  const miniStats = stats
    ? [
        { v: String(stats.established), l: "Established" },
        { v: `${stats.clients.value}${stats.clients.suffix}`, l: "Clients" },
        { v: `${stats.skus.value}${stats.skus.suffix}`, l: "SKUs" },
        { v: `${stats.states.value}${stats.states.suffix}`, l: "States" },
      ]
    : [
        { v: "1967", l: "Established" },
        { v: "2200+", l: "Clients" },
        { v: "1500+", l: "SKUs" },
        { v: "18+", l: "States" },
      ];

  const socials = [
    {
      label: "WhatsApp",
      href: `https://wa.me/${whatsapp}`,
      color: "#25D366",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: facebookUrl,
      color: "#1877F2",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: instagramUrl,
      color: "#E1306C",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: linkedinUrl,
      color: "#0A66C2",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      label: "Twitter / X",
      href: twitterUrl,
      color: "#000000",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #070d1a 0%, #040812 100%)" }}>

      {/* ── Ambient background glows — navy tones ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-20 left-1/4 w-[700px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(27,33,120,0.08) 0%, transparent 65%)" }}
        />
        <div
          className="absolute bottom-0 right-1/5 w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(20,25,98,0.06) 0%, transparent 65%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── Top contact strip ── */}
      <div
        className="relative border-b"
        style={{ borderColor: "rgba(27,33,120,0.15)", background: "rgba(27,33,120,0.04)" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <a
                href={`tel:${phoneRaw}`}
                className="flex items-center gap-2.5 font-inter text-sm text-white/55 hover:text-white transition-all duration-250 group"
              >
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand/20 to-brand/10 border border-brand/15 flex items-center justify-center flex-shrink-0 group-hover:border-brand/30 transition-colors">
                  <svg className="w-3.5 h-3.5 text-brand-light/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <span className="group-hover:text-white transition-colors">{phone}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2.5 font-inter text-sm text-white/55 hover:text-white transition-all duration-250 group"
              >
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand/20 to-brand/10 border border-brand/15 flex items-center justify-center flex-shrink-0 group-hover:border-brand/30 transition-colors">
                  <svg className="w-3.5 h-3.5 text-brand-light/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="group-hover:text-white transition-colors">{email}</span>
              </a>
              <div className="flex items-center gap-2.5 font-inter text-sm text-white/35">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand/20 to-brand/10 border border-brand/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-brand-light/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                {address}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2.5 font-inter text-xs text-white/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
              {hours}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main footer body ── */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand column — 4/12 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 flex flex-col"
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
              <Image
                src="/logo-white.png"
                alt="StarBottles"
                width={180}
                height={37}
                className="group-hover:opacity-90 transition-opacity"
              />
            </Link>

            <p className="font-inter text-white/40 text-[13px] leading-[1.8] mb-8 max-w-sm">
              Kerala&apos;s trusted B2B packaging partner since {miniStats[0].v}. Premium PET, HDPE, and PP containers
              for cosmetics, pharma, and FMCG — stocked in {address.split(",")[0]}, shipped pan-India.
            </p>

            {/* 4-stat mini grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {miniStats.map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-xl border px-4 py-3.5 group hover:border-brand/25 transition-all duration-300"
                  style={{ background: "rgba(27,33,120,0.05)", borderColor: "rgba(27,33,120,0.12)" }}
                >
                  <p className="font-poppins font-bold text-lg text-white leading-none tracking-[-0.02em]">{s.v}</p>
                  <p className="font-inter text-[11px] text-white/30 mt-1 uppercase tracking-wider">{s.l}</p>
                </motion.div>
              ))}
            </div>

            {/* Certification badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              {certBadges.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 font-inter text-[10px] font-semibold text-white/45 border rounded-full px-3 py-1.5 uppercase tracking-wider"
                  style={{ borderColor: "rgba(27,33,120,0.2)", background: "rgba(27,33,120,0.08)" }}
                >
                  <span className="w-1 h-1 rounded-full bg-brand-light/60" />
                  {b}
                </span>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="group w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300"
                  style={{
                    background: "rgba(27,33,120,0.06)",
                    borderColor: "rgba(27,33,120,0.15)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = `${s.color}15`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${s.color}40`;
                    (e.currentTarget as HTMLElement).style.color = s.color;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${s.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(27,33,120,0.06)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(27,33,120,0.15)";
                    (e.currentTarget as HTMLElement).style.color = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <span className="text-white/35 group-hover:scale-110 transition-transform duration-250">
                    {s.icon}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Spacer / Divider on desktop */}
          <div className="hidden lg:flex lg:col-span-1 justify-center">
            <div className="w-px h-full" style={{ background: "linear-gradient(to bottom, transparent, rgba(27,33,120,0.2) 20%, rgba(27,33,120,0.2) 80%, transparent)" }} />
          </div>

          {/* Link columns — 7/12 */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-8">

            {/* Products */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h4 className="font-poppins font-semibold text-white/85 text-sm mb-6 flex items-center gap-2.5">
                <span className="w-1 h-4 rounded-full bg-gradient-to-b from-brand-light to-brand/40 flex-shrink-0" />
                Products
              </h4>
              <ul className="space-y-3">
                {productLinks.map((link) => (
                  <FooterLink key={link.label} label={link.label} href={link.href} />
                ))}
              </ul>
            </motion.div>

            {/* Company */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              <h4 className="font-poppins font-semibold text-white/85 text-sm mb-6 flex items-center gap-2.5">
                <span className="w-1 h-4 rounded-full bg-gradient-to-b from-brand-light to-brand/40 flex-shrink-0" />
                Company
              </h4>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <FooterLink key={link.label} label={link.label} href={link.href} />
                ))}
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <h4 className="font-poppins font-semibold text-white/85 text-sm mb-6 flex items-center gap-2.5">
                <span className="w-1 h-4 rounded-full bg-gradient-to-b from-brand-light to-brand/40 flex-shrink-0" />
                Support
              </h4>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <FooterLink key={link.label} label={link.label} href={link.href} />
                ))}
              </ul>

              {/* Get in touch card */}
              <div
                className="mt-9 rounded-2xl p-5 relative overflow-hidden"
                style={{ background: "linear-gradient(145deg, rgba(27,33,120,0.18) 0%, rgba(14,18,73,0.08) 100%)", border: "1px solid rgba(27,33,120,0.2)" }}
              >
                {/* Decorative orb */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(42,50,160,0.25) 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
                />
                <div
                  className="absolute bottom-0 left-0 w-16 h-16 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(27,33,120,0.2) 0%, transparent 70%)", transform: "translate(-20%, 20%)" }}
                />
                <p className="font-poppins font-bold text-white text-sm mb-1.5 relative z-10">
                  Need help choosing?
                </p>
                <p className="font-inter text-white/40 text-xs mb-4 leading-relaxed relative z-10">
                  Our packaging experts respond within 24 hours.
                </p>
                <Link
                  href="/contact"
                  className="relative z-10 inline-flex items-center gap-2 font-poppins font-semibold text-xs text-white bg-gradient-to-r from-brand to-brand-dark hover:from-brand-light hover:to-brand px-4 py-2.5 rounded-xl transition-all duration-300 shadow-[0_2px_12px_rgba(27,33,120,0.3)] hover:shadow-[0_4px_20px_rgba(27,33,120,0.4)]"
                >
                  Talk to Us
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ── Brand gradient divider ── */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(27,33,120,0.4) 25%, rgba(42,50,160,0.6) 50%, rgba(27,33,120,0.4) 75%, transparent 100%)" }}
      />

      {/* ── Bottom bar ── */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Left: copyright */}
          <p className="font-inter text-[11px] text-white/25 order-2 sm:order-1 tracking-wide">
            © {new Date().getFullYear()} Star Bottles. All rights reserved.
          </p>

          {/* Center: Made in India */}
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <svg className="w-3.5 h-3.5 text-[#FF9933]/70" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
            <span className="font-inter text-[11px] text-white/25 tracking-wide">Crafted with pride in Kerala</span>
            <span className="text-[11px]">🇮🇳</span>
          </div>

          {/* Right: legal links */}
          <div className="flex items-center gap-6 order-3">
            {[
              { label: "Privacy", href: "/privacy-policy" },
              { label: "Terms", href: "/terms" },
              { label: "Sitemap", href: "#" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-inter text-[11px] text-white/25 hover:text-white/50 transition-colors duration-250 tracking-wide"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
