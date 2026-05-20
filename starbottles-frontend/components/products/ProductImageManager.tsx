"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Trash2, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useProductImages,
  useUploadProductImages,
  useDeleteProductImage,
} from "@/hooks/useProductAdmin";
import type { ProductImageSet } from "@/hooks/useProducts";

interface Props {
  productId: number;
  erpId: string;
}

export default function ProductImageManager({ productId, erpId }: Props) {
  const { data: images = [], isLoading } = useProductImages(productId);
  const upload = useUploadProductImages();
  const remove = useDeleteProductImage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const maxImages = 4;
  const canUpload = images.length < maxImages;

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const arr = Array.from(files).slice(0, maxImages - images.length);
    if (arr.length === 0) return;
    upload.mutate({ productId, files: arr });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={18} />
        Loading images...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Product Images ({images.length}/{maxImages})
        </h3>
        <p className="text-xs text-muted-foreground">ERP ID: {erpId}</p>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img: ProductImageSet, i: number) => (
            <div
              key={i}
              className="group relative aspect-square rounded-xl overflow-hidden border bg-muted"
            >
              <Image
                src={img.card}
                alt={`Image ${i + 1}`}
                fill
                className="object-cover"
                sizes="200px"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button
                onClick={() => remove.mutate({ productId, index: i + 1 })}
                disabled={remove.isPending}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                title="Delete image"
              >
                {remove.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
              <span className="absolute bottom-2 left-2 text-[11px] font-bold text-white bg-black/40 px-2 py-0.5 rounded-full">
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {canUpload && (
        <div
          className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/20 hover:border-muted-foreground/40"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {upload.isPending ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 size={24} className="animate-spin" />
              <p className="text-sm font-medium">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImagePlus size={24} />
              <p className="text-sm font-medium">
                Drop images here or click to browse
              </p>
              <p className="text-xs">
                Max {maxImages - images.length} more image(s). JPG, PNG, WebP up to 10MB each.
              </p>
            </div>
          )}
        </div>
      )}

      {upload.isError && (
        <p className="text-sm text-red-500">
          Upload failed. Please try again.
        </p>
      )}
    </div>
  );
}
