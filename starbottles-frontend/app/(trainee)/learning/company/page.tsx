"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Building2 } from "lucide-react";
import { useCompanyInfo } from "@/hooks/useTraining";
import { cn } from "@/lib/utils";

const PROGRESS_KEY = "starbottles_learning_progress";

function markProgress(key: string) {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    const progress = stored ? JSON.parse(stored) : {};
    progress[key] = true;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {}
}

export default function CompanyPage() {
  const { data: sections, isLoading } = useCompanyInfo();

  useEffect(() => {
    if (sections) markProgress("company");
  }, [sections]);

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">

      {/* Header */}
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2 text-xs">
          <Link href="/learning">
            <ArrowLeft size={14} /> Back to Learning Portal
          </Link>
        </Button>

        {/* Mini hero */}
        <div
          className="rounded-xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, oklch(0.20 0.08 252) 0%, oklch(0.32 0.12 252) 50%, oklch(0.45 0.16 228) 100%)",
          }}
        >
          <div className="px-6 py-6 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
              <BookOpen size={20} className="text-white/80" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Company Introduction</h1>
              <p className="text-xs text-white/40 mt-0.5">Learn about StarBottles and what we do</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content sections */}
      {sections && (
        <div className="space-y-4">
          {sections.map((section, i) => (
            <Card key={section.id} className="border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Numbered indicator */}
                  <div className="w-12 shrink-0 bg-muted/30 flex flex-col items-center pt-6">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 p-6 pl-4">
                    <h2 className="text-base font-semibold tracking-tight mb-3">{section.title}</h2>
                    <div
                      className="prose prose-neutral prose-sm max-w-none text-muted-foreground leading-relaxed
                        [&_h2]:text-foreground [&_h2]:text-sm [&_h2]:font-semibold
                        [&_h3]:text-foreground [&_h3]:text-sm [&_h3]:font-medium
                        [&_strong]:text-foreground [&_a]:text-accent"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <Card className="border shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Section complete</p>
                <p className="text-xs text-muted-foreground">Continue to the product catalogue</p>
              </div>
            </div>
            <Button asChild size="sm" className="gap-1.5 shadow-sm">
              <Link href="/products">
                Next: Products
                <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
