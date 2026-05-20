"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductCategory, ProductFilters as Filters } from "@/hooks/useProducts";

const MATERIALS = ["PET", "Glass", "HDPE", "PP", "Aluminium", "Tin"];
const SHAPES = ["Round", "Square", "Oval", "Rectangular", "Custom"];

interface Props {
  categories: ProductCategory[];
  currentFilters: Filters;
  onChange: (filters: Filters) => void;
}

export default function ProductFilters({ categories, currentFilters, onChange }: Props) {
  const [searchInput, setSearchInput] = useState(currentFilters.search ?? "");
  const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange({ ...currentFilters, search: searchInput || undefined });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function toggleCategory(id: number) {
    onChange({
      ...currentFilters,
      category_id: currentFilters.category_id === id ? undefined : id,
    });
  }

  function toggleMaterial(m: string) {
    onChange({
      ...currentFilters,
      material: currentFilters.material === m ? undefined : m,
    });
  }

  function toggleShape(s: string) {
    onChange({
      ...currentFilters,
      shape_type: currentFilters.shape_type === s ? undefined : s,
    });
  }

  function clearAll() {
    setSearchInput("");
    onChange({});
  }

  const hasFilters =
    currentFilters.search ||
    currentFilters.category_id ||
    currentFilters.material ||
    currentFilters.shape_type;

  return (
    <div className="space-y-6">
      {/* ── Search ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">
          Search
        </p>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[oklch(0.62_0.19_218)] transition-shadow"
          />
        </div>
      </div>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">
            Category
          </p>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center gap-1.5">
                  {cat.children.length > 0 && (
                    <button
                      className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() =>
                        setExpandedCats((prev) => ({
                          ...prev,
                          [cat.id]: !prev[cat.id],
                        }))
                      }
                    >
                      {expandedCats[cat.id] ? (
                        <ChevronDown size={13} />
                      ) : (
                        <ChevronRight size={13} />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors duration-150 ${
                      currentFilters.category_id === cat.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    }`}
                  >
                    {cat.name}
                  </button>
                </div>

                {expandedCats[cat.id] && cat.children.length > 0 && (
                  <div className="ml-6 mt-1.5 flex flex-wrap gap-1.5">
                    {cat.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => toggleCategory(child.id)}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-colors duration-150 ${
                          currentFilters.category_id === child.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Material ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">
          Material
        </p>
        <div className="flex flex-wrap gap-2">
          {MATERIALS.map((m) => (
            <button
              key={m}
              onClick={() => toggleMaterial(m)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors duration-150 ${
                currentFilters.material === m
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-background text-foreground hover:border-primary/50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ── Shape / Type ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">
          Shape / Type
        </p>
        <div className="flex flex-wrap gap-2">
          {SHAPES.map((s) => (
            <button
              key={s}
              onClick={() => toggleShape(s)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors duration-150 ${
                currentFilters.shape_type === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-background text-foreground hover:border-primary/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Clear All ── */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg"
          onClick={clearAll}
        >
          <X size={13} className="mr-1.5" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
