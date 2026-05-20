"use client";

import Link from "next/link";
import { usePages } from "@/hooks/useCms";
import { Card } from "@/components/ui/card";
import { FileText, Loader2, Home, Info, Package, Phone, Shield, ChevronRight } from "lucide-react";

const PAGE_LABELS: Record<string, string> = {
  home: "Home Page",
  about: "About Page",
  products: "Products Page",
  contact: "Contact Page",
  privacy: "Privacy Policy",
};

const PAGE_DESCRIPTIONS: Record<string, string> = {
  home: "Hero headline, intro text, and homepage sections",
  about: "Company story, mission, vision, and team content",
  products: "Product catalogue intro and category descriptions",
  contact: "Contact section text and office information",
  privacy: "Privacy policy text and legal disclaimers",
};

const PAGE_ICONS: Record<string, React.ElementType> = {
  home: Home,
  about: Info,
  products: Package,
  contact: Phone,
  privacy: Shield,
};

export default function PageListPage() {
  const { data: pages, isLoading } = usePages();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const slugs = Object.keys(pages ?? {});

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Page Content</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Click a page to edit its text content and sections. Changes are saved per page.
        </p>
      </div>

      {/* Page grid */}
      {slugs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
          <div className="p-4 rounded-full bg-muted/60 mb-4">
            <FileText size={28} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-base">No pages found</h3>
          <p className="text-sm text-muted-foreground mt-1">Page sections will appear here once seeded.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {slugs.map((slug) => {
            const Icon = PAGE_ICONS[slug] ?? FileText;
            const sectionCount = (pages?.[slug] ?? []).length;
            return (
              <Link key={slug} href={`/cms/pages/${slug}`}>
                <Card className="group p-5 hover:shadow-md border-border/60 transition-all duration-200 cursor-pointer h-full hover:border-accent/40 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-0.5 bg-transparent group-hover:bg-accent transition-all duration-300 rounded-r" />
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-muted/60 group-hover:bg-accent/10 transition-colors duration-200 shrink-0">
                      <Icon size={18} className="text-muted-foreground group-hover:text-accent transition-colors duration-200" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm">{PAGE_LABELS[slug] ?? slug}</h3>
                        <ChevronRight size={14} className="text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all duration-200 shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {PAGE_DESCRIPTIONS[slug] ?? "Edit page content sections"}
                      </p>
                      <div className="mt-2.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {sectionCount} section{sectionCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
