import { Suspense } from "react";
import { fetchProducts } from "@/lib/api";
import ProductsPageClient from "@/components/ProductsPageClient";

export const revalidate = 3600;

export default async function ProductsPage() {
  const products = await fetchProducts().catch(() => []);
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f6fa]" />}>
      <ProductsPageClient initialProducts={products} />
    </Suspense>
  );
}
