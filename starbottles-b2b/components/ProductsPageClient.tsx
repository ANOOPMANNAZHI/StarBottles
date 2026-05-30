"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { productImage, type Product } from "@/lib/api";

const PLACEHOLDER = "https://shop.starbottles.in/wp-content/uploads/2025/11/M3.webp";

function ProductCardImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover group-hover:scale-[1.06] transition-transform duration-[600ms] ease-out"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      onError={() => setImgSrc(PLACEHOLDER)}
    />
  );
}

// ─── Tag colour map ────────────────────────────────────────────────────────────
const tagColors: Record<string, string> = {
  "Best Seller": "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
  Premium: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/60",
  Versatile: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/60",
  "Eco-Friendly": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
  Popular: "bg-brand-pale text-brand-dark ring-1 ring-brand/20",
  "Pharma Grade": "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60",
};

// ─── Derived filter options ───────────────────────────────────────────────────

// Extract canonical material tags from "PET / LDPE", "PP / ABS", etc.
function parseMaterials(raw: string): string[] {
  return raw
    .split(/[/,]/)
    .map((s) => s.replace(/\(.*?\)/, "").trim())
    .filter(Boolean);
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Filters = {
  search: string;
  categories: Set<string>;
  materials: Set<string>;
  capacity: string; // bucket label or ""
};

const defaultFilters = (): Filters => ({
  search: "",
  categories: new Set(),
  materials: new Set(),
  capacity: "",
});

const CAPACITY_BUCKETS = [
  { label: "Up to 50 ml / g", test: (sizes: string[]) => sizes.some((s) => parseInt(s) <= 50) },
  { label: "50 – 150 ml / g", test: (sizes: string[]) => sizes.some((s) => { const n = parseInt(s); return n > 50 && n <= 150; }) },
  { label: "150 – 500 ml / g", test: (sizes: string[]) => sizes.some((s) => { const n = parseInt(s); return n > 150 && n <= 500; }) },
  { label: "500 ml / g +", test: (sizes: string[]) => sizes.some((s) => parseInt(s) > 500) },
];

// ─── FilterSidebar component ──────────────────────────────────────────────────
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-brand/[0.06] pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <span className="font-poppins font-semibold text-[13px] uppercase tracking-wider text-brand-dark/70">{title}</span>
        <span className={`w-5 h-5 rounded-md bg-brand-pale/60 flex items-center justify-center transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <svg
            className="w-3 h-3 text-brand"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckItem({
  label,
  checked,
  onChange,
  count,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1.5" onClick={onChange}>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center border-[1.5px] flex-shrink-0 transition-all duration-200 ${
          checked
            ? "bg-brand border-brand shadow-sm shadow-brand/20"
            : "bg-white border-gray-300/80 group-hover:border-brand/40 group-hover:bg-brand-pale/30"
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className={`font-inter text-[13px] flex-1 transition-colors ${checked ? "text-brand-dark font-semibold" : "text-gray-600 group-hover:text-gray-800"}`}>
        {label}
      </span>
      {count !== undefined && (
        <span className={`font-inter text-[11px] px-1.5 py-0.5 rounded-md transition-colors ${checked ? "bg-brand-pale text-brand font-medium" : "text-gray-400 bg-gray-50"}`}>
          {count}
        </span>
      )}
    </label>
  );
}

function Sidebar({
  filters,
  setFilters,
  totalActive,
  onReset,
  allCategories,
  allMaterials,
  products,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  totalActive: number;
  onReset: () => void;
  allCategories: string[];
  allMaterials: string[];
  products: Product[];
}) {
  const [catSearch, setCatSearch] = useState("");

  const toggleCategory = (cat: string) =>
    setFilters((f) => {
      const next = new Set(f.categories);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return { ...f, categories: next };
    });

  const toggleMaterial = (mat: string) =>
    setFilters((f) => {
      const next = new Set(f.materials);
      next.has(mat) ? next.delete(mat) : next.add(mat);
      return { ...f, materials: next };
    });

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allCategories.forEach((c) => {
      counts[c] = products.filter((p) => p.category === c).length;
    });
    return counts;
  }, [allCategories, products]);

  const filteredCats = useMemo(() => {
    if (!catSearch.trim()) return allCategories;
    const q = catSearch.toLowerCase();
    return allCategories.filter((c) => c.toLowerCase().includes(q));
  }, [allCategories, catSearch]);

  return (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
          </div>
          <span className="font-poppins font-bold text-sm text-brand-darker">
            Filters
            {totalActive > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-brand text-white text-[10px] font-inter font-bold rounded-full">
                {totalActive}
              </span>
            )}
          </span>
        </div>
        {totalActive > 0 && (
          <button
            onClick={onReset}
            className="font-inter text-xs text-brand/70 hover:text-brand transition-colors underline underline-offset-2 decoration-brand/30"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        {/* Search input */}
        <div className="relative mb-2">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input
            type="text"
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            placeholder="Search categories…"
            className="w-full pl-8 pr-7 py-1.5 text-[12px] font-inter border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 placeholder:text-gray-400 text-gray-700"
          />
          {catSearch && (
            <button
              onClick={() => setCatSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {/* Scrollable list */}
        <div className="overflow-y-auto [max-height:260px] [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] pr-1">
          {filteredCats.length > 0 ? (
            <div className="space-y-0.5">
              {filteredCats.map((cat) => (
                <CheckItem
                  key={cat}
                  label={cat}
                  checked={filters.categories.has(cat)}
                  onChange={() => toggleCategory(cat)}
                  count={catCounts[cat]}
                />
              ))}
            </div>
          ) : (
            <p className="font-inter text-[12px] text-gray-400 py-3 text-center">No categories found</p>
          )}
        </div>
      </FilterSection>

      {/* Material */}
      <FilterSection title="Material / MOC">
        <div className="space-y-0.5">
          {allMaterials.map((mat) => (
            <CheckItem
              key={mat}
              label={mat}
              checked={filters.materials.has(mat)}
              onChange={() => toggleMaterial(mat)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Capacity / Size Range */}
      <FilterSection title="Capacity / Size">
        <div className="space-y-1">
          {CAPACITY_BUCKETS.map((bucket) => (
            <label
              key={bucket.label}
              className="flex items-center gap-3 cursor-pointer group py-1.5"
              onClick={() => setFilters((f) => ({ ...f, capacity: bucket.label }))}
            >
              <input type="radio" name="capacity" value={bucket.label} checked={filters.capacity === bucket.label} onChange={() => setFilters((f) => ({ ...f, capacity: bucket.label }))} className="sr-only" />
              <span
                className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                  filters.capacity === bucket.label
                    ? "border-brand bg-brand shadow-sm shadow-brand/20"
                    : "border-gray-300/80 group-hover:border-brand/40"
                }`}
              >
                {filters.capacity === bucket.label && (
                  <span className="w-[6px] h-[6px] rounded-full bg-white" />
                )}
              </span>
              <span
                className={`font-inter text-[13px] transition-colors ${
                  filters.capacity === bucket.label
                    ? "text-brand-dark font-semibold"
                    : "text-gray-600 group-hover:text-gray-800"
                }`}
              >
                {bucket.label}
              </span>
            </label>
          ))}
          {filters.capacity && (
            <button
              onClick={() => setFilters((f) => ({ ...f, capacity: "" }))}
              className="font-inter text-xs text-gray-400 hover:text-brand transition-colors mt-2 flex items-center gap-1.5 pl-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear selection
            </button>
          )}
        </div>
      </FilterSection>
    </aside>
  );
}

