"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Video, Play, Clock } from "lucide-react";
import { useTrainingMaterials } from "@/hooks/useTraining";
import VideoPlayerModal from "@/components/training/VideoPlayerModal";
import { cn } from "@/lib/utils";

const PROGRESS_KEY = "starbottles_learning_progress";

export default function VideosPage() {
  const { data, isLoading } = useTrainingMaterials();
  const [playing, setPlaying] = useState<{ title: string; url: string } | null>(null);

  const videos = data?.videos ?? [];

  useEffect(() => {
    if (videos.length > 0) {
      try {
        const stored = localStorage.getItem(PROGRESS_KEY);
        const progress = stored ? JSON.parse(stored) : {};
        progress.videos = true;
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      } catch {}
    }
  }, [videos.length]);

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">

      {/* Header */}
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2 text-xs">
          <Link href="/learning">
            <ArrowLeft size={14} /> Back to Learning Portal
          </Link>
        </Button>

        <div
          className="rounded-xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, oklch(0.20 0.06 10) 0%, oklch(0.30 0.10 350) 50%, oklch(0.42 0.14 340) 100%)",
          }}
        >
          <div className="px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                <Video size={20} className="text-white/80" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Training Videos</h1>
                <p className="text-xs text-white/40 mt-0.5">Watch guided training content from your team</p>
              </div>
            </div>
            {videos.length > 0 && (
              <span className="text-xs font-semibold text-white/30 hidden sm:block">
                {videos.length} video{videos.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden border shadow-sm">
              <Skeleton className="h-44 w-full rounded-none" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && videos.length === 0 && (
        <Card className="border shadow-sm">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <Video size={28} className="text-muted-foreground/30" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-foreground">No training videos available yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Check back later — your administrator will upload training videos soon.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Video cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((video, i) => (
          <Card
            key={video.id}
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 border overflow-hidden"
            onClick={() => setPlaying({ title: video.title, url: video.video_url ?? video.download_url ?? "" })}
          >
            {/* Video thumbnail area */}
            <div
              className="relative h-44 flex items-center justify-center overflow-hidden"
              style={{
                background: `linear-gradient(135deg,
                  oklch(0.17 0.06 ${(i * 40 + 220) % 360}) 0%,
                  oklch(0.26 0.10 ${(i * 40 + 240) % 360}) 50%,
                  oklch(0.35 0.14 ${(i * 40 + 260) % 360}) 100%)`,
              }}
            >
              {/* Subtle pattern */}
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              {/* Play button */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 group-hover:scale-110 group-hover:border-white/30 transition-all duration-300">
                <Play size={24} className="text-white fill-white ml-1" />
              </div>
            </div>

            <CardContent className="p-5">
              <p className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-foreground transition-colors">
                {video.title}
              </p>
              {video.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  {video.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-1.5">
                <Play size={11} className="text-accent" />
                <span className="text-[11px] font-semibold text-accent uppercase tracking-wide">
                  Watch Now
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {playing && (
        <VideoPlayerModal
          open={!!playing}
          onClose={() => setPlaying(null)}
          title={playing.title}
          url={playing.url}
        />
      )}
    </div>
  );
}
