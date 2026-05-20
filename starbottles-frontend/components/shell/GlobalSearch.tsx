"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package, Users, MessageSquare, LayoutDashboard, BarChart2,
  Globe, Settings, GraduationCap, RefreshCw, Layers, FileText,
  Image as ImageIcon, Award, BarChart, Loader2,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import api from "@/lib/api";

interface ProductResult {
  id: number;
  title: string;
  item_code: string | null;
  brand: string | null;
  category: { name: string } | null;
}

const NAV_PAGES = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keywords: "home overview" },
  { name: "Products", href: "/admin/products", icon: Package, keywords: "catalogue items" },
  { name: "Product Categories", href: "/admin/products/categories", icon: Layers, keywords: "item groups" },
  { name: "Enquiries", href: "/enquiries", icon: MessageSquare, keywords: "inbox messages" },
  { name: "Users", href: "/users", icon: Users, keywords: "team members staff" },
  { name: "Training", href: "/training", icon: GraduationCap, keywords: "learning courses" },
  { name: "Reports", href: "/reports", icon: BarChart2, keywords: "analytics stats" },
  { name: "ERP Settings", href: "/admin/erp-settings", icon: RefreshCw, keywords: "sync frappe erp" },
  { name: "Roles & Permissions", href: "/admin/roles", icon: Settings, keywords: "rbac access" },
  { name: "Website CMS", href: "/cms", icon: Globe, keywords: "content pages" },
  { name: "Banners", href: "/cms/banners", icon: ImageIcon, keywords: "slider hero" },
  { name: "Media Library", href: "/cms/media", icon: ImageIcon, keywords: "images files uploads" },
  { name: "Pages", href: "/cms/pages", icon: FileText, keywords: "content about privacy" },
  { name: "SEO Settings", href: "/cms/seo", icon: Globe, keywords: "meta title description" },
  { name: "Site Settings", href: "/cms/settings", icon: Settings, keywords: "company contact social" },
  { name: "Testimonials", href: "/cms/testimonials", icon: Award, keywords: "reviews feedback" },
  { name: "Company Stats", href: "/cms/company-stats", icon: BarChart, keywords: "numbers milestones" },
  { name: "My Profile", href: "/profile", icon: Users, keywords: "account password" },
];

export function useGlobalSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return { open, setOpen };
}

export default function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setProducts([]);
      setLoading(false);
    }
  }, [open]);

  // Debounced product search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const { data } = await api.get("/v1/products", {
          params: { search: query, include_hidden: 1, page: 1 },
          signal: abortRef.current.signal,
        });
        setProducts((data.data ?? []).slice(0, 8));
      } catch {
        // ignore abort errors
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const navigate = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [router, onOpenChange]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Global Search"
      description="Search products, pages, and settings"
    >
      <CommandInput
        placeholder="Search products, pages..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          {loading ? (
            <span className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> Searching...
            </span>
          ) : query.length < 2 ? (
            "Type to search products..."
          ) : (
            "No results found."
          )}
        </CommandEmpty>

        {/* Product results */}
        {products.length > 0 && (
          <CommandGroup heading="Products">
            {products.map((p) => (
              <CommandItem
                key={`product-${p.id}`}
                value={`product ${p.title} ${p.item_code ?? ""}`}
                onSelect={() => navigate(`/admin/products/${p.id}`)}
              >
                <Package size={14} className="text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm truncate">{p.title}</span>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {[p.item_code, p.brand, p.category?.name].filter(Boolean).join(" · ")}
                  </span>
                </div>
              </CommandItem>
            ))}
            {products.length >= 8 && (
              <CommandItem
                value="view-all-products"
                onSelect={() => navigate(`/admin/products?search=${encodeURIComponent(query)}`)}
                className="justify-center text-xs text-muted-foreground"
              >
                View all results...
              </CommandItem>
            )}
          </CommandGroup>
        )}

        {/* Loading indicator within product section */}
        {loading && products.length === 0 && query.length >= 2 && (
          <CommandGroup heading="Products">
            <CommandItem disabled className="justify-center">
              <Loader2 size={14} className="animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Searching products...</span>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Pages navigation */}
        {(products.length > 0 || query.length >= 2) && <CommandSeparator />}
        <CommandGroup heading="Pages">
          {NAV_PAGES.map((page) => (
            <CommandItem
              key={page.href}
              value={`page ${page.name} ${page.keywords}`}
              onSelect={() => navigate(page.href)}
            >
              <page.icon size={14} className="text-muted-foreground shrink-0" />
              <span className="text-sm">{page.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
