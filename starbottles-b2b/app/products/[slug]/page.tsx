import { notFound } from "next/navigation";
import { fetchProductBySlug, fetchProducts } from "@/lib/api";
import ProductDetailClient from "@/components/ProductDetailClient";

export const revalidate = 0;

export async function generateStaticParams() {
  const products = await fetchProducts().catch(() => []);
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, allProducts] = await Promise.all([
    fetchProductBySlug(slug).catch(() => null),
    fetchProducts().catch(() => []),
  ]);

  if (!product) notFound();

  const relatedProducts = allProducts.filter((p) => p.id !== product.id);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
