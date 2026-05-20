"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Package, Search, X, Loader2, LayoutGrid, List, Check, ChevronsUpDown } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useProducts, useProductCategories, type ProductListItem, type ProductFilters } from "@/hooks/useProducts";

const CLASSIFICATIONS = ["A", "B", "C", "D"];
type Tab = "all" | "featured" | "hidden";
type ViewMode = "grid" | "list";

// ── Grid Card ─────────────────────────────────────────────────────────────────

function TraineeProductCard({ product }: { product: ProductListItem }) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col relative transition-all duration-200 hover:shadow-md",
        product.is_hidden ? "opacity-60 grayscale" : "",
        "border-border"
      )}
    >
      {product.is_hidden && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <Badge className="bg-slate-800 text-white text-[10px] font-semibold px-2 py-0.5 shadow-sm">
            Hidden
          </Badge>
        </div>
      )}
      {product.is_featured && !product.is_hidden && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <Badge className="bg-amber-400 text-amber-900 text-[10px] font-semibold px-2 py-0.5 shadow-sm">
            Featured
          </Badge>
        </div>
      )}

      <div className="relative aspect-[4/3] bg-muted/40">
        <ProductImage
          src={product.first_image}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="p-3 flex flex-col flex-1 gap-2">
        <p className="text-sm font-semibold line-clamp-2 leading-snug">{product.title}</p>
        <p className="text-xs text-muted-foreground">
          {[product.brand, product.category?.name].filter(Boolean).join(" · ") || "—"}
        </p>

        <div className="flex gap-1.5 mt-auto pt-2">
          <Button
            asChild
            size="sm"
            className="flex-1 text-xs h-7 bg-primary text-primary-foreground hover:opacity-90"
          >
            <Link href={`/products/${product.id}`}>View</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── List Row ──────────────────────────────────────────────────────────────────

