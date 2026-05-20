"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { productImage, type Product, type SiteSettings, type Category } from "@/lib/api";
import CallbackModal from "@/components/CallbackModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";
const PLACEHOLDER_IMAGE = "https://shop.starbottles.in/wp-content/uploads/2025/11/M3.webp";

function ProductNavImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
      sizes="58px"
      onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
    />
  );
}
const FALLBACK_PHONE = "+91 80868 50000";
const FALLBACK_PHONE_RAW = "+918086850000";

// ─── Category data for Products mega-menu ─────────────────────────────────────

// Default icon used for all DB categories
const DEFAULT_NAV_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

// Static "Custom Packaging" entry always appended last
const CUSTOM_PACKAGING_ENTRY = {
  label: "Custom Packaging",
  tagline: "Any Size · Any Shape · OEM",
  href: "/contact",
  productCategory: null as string | null,
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  ),
};

// Build menu category list from DB categories + static Custom Packaging entry
function buildNavCategories(categories?: Category[]) {
  const fromDb = (categories ?? []).map((cat) => ({
    label: cat.name,
    slug: cat.slug as string | null,
    tagline: cat.tagline ?? "Packaging solutions",
    href: `/products?category=${encodeURIComponent(cat.name)}`,
    productCategory: cat.name as string | null,
    icon: DEFAULT_NAV_ICON,
  }));
  return [...fromDb, { ...CUSTOM_PACKAGING_ENTRY, slug: null }];
}

type DropdownType = "products" | "categories" | null;

