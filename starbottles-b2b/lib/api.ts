const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const PLACEHOLDER_IMAGE = "/default.png";

/** Check if a URL points to a legacy dev dummy image (card_0.webp etc.) */
function isDummyImage(url: string): boolean {
  return /\/storage\/products\/.*\/card_\d+\.webp/.test(url);
}

/** Resolve a product image URL — Cloudflare R2 URLs pass through unchanged. */
export function productImage(url: string | null | undefined): string {
  if (!url || isDummyImage(url)) return PLACEHOLDER_IMAGE;
  // Rewrite localhost backend origin to the configured API_URL origin
  try {
    const apiOrigin = new URL(API_URL).origin;
    return url.replace(/http:\/\/localhost:800[0-9]/, apiOrigin);
  } catch {
    return url || PLACEHOLDER_IMAGE;
  }
}

export type Product = {
  id: number;
  slug: string;
  name: string;
  item_code: string;
  category: string;
  description: string;
  longDescription: string;
  material: string;
  capacity: string;
  sizes: string[];
  neck_size: string;
  shape: string;
  color: string;
  weight: string;
  total_height: string;
  label_area: string;
  retail_price: number | null;
  wholesale_price: number | null;
  moq: string;
  tag: string;
  featured: boolean;
  image: string;
  gallery: string[];
  features: string[];
  applications: string[];
  specs: { label: string; value: string }[];
};

export type Testimonial = {
  id: number;
  quote: string;
  name: string;
  business: string;
  location: string;
  metric: string | null;
  initials: string;
  rating: number;
};

export type CompanyStats = {
  established: number;
  clients: { value: number; suffix: string };
  skus: { value: number; suffix: string };
  states: { value: number; suffix: string };
  unitsShipped: { value: number; suffix: string };
};

async function apiFetch<T>(path: string, revalidate: number): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate },
    cache: revalidate === 0 ? "no-store" : undefined,
    headers: { Accept: "application/json" },
  } as RequestInit);
  if (!res.ok) throw new Error(`API fetch failed: ${path} (${res.status})`);
  const json = await res.json();
  // Laravel backend wraps responses in { data: ... }
  return ("data" in json ? json.data : json) as T;
}

/** Resolve all image URLs in a product (Cloudflare R2 URLs pass through unchanged). */
function fixProductImages(p: Product): Product {
  const img = productImage(p.image);
  return {
    ...p,
    image: img,
    gallery: p.gallery?.length ? p.gallery.map((g) => productImage(g)) : [img],
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const products = await apiFetch<Product[]>("/api/v1/b2b/products", 0);
  return products.map(fixProductImages);
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const product = await apiFetch<Product>(`/api/v1/b2b/products/${slug}`, 0);
  return fixProductImages(product);
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  return apiFetch<Testimonial[]>("/api/v1/website/testimonials", 0);
}

export async function fetchCompanyStats(): Promise<CompanyStats> {
  return apiFetch<CompanyStats>("/api/v1/website/company-stats", 0);
}

export type SiteSettings = Record<string, string | null>;

export type Banner = {
  id: number;
  title: string;
  subtitle: string | null;
  eyebrow: string | null;
  image_url: string;
  video_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  cta_secondary_text: string | null;
  cta_secondary_url: string | null;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  tagline: string | null;
  image_url: string | null;
  color: string | null;
  is_featured: boolean;
  product_count: number;
  children: Category[];
};

export type PageContent = Record<string, string | null>;

export type CatalogueItem = {
  id: number;
  version: string;
  file_url: string;
  updated_at: string;
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  return apiFetch<SiteSettings>("/api/v1/website/settings", 0);
}

export async function fetchBanners(): Promise<Banner[]> {
  return apiFetch<Banner[]>("/api/v1/website/banners", 0);
}

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/v1/products/categories", 0);
}

export async function fetchFeaturedCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/v1/products/categories/featured", 0);
}

export async function fetchPageContent(slug: string): Promise<PageContent> {
  return apiFetch<PageContent>(`/api/v1/website/pages/${slug}`, 0);
}

export async function fetchActiveCatalogues(): Promise<CatalogueItem[]> {
  return apiFetch<CatalogueItem[]>("/api/v1/catalogues/active", 0);
}
