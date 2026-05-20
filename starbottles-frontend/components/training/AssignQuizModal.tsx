"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUsers } from "@/hooks/useUsers";
import { useAssignQuiz } from "@/hooks/useQuiz";
import { toast } from "sonner";
import { Users, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  quizId: number;
  quizTitle: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AssignQuizModal({ open, onClose, quizId, quizTitle }: Props) {
  const { data: usersData } = useUsers();
  const assignQuiz = useAssignQuiz(quizId);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const trainees = usersData?.data?.filter((u: { role: string }) => u.role === "trainee") ?? [];

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === trainees.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(trainees.map((t: { id: number }) => t.id)));
    }
  };

  const handleAssign = async () => {
    if (selected.size === 0) return;
    try {
      const result = await assignQuiz.mutateAsync(Array.from(selected));
      toast.success(result.message ?? "Quiz assigned successfully");
      setSelected(new Set());
      onClose();
    } catch {
      toast.error("Failed to assign quiz");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={16} className="text-muted-foreground" />
            Assign Quiz
          </DialogTitle>
          <DialogDescription>
            Select trainees to assign &ldquo;{quizTitle}&rdquo; to.
          </DialogDescription>
        </DialogHeader>

        {/* Select all */}
        {trainees.length > 0 && (
          <div className="flex items-center justify-between pb-2 border-b">
            <button
              onClick={selectAll}
              className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
            >
              {selected.size === trainees.length ? "Deselect All" : "Select All"}
            </button>
            <span className="text-xs text-muted-foreground">
              {selected.size} selected
            </span>
          </div>
        )}

        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 -mr-1">
          {trainees.length === 0 && (
            <div className="py-8 text-center">
              <Users size={28} className="mx-auto mb-2 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No trainees found.</p>
            </div>
          )}
          {trainees.map((trainee: { id: number; name: string }) => {
            const isSelected = selected.has(trainee.id);
            return (
              <label
                key={trainee.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
                  isSelected
                    ? "bg-accent/5 border border-accent/20"
                    : "border border-transparent hover:bg-muted/30"
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggle(trainee.id)}
                />
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[9px] font-bold bg-muted text-muted-foreground">
                    {getInitials(trainee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 font-medium text-sm">{trainee.name}</span>
                {isSelected && (
                  <CheckCircle2 size={14} className="text-accent shrink-0" />
                )}
              </label>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={selected.size === 0 || assignQuiz.isPending}
            className="gap-1.5"
          >
            {assignQuiz.isPending && <Loader2 size={13} className="animate-spin" />}
            {assignQuiz.isPending
              ? "Assigning..."
              : `Assign to ${selected.size} Trainee${selected.size !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
