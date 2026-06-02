import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface CatalogueItem {
  id: number;
  version: string;
  file_url: string;
  is_current: boolean;
  uploaded_by: string | null;
  created_at: string;
}

export interface CataloguePagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export interface CataloguesPage {
  data: CatalogueItem[];
  meta: { pagination: CataloguePagination };
}

export function useCatalogues(page = 1) {
  return useQuery<CataloguesPage>({
    queryKey: ["catalogues", page],
    queryFn: () =>
      api.get(`/v1/catalogues?page=${page}`).then((r) => ({
        data: r.data.data as CatalogueItem[],
        meta: r.data.meta,
      })),
  });
}

export function useUploadCatalogue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api
        .post("/v1/catalogues", formData, {
          headers: { "Content-Type": undefined },
        })
        .then((r) => r.data.data as CatalogueItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogues"], exact: false });
    },
  });
}

export function useToggleActiveCatalogue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch(`/v1/catalogues/${id}/toggle-active`).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogues"], exact: false });
    },
  });
}

export function useDeleteCatalogue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/v1/catalogues/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogues"], exact: false });
    },
  });
}
