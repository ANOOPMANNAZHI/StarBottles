"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Loader2, Search, Package, AlertTriangle, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAdminProductCategories,
  useDeleteProductCategory,
  useToggleCategoryFeatured,
  type AdminProductCategory,
} from "@/hooks/useProductAdmin";

const PER_PAGE = 20;
const R2_BASE = "https://pub-3ac8dfa528c245f39b68fb9600dd0cb9.r2.dev";

function CategoryImage({ slug }: { slug: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <Package size={14} className="text-muted-foreground/40" />
      </div>
    );
  }
  return (
    <Image
      src={`${R2_BASE}/${slug}/1.jpg`}
      alt=""
      fill
      className="object-cover rounded-lg"
      sizes="40px"
      onError={() => setFailed(true)}
    />
  );
}

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useAdminProductCategories();
  const deleteCategory = useDeleteProductCategory();
  const toggleFeatured = useToggleCategoryFeatured();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminProductCategory | null>(null);

  const filtered = (categories ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteCategory.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Product Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Categories synced from ERP item groups. Delete removes the category and unlinks associated products.
        </p>
      </div>

      {/* Search + count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 h-9"
          />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} categor{filtered.length === 1 ? "y" : "ies"}
          {totalPages > 1 && ` · page ${page} of ${totalPages}`}
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24 ml-auto" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border shadow-sm py-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <Package size={40} className="text-muted-foreground opacity-20" strokeWidth={1.5} />
            <p className="text-sm font-medium">No categories found</p>
            <p className="text-xs text-muted-foreground">
              {search ? "Try a different search term." : "Sync item groups from ERP to populate categories."}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-4 px-5 py-2.5 bg-muted/40 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex-1">Name</span>
            <span className="w-32 text-right">ERP Name</span>
            <span className="w-24 text-right">Products</span>
            <span className="w-20 text-center">Featured</span>
            <span className="w-10" />
          </div>

          {/* Rows */}
          {paginated.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative w-10 h-10 shrink-0 rounded-lg border border-border overflow-hidden bg-muted/40">
                  <CategoryImage slug={cat.slug} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{cat.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{cat.slug}</p>
                </div>
              </div>
              <span className="w-32 text-right text-xs text-muted-foreground truncate">
                {cat.erp_name ?? "—"}
              </span>
              <span className="w-24 text-right text-xs tabular-nums">
                {cat.products_count}
              </span>
              <div className="w-20 flex justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  className={`w-8 h-8 p-0 transition-colors ${
                    cat.is_featured
                      ? "text-amber-500 hover:text-amber-600"
                      : "text-muted-foreground hover:text-amber-400"
                  }`}
                  onClick={() => toggleFeatured.mutate(cat.id)}
                  disabled={toggleFeatured.isPending}
                  title={cat.is_featured ? "Remove from featured" : "Mark as featured"}
                >
                  <Star size={15} fill={cat.is_featured ? "currentColor" : "none"} />
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="w-10 h-8 p-0 text-muted-foreground hover:text-red-500"
                onClick={() => setDeleteTarget(cat)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={14} />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              {(deleteTarget?.products_count ?? 0) > 0 && (
                <span className="block mt-2 text-amber-600">
                  {deleteTarget?.products_count} product{deleteTarget?.products_count === 1 ? "" : "s"} will be unlinked from this category.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategory.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCategory.isPending ? (
                <Loader2 size={14} className="animate-spin mr-1.5" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
