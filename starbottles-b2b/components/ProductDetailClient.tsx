"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import ContactMethodModal from "@/components/ContactMethodModal";
import { productImage, type Product } from "@/lib/api";
import { gaEvent } from "@/lib/analytics";

const PLACEHOLDER = "/default.png";

function ProductImage({ src, alt, ...props }: React.ComponentProps<typeof Image>) {
  const [imgSrc, setImgSrc] = useState(src as string);
  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      unoptimized={typeof imgSrc === "string" && imgSrc.startsWith("http")}
      onError={() => setImgSrc(PLACEHOLDER)}
    />
  );
}

const tagColors: Record<string, string> = {
  "Best Seller": "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
  Premium: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/60",
  Versatile: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/60",
  "Eco-Friendly": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
  Popular: "bg-brand-pale text-brand-dark ring-1 ring-brand/20",
  "Pharma Grade": "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60",
};

export default function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  // gallery already contains the main image as first entry; deduplicate by URL
  const rawImages = [product.image, ...product.gallery].filter(Boolean);
  const seen = new Set<string>();
  const allImages = rawImages
    .filter((url) => { const k = productImage(url); return seen.has(k) ? false : (seen.add(k), true); })
    .map((url) => productImage(url));
  const [activeImg, setActiveImg] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    gaEvent("view_item", {
      item_id: String(product.id),
      item_name: product.name,
      item_category: product.category,
    });
  }, [product.id, product.name, product.category]);

  const handleImgMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`;

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const shareData: ShareData = {
          title: product.name,
          text: `Check out ${product.name} from StarBottles`,
          url: canonicalUrl,
        };

        // Attempt to attach the product image as a file
        if (allImages[0] && navigator.canShare) {
          try {
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(allImages[0])}`;
            const res = await fetch(proxyUrl);
            if (res.ok) {
              const blob = await res.blob();
              const ext = blob.type.split("/")[1] || "jpg";
              const file = new File([blob], `${product.slug}.${ext}`, { type: blob.type });
              if (navigator.canShare({ files: [file] })) {
                shareData.files = [file];
              }
            }
          } catch {
            // Image fetch failed — share without image
          }
        }

        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          navigator.clipboard.writeText(canonicalUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } else {
      navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const waShareMsg =
    `https://wa.me/?text=Check%20out%20this%20product%20from%20StarBottles%3A%20` +
    encodeURIComponent(product.name) +
    `%20-%20` +
    encodeURIComponent(canonicalUrl);

  return (
    <>
      <main className="pt-20 bg-[#f5f6fa]">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3.5 flex items-center gap-2 text-sm font-inter text-gray-400">
            <Link href="/" className="hover:text-brand transition-colors duration-200">Home</Link>
            <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href="/products" className="hover:text-brand transition-colors duration-200">Products</Link>
            <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-brand-dark font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</span>
          </div>
        </div>

        {/* Hero - 2 column */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

              {/* Left: Image Gallery */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="lg:sticky lg:top-28"
              >
                <div
                  className="relative aspect-square rounded-2xl overflow-hidden mb-4 group"
                  style={{ background: "linear-gradient(145deg, #f7f8fc 0%, #eef0f7 50%, #e8eaf3 100%)", cursor: isZooming ? "crosshair" : "default" }}
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onMouseMove={handleImgMouseMove}
                >
                  {allImages.length > 0 ? (
                    <motion.div key={activeImg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0">
                      {/* Zoom wrapper — scale applied here, origin tracks cursor instantly */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          transform: isZooming ? "scale(2.5)" : "scale(1)",
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          transition: "transform 0.25s ease-out",
                          willChange: "transform",
                        }}
                      >
                        <ProductImage src={allImages[activeImg]} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-2xl bg-white/60 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {product.tag && (
                    <span className={`absolute top-4 left-4 z-20 text-[10px] font-inter font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg ${tagColors[product.tag] ?? "bg-gray-100 text-gray-600 ring-1 ring-gray-200/60"}`}>{product.tag}</span>
                  )}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImg((i) => (i - 1 + allImages.length) % allImages.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-black/[0.04] flex items-center justify-center hover:bg-white hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                        style={{ zIndex: 30 }}
                      >
                        <svg className="w-4 h-4 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button
                        onClick={() => setActiveImg((i) => (i + 1) % allImages.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-black/[0.04] flex items-center justify-center hover:bg-white hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                        style={{ zIndex: 30 }}
                      >
                        <svg className="w-4 h-4 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </>
                  )}
                  {/* Image counter */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-brand-darker/70 backdrop-blur-sm text-white/90 font-inter text-[11px] font-medium px-2.5 py-1 rounded-lg" style={{ zIndex: 30 }}>
                      {activeImg + 1} / {allImages.length}
                    </div>
                  )}
                </div>
                {allImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2.5">
                    {allImages.map((img, i) => (
                      <button key={i} onClick={() => setActiveImg(i)}
                        className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 ${
                          activeImg === i
                            ? "ring-2 ring-brand shadow-sm shadow-brand/20"
                            : "ring-1 ring-gray-200/60 hover:ring-brand/30 hover:shadow-sm"
                        }`}
                      >
                        <ProductImage src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="10vw" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Right: Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="inline-flex items-center gap-2 font-inter text-[11px] text-brand font-bold uppercase tracking-[0.15em] mb-3">
                  <span className="w-5 h-[2px] bg-brand rounded-full" />
                  {product.category}
                </span>
                <h1 className="font-poppins font-extrabold text-3xl lg:text-[2.5rem] text-brand-darker mt-1 mb-6 leading-[1.15] tracking-tight">{product.name}</h1>

                {/* Inline product details table */}
                {(() => {
                  const rows = [
                    { label: "Item Code",      value: product.item_code },
                    { label: "Capacity",       value: product.capacity },
                    { label: "Material / MOC", value: product.material },
                    { label: "Shape",          value: product.shape },
                    { label: "Neck Size",      value: product.neck_size },
                    { label: "Color",          value: product.color },
                    { label: "Total Height",   value: product.total_height },
                    { label: "Weight",         value: product.weight },
                    { label: "Label Area",     value: product.label_area },
                  ];
                  return (
                    <div className="mb-6 rounded-xl ring-1 ring-gray-200/80 overflow-hidden bg-white">
                      {rows.map((row, i) => (
                        <div
                          key={row.label}
                          className={`flex items-center px-4 py-2.5 ${i < rows.length - 1 ? "border-b border-gray-100" : ""} ${i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}
                        >
                          <span className="font-inter text-[12px] text-gray-400 uppercase tracking-wide w-32 flex-shrink-0">{row.label}</span>
                          <span className={`font-inter text-sm font-semibold ${row.value ? "text-brand-darker" : "text-gray-300"}`}>
                            {row.value || "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Specifications (from variations) */}
                {product.specs.length > 0 && (
                  <div className="mb-6 rounded-xl ring-1 ring-gray-200/80 overflow-hidden bg-white">
                    <div className="px-4 py-2.5 bg-brand-pale/30 border-b border-gray-100">
                      <span className="font-poppins text-[12px] font-bold text-brand-darker uppercase tracking-wide">Specifications</span>
                    </div>
                    {product.specs.map((spec, i) => (
                      <div
                        key={spec.label}
                        className={`flex items-center px-4 py-2.5 ${i < product.specs.length - 1 ? "border-b border-gray-100" : ""} ${i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}
                      >
                        <span className="font-inter text-[12px] text-gray-400 uppercase tracking-wide w-32 flex-shrink-0">{spec.label}</span>
                        <span className="font-inter text-sm font-semibold text-brand-darker">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* MOQ */}
                {product.moq && (
                  <div className="flex items-center gap-4 p-5 rounded-xl mb-7 ring-1 ring-brand/10"
                    style={{ background: "linear-gradient(135deg, #EAEBF5 0%, #f0f1f8 100%)" }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <div>
                      <p className="font-inter text-[11px] uppercase tracking-wider text-brand-dark/50 font-medium">Minimum Order Quantity</p>
                      <p className="font-poppins font-bold text-xl text-brand-darker">{product.moq}</p>
                    </div>
                  </div>
                )}

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-7">
                  <button
                    onClick={() => { setModalOpen(true); gaEvent("select_item", { item_id: String(product.id), item_name: product.name, engagement_type: "get_quote" }); }}
                    className="flex-1 inline-flex items-center justify-center gap-2.5 bg-brand hover:bg-brand-dark text-white font-poppins font-bold px-6 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30"
                  >
                    Get a Quote
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                  <a href="tel:+918086850000" className="inline-flex items-center justify-center gap-2 ring-2 ring-gray-200 text-brand-dark font-poppins font-bold px-6 py-4 rounded-xl hover:ring-brand/30 hover:bg-brand-pale/20 transition-all duration-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    Call Us
                  </a>
                </div>

                {/* Share buttons */}
                <div className="flex items-center gap-4 mb-8 py-4 border-t border-b border-gray-100">
                  <span className="font-inter text-xs text-gray-400 uppercase tracking-wider font-medium">Share</span>
                  <a href={waShareMsg} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-inter font-semibold text-[#25D366] hover:text-[#1ebe5d] transition-colors bg-[#25D366]/5 px-3 py-1.5 rounded-lg hover:bg-[#25D366]/10">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    WhatsApp
                  </a>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-xs font-inter font-semibold text-brand hover:text-brand-dark transition-colors bg-brand-pale/30 px-3 py-1.5 rounded-lg hover:bg-brand-pale/60"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </>
                    )}
                  </button>
                </div>

                {/* Applications */}
                {product.applications.length > 0 && (
                  <div>
                    <p className="font-poppins text-sm font-semibold text-brand-darker mb-3">Common Applications</p>
                    <div className="flex flex-wrap gap-2">
                      {product.applications.map((app) => (
                        <span key={app} className="font-inter text-xs text-brand-dark/70 bg-brand-pale/40 ring-1 ring-brand/[0.06] px-3.5 py-1.5 rounded-lg">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Product Description */}
        {product.description && (
          <section className="py-6 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h12" />
                  </svg>
                </div>
                <h2 className="font-poppins font-bold text-xl text-brand-darker">Product Description</h2>
              </div>
              <div className="max-w-3xl space-y-3">
                <p className="font-inter text-gray-600 text-base leading-relaxed">{product.description}</p>
                {product.longDescription && product.longDescription !== product.description && (
                  <p className="font-inter text-gray-500 text-sm leading-relaxed">{product.longDescription}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Specs + Features */}
        {(() => {
          const hasFeatures = product.features.length > 0;
          if (!hasFeatures) return null;
          return (
            <section className="py-14 lg:py-20 bg-[#f5f6fa]">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-10">

                {/* Features */}
                {hasFeatures && (
                  <div>
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h2 className="font-poppins font-bold text-xl text-brand-darker">Key Features</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3.5 bg-white rounded-xl px-5 py-3.5 ring-1 ring-gray-100 shadow-sm">
                          <div className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span className="font-inter text-sm text-gray-600 leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trust badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Quality Guaranteed", icon: (<svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>) },
                    { label: "Pan-India Delivery", icon: (<svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>) },
                    { label: "Low MOQ Available", icon: (<svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>) },
                    { label: "Fast Lead Times", icon: (<svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>) },
                  ].map((badge) => (
                    <div key={badge.label} className="flex items-center gap-3 bg-white ring-1 ring-gray-100 rounded-xl px-4 py-3.5 shadow-sm">
                      <div className="w-9 h-9 rounded-lg bg-brand-pale/50 flex items-center justify-center flex-shrink-0">
                        {badge.icon}
                      </div>
                      <span className="font-inter text-xs font-semibold text-brand-darker">{badge.label}</span>
                    </div>
                  ))}
                </div>

              </div>
            </section>
          );
        })()}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-14 lg:py-20 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-poppins font-bold text-2xl text-brand-darker">You May Also Like</h2>
                <Link href="/products" className="font-inter text-sm font-semibold text-brand hover:text-brand-dark transition-colors flex items-center gap-1.5">
                  View all
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.slice(0, 4).map((p) => (
                  <Link key={p.id} href={`/products/${p.slug}`} className="group rounded-xl hover:shadow-lg hover:shadow-brand/[0.06] transition-all duration-300 bg-white ring-1 ring-gray-100 hover:ring-brand/20 overflow-hidden">
                    <div className="relative h-36 overflow-hidden"
                      style={{ background: "linear-gradient(145deg, #f7f8fc 0%, #eef0f7 100%)" }}
                    >
                      {p.image ? (
                        <ProductImage src={productImage(p.image)} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-poppins font-semibold text-sm text-brand-darker group-hover:text-brand transition-colors duration-200 line-clamp-2 leading-snug">{p.name}</p>
                      {p.moq && <p className="font-inter text-xs text-gray-400 mt-1.5">MOQ: {p.moq}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Banner */}
        <section className="py-20 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #080d2a 0%, #0E1249 30%, #1B2178 60%, #2A32A0 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/[0.03]" style={{ transform: "translate(30%, -40%)" }} />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/[0.02]" style={{ transform: "translate(-30%, 40%)" }} />
          </div>
          <div className="max-w-3xl mx-auto px-6 text-center relative">
            <h2 className="font-poppins font-extrabold text-3xl md:text-4xl text-white mb-5 tracking-tight">Ready to order {product.name}?</h2>
            <p className="font-inter text-white/40 mb-10 text-base leading-relaxed max-w-lg mx-auto">Our team responds within 24 hours with a detailed quote and samples if needed.</p>
            <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2.5 bg-white text-brand-dark font-poppins font-bold px-10 py-4 rounded-xl transition-all duration-300 hover:bg-brand-pale hover:shadow-xl hover:shadow-white/10">
              Get a Quote Now
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </section>
      </main>

      <ContactMethodModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        productName={product.name}
        productUrl={`/products/${product.slug}`}
      />

      <Footer />
    </>
  );
}
