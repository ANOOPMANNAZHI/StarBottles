"use client";

import { useState } from "react";
import {
  useMilestones, useCreateMilestone, useUpdateMilestone,
  useDeleteMilestone, useReorderMilestones, type Milestone,
} from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, ArrowUp, ArrowDown, Trash2, Pencil, Loader2, Eye, EyeOff, Milestone as MilestoneIcon } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = { year: new Date().getFullYear(), title: "", description: "", order: 0, is_active: true };

export default function MilestonesPage() {
  const { data: milestones, isLoading } = useMilestones();
  const create = useCreateMilestone();
  const update = useUpdateMilestone();
  const remove = useDeleteMilestone();
  const reorder = useReorderMilestones();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Milestone | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (m: Milestone) => {
    setEditing(m);
    setForm({ year: m.year, title: m.title, description: m.description ?? "", order: m.order, is_active: m.is_active });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = { ...form, description: form.description || null };
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...payload });
      toast.success("Milestone updated");
    } else {
      await create.mutateAsync(payload);
      toast.success("Milestone created");
    }
    setDialogOpen(false);
  };

  const toggleActive = async (m: Milestone) => {
    await update.mutateAsync({ id: m.id, is_active: !m.is_active });
    toast.success(m.is_active ? "Milestone hidden" : "Milestone visible");
  };

  const move = async (index: number, direction: -1 | 1) => {
    if (!milestones) return;
    const ids = milestones.map((m) => m.id);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= ids.length) return;
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    await reorder.mutateAsync(ids);
  };

  const busy = create.isPending || update.isPending;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Milestones</h1>
          <p className="text-sm text-muted-foreground mt-1">Company timeline displayed on the About page.</p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus size={16} className="mr-2" /> Add Milestone
        </Button>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (milestones ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
          <div className="p-4 rounded-full bg-muted/60 mb-4">
            <MilestoneIcon size={28} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-base">No milestones yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Document Star Bottles&apos; journey — founding year, expansions, awards, and key achievements.
          </p>
          <Button onClick={openCreate} variant="outline" className="mt-4">
            <Plus size={16} className="mr-2" /> Add First Milestone
          </Button>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[52px] top-0 bottom-0 w-px bg-border/60" />

          <div className="space-y-2">
            {(milestones ?? []).map((m, i) => (
              <div key={m.id} className={`flex items-start gap-4 group ${!m.is_active ? "opacity-50" : ""}`}>
                {/* Year */}
                <div className="w-[104px] shrink-0 flex justify-end pr-4 pt-3">
                  <span className="text-lg font-bold text-accent tabular-nums">{m.year}</span>
                </div>

                {/* Timeline dot */}
                <div className="relative shrink-0 mt-3.5">
                  <div className="w-3 h-3 rounded-full bg-accent border-2 border-background ring-2 ring-accent/30" />
                </div>

                {/* Content card */}
                <div className="flex-1 min-w-0 bg-card border border-border/60 rounded-xl p-4 mb-2 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{m.title}</h3>
                        {!m.is_active && (
                          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inactive</span>
                        )}
                      </div>
                      {m.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.description}</p>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
                        title="Move up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === (milestones?.length ?? 0) - 1}
                        className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
                        title="Move down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => toggleActive(m)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                        title={m.is_active ? "Hide" : "Show"}
                      >
                        {m.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        onClick={() => openEdit(m)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(m)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Milestone" : "New Milestone"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Year <span className="text-destructive">*</span></label>
                <Input
                  className="mt-1"
                  type="number"
                  min={1900}
                  max={2100}
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
                <Input
                  className="mt-1"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Company Founded"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                className="mt-1 resize-none"
                value={form.description}
                rows={3}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this milestone..."
              />
            </div>
            <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded"
              />
              <div>
                <span className="text-sm font-medium">Active</span>
                <p className="text-xs text-muted-foreground">Show on the About page timeline</p>
              </div>
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={busy}>
                {busy && <Loader2 size={16} className="mr-2 animate-spin" />}
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deleteTarget?.year} — {deleteTarget?.title}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteTarget) {
                  await remove.mutateAsync(deleteTarget.id);
                  toast.success("Deleted");
                }
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
