"use client";

import { useState } from "react";
import {
  useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, useReorderBanners,
  type Banner,
} from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, ArrowUp, ArrowDown, Trash2, Pencil, Loader2, Eye, EyeOff, PanelTop, Link2, Film } from "lucide-react";
import { toast } from "sonner";

export default function BannersPage() {
  const { data: banners, isLoading } = useBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();
  const reorder = useReorderBanners();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  const [form, setForm] = useState({ title: "", subtitle: "", eyebrow: "", video_url: "", cta_text: "", cta_url: "", cta_secondary_text: "", cta_secondary_url: "", is_active: true });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", subtitle: "", eyebrow: "", video_url: "", cta_text: "", cta_url: "", cta_secondary_text: "", cta_secondary_url: "", is_active: true });
    setImageFile(null);
    setDialogOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      eyebrow: banner.eyebrow ?? "",
      video_url: banner.video_url ?? "",
      cta_text: banner.cta_text ?? "",
      cta_url: banner.cta_url ?? "",
      cta_secondary_text: banner.cta_secondary_text ?? "",
      cta_secondary_url: banner.cta_secondary_url ?? "",
      is_active: banner.is_active,
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append("title", form.title);
    if (form.subtitle) fd.append("subtitle", form.subtitle);
    if (form.eyebrow) fd.append("eyebrow", form.eyebrow);
    if (form.video_url) fd.append("video_url", form.video_url);
    if (form.cta_text) fd.append("cta_text", form.cta_text);
    if (form.cta_url) fd.append("cta_url", form.cta_url);
    if (form.cta_secondary_text) fd.append("cta_secondary_text", form.cta_secondary_text);
    if (form.cta_secondary_url) fd.append("cta_secondary_url", form.cta_secondary_url);
    fd.append("is_active", form.is_active ? "1" : "0");

    try {
      if (editing) {
        if (imageFile) fd.append("image", imageFile);
        await updateBanner.mutateAsync({ id: editing.id, fd });
        toast.success("Banner updated");
      } else {
        if (!imageFile && !form.video_url) { toast.error("Image is required when no video URL is set"); return; }
        if (imageFile) fd.append("image", imageFile);
        await createBanner.mutateAsync(fd);
        toast.success("Banner created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      const errors = err?.response?.data?.errors as Record<string, string[]> | undefined;
      const msg = err?.response?.data?.message
        || (errors ? Object.values(errors)[0]?.[0] : undefined)
        || "Something went wrong";
      toast.error(msg as string);
    }
  };

  const toggleActive = async (banner: Banner) => {
    const fd = new FormData();
    fd.append("title", banner.title);
    fd.append("is_active", banner.is_active ? "0" : "1");
    await updateBanner.mutateAsync({ id: banner.id, fd });
    toast.success(banner.is_active ? "Banner hidden" : "Banner visible");
  };

  const move = async (index: number, direction: -1 | 1) => {
    if (!banners) return;
    const ids = banners.map((b) => b.id);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= ids.length) return;
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    await reorder.mutateAsync(ids);
  };

  const busy = createBanner.isPending || updateBanner.isPending;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">Hero banners displayed on the homepage. Drag to reorder.</p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus size={16} className="mr-2" /> Add Banner
        </Button>
      </div>

      {/* Banner list */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (banners ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
          <div className="p-4 rounded-full bg-muted/60 mb-4">
            <PanelTop size={28} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-base">No banners yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Add a hero banner to display on the homepage. Each banner has a title, image, and optional CTA button.
          </p>
          <Button onClick={openCreate} variant="outline" className="mt-4">
            <Plus size={16} className="mr-2" /> Add First Banner
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(banners ?? []).map((banner, i) => (
            <Card key={banner.id} className="flex items-center gap-4 p-4 border-border/60 hover:shadow-md transition-all duration-200">
              {/* Thumbnail */}
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/60">
                {banner.image_url ? (
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PanelTop size={16} className="text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm truncate">{banner.title}</h3>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${banner.is_active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                    {banner.is_active ? "Active" : "Inactive"}
                  </span>
                  {banner.video_url && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                      <Film size={10} /> Video
                    </span>
                  )}
                </div>
                {banner.subtitle && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{banner.subtitle}</p>
                )}
                {banner.cta_text && (
                  <div className="flex items-center gap-1 mt-1">
                    <Link2 size={11} className="text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground/70 truncate">
                      {banner.cta_text}{banner.cta_url ? ` → ${banner.cta_url}` : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
                  title="Move up"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === (banners?.length ?? 0) - 1}
                  className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
                  title="Move down"
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  onClick={() => toggleActive(banner)}
                  className={`p-1.5 rounded-md transition-colors ${banner.is_active ? "hover:bg-muted text-muted-foreground" : "hover:bg-muted text-muted-foreground/40"}`}
                  title={banner.is_active ? "Hide banner" : "Show banner"}
                >
                  {banner.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => openEdit(banner)}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  title="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(banner)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>{editing ? "Edit Banner" : "New Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-1 overflow-y-auto flex-1 pr-1">
            {/* Basic info */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Banner Content</p>
              <div>
                <label className="text-sm font-medium">Eyebrow</label>
                <Input
                  className="mt-1"
                  value={form.eyebrow}
                  onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                  placeholder="e.g. India's #1 B2B Packaging Partner"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
                <Input
                  className="mt-1"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Main headline for the banner"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subtitle</label>
                <Input
                  className="mt-1"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Description text below headline"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Image
                  {!editing && !form.video_url && <span className="text-destructive">*</span>}
                  {!editing && form.video_url && <span className="text-xs text-muted-foreground font-normal ml-1">(optional — used as poster/fallback)</span>}
                  {editing && <span className="text-xs text-muted-foreground ml-1">(leave blank to keep current)</span>}
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  className="mt-1"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Video URL <span className="text-xs text-muted-foreground font-normal ml-1">(optional — YouTube link or direct .mp4 URL)</span></label>
                <Input
                  className="mt-1"
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                />
                <p className="text-xs text-muted-foreground mt-1">When set, the video plays as the banner background. Image is used as poster/fallback.</p>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary CTA</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Button Text</label>
                  <Input
                    className="mt-1"
                    value={form.cta_text}
                    onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                    placeholder="e.g. Explore Catalogue"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Button URL</label>
                  <Input
                    className="mt-1"
                    value={form.cta_url}
                    onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
                    placeholder="/products"
                  />
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Secondary CTA</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Button Text</label>
                  <Input
                    className="mt-1"
                    value={form.cta_secondary_text}
                    onChange={(e) => setForm({ ...form, cta_secondary_text: e.target.value })}
                    placeholder="e.g. Request a Quote"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Button URL</label>
                  <Input
                    className="mt-1"
                    value={form.cta_secondary_url}
                    onChange={(e) => setForm({ ...form, cta_secondary_url: e.target.value })}
                    placeholder="/contact"
                  />
                </div>
              </div>
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded"
              />
              <div>
                <span className="text-sm font-medium">Active</span>
                <p className="text-xs text-muted-foreground">Show this banner on the homepage</p>
              </div>
            </label>

          </div>
          <div className="flex justify-end gap-2 pt-3 shrink-0 border-t border-border/50">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={busy}>
              {busy && <Loader2 size={16} className="mr-2 animate-spin" />}
              {editing ? "Update Banner" : "Create Banner"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteTarget) {
                  await deleteBanner.mutateAsync(deleteTarget.id);
                  toast.success("Banner deleted");
                }
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