// ─── Products Mega Menu ───────────────────────────────────────────────────────
function ProductsMegaMenu({ onClose, products, categories }: { onClose: () => void; products: Product[]; categories?: Category[] }) {
  const navCats = buildNavCategories(categories);
  const [activeCategory, setActiveCategory] = useState(navCats[0]?.label ?? "");
  const [search, setSearch] = useState("");

  const filteredCats = search.trim()
    ? navCats.filter((c) => c.label.toLowerCase().includes(search.toLowerCase()))
    : navCats;

  const activeCat = navCats.find((c) => c.label === activeCategory) ?? navCats[0];
  const catProducts = activeCat?.productCategory
    ? products.filter((p) => p.category === activeCat.productCategory)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(14,18,73,0.25),0_0_0_1px_rgba(14,18,73,0.05)] overflow-hidden flex"
      style={{ width: "740px" }}
    >
      {/* Arrow */}
      <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white shadow-[-1px_-1px_2px_rgba(14,18,73,0.06)] rotate-45 z-10 rounded-sm" />

      {/* Left: Category list */}
      <div className="w-56 bg-gradient-to-b from-brand-pale/60 to-brand-pale/30 border-r border-brand/[0.06] flex-shrink-0 flex flex-col">
        <p className="font-poppins text-[10px] font-semibold text-brand/50 uppercase tracking-[0.16em] px-5 pt-4 pb-2 flex-shrink-0">
          Product Categories
        </p>
        {/* Search */}
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-8 pr-3 py-1.5 text-[12px] font-inter bg-white/70 border border-brand/[0.1] rounded-lg outline-none focus:border-brand/30 focus:bg-white placeholder:text-gray-400 transition-all duration-150"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="overflow-y-auto px-2 pb-4 space-y-0.5 [max-height:300px] [scrollbar-width:thin] [scrollbar-color:rgba(27,33,120,0.2)_transparent]">
          {filteredCats.length === 0 ? (
            <p className="text-center text-[11px] text-gray-400 py-6">No categories found</p>
          ) : null}
          {filteredCats.map((cat) => (
            <button
              key={cat.label}
              onMouseEnter={() => setActiveCategory(cat.label)}
              onClick={() => { onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl transition-all duration-200 group ${
                activeCategory === cat.label
                  ? "bg-white shadow-[0_2px_12px_rgba(14,18,73,0.08)] text-brand-dark"
                  : "text-gray-600 hover:text-brand-dark hover:bg-white/70"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative transition-all duration-200 ${
                  activeCategory === cat.label
                    ? "ring-2 ring-brand shadow-[0_2px_8px_rgba(27,33,120,0.3)]"
                    : "bg-brand/[0.07]"
                }`}
              >
                {cat.slug ? (
                  <CategoryNavImage slug={cat.slug} />
                ) : (
                  <span className={`flex items-center justify-center w-full h-full ${
                    activeCategory === cat.label ? "text-brand bg-brand/10" : "text-brand/60 group-hover:text-brand"
                  }`}>
                    {cat.icon}
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`font-inter text-[13px] font-semibold leading-tight truncate transition-colors duration-200 ${
                  activeCategory === cat.label ? "text-brand-dark" : ""
                }`}>
                  {cat.label}
                </p>
                <p className="font-inter text-[10px] text-gray-400 leading-tight truncate mt-0.5">{cat.tagline}</p>
              </div>
              <motion.svg
                initial={false}
                animate={{ opacity: activeCategory === cat.label ? 1 : 0, x: activeCategory === cat.label ? 0 : -4 }}
                transition={{ duration: 0.15 }}
                className="w-3.5 h-3.5 flex-shrink-0 text-brand"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </motion.svg>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Products or CTA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100/80 flex items-center justify-between">
          <div>
            <p className="font-poppins font-bold text-[15px] text-gray-900 tracking-[-0.01em]">{activeCat.label}</p>
            <p className="font-inter text-xs text-gray-400 mt-0.5">{activeCat.tagline}</p>
          </div>
          {activeCat.productCategory && (
            <Link
              href={activeCat.href}
              onClick={onClose}
              className="font-inter text-xs font-semibold text-brand hover:text-brand-dark transition-colors flex items-center gap-1.5 bg-brand-pale/50 hover:bg-brand-pale px-3 py-1.5 rounded-lg"
            >
              View all
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 p-5"
          >
            {activeCat.productCategory === null ? (
              /* Custom Packaging CTA */
              <div
                className="h-full min-h-[220px] rounded-2xl flex flex-col items-start justify-between p-6 relative overflow-hidden"
                style={{ background: "linear-gradient(145deg, #0E1249 0%, #1B2178 50%, #141962 100%)" }}
              >
                {/* Decorative orbs */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(42,50,160,0.4) 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
                />
                <div
                  className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(27,33,120,0.3) 0%, transparent 70%)", transform: "translate(-20%, 20%)" }}
                />
                <div className="relative z-10">
                  <p className="font-inter text-[10px] font-bold text-brand-pale/70 uppercase tracking-[0.2em] mb-3">
                    OEM / Custom
                  </p>
                  <h3 className="font-poppins font-bold text-white text-lg mb-2 max-w-[240px] leading-snug tracking-[-0.01em]">
                    Need a specific size, shape, or material?
                  </h3>
                  <p className="font-inter text-white/50 text-[13px] leading-relaxed max-w-[240px]">
                    Custom moulds, private-label printing, unique finishes — we build it from scratch.
                  </p>
                </div>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="relative z-10 mt-5 inline-flex items-center gap-2 bg-white text-brand-dark font-poppins font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-brand-pale hover:shadow-lg transition-all duration-200"
                >
                  Get Custom Quote
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            ) : catProducts.length === 0 ? (
              /* No products yet */
              <div className="flex flex-col items-center justify-center h-44 text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-pale/50 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-brand/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="font-inter text-sm text-gray-400 mb-3">Products coming soon</p>
                <Link
                  href={activeCat.href}
                  onClick={onClose}
                  className="font-inter text-xs font-semibold text-brand hover:text-brand-dark transition-colors bg-brand-pale/40 hover:bg-brand-pale px-4 py-2 rounded-lg"
                >
                  Browse catalogue
                </Link>
              </div>
            ) : (
              /* Product cards */
              <div className="grid grid-cols-2 gap-3">
                {catProducts.slice(0, 4).map((product) => (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="group flex gap-3.5 p-3 rounded-xl border border-gray-100 hover:border-brand/20 hover:shadow-[0_4px_16px_rgba(14,18,73,0.06)] hover:bg-gradient-to-br hover:from-brand-pale/20 hover:to-transparent transition-all duration-250"
                  >
                    {/* Image */}
                    <div className="w-[58px] h-[58px] bg-gradient-to-br from-brand-pale/40 to-brand-pale/10 rounded-xl flex-shrink-0 relative overflow-hidden border border-brand/[0.04]">
                      <ProductNavImage src={productImage(product.image)} alt={product.name} />
                    </div>
                    {/* Info */}
                    <div className="flex flex-col justify-center min-w-0">
                      <p className="font-poppins font-semibold text-[13px] text-gray-900 group-hover:text-brand-dark transition-colors leading-snug mb-1 line-clamp-2">
                        {product.name}
                      </p>
                      <p className="font-inter text-[10px] text-gray-400 leading-tight">
                        {product.sizes.slice(0, 3).join(" · ")}
                      </p>
                      <p className="font-inter text-[10px] text-brand font-bold mt-1 tracking-wide">
                        MOQ: {product.moq}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-brand-pale/20 to-transparent">
          <Link
            href="/products"
            onClick={onClose}
            className="font-inter text-xs font-semibold text-gray-600 hover:text-brand transition-colors flex items-center gap-2 group"
          >
            <svg className="w-4 h-4 text-brand/40 group-hover:text-brand transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Browse all products
          </Link>
          <Link
            href="/catalogue"
            onClick={onClose}
            className="font-inter text-xs text-gray-400 hover:text-brand transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Catalogue
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

const R2_BASE = "https://pub-3ac8dfa528c245f39b68fb9600dd0cb9.r2.dev";

function CategoryNavImage({ slug }: { slug: string }) {
  const [imgSrc, setImgSrc] = useState(`${R2_BASE}/${slug}/1.jpg`);
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center text-brand/40">
        {DEFAULT_NAV_ICON}
      </div>
    );
  }
  return (
    <Image
      src={imgSrc}
      alt=""
      fill
      className="object-cover"
      sizes="36px"
      onError={() => { setImgSrc(""); setFailed(true); }}
    />
  );
}

// ─── Categories dropdown ──────────────────────────────────────────────────────
function CategoriesDropdown({ onClose, categories }: { onClose: () => void; categories?: Category[] }) {
  const featured = (categories ?? []).filter((c) => c.is_featured);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[320px] bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(14,18,73,0.25),0_0_0_1px_rgba(14,18,73,0.05)] overflow-hidden"
    >
      <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white shadow-[-1px_-1px_2px_rgba(14,18,73,0.06)] rotate-45 z-10 rounded-sm" />
      <div className="px-5 py-3.5 bg-gradient-to-r from-brand-pale/60 to-brand-pale/30 border-b border-brand/[0.06]">
        <p className="font-poppins font-semibold text-xs text-brand-dark uppercase tracking-[0.12em]">
          Product Categories
        </p>
      </div>
      <div className="p-2.5">
        {featured.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="font-inter text-[12px] text-gray-400">No featured categories yet.</p>
          </div>
        ) : (
          featured.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.22 }}
            >
              <Link
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="flex items-start gap-3.5 px-3.5 py-3 rounded-xl hover:bg-brand-pale/50 group transition-all duration-200"
                onClick={onClose}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-pale/80 to-brand-pale/30 flex-shrink-0 mt-0.5 border border-brand/[0.06] overflow-hidden relative">
                  <CategoryNavImage slug={cat.slug} />
                </div>
                <div className="flex-1">
                  <p className="font-poppins font-semibold text-[13px] text-gray-900 group-hover:text-brand-dark transition-colors">
                    {cat.name}
                  </p>
                  {cat.tagline && (
                    <p className="font-inter text-[11px] text-gray-400 leading-snug mt-0.5">
                      {cat.tagline}
                    </p>
                  )}
                </div>
                <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand/50 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ─── Animated underline link ──────────────────────────────────────────────────
function NavLink({
  href,
  label,
  isActive,
  solid,
  hasDropdown,
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: {
  href: string;
  label: string;
  isActive: boolean;
  solid: boolean;
  hasDropdown?: boolean;
  isOpen?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative group font-inter text-[13px] font-medium tracking-[0.01em] transition-colors duration-200 flex items-center gap-1 py-1.5 ${
        isActive || isOpen
          ? solid ? "text-brand-dark" : "text-white"
          : solid
          ? "text-gray-600 hover:text-brand-dark"
          : "text-white/80 hover:text-white"
      }`}
    >
      {label}
      {hasDropdown && (
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-3.5 h-3.5 opacity-60"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      )}
      <span
        className={`absolute -bottom-0.5 left-0 h-[2px] rounded-full transition-all duration-300 ease-out ${
          solid ? "bg-brand" : "bg-white"
        } ${
          isActive || isOpen ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar({ products = [], settings, categories }: { products?: Product[]; settings?: SiteSettings; categories?: Category[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<string | null>(null);
  const [phone, setPhone] = useState(settings?.contact_phone || FALLBACK_PHONE);
  const [phoneRaw, setPhoneRaw] = useState(settings?.contact_phone_raw || FALLBACK_PHONE_RAW);
  const pathname = usePathname();
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fallback: fetch settings client-side only if not provided via props
  useEffect(() => {
    if (settings) return;
    fetch(`${API_URL}/api/v1/website/settings`, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((json) => {
        const s = json.data ?? json;
        if (s.contact_phone) setPhone(s.contact_phone);
        if (s.contact_phone_raw) setPhoneRaw(s.contact_phone_raw);
      })
      .catch(() => {});
  }, [settings]);

  const isHome = pathname === "/";
  const solid = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileProductsOpen(false);
    setMobileCategoriesOpen(false);
    setMobileCategoryOpen(null);
  }, [pathname]);

  const openDropdown = (type: DropdownType) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setActiveDropdown(type);
  };

  const closeDropdown = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 130);
  };

  const closeNow = () => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setActiveDropdown(null);
  };

  const navLinks = [
    { label: "Home", href: "/", dropdown: null, neverActive: false },
    { label: "Products", href: "/products", dropdown: "products" as DropdownType, neverActive: false },
    { label: "Categories", href: "/products", dropdown: "categories" as DropdownType, neverActive: true },
    { label: "Why StarBottles", href: "/about", dropdown: null, neverActive: false },
    { label: "Contact", href: "/contact", dropdown: null, neverActive: false },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        solid
          ? "bg-white/[0.97] backdrop-blur-xl shadow-[0_1px_0_rgba(14,18,73,0.06),0_4px_24px_rgba(14,18,73,0.04)]"
          : "bg-transparent"
      }`}
    >
      {/* Thin top accent line on solid state */}
      <div className={`h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent transition-opacity duration-500 ${solid ? "opacity-100" : "opacity-0"}`} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px] lg:h-[76px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3.5 flex-shrink-0 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={solid ? "/logo.png" : "/logo-white.png"}
              alt="StarBottles"
              width={160}
              height={33}
              className="transition-all duration-500 group-hover:opacity-90 h-12 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) =>
              item.dropdown ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => openDropdown(item.dropdown)}
                  onMouseLeave={closeDropdown}
                >
                  <NavLink
                    href={item.href}
                    label={item.label}
                    isActive={!item.neverActive && pathname === item.href}
                    solid={solid}
                    hasDropdown
                    isOpen={activeDropdown === item.dropdown}
                  />
                  <AnimatePresence>
                    {activeDropdown === item.dropdown && (
                      <div
                        onMouseEnter={() => openDropdown(item.dropdown)}
                        onMouseLeave={closeDropdown}
                      >
                        {item.dropdown === "products" ? (
                          <ProductsMegaMenu onClose={closeNow} products={products} categories={categories} />
                        ) : (
                          <CategoriesDropdown onClose={closeNow} categories={categories} />
                        )}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  key={item.label}
                  href={item.href}
                  label={item.label}
                  isActive={pathname === item.href}
                  solid={solid}
                />
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-5">
            <a
              href={`tel:${phoneRaw}`}
              className={`group flex items-center gap-2 font-inter text-sm font-medium transition-all duration-200 ${
                solid ? "text-gray-500 hover:text-brand-dark" : "text-white/70 hover:text-white"
              }`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                solid
                  ? "bg-brand-pale/60 text-brand/60 group-hover:bg-brand-pale group-hover:text-brand"
                  : "bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white"
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <span className="hidden lg:inline">{phone}</span>
            </a>

            <button
              onClick={() => setCallbackOpen(true)}
              className="relative group overflow-hidden font-poppins font-semibold text-[13px] text-white px-6 py-2.5 rounded-xl transition-all duration-300
                bg-gradient-to-r from-brand to-brand-dark
                hover:shadow-[0_4px_20px_rgba(27,33,120,0.4),0_0_0_1px_rgba(27,33,120,0.1)]
                shadow-[0_2px_12px_rgba(27,33,120,0.25)]"
            >
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
              <span className="relative flex items-center gap-2">
                Request Call Back
                <svg className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              solid ? "text-gray-700 hover:bg-brand-pale/50" : "text-white hover:bg-white/10"
            }`}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-[5px]">
              <motion.span animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.25 }} className={`block h-[1.5px] w-5 rounded-full ${solid ? "bg-gray-800" : "bg-white"}`} />
              <motion.span animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.2 }} className={`block h-[1.5px] w-5 rounded-full ${solid ? "bg-gray-800" : "bg-white"}`} />
              <motion.span animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.25 }} className={`block h-[1.5px] w-5 rounded-full ${solid ? "bg-gray-800" : "bg-white"}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-white border-t border-brand/[0.06] overflow-hidden shadow-[0_20px_40px_rgba(14,18,73,0.1)]"
          >
            <div className="max-w-7xl mx-auto px-6 py-5 space-y-1">

              {/* Home */}
              <Link href="/" onClick={() => setMenuOpen(false)} className={`block px-4 py-3 font-inter text-sm font-medium rounded-xl transition-all duration-200 ${pathname === "/" ? "text-brand-dark bg-brand-pale/60 font-semibold" : "text-gray-700 hover:text-brand-dark hover:bg-brand-pale/40"}`}>
                Home
              </Link>

              {/* Products — expandable with categories */}
              <div>
                <button
                  onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 font-inter text-sm font-medium text-gray-700 hover:text-brand-dark hover:bg-brand-pale/40 rounded-xl transition-all duration-200"
                >
                  <span>Products</span>
                  <motion.svg animate={{ rotate: mobileProductsOpen ? 180 : 0 }} transition={{ duration: 0.25 }} className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                <AnimatePresence>
                  {mobileProductsOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="ml-2 mt-1 overflow-hidden border-l-2 border-brand-pale pl-2">
                      {buildNavCategories(categories).map((cat) => {
                        const catProds = cat.productCategory
                          ? products.filter((p) => p.category === cat.productCategory)
                          : [];
                        const isOpen = mobileCategoryOpen === cat.label;
                        return (
                          <div key={cat.label}>
                            <button
                              onClick={() => setMobileCategoryOpen(isOpen ? null : cat.label)}
                              className="w-full flex items-center justify-between px-3 py-2.5 font-inter text-sm text-gray-600 hover:text-brand-dark hover:bg-brand-pale/30 rounded-xl transition-all duration-200"
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-brand-pale/50 flex-shrink-0 overflow-hidden relative border border-brand/[0.06]">
                                {cat.slug ? <CategoryNavImage slug={cat.slug} /> : <span className="flex items-center justify-center w-full h-full text-brand/50">{cat.icon}</span>}
                              </span>
                                <span className="font-medium">{cat.label}</span>
                              </span>
                              {catProds.length > 0 && (
                                <motion.svg animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </motion.svg>
                              )}
                            </button>
                            <AnimatePresence>
                              {isOpen && catProds.length > 0 && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="ml-8 overflow-hidden">
                                  {catProds.map((prod) => (
                                    <Link
                                      key={prod.slug}
                                      href={`/products/${prod.slug}`}
                                      onClick={() => setMenuOpen(false)}
                                      className="flex items-center gap-2.5 px-3 py-2 font-inter text-[13px] text-gray-500 hover:text-brand-dark hover:bg-brand-pale/30 rounded-xl transition-all duration-200"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand/30 flex-shrink-0" />
                                      {prod.name}
                                    </Link>
                                  ))}
                                  <Link href={cat.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 font-inter text-xs font-semibold text-brand hover:text-brand-dark transition-colors">
                                    View all {cat.label} →
                                  </Link>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                      <Link href="/products" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 mt-1 font-inter text-xs font-semibold text-brand border-t border-brand-pale hover:text-brand-dark transition-colors">
                        Browse all products →
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Categories */}
              <div>
                <button
                  onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 font-inter text-sm font-medium text-gray-700 hover:text-brand-dark hover:bg-brand-pale/40 rounded-xl transition-all duration-200"
                >
                  <span>Categories</span>
                  <motion.svg animate={{ rotate: mobileCategoriesOpen ? 180 : 0 }} transition={{ duration: 0.25 }} className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                <AnimatePresence>
                  {mobileCategoriesOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="ml-2 mt-1 space-y-0.5 overflow-hidden border-l-2 border-brand-pale pl-2">
                      {(categories ?? []).filter((c) => c.is_featured).map((cat) => (
                        <Link key={cat.id} href={`/products?category=${encodeURIComponent(cat.name)}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 font-inter text-sm text-gray-600 hover:text-brand-dark hover:bg-brand-pale/30 rounded-xl transition-all duration-200">
                          <span className="w-7 h-7 rounded-lg bg-brand-pale/50 flex-shrink-0 overflow-hidden relative border border-brand/[0.06]">
                            <CategoryNavImage slug={cat.slug} />
                          </span>
                          <span className="font-medium">{cat.name}</span>
                        </Link>
                      ))}
                      <Link href="/products" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 mt-1 font-inter text-xs font-semibold text-brand border-t border-brand-pale hover:text-brand-dark transition-colors">
                        Browse all products →
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Why StarBottles */}
              <Link href="/about" onClick={() => setMenuOpen(false)} className={`block px-4 py-3 font-inter text-sm font-medium rounded-xl transition-all duration-200 ${pathname === "/about" ? "text-brand-dark bg-brand-pale/60 font-semibold" : "text-gray-700 hover:text-brand-dark hover:bg-brand-pale/40"}`}>
                Why StarBottles
              </Link>

              {/* Contact */}
              <Link href="/contact" onClick={() => setMenuOpen(false)} className={`block px-4 py-3 font-inter text-sm font-medium rounded-xl transition-all duration-200 ${pathname === "/contact" ? "text-brand-dark bg-brand-pale/60 font-semibold" : "text-gray-700 hover:text-brand-dark hover:bg-brand-pale/40"}`}>
                Contact
              </Link>

              {/* Phone + CTA */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pt-4 pb-1 space-y-3">
                <a href={`tel:${phoneRaw}`} className="flex items-center justify-center gap-2 font-inter text-sm text-gray-500 hover:text-brand-dark transition-colors">
                  <svg className="w-4 h-4 text-brand/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {phone}
                </a>
                <button onClick={() => { setMenuOpen(false); setCallbackOpen(true); }} className="w-full block text-center font-poppins font-semibold text-sm text-white px-6 py-3.5 rounded-xl transition-all duration-300 bg-gradient-to-r from-brand to-brand-dark shadow-[0_4px_16px_rgba(27,33,120,0.3)] hover:shadow-[0_6px_24px_rgba(27,33,120,0.4)]">
                  Request Call Back
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CallbackModal isOpen={callbackOpen} onClose={() => setCallbackOpen(false)} />
    </header>
  );
}
