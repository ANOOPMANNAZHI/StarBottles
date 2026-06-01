"use client";

import { productImage } from "@/lib/api";
import type { ChatProduct } from "@/lib/chatFlows";

interface Props {
  product: ChatProduct;
  onGetQuote: (product: ChatProduct) => void;
}

export default function ChatProductCard({ product, onGetQuote }: Props) {
  const name = product.display_name || product.title;
  const image = productImage(product.first_image);
  const categoryName =
    product.category && typeof product.category === "object"
      ? product.category.name
      : null;

  // Use only the path so the link always opens on the current site port
  let productHref = product.share_url;
  try { productHref = new URL(product.share_url).pathname; } catch {}


  const specs = [
    product.capacity && { label: "Capacity", value: product.capacity },
    product.material && { label: "Material", value: product.material },
    categoryName && { label: "Category", value: categoryName },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3 p-3">
        {/* Image */}
        <a href={productHref} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img
            src={image}
            alt={name}
            className="w-16 h-16 object-cover rounded-lg bg-gray-50"
            loading="lazy"
          />
        </a>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <a
            href={productHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-gray-900 line-clamp-2 hover:text-[#1B2178] transition-colors leading-tight"
          >
            {name}
          </a>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            {specs.map((s) => (
              <span key={s.label} className="text-[10px] text-gray-500">
                <span className="text-gray-400">{s.label}:</span> {s.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-3 pb-3">
        <button
          onClick={() => onGetQuote(product)}
          className="w-full py-1.5 rounded-lg bg-[#1B2178] text-white text-xs font-semibold hover:bg-[#141a5e] transition-colors"
        >
          Get Quote
        </button>
      </div>
    </div>
  );
}
