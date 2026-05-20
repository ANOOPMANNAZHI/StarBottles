"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, RefreshCw, CheckCircle2, XCircle, FolderSync, Lock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useErpSettings,
  useUpdateErpSettings,
  useErpSyncStatus,
  useTriggerSync,
  useSyncCategories,
  useSyncProgress,
  useFullResync,
  type ErpSetting,
} from "@/hooks/useErpSync";

const FIELD_LABELS: Record<string, { label: string; hint: string }> = {
  erp_base_url:     { label: "Base URL",       hint: "e.g. https://sabco.frappe.cloud" },
  erp_api_key:      { label: "API Key",        hint: "Frappe API key" },
  erp_api_secret:   { label: "API Secret",     hint: "Leave blank to keep existing secret" },
  erp_company:      { label: "Company",        hint: "Company name in ERP" },
  erp_use_mock:     { label: "Mock Mode",      hint: "Use mock data instead of live API" },
  erp_page_size:    { label: "Page Size",      hint: "Records per API request (default 100)" },
  erp_sync_interval:{ label: "Sync Interval",  hint: "Hours between auto-syncs" },
};

export default function ErpSettingsPage() {
  const { data: settings, isLoading } = useErpSettings();
  const updateSettings = useUpdateErpSettings();
  const triggerSync = useTriggerSync();
  const isSyncing = triggerSync.syncState === "syncing";
  const { data: syncData } = useErpSyncStatus(isSyncing);
  const syncCategories = useSyncCategories();
  const isCategorySyncing = syncCategories.isPending;
  const fullResync = useFullResync();
  const isFullResyncing = fullResync.syncState === "syncing";
  const isAnySyncing = isSyncing || isCategorySyncing || isFullResyncing;
  const { data: progress } = useSyncProgress(isAnySyncing);

  const [form, setForm] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (settings) {
      const initial: Record<string, string> = {};
      settings.forEach((s) => {
        initial[s.key] = s.value ?? "";
      });
      setForm(initial);
      setDirty(false);
    }
  }, [settings]);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function handleSave() {
    const payload = Object.entries(form).map(([key, value]) => ({ key, value }));
    updateSettings.mutate(payload, {
      onSuccess: () => setDirty(false),
    });
  }

  const lastSync = syncData?.last_sync;
  const recentLogs = syncData?.logs ?? [];

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={16} className="animate-spin" /> Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-1">
          Admin / Integration
        </p>
        <h1 className="text-2xl font-bold tracking-tight">ERP Settings</h1>
      </div>

      {/* Connection settings */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Connection</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Frappe ERP API credentials and configuration
          </p>
        </div>
        <div className="p-5 space-y-5">
          {(settings ?? [])
            .filter((s) => s.key !== "erp_use_mock")
            .map((s) => {
              const meta = FIELD_LABELS[s.key];
              const isEditable = s.key === "erp_sync_interval";
              const isMasked = s.key === "erp_api_key" || s.key === "erp_api_secret";
              return (
                <div key={s.key} className="grid gap-1.5">
                  <Label htmlFor={s.key} className="text-sm font-medium flex items-center gap-1.5">
                    {meta?.label ?? s.key}
                    {!isEditable && <Lock size={11} className="text-muted-foreground" />}
                  </Label>
                  <Input
                    id={s.key}
                    type={isMasked ? "password" : "text"}
                    value={isMasked ? "••••••••••••" : (form[s.key] ?? "")}
                    onChange={isEditable ? (e) => updateField(s.key, e.target.value) : undefined}
                    readOnly={!isEditable}
                    placeholder={isEditable ? meta?.hint : undefined}
                    className={cn("h-9", !isEditable && "bg-muted text-muted-foreground cursor-not-allowed select-none")}
                  />
                  {isEditable && meta?.hint && (
                    <p className="text-[11px] text-muted-foreground">{meta.hint}</p>
                  )}
                </div>
              );
            })}

          {/* Mock mode toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5">
                Mock Mode
                <Lock size={11} className="text-muted-foreground" />
              </p>
              <p className="text-[11px] text-muted-foreground">
                Use local mock data instead of live Frappe API
              </p>
            </div>
            <Switch
              checked={form.erp_use_mock === "1"}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Save bar */}
      {dirty && (
        <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-xl border border-border bg-card px-5 py-3 shadow-lg">
          <span className="text-xs text-muted-foreground mr-auto">
            You have unsaved changes
          </span>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleSave}
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save Settings
          </Button>
        </div>
      )}

      {/* Product Categories sync */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Product Categories (Item Groups)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {syncData?.total_categories ?? 0} categories synced from ERP
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 text-xs font-semibold"
            onClick={() => syncCategories.mutate()}
            disabled={syncCategories.isPending}
          >
            {syncCategories.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <FolderSync size={12} />
            )}
            Sync Categories
          </Button>
        </div>
        {syncCategories.isSuccess && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 text-xs text-emerald-600">
              <CheckCircle2 size={14} />
              <span>
                {(syncCategories.data as { data?: { categories_synced?: number } })?.data?.categories_synced ?? 0} categories synced successfully
              </span>
            </div>
          </div>
        )}
        {syncCategories.isError && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 text-xs text-red-500">
              <XCircle size={14} />
              <span>Failed to sync categories</span>
            </div>
          </div>
        )}
      </div>

      {/* Sync result banner */}
      {triggerSync.syncState === "success" && triggerSync.syncResult && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="text-sm text-emerald-700 dark:text-emerald-400">
            Sync completed — {triggerSync.syncResult.added ?? 0} added, {triggerSync.syncResult.updated ?? 0} updated
          </span>
        </div>
      )}
      {triggerSync.syncState === "failed" && triggerSync.syncResult && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30">
          <XCircle size={16} className="text-red-600 shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-400 truncate">
            Sync failed — {triggerSync.syncResult.error}
          </span>
        </div>
      )}

      {/* Products sync section */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Products Sync</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lastSync ? (
                `Last synced ${formatDistanceToNow(new Date(lastSync.synced_at), {
                  addSuffix: true,
                })} · ${syncData?.total_products ?? 0} products`
              ) : (
                "Never synced"
              )}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 text-xs font-semibold"
            onClick={() => triggerSync.mutate()}
            disabled={triggerSync.isPending || isSyncing}
          >
            {triggerSync.isPending || isSyncing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            {isSyncing ? "Syncing..." : "Sync Products"}
          </Button>
        </div>

        {/* Sync progress bar */}
        {isAnySyncing && progress && (
          <div className="px-5 py-4 border-b border-border space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Loader2 size={12} className="animate-spin" />
                {progress.stage === "categories" ? "Syncing categories..." : "Syncing products..."}
              </span>
              <span className="text-xs text-muted-foreground">Safe to navigate away</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-primary rounded-full transition-all duration-500"
                style={{
                  width: progress.total > 0
                    ? `${Math.round((progress.current / progress.total) * 100)}%`
                    : progress.stage === "categories" ? "10%" : "5%",
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {progress.stage === "products" && progress.total > 0
                  ? `${progress.current} of ${progress.total} products`
                  : progress.stage === "categories"
                  ? "Processing categories..."
                  : "Starting..."}
              </span>
              <span className="flex items-center gap-1">
                {progress.cats_done ? (
                  <CheckCircle2 size={11} className="text-emerald-500" />
                ) : (
                  <Loader2 size={11} className="animate-spin" />
                )}
                Categories {progress.cats_done ? "done" : "pending"}
              </span>
            </div>
          </div>
        )}

        {/* Recent sync logs */}
        {recentLogs.length > 0 && (
          <div className="divide-y divide-border">
            {recentLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-center gap-3 text-sm">
                {log.status === "success" ? (
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-500 shrink-0" />
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.synced_at), { addSuffix: true })}
                </span>
                {log.status === "success" ? (
                  <span className="text-xs">
                    +{log.products_added} added, {log.products_updated} updated
                    {log.categories_synced > 0 && `, ${log.categories_synced} categories`}
                  </span>
                ) : (
                  <span className="text-xs text-red-500 truncate">
                    {log.error_message}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full resync result banners */}
      {fullResync.syncState === "success" && fullResync.syncResult && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="text-sm text-emerald-700">
            Full resync completed — {fullResync.syncResult.added ?? 0} products added
          </span>
        </div>
      )}
      {fullResync.syncState === "failed" && fullResync.syncResult && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <XCircle size={16} className="text-red-600 shrink-0" />
          <span className="text-sm text-red-700 truncate">
            Resync failed — {fullResync.syncResult.error}
          </span>
        </div>
      )}

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-red-50/30 shadow-sm">
        <div className="px-5 py-4 border-b border-red-100">
          <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
          <p className="text-xs text-red-500/80 mt-0.5">
            Destructive actions — cannot be undone
          </p>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Clear All Data &amp; Resync</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently deletes all products and categories from the database, then runs a fresh sync from ERP.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5 shrink-0"
                disabled={isAnySyncing}
              >
                {isFullResyncing ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
                {isFullResyncing ? "Resyncing..." : "Clear & Resync"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Data &amp; Resync?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>all products</strong> and{" "}
                  <strong>all categories</strong> from the database, then immediately
                  trigger a full sync from ERP. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => fullResync.mutate()}
                >
                  Yes, Clear &amp; Resync
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
