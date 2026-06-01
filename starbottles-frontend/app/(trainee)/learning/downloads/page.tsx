"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, FileText, FileImage, Download, FolderOpen } from "lucide-react";
import { useTrainingMaterials } from "@/hooks/useTraining";
import { cn } from "@/lib/utils";

const PROGRESS_KEY = "starbottles_learning_progress";

export default function DownloadsPage() {
  const { data, isLoading } = useTrainingMaterials();

  const files = [...(data?.pdfs ?? []), ...(data?.documents ?? [])];

  useEffect(() => {
    if (files.length > 0) {
      try {
        const stored = localStorage.getItem(PROGRESS_KEY);
        const progress = stored ? JSON.parse(stored) : {};
        progress.downloads = true;
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length]);

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">

      {/* Header */}
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2 text-xs">
          <Link href="/learning">
            <ArrowLeft size={14} /> Back to Learning Portal
          </Link>
        </Button>

        <div
          className="rounded-xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, oklch(0.18 0.06 162) 0%, oklch(0.28 0.10 162) 50%, oklch(0.40 0.14 152) 100%)",
          }}
        >
          <div className="px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                <Download size={20} className="text-white/80" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Resources & Downloads</h1>
                <p className="text-xs text-white/40 mt-0.5">PDFs, guides, and reference documents</p>
              </div>
            </div>
            {files.length > 0 && (
              <span className="text-xs font-semibold text-white/30 hidden sm:block">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-72" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && files.length === 0 && (
        <Card className="border shadow-sm">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <FolderOpen size={28} className="text-muted-foreground/30" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-foreground">No files available yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Your administrator will upload reference documents soon.
            </p>
          </CardContent>
        </Card>
      )}

      {/* File list */}
      <div className="space-y-2">
        {files.map((file) => {
          const isPdf = file.type === "pdf";
          return (
            <Card
              key={file.id}
              className="group border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="flex items-center gap-4 px-4 py-3.5">
                  {/* File type icon */}
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                    isPdf ? "bg-red-50" : "bg-blue-50"
                  )}>
                    {isPdf ? (
                      <FileImage size={20} className="text-red-500" />
                    ) : (
                      <FileText size={20} className="text-blue-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.title}</p>
                    {file.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{file.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold uppercase tracking-wide hidden sm:inline-flex"
                    >
                      {file.type}
                    </Badge>
                    <Button
                      asChild
                      size="sm"
                      className="gap-1.5 shadow-sm text-xs font-semibold h-8"
                    >
                      <a href={file.download_url ?? undefined} target="_blank" rel="noopener noreferrer">
                        <Download size={13} /> Download
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Next CTA */}
      {files.length > 0 && (
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Ready for the next step?</p>
                <p className="text-xs text-muted-foreground">Take the knowledge assessment to complete onboarding</p>
              </div>
              <Button asChild size="sm" className="gap-1.5 shadow-sm">
                <Link href="/quiz">
                  Take Assessment
                  <ArrowRight size={14} />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
