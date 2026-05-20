"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMedia, useUploadMedia, type MediaItem } from "@/hooks/useCms";
import { Upload, Check, Loader2 } from "lucide-react";

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
  const { data: media, isLoading } = useMedia("image");
  const upload = useUploadMedia();
  const [selected, setSelected] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;
      const result = await upload.mutateAsync(files);
      if (result.length) {
        setSelected(result[0].url);
      }
      e.target.value = "";
    },
    [upload]
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 mb-4">
          <label className="cursor-pointer">
            <Input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              <Upload size={16} /> Upload
            </span>
          </label>
          {upload.isPending && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {(media ?? []).map((item: MediaItem) => (
              <button
                key={item.id}
                onClick={() => setSelected(item.url)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  selected === item.url ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
                }`}
              >
                <img src={item.url} alt={item.alt_text ?? item.filename} className="w-full h-full object-cover" />
                {selected === item.url && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check size={24} className="text-primary" />
                  </div>
                )}
              </button>
            ))}
            {(media ?? []).length === 0 && (
              <p className="col-span-4 text-center text-muted-foreground py-8">No images yet. Upload one above.</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!selected}
            onClick={() => {
              if (selected) {
                onSelect(selected);
                onClose();
              }
            }}
          >
            Select
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
