import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ProductListItem, ProductImageSet } from "./useProducts";

function patchProduct(queryClient: ReturnType<typeof useQueryClient>, id: number, patch: Partial<ProductListItem>) {
  queryClient.setQueriesData<{ data: ProductListItem[]; meta: unknown }>(
    { queryKey: ["products"], exact: false },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      };
    }
  );
}

export function useToggleProductHidden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch(`/v1/products/${id}/hide`).then((r) => r.data.data),
    onMutate: async (id) => {
      const prev = queryClient.getQueriesData<{ data: ProductListItem[] }>({
        queryKey: ["products"],
        exact: false,
      });
      queryClient.setQueriesData<{ data: ProductListItem[]; meta: unknown }>(
        { queryKey: ["products"], exact: false },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((p) =>
              p.id === id ? { ...p, is_hidden: !p.is_hidden } : p
            ),
          };
        }
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      ctx?.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useToggleProductFeatured() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch(`/v1/products/${id}/feature`).then((r) => r.data.data),
    onMutate: async (id) => {
      const prev = queryClient.getQueriesData<{ data: ProductListItem[] }>({
        queryKey: ["products"],
        exact: false,
      });
      queryClient.setQueriesData<{ data: ProductListItem[]; meta: unknown }>(
        { queryKey: ["products"], exact: false },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((p) =>
              p.id === id ? { ...p, is_featured: !p.is_featured } : p
            ),
          };
        }
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      ctx?.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export type BulkProductAction = "show" | "hide" | "feature" | "unfeature";

export function useBulkUpdateProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, action }: { ids: number[]; action: BulkProductAction }) =>
      api.patch("/v1/products/bulk", { ids, action }).then((r) => r.data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProductDisplayName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, displayName }: { id: number; displayName: string | null }) =>
      api.patch(`/v1/products/${id}/display-name`, { display_name: displayName }).then((r) => r.data.data),
    onMutate: async ({ id, displayName }) => {
      const prev = queryClient.getQueriesData<{ data: ProductListItem[] }>({ queryKey: ["products"], exact: false });
      patchProduct(queryClient, id, { display_name: displayName });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", String(vars.id)] });
      queryClient.invalidateQueries({ queryKey: ["product", vars.id] });
    },
  });
}

export function useUpdateProductDescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, customDescription }: { id: number; customDescription: string | null }) =>
      api.patch(`/v1/products/${id}/description`, { custom_description: customDescription }).then((r) => r.data.data),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", String(vars.id)] });
      queryClient.invalidateQueries({ queryKey: ["product", vars.id] });
    },
  });
}

export interface ImportDisplayNameRow {
  sku: string;
  display_name: string | null;
  current_name: string | null;
  erp_title?: string;
  status: 'found' | 'not_found';
}

export interface ImportDisplayNameResult {
  dry_run: boolean;
  updated: number;
  not_found: number;
  skipped: number;
  rows: ImportDisplayNameRow[];
}

export function useImportDisplayNames() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, dryRun }: { file: File; dryRun: boolean }) => {
      const form = new FormData();
      form.append('file', file);
      form.append('dry_run', dryRun ? '1' : '0');
      return api.post<{ data: ImportDisplayNameResult }>('/v1/products/import-display-names', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data.data);
    },
    onSuccess: (data) => {
      if (!data.dry_run) {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    },
  });
}

export function useBulkResetDisplayNames() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) =>
      api.post("/v1/products/bulk-reset-display-name", { ids }).then((r) => r.data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ── Product Category Admin Hooks ─────────────────────────────────────

export interface AdminProductCategory {
  id: number;
  name: string;
  slug: string;
  erp_name: string | null;
  parent_id: number | null;
  is_featured: boolean;
  products_count: number;
  created_at: string;
}

export function useAdminProductCategories() {
  return useQuery<AdminProductCategory[]>({
    queryKey: ["admin-product-categories"],
    queryFn: () =>
      api.get("/v1/product-categories").then((r) => r.data.data),
  });
}

export function useToggleCategoryFeatured() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch(`/v1/product-categories/${id}/feature`).then((r) => r.data.data),
    onMutate: async (id) => {
      const prev = queryClient.getQueryData<AdminProductCategory[]>(["admin-product-categories"]);
      queryClient.setQueryData<AdminProductCategory[]>(
        ["admin-product-categories"],
        (old) => old?.map((c) => c.id === id ? { ...c, is_featured: !c.is_featured } : c)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["admin-product-categories"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product-categories"] });
    },
  });
}

export function useDeleteProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/v1/product-categories/${id}`).then((r) => r.data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product-categories"] });
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
    },
  });
}

// ── Product Image Admin Hooks ───────────────────────────────────────

export function useProductImages(productId: number | string | null) {
  return useQuery<ProductImageSet[]>({
    queryKey: ["product-images", productId],
    queryFn: () =>
      api.get(`/v1/products/${productId}/images`).then((r) => r.data.data),
    enabled: !!productId,
  });
}

export function useUploadProductImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, files }: { productId: number; files: File[] }) => {
      const formData = new FormData();
      files.forEach((f) => formData.append("images[]", f));
      return api
        .post(`/v1/products/${productId}/images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["product-images", vars.productId] });
      queryClient.invalidateQueries({ queryKey: ["product", vars.productId] });
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, index }: { productId: number; index: number }) =>
      api.delete(`/v1/products/${productId}/images/${index}`).then((r) => r.data),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["product-images", vars.productId] });
      queryClient.invalidateQueries({ queryKey: ["product", vars.productId] });
    },
  });
}
