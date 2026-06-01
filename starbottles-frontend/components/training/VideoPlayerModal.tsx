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

// Cloudflare Stream iframe embed URLs must be rendered in an <iframe>.
// HLS manifest URLs (*.m3u8) from Cloudflare work fine with ReactPlayer.
function isCloudflareIframe(url: string): boolean {
  return (
    url.includes("iframe.videodelivery.net") ||
    url.includes("cloudflarestream.com/embed") ||
    url.includes("watch.cloudflarestream.com")
  );
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
          {isCloudflareIframe(url) ? (
            <iframe
              src={url}
              className="w-full h-full"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <ReactPlayer src={url} width="100%" height="100%" controls playing />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
