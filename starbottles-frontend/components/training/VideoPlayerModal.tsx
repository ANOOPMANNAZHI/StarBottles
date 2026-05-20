"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactPlayer from "react-player";

interface VideoPlayerModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export default function VideoPlayerModal({
  open,
  onClose,
  title,
  url,
}: VideoPlayerModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full bg-black">
          <ReactPlayer src={url} width="100%" height="100%" controls playing />
        </div>
      </DialogContent>
    </Dialog>
  );
}
