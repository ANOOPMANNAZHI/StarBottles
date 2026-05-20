"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, Circle, BookOpen, Video, Download, ClipboardList,
  ArrowRight, Sparkles, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const PROGRESS_KEY = "starbottles_learning_progress";

const STEPS = [
  { id: "company", label: "Company" },
  { id: "videos", label: "Videos" },
  { id: "downloads", label: "Resources" },
  { id: "quiz", label: "Assessment" },
];

const NAV_CARDS = [
  {
    id: "company",
    icon: BookOpen,
    label: "Company Introduction",
    description: "Learn about StarBottles — our history, values, and what makes us different.",
    href: "/learning/company",
    gradient: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    color: "text-blue-600",
    duration: "5 min read",
  },
  {
    id: "videos",
    icon: Video,
    label: "Training Videos",
    description: "Watch guided product and process training videos from our team.",
    href: "/learning/videos",
    gradient: "from-rose-500 to-rose-600",
    bgLight: "bg-rose-50",
    color: "text-rose-600",
    duration: "Video library",
  },
  {
    id: "downloads",
    icon: Download,
    label: "Resources & Downloads",
    description: "Download PDFs, reference guides, and documentation for offline use.",
    href: "/learning/downloads",
    gradient: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50",
    color: "text-emerald-600",
    duration: "Download library",
  },
];

export default function LearningPage() {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const { data: session } = useSession();
  const userName = (session?.user as { name?: string } | undefined)?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_KEY);
      if (stored) setProgress(JSON.parse(stored));
    } catch {}
  }, []);

  const completedCount = STEPS.filter((s) => progress[s.id]).length;
  const progressPct = Math.round((completedCount / STEPS.length) * 100);
  const allDone = completedCount === STEPS.length;

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-7">

      {/* Hero banner */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, oklch(0.17 0.06 252) 0%, oklch(0.26 0.10 252) 40%, oklch(0.42 0.18 228) 100%)",
        }}
      >
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative px-7 py-8 lg:px-10 lg:py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3">
            <Badge
              variant="outline"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50 border-white/15 bg-white/5 px-2.5"
            >
              <GraduationCap size={11} className="mr-1.5" />
              Onboarding Program
            </Badge>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Welcome, {userName}
            </h1>
            <p className="text-sm text-white/50 max-w-md leading-relaxed">
              Complete each learning module below to prepare for your knowledge assessment and finish onboarding.
            </p>
          </div>

          {/* Circular progress indicator */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative w-24 h-24">
              <svg width="96" height="96" viewBox="0 0 96 96" className="rotate-[-90deg]">
                <circle cx="48" cy="48" r="38" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="6" />
                <circle
                  cx="48" cy="48" r="38" fill="none"
                  stroke="oklch(0.72 0.18 218)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 - (progressPct / 100) * 2 * Math.PI * 38}
                  style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white tabular-nums">{progressPct}%</span>
              </div>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
              {completedCount}/{STEPS.length} Complete
            </p>
          </div>
        </div>
      </div>

      {/* Progress stepper */}
      <Card className="border shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.12em]">Your Progress</p>
            {allDone && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold gap-1">
                <Sparkles size={10} /> All Complete
              </Badge>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-muted/60 overflow-hidden mb-5">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPct}%`,
                background: allDone
                  ? "linear-gradient(90deg, oklch(0.64 0.19 162) 0%, oklch(0.72 0.18 150) 100%)"
                  : "linear-gradient(90deg, oklch(0.24 0.10 252) 0%, oklch(0.58 0.20 218) 100%)",
              }}
            />
          </div>

          {/* Step indicators */}
          <div className="relative flex items-start justify-between">
            {/* Connecting line */}
            <div className="absolute left-[20px] right-[20px] top-[14px] h-[2px] bg-border/60" />

            {STEPS.map((step, i) => {
              const done = !!progress[step.id];
              const isActive = !done && completedCount === i;
              return (
                <div key={step.id} className="relative flex flex-col items-center gap-2 z-10 flex-1">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      done
                        ? "border-emerald-500 bg-emerald-500"
                        : isActive
                        ? "border-accent bg-card shadow-md shadow-accent/20"
                        : "border-border/60 bg-card"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 size={14} className="text-white" />
                    ) : isActive ? (
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide text-center leading-tight",
                      done ? "text-emerald-600" : isActive ? "text-foreground" : "text-muted-foreground/50"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quiz CTA - shows when ready */}
      {progress.downloads && !progress.quiz && (
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: "linear-gradient(90deg, oklch(0.24 0.10 252) 0%, oklch(0.42 0.18 228) 60%, oklch(0.58 0.20 218) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative p-6 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                <ClipboardList size={22} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Ready for your assessment</p>
                <p className="text-sm text-white/50 mt-0.5">Complete the knowledge test to finish your onboarding program.</p>
              </div>
            </div>
            <Button
              asChild
              className="shrink-0 bg-white font-semibold hover:bg-white/90 transition-colors shadow-lg gap-1.5"
              style={{ color: "oklch(0.24 0.10 252)" }}
            >
              <Link href="/quiz">
                Take Assessment
                <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Learning modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Learning Modules</h2>
          <p className="text-xs text-muted-foreground">{completedCount} of {NAV_CARDS.length} completed</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NAV_CARDS.map((card, index) => {
            const Icon = card.icon;
            const done = !!progress[card.id];
            const isNext = !done && STEPS.findIndex((s) => s.id === card.id) === completedCount;

            return (
              <Link key={card.id} href={card.href}>
                <Card className={cn(
                  "group relative h-full cursor-pointer transition-all duration-300 overflow-hidden border",
                  done
                    ? "border-emerald-200/60 bg-emerald-50/30 hover:shadow-md"
                    : isNext
                    ? "border-accent/30 shadow-md shadow-accent/5 hover:shadow-lg"
                    : "border-border/60 hover:shadow-md hover:border-border"
                )}>
                  {/* Top accent bar */}
                  <div className={cn(
                    "h-1 w-full",
                    done
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                      : isNext
                      ? "bg-gradient-to-r from-accent to-[oklch(0.48_0.18_228)]"
                      : "bg-transparent"
                  )} />

                  {/* Completed badge */}
                  {done && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                        <CheckCircle2 size={14} className="text-white" />
                      </div>
                    </div>
                  )}

                  {/* "Up next" badge */}
                  {isNext && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] font-semibold gap-1">
                        <Sparkles size={9} /> Up Next
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-5 pt-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                        done ? "bg-emerald-100" : card.bgLight,
                        "group-hover:scale-105"
                      )}>
                        <Icon size={20} className={done ? "text-emerald-600" : card.color} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <p className="font-semibold text-sm text-foreground">{card.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {card.description}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          {done ? (
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
                              Completed
                            </span>
                          ) : (
                            <>
                              <span className="text-[10px] font-medium text-muted-foreground/60">{card.duration}</span>
                              <ArrowRight size={10} className="text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
