import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductBySlug, fetchProducts } from "@/lib/api";
import ProductDetailClient from "@/components/ProductDetailClient";

export const revalidate = 0;

const BASE_URL = "https://starbottles.in";

export async function generateStaticParams() {
  const products = await fetchProducts().catch(() => []);
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug).catch(() => null);
  if (!product) return {};

  const title = `${product.name} — StarBottles`;
  const description =
    product.description ||
    `Buy ${product.name} in bulk from StarBottles. ${product.material ? `Material: ${product.material}.` : ""} ${product.capacity ? `Capacity: ${product.capacity}.` : ""} Low MOQ, pan-India delivery.`;
  const url = `${BASE_URL}/products/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "StarBottles",
      locale: "en_IN",
      type: "website",
      images: product.image ? [{ url: product.image, width: 800, height: 800, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.image ? [product.image] : [],
    },
  };
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

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.item_code,
    image: product.gallery?.length ? product.gallery : [product.image],
    brand: { "@type": "Brand", name: "StarBottles" },
    url: `${BASE_URL}/products/${product.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "StarBottles" },
      ...(product.wholesale_price ? { price: product.wholesale_price } : {}),
    },
    ...(product.material ? { material: product.material } : {}),
    ...(product.category ? { category: product.category } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
