"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, CheckCircle2, XCircle, Trophy, AlertTriangle,
  ClipboardList, Target, HelpCircle,
} from "lucide-react";
import { useQuizReview, type QuizReviewQuestion } from "@/hooks/useQuiz";
import { cn } from "@/lib/utils";

export default function QuizReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const quizId = parseInt(id);
  const { data: review, isLoading } = useQuizReview(quizId);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-8">
        <Card className="border shadow-sm">
          <CardContent className="py-16 text-center">
            <ClipboardList size={36} className="mx-auto mb-3 text-muted-foreground/20" />
            <p className="font-medium text-foreground">Review not available</p>
            <p className="text-sm text-muted-foreground mt-1">
              You may not have attempted this quiz yet, or it may not be assigned to you.
            </p>
            <Button asChild size="sm" className="mt-4" variant="outline">
              <Link href="/quiz">Back to Tests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const correctCount = review.correct_count;
  const wrongCount = review.total_count - correctCount;

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">
      <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2 text-xs">
        <Link href="/quiz">
          <ArrowLeft size={14} /> Back to Tests
        </Link>
      </Button>

      {/* Summary card */}
      <Card className={cn(
        "border shadow-sm overflow-hidden",
        review.passed ? "border-emerald-200" : "border-red-200"
      )}>
        <div className={cn(
          "h-1.5",
          review.passed
            ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
            : "bg-gradient-to-r from-red-400 to-red-500"
        )} />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-foreground">{review.title}</h1>
              <p className="text-sm text-muted-foreground">Quiz Review — Detailed Answers</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {review.passed ? (
                  <Trophy size={20} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={20} className="text-red-500" />
                )}
                <span className={cn(
                  "text-2xl font-bold tabular-nums",
                  review.passed ? "text-emerald-600" : "text-red-600"
                )}>
                  {review.score}%
                </span>
              </div>
              <Badge variant={review.passed ? "default" : "destructive"} className="text-xs">
                {review.passed ? "Passed" : "Failed"}
              </Badge>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5">
              <HelpCircle size={13} />
              {review.total_count} Questions
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5">
              <Target size={13} />
              Pass at {review.passing_score}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-1.5">
              <CheckCircle2 size={13} />
              {correctCount} Correct
            </div>
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
              <XCircle size={13} />
              {wrongCount} Wrong
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {review.questions.map((q: QuizReviewQuestion, index: number) => (
          <Card
            key={q.id}
            className={cn(
              "border shadow-sm overflow-hidden",
              q.is_correct ? "border-emerald-100" : "border-red-100"
            )}
          >
            <div className={cn(
              "h-0.5",
              q.is_correct ? "bg-emerald-400" : "bg-red-400"
            )} />
            <CardContent className="p-5 space-y-3">
              {/* Question header */}
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  q.is_correct ? "bg-emerald-100" : "bg-red-100"
                )}>
                  {q.is_correct ? (
                    <CheckCircle2 size={15} className="text-emerald-600" />
                  ) : (
                    <XCircle size={15} className="text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Question {index + 1}
                  </p>
                  <p className="font-medium text-foreground leading-relaxed">
                    {q.question_text}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 pl-10">
                {q.options.map((option, oi) => {
                  const isCorrect = oi === q.correct_option;
                  const isMarked = oi === q.marked_option;
                  const isWrongMarked = isMarked && !isCorrect;

                  return (
                    <div
                      key={oi}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-sm",
                        isCorrect
                          ? "border-emerald-200 bg-emerald-50"
                          : isWrongMarked
                          ? "border-red-200 bg-red-50"
                          : "border-border/40 bg-card"
                      )}
                    >
                      <span className={cn(
                        "inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold shrink-0",
                        isCorrect
                          ? "bg-emerald-200 text-emerald-700"
                          : isWrongMarked
                          ? "bg-red-200 text-red-700"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className={cn(
                        "flex-1",
                        isCorrect ? "text-emerald-800 font-medium" : isWrongMarked ? "text-red-800" : "text-foreground/70"
                      )}>
                        {option}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCorrect && (
                          <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 bg-emerald-50 gap-1">
                            <CheckCircle2 size={10} /> Correct
                          </Badge>
                        )}
                        {isMarked && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] gap-1",
                              isCorrect
                                ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                                : "border-red-300 text-red-700 bg-red-50"
                            )}
                          >
                            Your Answer
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="flex justify-center pt-2 pb-4">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/quiz">
            <ArrowLeft size={14} /> Back to Tests
          </Link>
        </Button>
      </div>
    </div>
  );
}
