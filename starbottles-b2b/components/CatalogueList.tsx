"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CatalogueItem } from "@/lib/api";

const PAGE_SIZE = 10;

function DownloadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg className="w-10 h-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h1.5a1 1 0 010 2H9v-2zm0 0V11m6 2h-1m1 0a1 1 0 010 2h-1v-2m0 0V11" />
    </svg>
  );
}

function CatalogueCard({ catalogue }: { catalogue: CatalogueItem }) {
  const formatted = new Date(catalogue.updated_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand/20 transition-all duration-300 p-6 flex items-center gap-5">
      <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-brand-pale/30 flex items-center justify-center group-hover:bg-brand-pale/60 transition-colors duration-300">
        <PdfIcon />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-poppins font-semibold text-gray-900 text-base leading-snug truncate">
          {catalogue.version || "Product Catalogue"}
        </h3>
        <p className="font-inter text-xs text-gray-400 mt-1">Updated {formatted}</p>
      </div>
      <a
        href={catalogue.file_url}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white font-inter font-semibold text-sm hover:bg-brand-dark transition-colors duration-200 shadow-sm"
      >
        <DownloadIcon />
        <span className="hidden sm:inline">Download</span>
      </a>
    </div>
  );
}

export default function CatalogueList({ catalogues }: { catalogues: CatalogueItem[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visible = catalogues.slice(0, visibleCount);
  const remaining = catalogues.length - visibleCount;
  const hasMore = remaining > 0;

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((c) => c + PAGE_SIZE);
      setLoadingMore(false);
      setTimeout(() => {
        loadMoreRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }, 300);
  };

  if (catalogues.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="font-poppins font-semibold text-gray-700 text-lg">
          No catalogues available at the moment
        </p>
        <p className="font-inter text-gray-400 text-sm mt-2 mb-6">
          Please check back soon or contact us directly for product information.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white font-inter font-semibold text-sm hover:bg-brand-dark transition-colors duration-200"
        >
          Contact Us
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {visible.map((catalogue) => (
          <CatalogueCard key={catalogue.id} catalogue={catalogue} />
        ))}
      </div>

      {/* Load more */}
      <div ref={loadMoreRef} className="mt-10">
        {hasMore ? (
          <div className="flex flex-col items-center gap-4">
            {/* Progress bar */}
            <div className="w-full max-w-xs bg-gray-100 rounded-full h-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand to-brand-light rounded-full transition-all duration-500"
                style={{ width: `${(Math.min(visibleCount, catalogues.length) / catalogues.length) * 100}%` }}
              />
            </div>
            <p className="font-inter text-xs text-gray-400">
              {Math.min(visibleCount, catalogues.length)} of {catalogues.length} catalogues
            </p>
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2.5 font-poppins font-semibold text-sm text-brand-dark bg-white ring-1 ring-gray-200 hover:ring-brand/30 hover:shadow-lg hover:shadow-brand/[0.06] px-8 py-3.5 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  Load {Math.min(remaining, PAGE_SIZE)} more
                  <span className="font-inter font-normal text-xs text-gray-400">
                    ({remaining} remaining)
                  </span>
                  <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        ) : catalogues.length > PAGE_SIZE ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="w-full max-w-xs bg-gradient-to-r from-brand to-brand-light rounded-full h-1" />
            <p className="font-inter text-xs text-gray-400">
              All {catalogues.length} catalogues shown
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
