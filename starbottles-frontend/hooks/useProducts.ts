import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  children: Omit<ProductCategory, "children">[];
}

export interface ProductListItem {
  id: number;
  erp_id: string;
  item_code: string | null;
  title: string;
  display_name: string | null;
  category: { id: number; name: string } | null;
  material: string | null;
  capacity: string | null;
  brand: string | null;
  stock_uom: string | null;
  classification: string | null;
  is_featured: boolean;
  is_hidden: boolean;
  first_image: string | null;
  share_url: string;
}

export interface ProductImageSet {
  thumb: string;
  card: string;
  detail: string;
  original: string;
}

export interface ProductDetail extends ProductListItem {
  slug: string | null;
  display_name: string | null;
  description: string | null;
  custom_description: string | null;
  neck_size: string | null;
  shape_type: string | null;
  color: string | null;
  weight: string | null;
  total_height: string | null;
  box_quantity: string | null;
  label_area: string | null;
  image_url: string | null;
  images: (ProductImageSet | string)[];
  video_url: string | null;
  is_active: boolean;
  synced_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  category: { id: number; name: string; slug: string } | null;
  variations: { attribute_name: string; attribute_value: string }[];
}

export interface ProductFilters {
  search?: string;
  category_id?: number | string;
  material?: string;
  capacity?: string;
  shape_type?: string;
  brand?: string;
  classification?: string;
  featured?: boolean;
  include_hidden?: boolean;
  is_hidden?: boolean;
  per_page?: number;
}

export interface ProductsPagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export interface ProductsResponse {
  data: ProductListItem[];
  meta: { pagination: ProductsPagination };
}

export function useProducts(filters: ProductFilters = {}, page = 1) {
  const params = Object.fromEntries(
    Object.entries({ ...filters, page }).filter(
      ([, v]) => v !== undefined && v !== "" && v !== false
    )
  );
  return useQuery<ProductsResponse>({
    queryKey: ["products", params],
    queryFn: () => api.get("/v1/products", { params }).then((r) => ({
      data: r.data.data,
      meta: r.data.meta,
    })),
    placeholderData: keepPreviousData,
    staleTime: 30000, // 30s — avoid refetching on tab switch / back navigation
  });
}

export function useProduct(id: number | string | null) {
  return useQuery<ProductDetail>({
    queryKey: ["product", id],
    queryFn: () =>
      api.get(`/v1/products/${id}`).then((r) => r.data.data as ProductDetail),
    enabled: !!id,
    staleTime: 60000, // 1 min cache
  });
}

export function useProductCategories() {
  return useQuery<ProductCategory[]>({
    queryKey: ["product-categories"],
    queryFn: () =>
      api.get("/v1/products/categories").then((r) => r.data.data as ProductCategory[]),
    staleTime: Infinity,
  });
}

export function useSubmitProductEnquiry() {
  return useMutation({
    mutationFn: (data: {
      product_id: number;
      name: string;
      phone: string;
      email?: string;
      message?: string;
    }) => api.post("/v1/enquiries", data).then((r) => r.data),
  });
}
