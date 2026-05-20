"use client";

import { useState, useEffect } from "react";
import { useSeoList, useUpdateSeo, type SeoEntry } from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Search } from "lucide-react";
import { toast } from "sonner";

const PAGE_LABELS: Record<string, string> = {
  home: "Home",
  about: "About",
  products: "Products",
  contact: "Contact",
  privacy: "Privacy",
};

const SITE_DOMAIN = "starbottles.in";

function charBarColor(count: number, min: number, max: number): string {
  if (count >= min && count <= max) return "bg-green-500";
  if (count > max) return "bg-red-500";
  if (count > 0) return "bg-amber-400";
  return "bg-muted";
}

function CharBar({ count, max, min, label }: { count: number; max: number; min: number; label: string }) {
  const pct = Math.min(100, (count / max) * 100);
  const color = charBarColor(count, min, max);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${count >= min && count <= max ? "text-green-600" : count > max ? "text-red-500" : "text-amber-500"}`}>
          {count} / {max}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {count < min && count > 0 && (
        <p className="text-[10px] text-amber-500">Recommended: {min}–{max} chars</p>
      )}
    </div>
  );
}

function SerpPreview({ title, slug, description }: { title: string; slug: string; description: string }) {
  const displayTitle = title || "Page Title";
  const displayDesc = description || "Page description will appear here. Write a compelling summary to attract clicks from search results.";
  const url = `https://${SITE_DOMAIN}${slug === "home" ? "" : `/${slug}`}`;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-0.5">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Google Preview</p>
      <div className="space-y-1">
        <p className="text-[13px] text-[#1a0dab] font-medium leading-snug line-clamp-1 cursor-pointer hover:underline">
          {displayTitle}
        </p>
        <p className="text-[11px] text-[#006621] leading-tight">{url}</p>
        <p className="text-[12px] text-[#545454] leading-relaxed line-clamp-2">{displayDesc}</p>
      </div>
    </div>
  );
}

export default function SeoPage() {
  const { data: seoList, isLoading } = useSeoList();
  const updateSeo = useUpdateSeo();
  const [values, setValues] = useState<Record<string, { meta_title: string; meta_description: string }>>({});

  useEffect(() => {
    if (!seoList) return;
    const v: Record<string, { meta_title: string; meta_description: string }> = {};
    seoList.forEach((s: SeoEntry) => {
      v[s.page_slug] = {
        meta_title: s.meta_title ?? "",
        meta_description: s.meta_description ?? "",
      };
    });
    setValues(v);
  }, [seoList]);

  const handleSave = async (slug: string) => {
    const data = values[slug];
    if (!data) return;
    await updateSeo.mutateAsync({ slug, meta_title: data.meta_title, meta_description: data.meta_description });
    toast.success(`SEO for ${PAGE_LABELS[slug] ?? slug} saved`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const slugs = (seoList ?? []).map((s: SeoEntry) => s.page_slug);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SEO Metadata</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure meta titles and descriptions. Preview how each page appears in Google search results.
        </p>
      </div>

      <Tabs defaultValue={slugs[0] ?? "home"}>
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
          {slugs.map((slug: string) => (
            <TabsTrigger key={slug} value={slug} className="gap-1.5">
              <Search size={12} />
              {PAGE_LABELS[slug] ?? slug}
            </TabsTrigger>
          ))}
        </TabsList>

        {slugs.map((slug: string) => {
          const titleLen = (values[slug]?.meta_title ?? "").length;
          const descLen = (values[slug]?.meta_description ?? "").length;

          return (
            <TabsContent key={slug} value={slug} className="space-y-4 mt-4">
              {/* SERP preview */}
              <SerpPreview
                title={values[slug]?.meta_title ?? ""}
                slug={slug}
                description={values[slug]?.meta_description ?? ""}
              />

              {/* Fields */}
              <Card className="border-border/60 p-5 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta Title</label>
                  <Input
                    value={values[slug]?.meta_title ?? ""}
                    onChange={(e) => setValues({
                      ...values,
                      [slug]: { ...values[slug], meta_title: e.target.value },
                    })}
                    maxLength={70}
                    placeholder="e.g. Star Bottles — Premium Glass Packaging"
                  />
                  <CharBar count={titleLen} min={50} max={65} label="Title length" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta Description</label>
                  <Textarea
                    value={values[slug]?.meta_description ?? ""}
                    onChange={(e) => setValues({
                      ...values,
                      [slug]: { ...values[slug], meta_description: e.target.value },
                    })}
                    maxLength={160}
                    rows={3}
                    placeholder="A concise summary of the page shown in search results..."
                    className="resize-none"
                  />
                  <CharBar count={descLen} min={120} max={155} label="Description length" />
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave(slug)} disabled={updateSeo.isPending}>
                    {updateSeo.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                    Save {PAGE_LABELS[slug] ?? slug} SEO
                  </Button>
                </div>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