// ─── Mobile filter drawer ─────────────────────────────────────────────────────
function MobileFilterDrawer({
  open,
  onClose,
  filters,
  setFilters,
  totalActive,
  onReset,
  resultCount,
  allCategories,
  allMaterials,
  products,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  totalActive: number;
  onReset: () => void;
  resultCount: number;
  allCategories: string[];
  allMaterials: string[];
  products: Product[];
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-darker/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 w-[320px] bg-white z-50 shadow-2xl overflow-y-auto lg:hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-7">
                <span className="font-poppins font-bold text-lg text-brand-darker">Filters</span>
                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <Sidebar
                filters={filters}
                setFilters={setFilters}
                totalActive={totalActive}
                onReset={onReset}
                allCategories={allCategories}
                allMaterials={allMaterials}
                products={products}
              />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
              <button
                onClick={onClose}
                className="w-full bg-brand hover:bg-brand-dark text-white font-poppins font-semibold py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-brand/20"
              >
                Show {resultCount} result{resultCount !== 1 ? "s" : ""}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Active filter chips ──────────────────────────────────────────────────────
function ActiveFilters({
  filters,
  setFilters,
  onReset,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onReset: () => void;
}) {
  const chips: { label: string; remove: () => void }[] = [];

  filters.categories.forEach((cat) =>
    chips.push({
      label: cat,
      remove: () =>
        setFilters((f) => {
          const next = new Set(f.categories);
          next.delete(cat);
          return { ...f, categories: next };
        }),
    })
  );

  filters.materials.forEach((mat) =>
    chips.push({
      label: mat,
      remove: () =>
        setFilters((f) => {
          const next = new Set(f.materials);
          next.delete(mat);
          return { ...f, materials: next };
        }),
    })
  );

  if (filters.capacity)
    chips.push({
      label: filters.capacity,
      remove: () => setFilters((f) => ({ ...f, capacity: "" })),
    });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="font-inter text-xs text-gray-400 shrink-0 mr-1">Active filters:</span>
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center gap-1.5 bg-brand-pale/70 text-brand-dark font-inter text-xs font-semibold px-3 py-1.5 rounded-lg ring-1 ring-brand/10"
        >
          {chip.label}
          <button onClick={chip.remove} className="text-brand/50 hover:text-brand transition-colors ml-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      <button
        onClick={onReset}
        className="font-inter text-xs text-gray-400 hover:text-brand transition-colors ml-1 underline underline-offset-2"
      >
        Clear all
      </button>
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.36), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="group flex flex-col bg-white rounded-2xl overflow-hidden h-full transition-all duration-300 ring-1 ring-gray-100 hover:ring-brand/25 hover:shadow-xl hover:shadow-brand/[0.06]"
      >
        {/* Image */}
        <div className="relative h-52 bg-gradient-to-br from-[#f7f8fc] via-brand-pale/15 to-[#f0f1f8] overflow-hidden shrink-0">
          {product.image ? (
            <ProductCardImage src={productImage(product.image)} alt={product.name} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          )}
          {product.tag && (
            <span className={`absolute top-3.5 left-3.5 text-[10px] font-inter font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${tagColors[product.tag] ?? "bg-gray-100 text-gray-600 ring-1 ring-gray-200/60"}`}>
              {product.tag}
            </span>
          )}
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand/0 via-transparent to-transparent group-hover:from-brand/[0.03] transition-all duration-500" />
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="font-inter text-[11px] font-bold text-brand uppercase tracking-wider">{product.category}</span>
            {product.material && (
              <>
                <span className="w-[3px] h-[3px] rounded-full bg-gray-300" />
                <span className="font-inter text-[11px] text-gray-400">{product.material}</span>
              </>
            )}
          </div>

          <h3 className="font-poppins font-bold text-[15px] text-gray-900 group-hover:text-brand transition-colors duration-200 leading-snug mb-2">
            {product.name}
          </h3>
          <p className="font-inter text-xs text-gray-500 leading-relaxed mb-3.5 line-clamp-2 flex-1">
            {product.description}
          </p>

          {/* Size chips */}
          {product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {product.sizes.map((s) => (
                <span key={s} className="font-inter text-[10px] font-medium bg-brand-pale/40 text-brand-dark/70 px-2 py-0.5 rounded-md">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3.5 border-t border-gray-100/80">
            <div>
              {product.moq && (
                <>
                  <p className="font-inter text-[10px] uppercase tracking-wider text-gray-400">MOQ</p>
                  <p className="font-inter text-xs font-bold text-brand-dark">{product.moq}</p>
                </>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 font-inter text-xs font-bold text-brand group-hover:text-brand-dark transition-colors">
              Details
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const PAGE_SIZE = 9;

// ─── Main client component ────────────────────────────────────────────────────
export default function ProductsPageClient({ initialProducts }: { initialProducts: Product[] }) {
  const allCategories = useMemo(() => Array.from(new Set(initialProducts.map((p) => p.category))).filter(Boolean), [initialProducts]);
  const allMaterials = useMemo(() => Array.from(new Set(initialProducts.flatMap((p) => parseMaterials(p.material)))).sort(), [initialProducts]);

  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortBy, setSortBy] = useState<"default" | "name_asc" | "name_desc" | "featured">("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Sync category filter with ?category= URL param whenever it changes
  const searchParams = useSearchParams();
  useEffect(() => {
    const cat = searchParams.get("category");
    setFilters((f) => ({
      ...defaultFilters(),
      search: f.search, // preserve any active search text
      categories: cat ? new Set([cat]) : new Set(),
    }));
    setVisibleCount(PAGE_SIZE);
  }, [searchParams]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters());
    setVisibleCount(PAGE_SIZE);
    setSortBy("default");
  }, []);

  const totalActiveFilters =
    filters.categories.size + filters.materials.size + (filters.capacity ? 1 : 0);
  const hasAnyFilter = !!filters.search || totalActiveFilters > 0;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const inSpecs = p.specs.some(
          (s) => (s.label ?? "").toLowerCase().includes(q) || (s.value ?? "").toLowerCase().includes(q)
        );
        const inFeatures = p.features.some((f) => (f ?? "").toLowerCase().includes(q));
        const inApps = p.applications.some((a) => (a ?? "").toLowerCase().includes(q));
        const matchSearch =
          (p.name ?? "").toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          (p.material ?? "").toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q) ||
          inSpecs || inFeatures || inApps;
        if (!matchSearch) return false;
      }

      if (filters.categories.size > 0 && !filters.categories.has(p.category)) return false;

      if (filters.materials.size > 0) {
        const productMaterials = parseMaterials(p.material);
        const matchesMaterial = [...filters.materials].some((m) => productMaterials.includes(m));
        if (!matchesMaterial) return false;
      }

      if (filters.capacity) {
        const bucket = CAPACITY_BUCKETS.find((b) => b.label === filters.capacity);
        if (bucket && !bucket.test(p.sizes)) return false;
      }

      return true;
    });
  }, [filters, initialProducts]);

  const sorted = useMemo(() => {
    if (sortBy === "name_asc") return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "name_desc") return [...filtered].sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === "featured") return [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return filtered;
  }, [filtered, sortBy]);

  const visibleProducts = sorted.slice(0, visibleCount);
  const remaining = sorted.length - visibleCount;
  const hasMore = remaining > 0;

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((c) => c + PAGE_SIZE);
      setLoadingMore(false);
      setTimeout(() => {
        loadMoreRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
    }, 350);
  };

  return (
    <main className="min-h-screen bg-[#f5f6fa]">

      {/* ── Page Hero ── */}
      <div className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #080d2a 0%, #0E1249 30%, #1B2178 60%, #2A32A0 100%)" }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 60%)", transform: "translate(30%, -40%)" }}
          />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] opacity-[0.05]"
            style={{ background: "radial-gradient(ellipse at bottom left, #fff 0%, transparent 70%)" }}
          />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2.5 bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] text-white/70 font-inter text-sm px-5 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-light animate-pulse" />
              Product Catalogue
            </div>
            <h1 className="font-poppins font-extrabold text-4xl md:text-[3.25rem] text-white mb-5 leading-[1.1] tracking-tight">
              {initialProducts.length}+ Packaging
              <br className="hidden sm:block" />
              <span className="text-brand-pale/80"> SKUs Available</span>
            </h1>
            <p className="font-inter text-white/45 text-lg max-w-2xl mb-10 leading-relaxed">
              PET, HDPE, PP, ABS -- for cosmetics, pharma, FMCG, and home care.
              <br className="hidden md:block" />
              All in stock, bulk-ready, and competitively priced.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2.5 bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.15] text-white font-poppins font-semibold text-sm px-7 py-3.5 rounded-xl transition-all duration-300 backdrop-blur-sm"
              >
                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Catalogue
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 bg-white text-brand-dark font-poppins font-bold text-sm px-7 py-3.5 rounded-xl transition-all duration-300 hover:bg-brand-pale hover:shadow-lg hover:shadow-white/10"
              >
                Request a Quote
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Search bar — sticky ── */}
      <div className="sticky top-[64px] lg:top-[80px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3.5 flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex-shrink-0 inline-flex items-center gap-2 font-inter text-sm font-semibold text-brand-dark bg-brand-pale/50 px-4 py-2.5 rounded-xl hover:bg-brand-pale transition-colors"
          >
            <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
            {totalActiveFilters > 0 && (
              <span className="bg-brand text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full leading-none">
                {totalActiveFilters}
              </span>
            )}
          </button>

          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search by name, material, application, or spec..."
              className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl font-inter text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all bg-gray-50/50 focus:bg-white"
            />
            {filters.search && (
              <button
                onClick={() => setFilters((f) => ({ ...f, search: "" }))}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <span className="hidden sm:flex items-center gap-1.5 font-inter text-sm text-gray-400 shrink-0 whitespace-nowrap bg-gray-50 px-3 py-1.5 rounded-lg">
            <span className="text-brand-dark font-bold">{Math.min(visibleCount, filtered.length)}</span>
            <span className="text-gray-300">/</span>
            <span className="text-brand-dark font-bold">{filtered.length}</span>
            {filtered.length !== initialProducts.length && (
              <span className="text-gray-400 text-xs ml-0.5">(filtered)</span>
            )}
          </span>
        </div>
      </div>

      {/* ── Main layout: sidebar + grid ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex gap-8 items-start">

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-60 xl:w-[272px] flex-shrink-0 sticky top-[148px]">
            <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 shadow-sm">
              <Sidebar
                filters={filters}
                setFilters={setFilters}
                totalActive={totalActiveFilters}
                onReset={resetFilters}
                allCategories={allCategories}
                allMaterials={allMaterials}
                products={initialProducts}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <ActiveFilters filters={filters} setFilters={setFilters} onReset={resetFilters} />

            <div className="flex items-center justify-between mb-7">
              <p className="font-inter text-sm text-gray-500">
                {hasAnyFilter ? (
                  <>
                    Showing{" "}
                    <span className="text-brand-dark font-bold">{Math.min(visibleCount, filtered.length)}</span>
                    {" "}of{" "}
                    <span className="text-brand-dark font-bold">{filtered.length}</span>
                    {" "}result{filtered.length !== 1 ? "s" : ""}
                  </>
                ) : (
                  <>
                    Showing{" "}
                    <span className="text-brand-dark font-bold">{Math.min(visibleCount, initialProducts.length)}</span>
                    {" "}of{" "}
                    <span className="text-brand-dark font-bold">{initialProducts.length}</span>
                    {" "}products
                  </>
                )}
              </p>
              <div className="flex items-center gap-3 shrink-0">
              {hasAnyFilter && (
                <button
                  onClick={resetFilters}
                  className="font-inter text-xs text-brand hover:text-brand-dark transition-colors underline underline-offset-2 decoration-brand/30"
                >
                  Clear all filters
                </button>
              )}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="font-inter text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 cursor-pointer"
              >
                <option value="default">Sort: Default</option>
                <option value="name_asc">Name A → Z</option>
                <option value="name_desc">Name Z → A</option>
                <option value="featured">Featured First</option>
              </select>
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 bg-white rounded-2xl ring-1 ring-gray-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-pale/50 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-brand/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
                  </svg>
                </div>
                <h3 className="font-poppins font-bold text-xl text-gray-900 mb-2">No products match</h3>
                <p className="font-inter text-gray-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                  Try adjusting your search or removing some filters to see more results.
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 bg-brand text-white font-poppins font-semibold text-sm px-7 py-3 rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {visibleProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>

                {/* ── Load More / End state ── */}
                <div ref={loadMoreRef} className="mt-12">
                  {hasMore ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-full max-w-xs bg-gray-100 rounded-full h-1 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-brand to-brand-light rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(Math.min(visibleCount, filtered.length) / filtered.length) * 100}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                      <p className="font-inter text-xs text-gray-400">
                        {Math.min(visibleCount, filtered.length)} of {filtered.length} products
                      </p>
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2.5 font-poppins font-semibold text-sm text-brand-dark bg-white ring-1 ring-gray-200 hover:ring-brand/30 hover:shadow-lg hover:shadow-brand/[0.06] px-8 py-3.5 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loadingMore ? (
                          <>
                            <svg className="w-4 h-4 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Loading...
                          </>
                        ) : (
                          <>
                            Load {Math.min(remaining, PAGE_SIZE)} more
                            <span className="font-inter font-normal text-xs text-gray-400">
                              ({remaining} remaining)
                            </span>
                            <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  ) : filtered.length > PAGE_SIZE ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <div className="w-full max-w-xs bg-gradient-to-r from-brand to-brand-light rounded-full h-1" />
                      <p className="font-inter text-xs text-gray-400">
                        All {filtered.length} products shown
                      </p>
                    </div>
                  ) : null}
                </div>
              </>
            )}

            {/* Bottom CTA */}
            <div className="mt-16 relative overflow-hidden rounded-2xl"
              style={{ background: "linear-gradient(135deg, #0E1249 0%, #1B2178 50%, #2A32A0 100%)" }}
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/[0.04] -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/[0.03] translate-y-1/2 -translate-x-1/4" />
              <div className="relative p-8 md:p-12 text-center">
                <h3 className="font-poppins font-bold text-2xl md:text-3xl text-white mb-3">
                  Can&apos;t find what you need?
                </h3>
                <p className="font-inter text-white/45 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                  We source custom sizes, shapes, and materials. Tell us your requirements and our team will respond within 24 hours.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2.5 bg-white text-brand-dark font-poppins font-bold px-8 py-3.5 rounded-xl transition-all duration-300 hover:bg-brand-pale hover:shadow-lg"
                  >
                    Request Custom Quote
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <a
                    href="https://wa.me/919847212407?text=Hi%2C%20I%20need%20custom%20packaging%20for%20my%20product."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fba5a] text-white font-poppins font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-[#25D366]/20"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        filters={filters}
        setFilters={setFilters}
        totalActive={totalActiveFilters}
        onReset={resetFilters}
        resultCount={filtered.length}
        allCategories={allCategories}
        allMaterials={allMaterials}
        products={initialProducts}
      />

      <Footer />
    </main>
  );
}
