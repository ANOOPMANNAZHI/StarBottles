"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Star, StarOff, RefreshCw, Loader2, Package, Search, X, CheckCircle2, XCircle, ChevronsUpDown, Check, LayoutGrid, List } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useProducts, useProductCategories, type ProductListItem, type ProductFilters } from "@/hooks/useProducts";
import { useToggleProductHidden, useToggleProductFeatured, useAdminProductCategories, useBulkUpdateProducts, type BulkProductAction } from "@/hooks/useProductAdmin";
import { useErpSyncStatus, useTriggerSync, useSyncProgress } from "@/hooks/useErpSync";

const CLASSIFICATIONS = ["A", "B", "C", "D"];


type Tab = "all" | "featured" | "hidden";
type ViewMode = "grid" | "list";

// ── Grid Card ────────────────────────────────────────────────────────────────

function AdminProductCard({
  product,
  selected,
  onSelect,
  onToggleHidden,
  onToggleFeatured,
}: {
  product: ProductListItem;
  selected: boolean;
  onSelect: (id: number) => void;
  onToggleHidden: (id: number) => void;
  onToggleFeatured: (id: number) => void;
}) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col relative transition-all duration-200 hover:shadow-md",
        product.is_hidden ? "opacity-60 grayscale" : "",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border"
      )}
    >
      {/* Selection checkbox */}
      <div
        className="absolute top-2.5 left-2.5 z-20"
        onClick={(e) => { e.stopPropagation(); onSelect(product.id); }}
      >
        <Checkbox
          checked={selected}
          className="h-4 w-4 bg-white/90 border-white shadow-sm"
        />
      </div>

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
            <Link href={`/admin/products/${product.id}`}>View</Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="px-2 h-7 text-muted-foreground hover:text-foreground hover:bg-muted/60"
            title={product.is_hidden ? "Show product" : "Hide product"}
            onClick={() => onToggleHidden(product.id)}
          >
            {product.is_hidden ? <Eye size={14} /> : <EyeOff size={14} />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="px-2 h-7 hover:bg-muted/60"
            title={product.is_featured ? "Unfeature" : "Feature"}
            onClick={() => onToggleFeatured(product.id)}
          >
            {product.is_featured ? (
              <Star size={14} className="text-amber-500 fill-amber-500" />
            ) : (
              <StarOff size={14} className="text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── List Row ─────────────────────────────────────────────────────────────────

function AdminProductRow({
  product,
  selected,
  onSelect,
  onToggleHidden,
  onToggleFeatured,
}: {
  product: ProductListItem;
  selected: boolean;
  onSelect: (id: number) => void;
  onToggleHidden: (id: number) => void;
  onToggleFeatured: (id: number) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors",
        product.is_hidden ? "opacity-50" : "",
        selected ? "bg-primary/5" : ""
      )}
    >
      {/* Checkbox */}
      <div onClick={(e) => { e.stopPropagation(); onSelect(product.id); }}>
        <Checkbox checked={selected} className="h-4 w-4" />
      </div>

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
          <Link href={`/admin/products/${product.id}`}>View</Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="px-2 h-7 text-muted-foreground hover:text-foreground hover:bg-muted/60"
          title={product.is_hidden ? "Show product" : "Hide product"}
          onClick={() => onToggleHidden(product.id)}
        >
          {product.is_hidden ? <Eye size={13} /> : <EyeOff size={13} />}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="px-2 h-7 hover:bg-muted/60"
          title={product.is_featured ? "Unfeature" : "Feature"}
          onClick={() => onToggleFeatured(product.id)}
        >
          {product.is_featured ? (
            <Star size={13} className="text-amber-500 fill-amber-500" />
          ) : (
            <StarOff size={13} className="text-muted-foreground" />
          )}
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

// ── Bulk Action Bar ───────────────────────────────────────────────────────────

function BulkActionBar({
  count,
  total,
  onSelectAll,
  onClear,
  onAction,
  isPending,
}: {
  count: number;
  total: number;
  onSelectAll: () => void;
  onClear: () => void;
  onAction: (action: BulkProductAction) => void;
  isPending: boolean;
}) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card shadow-xl px-4 py-2.5 text-sm">
        {/* Count */}
        <span className="font-semibold text-foreground mr-1">
          {count} selected
        </span>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Select all on page */}
        {count < total && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            onClick={onSelectAll}
          >
            Select all {total}
          </Button>
        )}

        {/* Action buttons */}
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          disabled={isPending}
          onClick={() => onAction("show")}
        >
          <Eye size={12} />
          Show
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          disabled={isPending}
          onClick={() => onAction("hide")}
        >
          <EyeOff size={12} />
          Hide
        </Button>

        <div className="w-px h-5 bg-border mx-0.5" />

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
          disabled={isPending}
          onClick={() => onAction("feature")}
        >
          <Star size={12} className="fill-amber-400 text-amber-500" />
          Feature
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          disabled={isPending}
          onClick={() => onAction("unfeature")}
        >
          <StarOff size={12} />
          Unfeature
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Clear */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={onClear}
          title="Clear selection"
        >
          <X size={14} />
        </Button>

        {isPending && <Loader2 size={14} className="animate-spin text-muted-foreground ml-1" />}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PER_PAGE_OPTIONS = [12, 24, 48, 96];

export default function AdminProductsPage() {
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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
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

  // Clear selection when tab/page/filters change
  useEffect(() => { setSelectedIds(new Set()); }, [tab, page, perPage, debouncedSearch, categoryId, classification]);

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
  const { data: adminCategories } = useAdminProductCategories();
  const categories = useMemo(() => adminCategories ?? [], [adminCategories]);
  const triggerSync = useTriggerSync();
  const isSyncing = triggerSync.syncState === "syncing";
  const { data: syncData } = useErpSyncStatus(isSyncing);
  const { data: progress } = useSyncProgress(isSyncing);
  const toggleHidden = useToggleProductHidden();
  const toggleFeatured = useToggleProductFeatured();
  const bulkUpdate = useBulkUpdateProducts();

  const products = data?.data ?? [];
  const pagination = data?.meta?.pagination;
  const lastSync = syncData?.last_sync;

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(products.map((p) => p.id)));
  }, [products]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const allPageSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));

  function toggleSelectAll() {
    allPageSelected ? clearSelection() : selectAll();
  }

  async function handleBulkAction(action: BulkProductAction) {
    const ids = Array.from(selectedIds);
    try {
      await bulkUpdate.mutateAsync({ ids, action });
      const label = action === "show" ? "shown" : action === "hide" ? "hidden" : action === "feature" ? "featured" : "unfeatured";
      toast.success(`${ids.length} product${ids.length !== 1 ? "s" : ""} ${label}`);
      clearSelection();
    } catch {
      toast.error("Bulk update failed");
    }
  }

  return (
    <div className={cn("max-w-7xl mx-auto px-6 py-8 space-y-6", selectedIds.size > 0 && "pb-28")}>
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
      </div>

      {/* Sync result banner */}
      {triggerSync.syncState === "success" && triggerSync.syncResult && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="text-sm text-emerald-700 dark:text-emerald-400">
            Sync completed — {triggerSync.syncResult.added ?? 0} added, {triggerSync.syncResult.updated ?? 0} updated
          </span>
          <button onClick={triggerSync.dismiss} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <X size={14} />
          </button>
        </div>
      )}
      {triggerSync.syncState === "failed" && triggerSync.syncResult && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30">
          <XCircle size={16} className="text-red-600 shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-400 truncate">
            Sync failed — {triggerSync.syncResult.error}
          </span>
          <button onClick={triggerSync.dismiss} className="ml-auto text-red-500 hover:text-red-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ERP sync banner */}
      <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {isSyncing ? (
              <>
                <Loader2 size={14} className="animate-spin text-primary shrink-0" />
                <span className="text-sm text-foreground font-medium">
                  {progress?.stage === "categories" ? "Syncing categories..." : "Syncing products from ERP..."}
                </span>
              </>
            ) : (
              <>
                <div className="shrink-0 w-2 h-2 rounded-full bg-[oklch(0.68_0.19_162)]" />
                <span className="text-sm text-muted-foreground truncate">
                  {lastSync
                    ? `Last synced ${formatDistanceToNow(new Date(lastSync.synced_at), { addSuffix: true })} · ${syncData?.total_products ?? 0} products in DB`
                    : "ERP sync has never been run"}
                </span>
              </>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5 h-8 text-xs font-semibold"
            onClick={() => triggerSync.mutate()}
            disabled={triggerSync.isPending || isSyncing}
          >
            {triggerSync.isPending || isSyncing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
        </div>

        {isSyncing && progress && (
          <div className="space-y-1.5">
            <div className="w-full bg-background rounded-full h-1.5 overflow-hidden border border-border">
              <div
                className="h-1.5 bg-primary rounded-full transition-all duration-500"
                style={{
                  width: progress.total > 0
                    ? `${Math.round((progress.current / progress.total) * 100)}%`
                    : progress.stage === "categories" ? "10%" : "5%",
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {progress.stage === "products" && progress.total > 0
                  ? `${progress.current} of ${progress.total} products`
                  : "Processing categories..."}
              </span>
              <span className="text-xs text-muted-foreground">Safe to navigate away</span>
            </div>
          </div>
        )}
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
              onValueChange={(v) => { setPerPage(Number(v)); setPage(1); clearSelection(); }}
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
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="w-10 h-10 rounded-md shrink-0" />
                <Skeleton className="h-3 w-24 shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-3 w-28 hidden md:block" />
                <Skeleton className="h-7 w-24" />
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
                : "Try syncing from ERP to populate the catalogue."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" className="text-xs mt-1" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <>
          {/* Select all row for grid */}
          <div className="flex items-center gap-2 px-1">
            <Checkbox
              checked={allPageSelected}
              onCheckedChange={toggleSelectAll}
              className="h-4 w-4"
            />
            <span className="text-xs text-muted-foreground">
              {allPageSelected ? "Deselect all" : `Select all ${products.length} on this page`}
            </span>
          </div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            {products.map((product) => (
              <AdminProductCard
                key={product.id}
                product={product}
                selected={selectedIds.has(product.id)}
                onSelect={toggleSelect}
                onToggleHidden={(id) => toggleHidden.mutate(id)}
                onToggleFeatured={(id) => toggleFeatured.mutate(id)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className={`rounded-xl border border-border overflow-hidden bg-card transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          {/* List header */}
          <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 border-b border-border text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Checkbox
              checked={allPageSelected}
              onCheckedChange={toggleSelectAll}
              className="h-4 w-4"
            />
            <div className="w-10 shrink-0" />
            <span className="w-24 shrink-0">Item Code</span>
            <span className="flex-1">Title</span>
            <span className="w-32 shrink-0 hidden md:block">Category</span>
            <span className="w-24 shrink-0 hidden lg:block">Brand</span>
            <span className="w-12 shrink-0 hidden lg:block text-center">Class</span>
            <span className="w-20 shrink-0 hidden sm:block">Status</span>
            <span className="w-32 shrink-0 text-right">Actions</span>
          </div>
          {products.map((product) => (
            <AdminProductRow
              key={product.id}
              product={product}
              selected={selectedIds.has(product.id)}
              onSelect={toggleSelect}
              onToggleHidden={(id) => toggleHidden.mutate(id)}
              onToggleFeatured={(id) => toggleFeatured.mutate(id)}
            />
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

      {/* Floating bulk action bar */}
      <BulkActionBar
        count={selectedIds.size}
        total={products.length}
        onSelectAll={selectAll}
        onClear={clearSelection}
        onAction={handleBulkAction}
        isPending={bulkUpdate.isPending}
      />
    </div>
  );
}
