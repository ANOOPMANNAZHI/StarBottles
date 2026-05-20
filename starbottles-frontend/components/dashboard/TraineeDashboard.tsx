"use client";

import Link from "next/link";
import {
  BookOpen, ClipboardList, CheckCircle2, XCircle,
  ArrowRight, Activity, Video, FileText, Building2, Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyQuizzes } from "@/hooks/useQuiz";
import { useTrainingMaterials } from "@/hooks/useTraining";
import { cn } from "@/lib/utils";

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  isLoading: boolean;
  accent: string;
}) {
  return (
    <Card className="relative overflow-hidden border shadow-sm">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", accent)} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {title}
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {value}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/40">
            <Icon size={16} className="text-muted-foreground" strokeWidth={1.75} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TraineeDashboard({ userName }: { userName: string }) {
  const { data: quizzes = [], isLoading: quizLoading } = useMyQuizzes();
  const { data: materials, isLoading: materialsLoading } = useTrainingMaterials();

  const totalQuizzes = quizzes.length;
  const passedQuizzes = quizzes.filter((q) => q.passed).length;
  const pendingQuizzes = quizzes.filter((q) => !q.attempted || q.retake_approved).length;
  const failedQuizzes = quizzes.filter((q) => q.attempted && !q.passed && !q.retake_approved).length;

  const videoCount = materials?.videos?.length ?? 0;
  const pdfCount = materials?.pdfs?.length ?? 0;
  const docCount = materials?.documents?.length ?? 0;
  const totalMaterials = videoCount + pdfCount + docCount;

  const isLoading = quizLoading || materialsLoading;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="p-5 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[oklch(0.22_0.04_160)] to-[oklch(0.18_0.06_180)] p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.06]">
          <svg viewBox="0 0 200 200" fill="currentColor">
            {Array.from({ length: 100 }).map((_, i) => (
              <circle key={i} cx={(i % 10) * 20 + 10} cy={Math.floor(i / 10) * 20 + 10} r="2" />
            ))}
          </svg>
        </div>
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50 mb-1">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {greeting}, {userName}
              </h1>
              <p className="text-sm text-white/60 mt-1">
                Keep learning and growing. Here&apos;s your progress.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/learning"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-sm font-medium transition-all duration-200"
              >
                <BookOpen size={15} />
                Learning Hub
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Quizzes"
          value={totalQuizzes}
          icon={ClipboardList}
          isLoading={quizLoading}
          accent="bg-gradient-to-r from-blue-500 to-blue-400"
        />
        <StatCard
          title="Passed"
          value={passedQuizzes}
          icon={CheckCircle2}
          isLoading={quizLoading}
          accent="bg-gradient-to-r from-emerald-500 to-emerald-400"
        />
        <StatCard
          title="Pending"
          value={pendingQuizzes}
          icon={Activity}
          isLoading={quizLoading}
          accent="bg-gradient-to-r from-amber-500 to-amber-400"
        />
        <StatCard
          title="Learning Materials"
          value={totalMaterials}
          icon={BookOpen}
          isLoading={materialsLoading}
          accent="bg-gradient-to-r from-purple-500 to-purple-400"
        />
      </div>

      {/* Two-column: Quizzes + Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Trophy size={14} />
              My Quizzes
            </h2>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors duration-200"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <Card className="border shadow-sm overflow-hidden">
            {quizLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-md" />
                ))}
              </div>
            ) : quizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <ClipboardList size={20} className="text-blue-400" />
                </div>
                <p className="text-sm font-medium text-foreground">No quizzes assigned</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your quizzes will appear here once assigned.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {quizzes.slice(0, 6).map((q) => {
                  const canTake = !q.attempted || q.retake_approved;
                  return (
                    <Link
                      key={q.id}
                      href={canTake ? `/quiz/${q.id}` : "/quiz"}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors duration-150"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {q.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {q.questions_count} questions · Pass: {q.passing_score}%
                        </p>
                      </div>
                      <div className="shrink-0 ml-3">
                        {!q.attempted ? (
                          <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-600 border-blue-200/60">
                            Pending
                          </Badge>
                        ) : q.passed ? (
                          <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-600 border-emerald-200/60">
                            <CheckCircle2 size={10} className="mr-1" />
                            {q.score}% Passed
                          </Badge>
                        ) : q.retake_approved ? (
                          <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 bg-amber-50 text-amber-600 border-amber-200/60">
                            Retake
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 bg-red-50 text-red-600 border-red-200/60">
                            <XCircle size={10} className="mr-1" />
                            {q.score}% Failed
                          </Badge>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Learning materials */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen size={14} />
              Learning Materials
            </h2>
            <Link
              href="/learning"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors duration-200"
            >
              Browse all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/learning/videos">
              <Card className="border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <Video size={18} className="text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Training Videos</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {materialsLoading ? "..." : `${videoCount} video${videoCount !== 1 ? "s" : ""} available`}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/learning/downloads">
              <Card className="border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">PDFs & Documents</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {materialsLoading ? "..." : `${pdfCount + docCount} file${pdfCount + docCount !== 1 ? "s" : ""} available`}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/learning/company">
              <Card className="border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-purple-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Company Information</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Learn about the company
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
