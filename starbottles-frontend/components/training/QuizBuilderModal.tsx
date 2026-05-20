"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Plus, CheckCircle2, Loader2, GripVertical } from "lucide-react";
import { useCreateQuiz } from "@/hooks/useQuiz";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  passing_score: z.number().min(0).max(100),
  questions: z
    .array(
      z.object({
        question_text: z.string().min(1, "Question text is required"),
        options: z.tuple([
          z.string().min(1),
          z.string().min(1),
          z.string().min(1),
          z.string().min(1),
        ]),
        correct_option: z.number().min(0).max(3),
      })
    )
    .min(1, "At least one question required"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function QuizBuilderModal({ open, onClose }: Props) {
  const createQuiz = useCreateQuiz();
  const [passingScore, setPassingScore] = useState(70);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      passing_score: 70,
      questions: [
        {
          question_text: "",
          options: ["", "", "", ""],
          correct_option: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createQuiz.mutateAsync(data);
      toast.success("Quiz created successfully");
      reset();
      setPassingScore(70);
      onClose();
    } catch {
      toast.error("Failed to create quiz");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
          <DialogDescription>
            Build a knowledge assessment for your trainees. Add questions and mark the correct answer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Quiz title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-medium">Quiz Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g. Product Knowledge Test"
              className="bg-background"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Passing score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Passing Score</Label>
              <Badge variant="outline" className="text-xs font-bold tabular-nums px-2.5">
                {passingScore}%
              </Badge>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[passingScore]}
              onValueChange={([v]) => {
                setPassingScore(v);
                setValue("passing_score", v);
              }}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/60 px-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Questions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{fields.length} question{fields.length !== 1 ? "s" : ""} added</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() =>
                  append({ question_text: "", options: ["", "", "", ""], correct_option: 0 })
                }
              >
                <Plus size={13} /> Add Question
              </Button>
            </div>

            {fields.map((field, qi) => {
              const correctOption = watch(`questions.${qi}.correct_option`);
              return (
                <div
                  key={field.id}
                  className="rounded-xl border bg-card p-5 space-y-4 relative"
                >
                  {/* Question header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{qi + 1}</span>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Question {qi + 1}</span>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(qi)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    )}
                  </div>

                  {/* Question text */}
                  <Input
                    {...register(`questions.${qi}.question_text`)}
                    placeholder="Enter your question"
                    className="bg-background font-medium"
                  />

                  {/* Options */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Options — select the correct answer
                    </p>
                    <RadioGroup
                      value={String(correctOption)}
                      onValueChange={(v) =>
                        setValue(`questions.${qi}.correct_option`, parseInt(v))
                      }
                      className="space-y-2"
                    >
                      {[0, 1, 2, 3].map((oi) => {
                        const isCorrect = correctOption === oi;
                        return (
                          <div
                            key={oi}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg border p-2.5 transition-all duration-200",
                              isCorrect
                                ? "border-emerald-300 bg-emerald-50/50"
                                : "border-border/60"
                            )}
                          >
                            <RadioGroupItem value={String(oi)} id={`q${qi}-o${oi}`} />
                            <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <Input
                              {...register(`questions.${qi}.options.${oi}` as `questions.${number}.options.${0 | 1 | 2 | 3}`)}
                              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                              className={cn(
                                "h-8 text-sm border-0 bg-transparent shadow-none focus-visible:ring-0 px-0",
                                isCorrect && "font-medium"
                              )}
                            />
                            {isCorrect && (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[9px] font-semibold shrink-0 gap-0.5">
                                <CheckCircle2 size={9} /> Correct
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createQuiz.isPending} className="gap-1.5">
              {createQuiz.isPending && <Loader2 size={14} className="animate-spin" />}
              {createQuiz.isPending ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
