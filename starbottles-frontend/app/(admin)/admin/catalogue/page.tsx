"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  BookOpen, Upload, Loader2, Trash2, CheckCircle2, FileText, ExternalLink,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn } from "@/lib/utils";
import {
  useCatalogues,
  useUploadCatalogue,
  useToggleActiveCatalogue,
  useDeleteCatalogue,
  CatalogueItem,
} from "@/hooks/useCatalogue";

// ── Upload Card ─────────────────────────────────────────────────────────────
function UploadCard() {
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const upload = useUploadCatalogue();

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) setSelectedFile(files[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    noClick: false,
  });

  const handleSave = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file first");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter a catalogue name");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("version", name.trim());
      await upload.mutateAsync(fd);
      toast.success("Catalogue uploaded successfully");
      setName("");
      setSelectedFile(null);
    } catch {
      toast.error("Upload failed — ensure the file is a PDF under 20 MB");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border shadow-sm overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <FileText size={15} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Upload New Catalogue</h3>
            <p className="text-xs text-muted-foreground">PDF only · Max 20 MB</p>
          </div>
        </div>

        <Input
          placeholder="Catalogue name (e.g. Star Bottles 2024)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background text-sm max-w-xs"
        />

        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
            selectedFile
              ? "border-red-400 bg-red-50/20"
              : isDragActive
              ? "border-red-400 bg-red-50/40 scale-[1.01]"
              : "border-border/60 hover:border-red-400/40 hover:bg-muted/20"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {isDragActive ? (
              <>
                <Upload size={28} className="text-red-500" />
                <p className="text-sm font-medium text-red-600">Drop the PDF here</p>
              </>
            ) : selectedFile ? (
              <>
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <FileText size={20} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Click to change
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
                  <Upload size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Drag & drop or{" "}
                    <span className="text-red-500 font-semibold">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    PDF catalogue file up to 20 MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          {selectedFile && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setSelectedFile(null)}
              disabled={uploading}
            >
              Clear
            </Button>
          )}
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleSave}
            disabled={uploading || !selectedFile}
          >
            {uploading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload size={13} />
                Save Catalogue
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Catalogue Row ───────────────────────────────────────────────────────────
function CatalogueRow({ item }: { item: CatalogueItem }) {
  const toggleActive = useToggleActiveCatalogue();
  const deleteCatalogue = useDeleteCatalogue();

  return (
    <Card
      className={cn(
        "group border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
        item.is_current && "border-green-200 bg-green-50/30"
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-4 px-4 py-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              item.is_current ? "bg-green-100" : "bg-red-50"
            )}
          >
            <FileText
              size={18}
              className={item.is_current ? "text-green-600" : "text-red-500"}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">{item.version || "Unnamed"}</p>
              {item.is_current && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] font-semibold">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.uploaded_by ?? "Unknown"} ·{" "}
              {format(new Date(item.created_at), "dd MMM yyyy, HH:mm")}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Open PDF"
            >
              <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} />
              </a>
            </Button>

            <Button
              variant={item.is_current ? "outline" : "outline"}
              size="sm"
              className={cn(
                "h-8 text-xs gap-1.5 hidden sm:inline-flex",
                item.is_current && "border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800"
              )}
              disabled={toggleActive.isPending}
              onClick={async () => {
                try {
                  await toggleActive.mutateAsync(item.id);
                  toast.success(
                    item.is_current
                      ? `"${item.version || "Catalogue"}" deactivated`
                      : `"${item.version || "Catalogue"}" activated`
                  );
                } catch {
                  toast.error("Failed to update catalogue status");
                }
              }}
            >
              {toggleActive.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : item.is_current ? (
                <CheckCircle2 size={13} />
              ) : (
                <CheckCircle2 size={13} />
              )}
              {item.is_current ? "Deactivate" : "Activate"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive transition-all duration-200 opacity-0 group-hover:opacity-100"
                  disabled={deleteCatalogue.isPending}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Catalogue</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete{" "}
                    <strong>{item.version || "this catalogue"}</strong>? The PDF
                    file will be permanently removed and cannot be recovered.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      try {
                        await deleteCatalogue.mutateAsync(item.id);
                        toast.success("Catalogue deleted");
                      } catch {
                        toast.error("Failed to delete catalogue");
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function AdminCataloguePage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useCatalogues(page);

  const catalogues = data?.data ?? [];
  const pagination = data?.meta?.pagination;
  const active = catalogues.filter((c) => c.is_current);

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Product Catalogue</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Upload PDF catalogues and set which version is publicly available for download
        </p>
      </div>

      {/* Active status banner */}
      {!isLoading && pagination && (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 flex items-center gap-3 text-sm",
            active.length > 0
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          )}
        >
          <BookOpen size={16} className="shrink-0" />
          {active.length > 0 ? (
            <span>
              {active.length} active on this page — {pagination.total} total catalogue{pagination.total !== 1 ? "s" : ""}
            </span>
          ) : (
            <span>
              No catalogues are active. Upload one and activate it to make it publicly available.
            </span>
          )}
        </div>
      )}

      {/* Upload */}
      <UploadCard />

      {/* List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Uploaded Catalogues
          </p>
          {pagination && (
            <p className="text-xs text-muted-foreground">
              {pagination.total} total
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : catalogues.length === 0 ? (
          <div className="rounded-2xl border bg-card shadow-sm py-16 text-center">
            <FileText
              size={40}
              className="mx-auto mb-3 text-muted-foreground/20"
              strokeWidth={1.5}
            />
            <p className="font-medium text-foreground">No catalogues uploaded yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your first PDF catalogue above to get started.
            </p>
          </div>
        ) : (
          catalogues.map((item) => <CatalogueRow key={item.id} item={item} />)
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={14} />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground flex items-center gap-1.5 min-w-[90px] justify-center">
              {isFetching && <Loader2 size={12} className="animate-spin" />}
              Page {page} of {pagination.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.last_page || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
