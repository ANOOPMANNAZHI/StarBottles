import { Suspense } from "react";
import { fetchProducts, fetchSiteSettings } from "@/lib/api";
import ProductsPageClient from "@/components/ProductsPageClient";

export const revalidate = 0;

export default async function ProductsPage() {
  const [products, settings] = await Promise.all([
    fetchProducts().catch(() => []),
    fetchSiteSettings().catch(() => ({} as import("@/lib/api").SiteSettings)),
  ]);
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f6fa]" />}>
      <ProductsPageClient initialProducts={products} whatsapp={settings.whatsapp_number || "918086850000"} />
    </Suspense>
  );
}
