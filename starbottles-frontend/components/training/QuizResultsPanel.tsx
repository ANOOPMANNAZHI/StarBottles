"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useApproveRetake, useQuizResults } from "@/hooks/useQuiz";
import { format } from "date-fns";
import { toast } from "sonner";
import { Trophy, Target, BarChart2, RotateCcw, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  quizId: number;
  quizTitle: string;
}

export default function QuizResultsPanel({ quizId, quizTitle }: Props) {
  const { data, isLoading } = useQuizResults(quizId);
  const approveRetake = useApproveRetake();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const { summary, data: rows } = data;

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-base">{quizTitle}</h3>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-2">
              <Users size={15} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold tracking-tight tabular-nums">{summary.total_attempts}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mt-0.5">Attempts</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-2">
              <Trophy size={15} className="text-emerald-500" />
            </div>
            <p className={cn(
              "text-2xl font-bold tracking-tight tabular-nums",
              summary.pass_rate >= 70 ? "text-emerald-600" : "text-red-600"
            )}>
              {summary.pass_rate}%
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mt-0.5">Pass Rate</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center mx-auto mb-2">
              <Target size={15} className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold tracking-tight tabular-nums">{summary.average_score}%</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mt-0.5">Avg Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Results table */}
      {rows.length === 0 ? (
        <div className="rounded-xl border bg-muted/20 py-10 text-center">
          <BarChart2 size={28} className="mx-auto mb-2 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">No attempts yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground h-9">Trainee</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground h-9 text-center">Score</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground h-9 text-center">Status</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground h-9">Date</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground h-9 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/10">
                  <TableCell className="font-medium text-sm py-3">{row.trainee_name}</TableCell>
                  <TableCell className="text-center py-3">
                    <span className={cn(
                      "font-semibold text-sm tabular-nums",
                      row.passed ? "text-emerald-600" : "text-red-600"
                    )}>
                      {row.score}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold",
                        row.passed
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      )}
                    >
                      {row.passed ? "Passed" : "Failed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs py-3 tabular-nums">
                    {format(new Date(row.attempted_at), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right py-3">
                    {!row.passed && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1.5 h-7"
                        disabled={approveRetake.isPending}
                        onClick={async () => {
                          try {
                            await approveRetake.mutateAsync(row.id);
                            toast.success("Retake approved");
                          } catch {
                            toast.error("Failed to approve retake");
                          }
                        }}
                      >
                        <RotateCcw size={11} />
                        Approve Retake
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
