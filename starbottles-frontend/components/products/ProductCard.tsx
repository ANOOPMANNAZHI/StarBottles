"use client";

import Image from "next/image";
import Link from "next/link";
import { EyeOff, Star } from "lucide-react";
import type { ProductListItem } from "@/hooks/useProducts";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='14' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

interface Props {
  product: ProductListItem;
}

export default function ProductCard({ product }: Props) {
  return (
    <div className="group relative rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* ── Image area ── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={product.first_image ?? PLACEHOLDER}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER;
          }}
        />

        {/* Bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Category pill — bottom-left on the gradient */}
        {product.category && (
          <span className="absolute bottom-2.5 left-3 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">
            {product.category.name}
          </span>
        )}

        {/* Top-right badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
          {product.is_featured && (
            <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              <Star size={10} fill="currentColor" strokeWidth={0} />
              Featured
            </span>
          )}
          {product.is_hidden && (
            <span className="flex items-center gap-1 bg-slate-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              <EyeOff size={10} strokeWidth={2} />
              Hidden
            </span>
          )}
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-[15px] line-clamp-2 leading-snug text-foreground">
          {product.title}
        </h3>

        {(product.material || product.capacity) && (
          <p className="text-xs text-muted-foreground">
            {[product.material, product.capacity].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* CTA — hover-reveal on desktop, always visible on mobile */}
        <div className="mt-auto pt-3">
          <Link
            href={`/products/${product.id}`}
            className="
              block w-full text-center text-sm font-semibold text-white
              h-9 leading-9 rounded-xl
              transition-opacity duration-200
              sm:opacity-0 sm:group-hover:opacity-100
              opacity-100
            "
            style={{
              background:
                "linear-gradient(90deg, oklch(0.26 0.10 252) 0%, oklch(0.42 0.16 235) 55%, oklch(0.62 0.19 218) 100%)",
            }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
