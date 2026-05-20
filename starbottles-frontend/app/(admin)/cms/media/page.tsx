"use client";

import { useState, useCallback } from "react";
import { useMedia, useUploadMedia, useDeleteMedia, useUpdateMediaAlt, type MediaItem } from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Upload, Trash2, Copy, Loader2, Check, Pencil, ImageIcon } from "lucide-react";
import { toast } from "sonner";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryPage() {
  const { data: media, isLoading } = useMedia();
  const upload = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const updateAlt = useUpdateMediaAlt();
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [editAlt, setEditAlt] = useState<{ id: number; alt_text: string } | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      await upload.mutateAsync(files);
      toast.success(`${files.length} file(s) uploaded`);
    },
    [upload]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      await handleUpload(files);
      e.target.value = "";
    },
    [handleUpload]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.type.startsWith("image/") || f.type === "application/pdf"
      );
      if (files.length) await handleUpload(files);
    },
    [handleUpload]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const copyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 1500);
    toast.success("URL copied");
  };

  const saveAlt = async () => {
    if (!editAlt) return;
    await updateAlt.mutateAsync(editAlt);
    setEditAlt(null);
    toast.success("Alt text updated");
  };

  const filtered = (media ?? []).filter((item) =>
    item.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading..." : `${(media ?? []).length} file${(media ?? []).length !== 1 ? "s" : ""} uploaded`}
          </p>
        </div>
        <label className="cursor-pointer shrink-0">
          <Input type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleFileInput} />
          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            {upload.isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Upload Files
          </span>
        </label>
      </div>

      {/* Drag & drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? "border-accent bg-accent/5 scale-[1.01]"
            : "border-border/60 hover:border-border"
        }`}
      >
        <Upload size={24} className={`mb-2 transition-colors ${isDragging ? "text-accent" : "text-muted-foreground/50"}`} strokeWidth={1.5} />
        <p className="text-sm font-medium text-muted-foreground">
          {isDragging ? "Drop files here" : "Drag and drop images or PDFs here"}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">or use the Upload Files button above</p>
        {upload.isPending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Loader2 size={18} className="animate-spin text-accent" />
              Uploading...
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      {(media ?? []).length > 0 && (
        <div className="relative max-w-sm">
          <Input
            placeholder="Search by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      )}

      {/* Media grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (media ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
          <div className="p-4 rounded-full bg-muted/60 mb-4">
            <ImageIcon size={28} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-base">No files yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Upload images or PDFs to use across banners, pages, and settings.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-10 text-sm">No files match &quot;{search}&quot;</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((item) => (
            <Card key={item.id} className="overflow-hidden group border-border/60 hover:shadow-md transition-all duration-200">
              <div className="aspect-square bg-muted relative">
                {item.mime_type.startsWith("image/") ? (
                  <img src={item.url} alt={item.alt_text ?? item.filename} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-2 text-center">
                    {item.mime_type}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(item)}
                    className="p-1.5 bg-white rounded-full text-black hover:bg-gray-100 transition-colors"
                    title="Copy URL"
                  >
                    {copied === item.id ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                  <button
                    onClick={() => setEditAlt({ id: item.id, alt_text: item.alt_text ?? "" })}
                    className="p-1.5 bg-white rounded-full text-black hover:bg-gray-100 transition-colors"
                    title="Edit alt text"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="p-2 space-y-0.5">
                <p className="text-xs truncate text-foreground/80 font-medium">{item.filename}</p>
                <p className="text-[10px] text-muted-foreground">{formatBytes(item.size)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit alt text dialog */}
      {editAlt && (
        <AlertDialog open onOpenChange={() => setEditAlt(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Alt Text</AlertDialogTitle>
              <AlertDialogDescription>
                Describe the image for accessibility and SEO. Used by screen readers and search engines.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={editAlt.alt_text}
              onChange={(e) => setEditAlt({ ...editAlt, alt_text: e.target.value })}
              placeholder="e.g. Glass water bottles arranged on a table"
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={saveAlt}>Save</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deleteTarget?.filename}&quot;? This cannot be undone and may break pages using this file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteTarget) {
                  await deleteMedia.mutateAsync(deleteTarget.id);
                  toast.success("File deleted");
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
