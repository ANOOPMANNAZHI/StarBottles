"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { SyncProgress } from "@/hooks/useErpSync";

type DisplayState = "hidden" | "syncing" | "completed" | "failed";

export default function ErpSyncIndicator() {
  const [display, setDisplay] = useState<DisplayState>("hidden");
  const [productProgress, setProductProgress] = useState<{ current: number; total: number } | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  // Always poll — slow when idle, fast when syncing
  const { data: progress } = useQuery({
    queryKey: ["erp-sync-progress-global"],
    queryFn: () =>
      api.get("/v1/erp/sync-progress").then((r) => r.data.data as SyncProgress),
    refetchInterval: display === "syncing" ? 1500 : 8000,
  });

  useEffect(() => {
    if (!progress) return;

    const prev = prevStatusRef.current;
    const curr = progress.status;
    prevStatusRef.current = curr;

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (curr === "syncing") {
      setDisplay("syncing");
      if (progress.stage === "products" && progress.total > 0) {
        setProductProgress({ current: progress.current, total: progress.total });
      } else {
        setProductProgress(null);
      }
    } else if (curr === "completed" && prev === "syncing") {
      setDisplay("completed");
      setProductProgress(null);
      hideTimerRef.current = setTimeout(() => setDisplay("hidden"), 4000);
    } else if (curr === "failed" && prev === "syncing") {
      setDisplay("failed");
      setProductProgress(null);
      hideTimerRef.current = setTimeout(() => setDisplay("hidden"), 6000);
    }
  }, [progress]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  if (display === "hidden") return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-1",
        display === "syncing"  && "bg-amber-50 text-amber-700 border border-amber-200",
        display === "completed" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
        display === "failed"   && "bg-red-50 text-red-700 border border-red-200",
      )}
    >
      {display === "syncing" && (
        <>
          <Loader2 size={12} className="animate-spin shrink-0" />
          <span className="hidden sm:inline">
            {productProgress
              ? `Syncing ${productProgress.current}/${productProgress.total}`
              : progress?.stage === "categories"
              ? "Syncing categories…"
              : "ERP Sync…"}
          </span>
          <span className="sm:hidden">Syncing</span>
        </>
      )}
      {display === "completed" && (
        <>
          <CheckCircle2 size={12} className="shrink-0" />
          <span>Sync done</span>
        </>
      )}
      {display === "failed" && (
        <>
          <XCircle size={12} className="shrink-0" />
          <span>Sync failed</span>
        </>
      )}
    </div>
  );
}