function TraineeProductRow({ product }: { product: ProductListItem }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors",
        product.is_hidden ? "opacity-50" : ""
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-10 h-10 shrink-0 rounded-md overflow-hidden bg-muted/40">
        <ProductImage
          src={product.first_image}
          alt={product.title}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>

      {/* Item code */}
      <span className="text-[11px] font-mono text-muted-foreground w-24 shrink-0 truncate">
        {product.item_code ?? "—"}
      </span>

      {/* Title */}
      <span className="text-sm font-medium flex-1 truncate min-w-0">{product.title}</span>

      {/* Category */}
      <span className="text-xs text-muted-foreground w-32 shrink-0 truncate hidden md:block">
        {product.category?.name ?? "—"}
      </span>

      {/* Brand */}
      <span className="text-xs text-muted-foreground w-24 shrink-0 truncate hidden lg:block">
        {product.brand ?? "—"}
      </span>

      {/* Classification */}
      <span className="w-12 shrink-0 hidden lg:flex justify-center">
        {product.classification ? (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-semibold">
            {product.classification}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </span>

      {/* Status badges */}
      <div className="flex items-center gap-1 w-20 shrink-0 hidden sm:flex">
        {product.is_featured && (
          <Badge className="bg-amber-400 text-amber-900 text-[10px] px-1.5 py-0 font-semibold">★</Badge>
        )}
        {product.is_hidden && (
          <Badge className="bg-slate-700 text-white text-[10px] px-1.5 py-0 font-semibold">Hidden</Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          asChild
          size="sm"
          className="h-7 px-3 text-xs bg-primary text-primary-foreground hover:opacity-90"
        >
          <Link href={`/products/${product.id}`}>View</Link>
        </Button>
      </div>
    </div>
  );
}

// ── Category Combobox ─────────────────────────────────────────────────────────

function CategoryCombobox({
  categories,
  value,
  onChange,
}: {
  categories: { id: number; name: string; products_count?: number }[];
  value: number | undefined;
  onChange: (id: number | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-52 justify-between text-xs font-normal"
        >
          <span className="truncate">{selected ? selected.name : "All Categories"}</span>
          <ChevronsUpDown size={12} className="ml-1 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search categories..." className="h-9 text-sm" />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => { onChange(undefined); setOpen(false); }} className="text-sm">
                <Check size={14} className={cn("mr-2", !value ? "opacity-100" : "opacity-0")} />
                All Categories
              </CommandItem>
              {categories.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={cat.name}
                  onSelect={() => { onChange(cat.id); setOpen(false); }}
                  className="text-sm"
                >
                  <Check size={14} className={cn("mr-2", value === cat.id ? "opacity-100" : "opacity-0")} />
                  <span className="truncate flex-1">{cat.name}</span>
                  {"products_count" in cat && (
                    <span className="text-[10px] text-muted-foreground ml-1">{cat.products_count}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PER_PAGE_OPTIONS = [12, 24, 48, 96];

export default function ProductsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(24);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [classification, setClassification] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "grid";
    return (localStorage.getItem("products-view-mode") as ViewMode) ?? "grid";
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function switchView(mode: ViewMode) {
    setViewMode(mode);
    localStorage.setItem("products-view-mode", mode);
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (search.length === 1) return;
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const filters: ProductFilters = {
    include_hidden: true,
    per_page: perPage,
    ...(tab === "featured" ? { featured: true } : {}),
    ...(tab === "hidden" ? { is_hidden: true } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(categoryId ? { category_id: categoryId } : {}),
    ...(classification ? { classification } : {}),
  };

  const hasActiveFilters = !!(debouncedSearch || categoryId || classification);

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setCategoryId(undefined);
    setClassification(undefined);
    setPage(1);
  }

  const { data, isLoading, isFetching } = useProducts(filters, page);
  const { data: categoriesData } = useProductCategories();
  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);

  const products = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
      </div>

      {/* Tabs + Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Tabs
            value={tab}
            activationMode="manual"
            onValueChange={(v) => { setTab(v as Tab); setPage(1); }}
          >
            <TabsList className="h-9 bg-muted/40 border border-border">
              <TabsTrigger value="all" className="text-xs font-semibold px-4">All</TabsTrigger>
              <TabsTrigger value="featured" className="text-xs font-semibold px-4">Featured</TabsTrigger>
              <TabsTrigger value="hidden" className="text-xs font-semibold px-4">Hidden</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
            <button
              onClick={() => switchView("grid")}
              className={cn("rounded-md p-1.5 transition-colors", viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => switchView("list")}
              className={cn("rounded-md p-1.5 transition-colors", viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
              title="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Search + Filters row */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, description, item code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>

          {categories.length > 0 && (
            <CategoryCombobox
              categories={categories}
              value={categoryId}
              onChange={(id) => { setCategoryId(id); setPage(1); }}
            />
          )}

          <Select
            value={classification ?? "all"}
            onValueChange={(v) => { setClassification(v === "all" ? undefined : v); setPage(1); }}
          >
            <SelectTrigger className="h-9 w-32">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {CLASSIFICATIONS.map((c) => (
                <SelectItem key={c} value={c}>Class {c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-9 text-muted-foreground hover:text-destructive" onClick={clearFilters}>
              <X size={14} className="mr-1" /> Clear
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            {pagination && (
              <span className="text-xs text-muted-foreground">
                {pagination.total} product{pagination.total !== 1 ? "s" : ""}
              </span>
            )}
            <Select
              value={String(perPage)}
              onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}
            >
              <SelectTrigger className="h-9 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PER_PAGE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)} className="text-xs">
                    {n} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Product grid / list */}
      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-7 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-b-0">
                <Skeleton className="w-10 h-10 rounded-md shrink-0" />
                <Skeleton className="h-3 w-24 shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-3 w-28 hidden md:block" />
                <Skeleton className="h-7 w-16" />
              </div>
            ))}
          </div>
        )
      ) : products.length === 0 ? (
        <div className="bg-card rounded-xl border border-border shadow-sm py-20 text-center">
          <div className="flex flex-col items-center gap-3">
            <Package size={40} className="text-muted-foreground opacity-20" strokeWidth={1.5} />
            <p className="text-sm font-medium text-foreground">No products found</p>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your search or filters."
                : tab === "featured"
                ? "No products are marked as featured yet."
                : tab === "hidden"
                ? "No products are currently hidden."
                : "No products available."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" className="text-xs mt-1" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          {products.map((product) => (
            <TraineeProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className={`rounded-xl border border-border overflow-hidden bg-card transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          {/* List header */}
          <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 border-b border-border text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <div className="w-10 shrink-0" />
            <span className="w-24 shrink-0">Item Code</span>
            <span className="flex-1">Title</span>
            <span className="w-32 shrink-0 hidden md:block">Category</span>
            <span className="w-24 shrink-0 hidden lg:block">Brand</span>
            <span className="w-12 shrink-0 hidden lg:block text-center">Class</span>
            <span className="w-20 shrink-0 hidden sm:block">Status</span>
            <span className="w-16 shrink-0 text-right">Actions</span>
          </div>
          {products.map((product) => (
            <TraineeProductRow key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            {isFetching && <Loader2 size={12} className="animate-spin" />}
            Page {page} of {pagination.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.last_page || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
