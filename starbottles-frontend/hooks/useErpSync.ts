import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect } from "react";
import api from "@/lib/api";

export interface ErpSyncLog {
  id: number;
  status: "success" | "failed";
  products_added: number;
  products_updated: number;
  categories_synced: number;
  error_message: string | null;
  synced_at: string;
}

export interface ErpSyncStatus {
  logs: ErpSyncLog[];
  total_products: number;
  total_categories: number;
  last_sync: ErpSyncLog | null;
}

export interface ErpSetting {
  key: string;
  value: string | null;
  type: string;
}

export function useErpSyncStatus(pollingEnabled = false) {
  return useQuery({
    queryKey: ["erp-sync-status"],
    queryFn: () =>
      api
        .get("/v1/erp/sync-status")
        .then((r) => r.data.data as ErpSyncStatus),
    refetchInterval: pollingEnabled ? 2000 : 60000,
  });
}

export type SyncState = "idle" | "syncing" | "success" | "failed";

export interface SyncResult {
  added?: number;
  updated?: number;
  error?: string;
}

export interface SyncProgress {
  status: "idle" | "syncing" | "completed" | "failed";
  stage: "categories" | "products" | null;
  current: number;
  total: number;
  cats_done: boolean;
}

export function useSyncProgress(enabled: boolean) {
  return useQuery({
    queryKey: ["erp-sync-progress"],
    queryFn: () =>
      api.get("/v1/erp/sync-progress").then((r) => r.data.data as SyncProgress),
    refetchInterval: enabled ? 1000 : false,
  });
}

export function useTriggerSync() {
  const queryClient = useQueryClient();
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const lastLogIdRef = useRef<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  const mutation = useMutation({
    mutationFn: () => api.post("/v1/erp/sync").then((r) => r.data),
    onMutate: () => {
      const status = queryClient.getQueryData<ErpSyncStatus>(["erp-sync-status"]);
      lastLogIdRef.current = status?.last_sync?.id ?? null;
      setSyncState("syncing");
      setSyncResult(null);
    },
    onSuccess: () => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const { data } = await api.get("/v1/erp/sync-status");
          const status = data.data as ErpSyncStatus;
          const latest = status.last_sync;

          if (latest && latest.id !== lastLogIdRef.current) {
            stopPolling();
            queryClient.setQueryData(["erp-sync-status"], status);
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["admin-product-categories"] });
            queryClient.invalidateQueries({ queryKey: ["erp-sync-progress"] });

            if (latest.status === "success") {
              setSyncState("success");
              setSyncResult({
                added: latest.products_added,
                updated: latest.products_updated,
              });
            } else {
              setSyncState("failed");
              setSyncResult({ error: latest.error_message ?? "Sync failed" });
            }

            setTimeout(() => setSyncState("idle"), 8000);
          }
        } catch {
          // Ignore polling errors
        }
      }, 2000);

      // Safety: stop polling after 5 minutes
      setTimeout(() => {
        stopPolling();
        if (syncState === "syncing") {
          setSyncState("idle");
        }
      }, 300000);
    },
    onError: () => {
      setSyncState("failed");
      setSyncResult({ error: "Failed to queue sync job" });
      setTimeout(() => setSyncState("idle"), 8000);
    },
  });

  const dismiss = useCallback(() => {
    setSyncState("idle");
    setSyncResult(null);
  }, []);

  return { ...mutation, syncState, syncResult, dismiss };
}

export function useErpSettings() {
  return useQuery({
    queryKey: ["erp-settings"],
    queryFn: () =>
      api.get("/v1/erp/settings").then((r) => r.data.data as ErpSetting[]),
  });
}

export function useUpdateErpSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: { key: string; value: string | null }[]) =>
      api.put("/v1/erp/settings", { settings }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erp-settings"] });
    },
  });
}

export function useSyncCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post("/v1/erp/sync-categories").then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erp-sync-status"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product-categories"] });
    },
  });
}

export function useFullResync() {
  const queryClient = useQueryClient();
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const lastLogIdRef = useRef<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const mutation = useMutation({
    mutationFn: () => api.post("/v1/erp/full-resync").then((r) => r.data),
    onMutate: () => {
      setSyncState("syncing");
      setSyncResult(null);
      lastLogIdRef.current = null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erp-sync-status"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product-categories"] });

      pollRef.current = setInterval(async () => {
        try {
          const { data } = await api.get("/v1/erp/sync-status");
          const status = data.data as ErpSyncStatus;
          const latest = status.last_sync;

          if (latest && latest.id !== lastLogIdRef.current && latest.status !== undefined) {
            // Wait until a new log appears
            if (lastLogIdRef.current === null) {
              lastLogIdRef.current = latest.id;
            } else if (latest.id !== lastLogIdRef.current) {
              stopPolling();
              queryClient.setQueryData(["erp-sync-status"], status);
              queryClient.invalidateQueries({ queryKey: ["products"] });
              queryClient.invalidateQueries({ queryKey: ["admin-product-categories"] });
              queryClient.invalidateQueries({ queryKey: ["erp-sync-progress"] });

              if (latest.status === "success") {
                setSyncState("success");
                setSyncResult({ added: latest.products_added, updated: latest.products_updated });
              } else {
                setSyncState("failed");
                setSyncResult({ error: latest.error_message ?? "Resync failed" });
              }
              setTimeout(() => setSyncState("idle"), 8000);
            }
          }
        } catch {
          // Ignore polling errors
        }
      }, 2000);

      setTimeout(() => {
        stopPolling();
        if (syncState === "syncing") setSyncState("idle");
      }, 300000);
    },
    onError: () => {
      setSyncState("failed");
      setSyncResult({ error: "Failed to queue full resync" });
      setTimeout(() => setSyncState("idle"), 8000);
    },
  });

  return { ...mutation, syncState, syncResult };
}
