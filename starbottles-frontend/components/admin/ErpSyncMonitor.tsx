"use client";

import { formatDistanceToNow, format } from "date-fns";
import { RefreshCw, Loader2, ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, Zap } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useErpSyncStatus, useTriggerSync } from "@/hooks/useErpSync";
import { cn } from "@/lib/utils";

export default function ErpSyncMonitor() {
  const { data, isLoading, refetch } = useErpSyncStatus();
  const triggerSync = useTriggerSync();
  const [errorOpen, setErrorOpen] = useState(false);

  const lastSync = data?.last_sync;
  const totalProducts = data?.total_products ?? 0;

  const handleSyncNow = async () => {
    await triggerSync.mutateAsync();
  };

  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isSuccess = lastSync?.status === "success";

  return (
    <Card className="border shadow-sm overflow-hidden">
      {/* Status accent bar */}
      <div className={cn(
        "h-1",
        lastSync
          ? isSuccess
            ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
            : "bg-gradient-to-r from-red-400 to-red-500"
          : "bg-gradient-to-r from-muted to-muted"
      )} />

      <CardContent className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center",
              isSuccess ? "bg-emerald-50" : lastSync ? "bg-red-50" : "bg-muted/60"
            )}>
              {lastSync ? (
                isSuccess ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <XCircle size={16} className="text-red-500" />
                )
              ) : (
                <RefreshCw size={16} className="text-muted-foreground/40" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">ERP Product Sync</p>
                {lastSync && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold",
                      isSuccess
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {isSuccess ? "Healthy" : "Error"}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lastSync ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">
                        Last sync {formatDistanceToNow(new Date(lastSync.synced_at), { addSuffix: true })}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {format(new Date(lastSync.synced_at), "dd MMM yyyy, HH:mm:ss")}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  "No sync history"
                )}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleSyncNow}
            disabled={triggerSync.isPending || isLoading}
            className="gap-1.5 text-xs font-semibold h-8"
          >
            {triggerSync.isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Zap size={13} />
            )}
            Sync Now
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-muted/30 border border-border/40 px-4 py-3 text-center">
            <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
              {totalProducts.toLocaleString()}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mt-0.5">Total Products</p>
          </div>
          <div className="rounded-xl bg-muted/30 border border-border/40 px-4 py-3 text-center">
            <p className="text-xl font-bold tracking-tight tabular-nums text-emerald-600">
              {lastSync?.products_added ?? 0}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mt-0.5">Added</p>
          </div>
          <div className="rounded-xl bg-muted/30 border border-border/40 px-4 py-3 text-center">
            <p className="text-xl font-bold tracking-tight tabular-nums text-accent">
              {lastSync?.products_updated ?? 0}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mt-0.5">Updated</p>
          </div>
          <div className="rounded-xl bg-muted/30 border border-border/40 px-4 py-3 text-center">
            <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
              {data?.logs?.length ?? 0}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mt-0.5">Total Syncs</p>
          </div>
        </div>

        {/* Error panel */}
        {lastSync?.status === "failed" && lastSync.error_message && (
          <Collapsible open={errorOpen} onOpenChange={setErrorOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-red-600 hover:text-red-700 hover:bg-red-50/50 h-8 text-xs"
              >
                <span>View error details</span>
                {errorOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-2 rounded-lg bg-red-50 border border-red-200/60 p-3 text-xs text-red-700 whitespace-pre-wrap break-all font-mono">
                {lastSync.error_message}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
