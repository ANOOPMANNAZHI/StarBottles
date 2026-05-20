"use client";

import { useState } from "react";
import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2, XCircle, ArrowLeft, ArrowRight, HelpCircle,
  Target, Trophy, AlertTriangle, ClipboardList, Sparkles, Eye,
} from "lucide-react";
import { useQuiz, useSubmitQuizAttempt, QuizAttemptResult } from "@/hooks/useQuiz";
import { cn } from "@/lib/utils";

type Stage = "not-started" | "in-progress" | "results";

export default function QuizTakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const quizId = parseInt(id);

  const { data: quiz, isLoading } = useQuiz(quizId);
  const submitAttempt = useSubmitQuizAttempt(quizId);

  const [stage, setStage] = useState<Stage>("not-started");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-5 lg:px-8 py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto px-5 lg:px-8 py-8">
        <Card className="border shadow-sm">
          <CardContent className="py-16 text-center">
            <ClipboardList size={36} className="mx-auto mb-3 text-muted-foreground/20" />
            <p className="font-medium text-foreground">Quiz not found</p>
            <p className="text-sm text-muted-foreground mt-1">This quiz may not exist or you may not be assigned to it.</p>
            <Button asChild size="sm" className="mt-4" variant="outline">
              <Link href="/quiz">Back to Tests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questions = quiz.questions;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    setConfirmOpen(false);
    const answersArray = questions.map((_, i) => answers[i] ?? 0);
    try {
      const res = await submitAttempt.mutateAsync(answersArray);
      setResult(res);
      setStage("results");
    } catch {
      // handled
    }
  };

  // ── Not started ──────────────────────────────────────────────────────────
  if (stage === "not-started") {
    return (
      <div className="max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2 text-xs">
          <Link href="/quiz">
            <ArrowLeft size={14} /> Back to Tests
          </Link>
        </Button>

        {/* Hero card */}
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, oklch(0.17 0.08 270) 0%, oklch(0.28 0.12 270) 45%, oklch(0.42 0.18 240) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative px-8 py-12 text-center space-y-7">
            <Badge
              variant="outline"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50 border-white/15 bg-white/5 px-3"
            >
              <ClipboardList size={11} className="mr-1.5" />
              Knowledge Assessment
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight text-white">{quiz.title}</h1>

            {/* Stats */}
            <div className="flex justify-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/8 border border-white/10 px-4 py-2.5">
                <HelpCircle size={15} className="text-white/50" />
                <span className="text-sm font-semibold text-white">{totalQuestions} Questions</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/8 border border-white/10 px-4 py-2.5">
                <Target size={15} className="text-white/50" />
                <span className="text-sm font-semibold text-white">Pass at {quiz.passing_score}%</span>
              </div>
            </div>

            <p className="text-sm text-white/40 max-w-sm mx-auto leading-relaxed">
              Answer all questions in order. You cannot go back once you move to the next question.
            </p>

            <Button
              size="lg"
              onClick={() => setStage("in-progress")}
              className="font-bold text-base px-10 bg-white hover:bg-white/90 transition-all duration-200 shadow-lg gap-2"
              style={{ color: "oklch(0.24 0.10 252)" }}
            >
              Begin Quiz
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────
  if (stage === "results" && result) {
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (result.score / 100) * circumference;

    return (
      <div className="max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">
        <Card
          className={cn(
            "border shadow-sm overflow-hidden",
            result.passed ? "border-emerald-200" : "border-red-200"
          )}
        >
          {/* Top accent */}
          <div className={cn(
            "h-1.5",
            result.passed
              ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
              : "bg-gradient-to-r from-red-400 to-red-500"
          )} />

          <CardContent className="px-8 py-10 text-center space-y-6">
            {/* Score ring */}
            <div className="flex justify-center">
              <div className="relative w-40 h-40">
                <svg width="160" height="160" viewBox="0 0 160 160" className="rotate-[-90deg]">
                  <circle
                    cx="80" cy="80" r="54"
                    fill="none"
                    stroke={result.passed ? "#d1fae5" : "#fecaca"}
                    strokeWidth="10"
                  />
                  <circle
                    cx="80" cy="80" r="54"
                    fill="none"
                    stroke={result.passed ? "#10b981" : "#ef4444"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn(
                    "text-4xl font-bold tabular-nums",
                    result.passed ? "text-emerald-600" : "text-red-600"
                  )}>
                    {result.score}%
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mt-0.5">
                    Score
                  </span>
                </div>
              </div>
            </div>

            {result.passed ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Trophy size={20} className="text-emerald-600" />
                  </div>
                </div>
                <p className="text-xl font-bold text-foreground">Congratulations! You passed!</p>
                <p className="text-sm text-muted-foreground">
                  You answered <span className="font-semibold text-foreground">{result.correct_count}</span> of{" "}
                  <span className="font-semibold text-foreground">{result.total_count}</span> questions correctly.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-red-600" />
                  </div>
                </div>
                <p className="text-xl font-bold text-foreground">Not quite there yet</p>
                <p className="text-sm text-muted-foreground">
                  You scored <span className="font-semibold text-foreground">{result.score}%</span>, but{" "}
                  <span className="font-semibold text-foreground">{result.passing_score}%</span> is required to pass.
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Contact your administrator for a retake.
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" variant="outline" className="font-semibold gap-2">
                <Link href={`/quiz/${id}/review`}>
                  <Eye size={15} />
                  View Details
                </Link>
              </Button>
              <Button asChild size="lg" className="font-semibold gap-2 shadow-sm">
                <Link href="/learning">
                  <ArrowLeft size={15} />
                  Back to Learning
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── In progress ──────────────────────────────────────────────────────────
  const progressPct = ((currentIndex + 1) / totalQuestions) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-5">

      {/* Progress header */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-semibold tabular-nums px-2.5">
                {currentIndex + 1} / {totalQuestions}
              </Badge>
              <span className="text-xs text-muted-foreground">questions</span>
            </div>
            <span className="text-xs font-semibold text-muted-foreground tabular-nums">
              {Math.round(progressPct)}% complete
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, oklch(0.24 0.10 252) 0%, oklch(0.58 0.20 218) 100%)",
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Question card */}
      <Card className="border shadow-md">
        <CardContent className="p-6 space-y-5">
          <h2 className="text-lg font-semibold leading-relaxed text-foreground">
            {currentQuestion.question_text}
          </h2>

          <div className="space-y-2.5">
            {currentQuestion.options.map((option, oi) => {
              const isSelected = answers[currentIndex] === oi;
              return (
                <button
                  key={oi}
                  onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: oi }))}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group",
                    isSelected
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-border/60 bg-card hover:border-muted-foreground/30 hover:bg-muted/20 text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold shrink-0 transition-all duration-200",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-muted/60 text-muted-foreground group-hover:bg-muted"
                    )}
                  >
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="font-medium text-sm leading-snug">{option}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end">
        {currentIndex < totalQuestions - 1 ? (
          <Button
            disabled={answers[currentIndex] === undefined}
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="gap-2 font-semibold shadow-sm disabled:opacity-40"
          >
            Next Question
            <ArrowRight size={15} />
          </Button>
        ) : (
          <Button
            disabled={answers[currentIndex] === undefined || submitAttempt.isPending}
            onClick={() => setConfirmOpen(true)}
            className="gap-2 font-semibold shadow-sm disabled:opacity-40"
          >
            {submitAttempt.isPending ? "Submitting..." : "Submit Quiz"}
            <CheckCircle2 size={15} />
          </Button>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit your answers?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered all {totalQuestions} questions. Once submitted, you cannot change
              your answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={submitAttempt.isPending}>
              {submitAttempt.isPending ? "Submitting..." : "Submit Quiz"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
