"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, ClipboardList, HelpCircle, Target, CheckCircle2, XCircle, RotateCcw, Eye } from "lucide-react";
import { useMyQuizzes, type MyQuizItem } from "@/hooks/useQuiz";
import { cn } from "@/lib/utils";

export default function QuizListPage() {
  const { data: quizzes = [], isLoading } = useMyQuizzes();

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">

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
            background: "linear-gradient(135deg, oklch(0.18 0.08 270) 0%, oklch(0.28 0.12 270) 50%, oklch(0.40 0.16 260) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                <ClipboardList size={20} className="text-white/80" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Knowledge Tests</h1>
                <p className="text-xs text-white/40 mt-0.5">Complete your assessments to finish onboarding</p>
              </div>
            </div>
            {quizzes.length > 0 && (
              <span className="text-xs font-semibold text-white/30 hidden sm:block">
                {quizzes.length} test{quizzes.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && quizzes.length === 0 && (
        <Card className="border shadow-sm">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={28} className="text-muted-foreground/30" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-foreground">No quizzes assigned yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Your administrator will assign knowledge tests when you are ready.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quiz cards */}
      <div className="space-y-3">
        {quizzes.map((quiz) => {
          const canRetake = quiz.attempted && !quiz.passed && quiz.retake_approved;
          const canStart = !quiz.attempted || canRetake;

          return (
            <Card
              key={quiz.id}
              className="group border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Top accent */}
              <div className={cn(
                "h-1 bg-gradient-to-r",
                quiz.attempted && quiz.passed
                  ? "from-emerald-400 to-emerald-500"
                  : quiz.attempted && !quiz.passed
                    ? "from-red-400 to-red-500"
                    : "from-[oklch(0.56_0.22_270)] to-[oklch(0.58_0.20_218)]"
              )} />

              <CardContent className="p-5">
                <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                  <div className="flex items-start gap-4">
                    {/* Quiz icon */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[oklch(0.56_0.22_270)]/10 to-[oklch(0.56_0.22_270)]/5 flex items-center justify-center shrink-0">
                      <ClipboardList size={18} className="text-[oklch(0.44_0.20_270)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{quiz.title}</p>
                      {/* Stats */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <HelpCircle size={12} />
                          {quiz.questions_count} questions
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <Target size={12} />
                          Pass at {quiz.passing_score}%
                        </span>
                        {quiz.attempted && (
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium",
                            quiz.passed
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          )}>
                            {quiz.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {quiz.passed ? `Passed (${quiz.score}%)` : `Failed (${quiz.score}%)`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {quiz.attempted && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                      >
                        <Link href={`/quiz/${quiz.id}/review`}>
                          <Eye size={13} /> View Details
                        </Link>
                      </Button>
                    )}
                    {canStart ? (
                      <Button
                        asChild
                        size="sm"
                        className="gap-1.5 shadow-sm font-semibold"
                      >
                        <Link href={`/quiz/${quiz.id}`}>
                          {canRetake ? <><RotateCcw size={14} /> Retake</> : <>Start Quiz <ArrowRight size={14} /></>}
                        </Link>
                      </Button>
                    ) : quiz.attempted && !quiz.passed ? (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Awaiting retake approval
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
