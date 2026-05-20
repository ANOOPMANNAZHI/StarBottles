"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Copy, ExternalLink, Share2, X } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import ProductImage from "@/components/ui/ProductImage";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/useProducts";
import Image from "next/image";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <dt className="text-sm text-muted-foreground whitespace-nowrap">{label}</dt>
      <dd className="text-sm font-medium text-foreground text-right truncate">
        {value ?? <span className="text-muted-foreground/50 font-normal">—</span>}
      </dd>
    </div>
  );
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <Badge
      className={
        active
          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : "bg-slate-100 text-slate-500 border-slate-200"
      }
      variant="outline"
    >
      {label}
    </Badge>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
    </button>
  );
}

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='14' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: product, isLoading } = useProduct(id);
  const [shared, setShared] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  async function handleShare() {
    if (!product) return;
    const shareUrl = product.share_url || window.location.href;

    const shareData: ShareData = {
      title: product.title,
      text: `${product.title}\n${shareUrl}`,
      url: shareUrl,
    };

    const imageUrl = product.first_image ??
      (product.images?.[0]
        ? typeof product.images[0] === "string" ? product.images[0] : product.images[0].card
        : null);

    if (imageUrl && typeof navigator !== "undefined" && navigator.canShare) {
      try {
        const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
        if (res.ok) {
          const blob = await res.blob();
          const ext = blob.type.split("/")[1] || "jpg";
          const file = new File([blob], `${product.slug || product.id}.${ext}`, { type: blob.type });
          if (navigator.canShare({ files: [file] })) {
            shareData.files = [file];
            shareData.text = `${product.title}\n${shareUrl}`;
            delete shareData.url;
          }
        }
      } catch { /* share without image */ }
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          navigator.clipboard.writeText(shareUrl);
          setShared(true);
          setTimeout(() => setShared(false), 2000);
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        Product not found.
      </div>
    );
  }

  const firstImage =
    product.first_image ??
    (product.images?.[0]
      ? typeof product.images[0] === "string"
        ? product.images[0]
        : product.images[0].card
      : null);

  const resolveUrl = (img: unknown, size: string) =>
    typeof img === "string" ? img : (img as Record<string, string>)[size];

  const lightboxImages = product.images?.length
    ? product.images.map((img) => resolveUrl(img, "original"))
    : [firstImage ?? PLACEHOLDER];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => router.push("/products")}
        >
          <ArrowLeft size={13} />
          Back
        </Button>
        <h1 className="text-xl font-bold text-foreground truncate flex-1 min-w-0">
          {product.title}
        </h1>
        <div className="flex gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={handleShare}
          >
            {shared ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
            {shared ? "Copied!" : "Share"}
          </Button>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex gap-2 flex-wrap">
        <StatusBadge active={product.is_active} label={product.is_active ? "Active" : "Inactive"} />
        <StatusBadge active={product.is_featured} label={product.is_featured ? "Featured" : "Not Featured"} />
        {product.is_hidden && (
          <Badge className="bg-slate-800 text-white border-slate-700" variant="outline">Hidden</Badge>
        )}
        {product.classification && (
          <Badge variant="outline">Class {product.classification}</Badge>
        )}
        {product.stock_uom && (
          <Badge variant="outline">UOM: {product.stock_uom}</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Image + Quick Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Primary image */}
          <div
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden cursor-zoom-in"
            onClick={() => { setActiveImage(0); setLightboxOpen(true); }}
          >
            <div className="relative aspect-square bg-muted/40">
              <ProductImage
                src={firstImage}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
          </div>

          {/* Additional images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {product.images.slice(1).map((img, i) => {
                const src = typeof img === "string" ? img : img.thumb;
                return (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted/40 cursor-zoom-in"
                    onClick={() => { setActiveImage(i + 1); setLightboxOpen(true); }}
                  >
                    <ProductImage src={src} alt="" fill className="object-cover" sizes="100px" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Info card */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Info</h3>
            </div>
            <dl className="px-4 py-1">
              <InfoRow label="ID" value={product.id} />
              <InfoRow label="Slug" value={product.slug} />
              <InfoRow
                label="Share URL"
                value={
                  product.share_url ? (
                    <span className="flex items-center gap-1.5">
                      <a
                        href={product.share_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate max-w-[140px]"
                      >
                        Link
                      </a>
                      <ExternalLink size={11} className="text-muted-foreground shrink-0" />
                    </span>
                  ) : null
                }
              />
            </dl>
          </div>
        </div>

        {/* Right column — Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* ERP Details */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">ERP Details</h3>
            </div>
            <dl className="px-5 py-1">
              <InfoRow
                label="Item Code"
                value={
                  product.item_code ? (
                    <span className="flex items-center gap-2">
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{product.item_code}</code>
                      <CopyButton text={product.item_code} />
                    </span>
                  ) : null
                }
              />
              <InfoRow
                label="ERP ID"
                value={
                  product.erp_id ? (
                    <span className="flex items-center gap-2">
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{product.erp_id}</code>
                      <CopyButton text={product.erp_id} />
                    </span>
                  ) : null
                }
              />
              <InfoRow label="Brand" value={product.brand} />
              <InfoRow label="Category" value={product.category?.name} />
              <InfoRow label="Stock UOM" value={product.stock_uom} />
              <InfoRow label="Classification" value={product.classification} />
              <InfoRow label="ERP Image URL" value={product.image_url} />
            </dl>
          </div>

          {/* Product Specifications */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">Specifications</h3>
            </div>
            <dl className="px-5 py-1">
              <InfoRow label="Material" value={product.material} />
              <InfoRow label="Capacity" value={product.capacity} />
              <InfoRow label="Neck Size" value={product.neck_size} />
              <InfoRow label="Shape" value={product.shape_type} />
              <InfoRow label="Video URL" value={
                product.video_url ? (
                  <a href={product.video_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    {product.video_url}
                    <ExternalLink size={11} />
                  </a>
                ) : null
              } />
            </dl>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">Description</h3>
            </div>
            <div className="px-5 py-4">
              {product.description ? (
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/50">No description available.</p>
              )}
            </div>
          </div>

          {/* Variations */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">Variations</h3>
            </div>
            {product.variations && product.variations.length > 0 ? (
              <div className="divide-y divide-border">
                {product.variations.map((v, i) => (
                  <div key={i} className="flex justify-between px-5 py-2.5 text-sm">
                    <span className="text-muted-foreground">{v.attribute_name}</span>
                    <span className="font-medium">{v.attribute_value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-4">
                <p className="text-sm text-muted-foreground/50">No variations available.</p>
              </div>
            )}
          </div>

          {/* Visibility & Status */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">Visibility & Status</h3>
            </div>
            <dl className="px-5 py-1">
              <InfoRow label="Active" value={
                <StatusBadge active={product.is_active} label={product.is_active ? "Yes" : "No"} />
              } />
              <InfoRow label="Featured" value={
                <StatusBadge active={product.is_featured} label={product.is_featured ? "Yes" : "No"} />
              } />
              <InfoRow label="Hidden" value={
                product.is_hidden
                  ? <Badge className="bg-slate-800 text-white border-slate-700" variant="outline">Yes</Badge>
                  : <span className="text-sm">No</span>
              } />
            </dl>
          </div>

          {/* Timestamps */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">Timestamps</h3>
            </div>
            <dl className="px-5 py-1">
              <InfoRow
                label="Created"
                value={product.created_at ? format(new Date(product.created_at), "dd MMM yyyy, HH:mm") : null}
              />
              <InfoRow
                label="Updated"
                value={product.updated_at ? format(new Date(product.updated_at), "dd MMM yyyy, HH:mm") : null}
              />
              <InfoRow
                label="Last ERP Sync"
                value={
                  product.synced_at ? (
                    <span>
                      {format(new Date(product.synced_at), "dd MMM yyyy, HH:mm")}
                      <span className="text-muted-foreground ml-1.5 text-xs">
                        ({formatDistanceToNow(new Date(product.synced_at), { addSuffix: true })})
                      </span>
                    </span>
                  ) : null
                }
              />
            </dl>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-150 z-10"
          >
            <X size={18} />
          </button>

          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i - 1 + lightboxImages.length) % lightboxImages.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-150 z-10"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div
            className="relative max-w-4xl w-full aspect-[4/3]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImages[activeImage] ?? PLACEHOLDER}
              alt={product.title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i + 1) % lightboxImages.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-150 z-10"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {lightboxImages.length > 1 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {activeImage + 1} / {lightboxImages.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
