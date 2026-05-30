"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Star, StarOff, ExternalLink, Copy, Check, Share2, Pencil, RotateCcw } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import ProductImage from "@/components/ui/ProductImage";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/useProducts";
import { useToggleProductHidden, useToggleProductFeatured, useUpdateProductDisplayName, useUpdateProductDescription } from "@/hooks/useProductAdmin";
import { toast } from "sonner";


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

function DisplayNameEditor({ productId, displayName, title }: { productId: number; displayName: string | null; title: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const updateDisplayName = useUpdateProductDisplayName();

  function startEdit() {
    setDraft(displayName ?? "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function save() {
    const trimmed = draft.trim();
    const newValue = trimmed === "" ? null : trimmed;
    updateDisplayName.mutate(
      { id: productId, displayName: newValue },
      {
        onSuccess: () => { toast.success(newValue ? "Display name saved" : "Display name reset"); setEditing(false); },
        onError: () => toast.error("Failed to save display name"),
      }
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">B2B Display Name</h3>
        {!editing && (
          <div className="flex items-center gap-1.5">
            {displayName && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground gap-1"
                disabled={updateDisplayName.isPending}
                onClick={() => updateDisplayName.mutate(
                  { id: productId, displayName: null },
                  { onSuccess: () => toast.success("Display name reset") }
                )}
                title="Reset to ERP product name"
              >
                <RotateCcw size={11} />
                Reset
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" onClick={startEdit}>
              <Pencil size={11} />
              Edit
            </Button>
          </div>
        )}
      </div>
      <div className="px-5 py-4">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              placeholder={title}
              className="flex-1 text-sm border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background"
            />
            <Button size="sm" className="h-8 text-xs" onClick={save} disabled={updateDisplayName.isPending}>
              {updateDisplayName.isPending ? "Saving..." : "Save"}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div>
            {displayName ? (
              <p className="text-sm font-medium text-foreground">{displayName}</p>
            ) : (
              <p className="text-sm text-muted-foreground/60 italic">Using product name — "{title}"</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {displayName
                ? "This custom name is shown on the B2B website instead of the ERP product name."
                : "No custom display name set. The ERP product name is shown on the B2B website. This is never overwritten by re-sync."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DescriptionEditor({
  productId,
  customDescription,
  erpDescription,
}: {
  productId: number;
  customDescription: string | null;
  erpDescription: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const updateDescription = useUpdateProductDescription();

  function startEdit() {
    setDraft(customDescription ?? "");
    setEditing(true);
  }

  function save() {
    const trimmed = draft.trim();
    const newValue = trimmed === "" ? null : trimmed;
    updateDescription.mutate(
      { id: productId, customDescription: newValue },
      {
        onSuccess: () => {
          toast.success(newValue ? "Description saved" : "Description reset to ERP value");
          setEditing(false);
        },
        onError: () => toast.error("Failed to save description"),
      }
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">Description</h3>
        {!editing && (
          <div className="flex items-center gap-1.5">
            {customDescription && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground gap-1"
                disabled={updateDescription.isPending}
                onClick={() =>
                  updateDescription.mutate(
                    { id: productId, customDescription: null },
                    { onSuccess: () => toast.success("Description reset to ERP value") }
                  )
                }
                title="Reset to ERP description"
              >
                <RotateCcw size={11} />
                Reset
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" onClick={startEdit}>
              <Pencil size={11} />
              Edit
            </Button>
          </div>
        )}
      </div>
      <div className="px-5 py-4">
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
              placeholder={erpDescription ?? "Enter a description…"}
              rows={5}
              className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background resize-y"
            />
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8 text-xs" onClick={save} disabled={updateDescription.isPending}>
                {updateDescription.isPending ? "Saving..." : "Save"}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {customDescription ? (
              <>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{customDescription}</p>
                <p className="text-xs text-muted-foreground mt-2">Custom description — ERP value is preserved but not shown.</p>
              </>
            ) : erpDescription ? (
              <>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{erpDescription}</p>
                <p className="text-xs text-muted-foreground mt-2">Showing ERP description. Edit to set a custom one that won&apos;t be overwritten by sync.</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground/50">No description available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: product, isLoading } = useProduct(id);
  const toggleHidden = useToggleProductHidden();
  const toggleFeatured = useToggleProductFeatured();
  const [shared, setShared] = useState(false);

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
            // Image as attachment, name + URL as caption (tappable in WhatsApp)
            shareData.files = [file];
            shareData.text = `${product.title}\n${shareUrl}`;
            delete shareData.url;
          }
        }
      } catch {
        // share without image
      }
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => router.push("/admin/products")}
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
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={() => toggleHidden.mutate(product.id)}
          >
            {product.is_hidden ? <Eye size={13} /> : <EyeOff size={13} />}
            {product.is_hidden ? "Show" : "Hide"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={() => toggleFeatured.mutate(product.id)}
          >
            {product.is_featured ? (
              <Star size={13} className="text-amber-500 fill-amber-500" />
            ) : (
              <StarOff size={13} />
            )}
            {product.is_featured ? "Unfeature" : "Feature"}
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
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
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
                  <div key={i} className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted/40">
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
          {/* B2B Display Name */}
          <DisplayNameEditor
            productId={product.id}
            displayName={product.display_name}
            title={product.title}
          />

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
          <DescriptionEditor
            productId={product.id}
            customDescription={product.custom_description}
            erpDescription={product.description}
          />

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
    </div>
  );
}
