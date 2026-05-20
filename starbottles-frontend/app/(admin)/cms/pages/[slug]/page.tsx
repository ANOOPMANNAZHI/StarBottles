"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePageSections, useUpdatePage, type PageSection } from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, Type, Code } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const TiptapEditor = dynamic(() => import("@/components/cms/TiptapEditor"), { ssr: false });

const PAGE_LABELS: Record<string, string> = {
  home: "Home Page",
  about: "About Page",
  products: "Products Page",
  contact: "Contact Page",
  privacy: "Privacy Policy",
};

function formatLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PageEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: sections, isLoading } = usePageSections(slug);
  const updatePage = useUpdatePage();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!sections) return;
    const v: Record<string, string> = {};
    sections.forEach((s: PageSection) => {
      v[s.section_key] = s.content ?? "";
    });
    setValues(v);
  }, [sections]);

  const handleSave = async () => {
    const sectionData = Object.entries(values).map(([section_key, content]) => ({
      section_key,
      content: content || null,
    }));
    await updatePage.mutateAsync({ slug, sections: sectionData });
    toast.success("Page content saved");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Sticky header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/cms/pages")}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="Back to pages"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">{PAGE_LABELS[slug] ?? slug}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {(sections ?? []).length} section{(sections ?? []).length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleSave} disabled={updatePage.isPending} className="shrink-0">
          {updatePage.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
          Save
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {(sections ?? []).map((section: PageSection) => (
          <Card key={section.section_key} className="border-border/60 overflow-hidden">
            {/* Section card header */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/60">
              <h3 className="text-sm font-semibold">{formatLabel(section.section_key)}</h3>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full ${
                section.content_type === "html"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {section.content_type === "html" ? <Code size={10} /> : <Type size={10} />}
                {section.content_type}
              </span>
            </div>

            {/* Section editor */}
            <div className="p-4">
              {section.content_type === "html" ? (
                <TiptapEditor
                  value={values[section.section_key] ?? ""}
                  onChange={(html) => setValues({ ...values, [section.section_key]: html })}
                />
              ) : (
                <Input
                  value={values[section.section_key] ?? ""}
                  onChange={(e) => setValues({ ...values, [section.section_key]: e.target.value })}
                  placeholder={`Enter ${formatLabel(section.section_key).toLowerCase()}...`}
                />
              )}
            </div>
          </Card>
        ))}
      </div>

      {(sections ?? []).length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          No sections found for this page.
        </div>
      )}

      {/* Bottom save */}
      {(sections ?? []).length > 0 && (
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={updatePage.isPending}>
            {updatePage.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  );
}
