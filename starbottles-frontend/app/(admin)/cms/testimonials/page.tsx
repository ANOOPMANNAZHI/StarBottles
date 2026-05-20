"use client";

import { useState } from "react";
import {
  useTestimonials, useCreateTestimonial, useUpdateTestimonial,
  useDeleteTestimonial, useReorderTestimonials, type Testimonial,
} from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, ArrowUp, ArrowDown, Trash2, Pencil, Loader2, Eye, EyeOff, Quote } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = {
  quote: "", name: "", business: "", location: "",
  metric: "", initials: "", rating: 5, order: 0, is_active: true,
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? "text-amber-400" : "text-muted-foreground/30"}>★</span>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const { data: testimonials, isLoading } = useTestimonials();
  const create = useCreateTestimonial();
  const update = useUpdateTestimonial();
  const remove = useDeleteTestimonial();
  const reorder = useReorderTestimonials();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      quote: t.quote, name: t.name, business: t.business,
      location: t.location, metric: t.metric ?? "", initials: t.initials,
      rating: t.rating, order: t.order, is_active: t.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = { ...form, metric: form.metric || null };
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...payload });
      toast.success("Testimonial updated");
    } else {
      await create.mutateAsync(payload);
      toast.success("Testimonial created");
    }
    setDialogOpen(false);
  };

  const toggleActive = async (t: Testimonial) => {
    await update.mutateAsync({ id: t.id, is_active: !t.is_active });
    toast.success(t.is_active ? "Testimonial hidden" : "Testimonial visible");
  };

  const move = async (index: number, direction: -1 | 1) => {
    if (!testimonials) return;
    const ids = testimonials.map((t) => t.id);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= ids.length) return;
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    await reorder.mutateAsync(ids);
  };

  const busy = create.isPending || update.isPending;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-sm text-muted-foreground mt-1">Client social proof displayed on the B2B website.</p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus size={16} className="mr-2" /> Add Testimonial
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (testimonials ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
          <div className="p-4 rounded-full bg-muted/60 mb-4">
            <Quote size={28} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-base">No testimonials yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Customers trust Star Bottles. Add their quotes to build credibility on the B2B website.
          </p>
          <Button onClick={openCreate} variant="outline" className="mt-4">
            <Plus size={16} className="mr-2" /> Add First Testimonial
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(testimonials ?? []).map((t, i) => (
            <Card key={t.id} className={`p-4 flex items-start gap-4 border-border/60 hover:shadow-md transition-all duration-200 ${!t.is_active ? "opacity-60" : ""}`}>
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-sm font-bold text-accent shrink-0 border border-accent/20">
                {t.initials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.business} · {t.location}</span>
                  {!t.is_active && (
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                </div>
                <StarRating rating={t.rating} />
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 italic">&quot;{t.quote}&quot;</p>
                {t.metric && (
                  <span className="inline-block mt-2 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                    {t.metric}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
                  title="Move up"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === (testimonials?.length ?? 0) - 1}
                  className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
                  title="Move down"
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  onClick={() => toggleActive(t)}
                  className={`p-1.5 rounded-md transition-colors ${t.is_active ? "hover:bg-muted text-muted-foreground" : "hover:bg-muted text-muted-foreground/40"}`}
                  title={t.is_active ? "Hide" : "Show"}
                >
                  {t.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => openEdit(t)}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  title="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(t)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Testimonial" : "New Testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-1">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quote</p>
              <div>
                <label className="text-sm font-medium">Customer Quote <span className="text-destructive">*</span></label>
                <Textarea
                  className="mt-1 resize-none"
                  value={form.quote}
                  rows={3}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  placeholder="What did the customer say about Star Bottles?"
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
                  <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Initials <span className="text-destructive">*</span></label>
                  <Input className="mt-1" value={form.initials} maxLength={4} onChange={(e) => setForm({ ...form, initials: e.target.value })} placeholder="AB" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Business <span className="text-destructive">*</span></label>
                  <Input className="mt-1" value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} placeholder="Company name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Location <span className="text-destructive">*</span></label>
                  <Input className="mt-1" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Additional</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Metric</label>
                  <Input
                    className="mt-1"
                    value={form.metric}
                    placeholder="e.g. 12,000+ units/quarter"
                    onChange={(e) => setForm({ ...form, metric: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Optional highlight badge</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Rating (1–5)</label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  />
                </div>
              </div>
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
                <p className="text-xs text-muted-foreground">Show on the B2B website</p>
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
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription>
              Delete the testimonial from &quot;{deleteTarget?.name}&quot;? This cannot be undone.
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
