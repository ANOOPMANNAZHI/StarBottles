"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Phone,
  MessageSquare,
  Clock,
  Mail,
  Box,
  CalendarDays,
  CheckCircle2,
  StickyNote,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEnquiry,
  useUpdateEnquiryStatus,
  useAddEnquiryNote,
} from "@/hooks/useEnquiries";
import type { EnquiryListItem } from "@/hooks/useEnquiries";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  website: "Website",
  email: "Email",
};

const SOURCE_COLORS: Record<string, string> = {
  whatsapp: "bg-green-100 text-green-700 border-green-200",
  website: "bg-sky-100 text-sky-700 border-sky-200",
  email: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "follow_up_pending", label: "Follow-up Pending" },
  { value: "qualified_lead", label: "Qualified Lead" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
] as const;

type StatusValue = (typeof STATUSES)[number]["value"];

const STATUS_STYLES: Record<
  StatusValue,
  { pill: string; dot: string; label: string }
> = {
  new: {
    pill: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    label: "New",
  },
  contacted: {
    pill: "bg-sky-100 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
    label: "Contacted",
  },
  follow_up_pending: {
    pill: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    label: "Follow-up Pending",
  },
  qualified_lead: {
    pill: "bg-violet-100 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    label: "Qualified Lead",
  },
  closed_won: {
    pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Closed Won",
  },
  closed_lost: {
    pill: "bg-red-100 text-red-600 border-red-200",
    dot: "bg-red-400",
    label: "Closed Lost",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatResponseTime(minutes: number | null): string | null {
  if (minutes === null) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function isStatusValue(v: string): v is StatusValue {
  return Object.keys(STATUS_STYLES).includes(v);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-3">
      {children}
    </p>
  );
}

function InfoRow({
  icon: Icon,
  value,
  href,
}: {
  icon: React.ElementType;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-2.5 text-sm text-foreground">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon size={13} className="text-muted-foreground" />
      </span>
      <span className="truncate">{value}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:opacity-80 transition-opacity">
        {content}
      </a>
    );
  }
  return content;
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function PanelSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div
        className="h-[172px] shrink-0 px-5 pt-10 pb-5 flex flex-col justify-end gap-3"
        style={{ backgroundColor: "oklch(0.26 0.10 252)" }}
      >
        <div className="flex items-end gap-4">
          <Skeleton className="h-[52px] w-[52px] rounded-full opacity-20" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-36 opacity-20" />
            <Skeleton className="h-3 w-24 opacity-10" />
          </div>
        </div>
        <div className="flex gap-2 mt-1">
          <Skeleton className="h-8 w-20 rounded-lg opacity-15" />
          <Skeleton className="h-8 w-28 rounded-lg opacity-15" />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="flex-1 overflow-y-auto bg-background p-5 space-y-4">
        <Skeleton className="h-[100px] w-full rounded-xl" />
        <Skeleton className="h-[140px] w-full rounded-xl" />
        <Skeleton className="h-[120px] w-full rounded-xl" />
        <Skeleton className="h-[180px] w-full rounded-xl" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  enquiry: EnquiryListItem | null;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EnquiryDetailPanel({ enquiry, onClose }: Props) {
  const { data: detail, isLoading } = useEnquiry(enquiry?.id ?? null);
  const updateStatus = useUpdateEnquiryStatus();
  const addNote = useAddEnquiryNote();

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();
  const [noteText, setNoteText] = useState("");

  // Sync status when detail loads
  useEffect(() => {
    if (detail) {
      setSelectedStatus(detail.status);
    }
  }, [detail?.id, detail?.status]);

  // Reset state when panel closes or enquiry changes
  useEffect(() => {
    if (!enquiry) {
      setSelectedStatus("");
      setFollowUpDate(undefined);
      setNoteText("");
    }
  }, [enquiry?.id]);

  const intlPhone = detail?.phone?.replace(/^0/, "91");

  async function handleSaveStatus() {
    if (!detail) return;
    await updateStatus.mutateAsync({
      id: detail.id,
      status: selectedStatus,
      follow_up_date: followUpDate ? format(followUpDate, "yyyy-MM-dd") : null,
    });
  }

  async function handleAddNote() {
    if (!detail || !noteText.trim()) return;
    await addNote.mutateAsync({
      enquiryId: detail.id,
      note_text: noteText.trim(),
    });
    setNoteText("");
  }

  const currentStatusStyle =
    isStatusValue(selectedStatus) ? STATUS_STYLES[selectedStatus] : null;

  const responseTime = formatResponseTime(detail?.response_time_minutes ?? null);

  return (
    <Sheet open={!!enquiry} onOpenChange={(open) => !open && onClose()}>
      {/*
        p-0 removes all default SheetContent padding so we own the full canvas.
        overflow-hidden + flex-col lets us split header (fixed) from body (scrollable).
      */}
      <SheetContent
        side="right"
        className="w-full sm:max-w-[520px] p-0 overflow-hidden flex flex-col gap-0 border-l border-border"
      >
        {/* Visually hidden title for screen-reader accessibility */}
        <SheetHeader className="sr-only">
          <SheetTitle>
            {detail?.customer_name ?? "Enquiry Details"}
          </SheetTitle>
        </SheetHeader>

        {/* Loading state */}
        {!detail && isLoading && <PanelSkeleton />}

        {/* Detail state */}
        {detail && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">

            {/* ================================================================
                HEADER — full-bleed navy gradient
            ================================================================ */}
            <div
              className="shrink-0 px-5 pb-5 pt-10 flex flex-col justify-end gap-4"
              style={{
                background:
                  "linear-gradient(145deg, oklch(0.26 0.10 252) 0%, oklch(0.20 0.10 258) 100%)",
              }}
            >
              {/* Avatar + name row */}
              <div className="flex items-end gap-4">
                {/* Cyan initials avatar */}
                <div
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-white text-base font-bold tracking-wide shadow-lg"
                  style={{ backgroundColor: "oklch(0.62 0.19 218)" }}
                >
                  {getInitials(detail.customer_name)}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-semibold text-[15px] leading-snug truncate">
                    {detail.customer_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {/* Source badge */}
                    <span
                      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${SOURCE_COLORS[detail.source] ?? "bg-white/10 text-white border-white/20"}`}
                    >
                      {SOURCE_LABELS[detail.source] ?? detail.source}
                    </span>

                    {/* Received date */}
                    <span className="text-white/55 text-[11px]">
                      {format(
                        new Date(detail.received_at_raw),
                        "d MMM yyyy, HH:mm"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA action buttons */}
              <div className="flex gap-2">
                <a href={`tel:${detail.phone}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-1.5 text-xs font-medium"
                  >
                    <Phone size={12} />
                    Call
                  </Button>
                </a>
                <a
                  href={`https://wa.me/${intlPhone}?text=Hi ${encodeURIComponent(detail.customer_name)}, this is regarding your enquiry...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    className="w-full bg-green-500 hover:bg-green-600 text-white border-0 gap-1.5 text-xs font-medium shadow-sm"
                  >
                    <MessageSquare size={12} />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>

            {/* ================================================================
                BODY — scrollable on bg-background
            ================================================================ */}
            <div className="flex-1 overflow-y-auto bg-background px-4 py-5 space-y-4">

              {/* --------------------------------------------------------------
                  Card 1: Enquiry Info
              -------------------------------------------------------------- */}
              <div className="rounded-xl bg-card border border-border p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <SectionLabel>Enquiry Info</SectionLabel>

                <div className="space-y-2">
                  {detail.email && (
                    <InfoRow
                      icon={Mail}
                      value={detail.email}
                      href={`mailto:${detail.email}`}
                    />
                  )}
                  <InfoRow
                    icon={Phone}
                    value={detail.phone}
                    href={`tel:${detail.phone}`}
                  />
                </div>

                {/* Customer message — quoted block with cyan left accent */}
                {detail.message && (
                  <div className="mt-1 rounded-lg bg-muted border-l-[3px] px-3 py-2.5"
                    style={{ borderLeftColor: "oklch(0.62 0.19 218)" }}
                  >
                    <p className="text-[13px] text-muted-foreground italic leading-relaxed">
                      &ldquo;{detail.message}&rdquo;
                    </p>
                  </div>
                )}

                {/* Linked product card */}
                {detail.product && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5 mt-1">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: "oklch(0.62 0.19 218 / 0.12)" }}
                    >
                      <Box
                        size={13}
                        style={{ color: "oklch(0.62 0.19 218)" }}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Product
                      </p>
                      <p className="text-[13px] font-medium text-foreground truncate">
                        {detail.product.title}
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      className="shrink-0 text-muted-foreground"
                    />
                  </div>
                )}
              </div>

              {/* --------------------------------------------------------------
                  Card 2: Status & Follow-up
              -------------------------------------------------------------- */}
              <div
                className="rounded-xl bg-card border border-border p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: "60ms", animationFillMode: "both" }}
              >
                {/* Row: section label + response time pill */}
                <div className="flex items-center justify-between">
                  <SectionLabel>Status &amp; Follow-up</SectionLabel>
                  {responseTime && (
                    <div className="flex items-center gap-1 rounded-full bg-muted border border-border px-2.5 py-1 text-[11px] text-muted-foreground mb-3">
                      <Clock size={11} />
                      <span>Responded in {responseTime}</span>
                    </div>
                  )}
                </div>

                {/* Current status pill — live preview as user changes select */}
                {currentStatusStyle && (
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${currentStatusStyle.pill}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${currentStatusStyle.dot}`}
                    />
                    {currentStatusStyle.label}
                  </div>
                )}

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="text-sm h-9 bg-background border-border">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => {
                      const style = STATUS_STYLES[s.value];
                      return (
                        <SelectItem key={s.value} value={s.value}>
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${style.dot}`}
                            />
                            {s.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* Follow-up date picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left font-normal text-sm h-9 bg-background border-border gap-2 text-foreground"
                    >
                      <CalendarDays
                        size={13}
                        className="text-muted-foreground"
                      />
                      {followUpDate ? (
                        <span>{format(followUpDate, "dd MMM yyyy")}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          Set follow-up date
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={followUpDate}
                      onSelect={setFollowUpDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Save button — navy */}
                <Button
                  size="sm"
                  className="w-full h-9 text-sm font-semibold gap-2"
                  style={{
                    backgroundColor: "oklch(0.26 0.10 252)",
                    color: "oklch(0.98 0.005 240)",
                  }}
                  onClick={handleSaveStatus}
                  disabled={updateStatus.isPending}
                >
                  <CheckCircle2 size={13} />
                  {updateStatus.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              {/* --------------------------------------------------------------
                  Card 3: Activity / Notes
              -------------------------------------------------------------- */}
              <div
                className="rounded-xl bg-card border border-border p-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: "120ms", animationFillMode: "both" }}
              >
                {/* Section header with note count badge */}
                <div className="flex items-center justify-between mb-4">
                  <SectionLabel>Activity</SectionLabel>
                  <span
                    className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white mb-3"
                    style={{ backgroundColor: "oklch(0.26 0.10 252)" }}
                  >
                    {detail.notes.length}
                  </span>
                </div>

                {/* Notes: timeline or empty state */}
                {detail.notes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2.5 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <StickyNote
                        size={16}
                        className="text-muted-foreground"
                      />
                    </div>
                    <p className="text-[13px] text-muted-foreground font-medium">
                      No activity yet
                    </p>
                    <p className="text-[11px] text-muted-foreground/60">
                      Notes you add will appear here
                    </p>
                  </div>
                ) : (
                  <div>
                    {detail.notes.map((note, i) => {
                      const isWhatsApp = note.note_text.startsWith(
                        "[WhatsApp]"
                      );
                      const isLast = i === detail.notes.length - 1;

                      return (
                        <div key={note.id} className="flex gap-3">
                          {/* Timeline rail — dot + vertical line */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`mt-[3px] h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-card ${
                                isWhatsApp
                                  ? "bg-green-500"
                                  : ""
                              }`}
                              style={
                                !isWhatsApp
                                  ? {
                                      backgroundColor: "oklch(0.26 0.10 252)",
                                    }
                                  : undefined
                              }
                            />
                            {!isLast && (
                              <div className="w-px flex-1 bg-border my-1.5 min-h-[12px]" />
                            )}
                          </div>

                          {/* Note content */}
                          <div className={`flex-1 min-w-0 ${isLast ? "pb-1" : "pb-4"}`}>
                            <div className="flex items-baseline justify-between gap-2 mb-0.5">
                              <span className="text-[11px] font-semibold text-muted-foreground truncate">
                                {isWhatsApp ? (
                                  <span className="text-green-600">
                                    via WhatsApp
                                  </span>
                                ) : (
                                  note.author?.name ?? "System"
                                )}
                              </span>
                              <span className="text-[10px] text-muted-foreground/60 shrink-0 tabular-nums">
                                {format(
                                  new Date(note.created_at),
                                  "d MMM, HH:mm"
                                )}
                              </span>
                            </div>
                            <p className="text-[13px] text-foreground leading-relaxed">
                              {note.note_text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add note area — always visible at bottom of activity card */}
                <div className="mt-4 border-t border-border pt-4 space-y-2">
                  <Textarea
                    placeholder="Write a note..."
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="resize-none text-sm bg-background border-border placeholder:text-muted-foreground/50"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!noteText.trim() || addNote.isPending}
                    className="w-full h-9 text-sm font-semibold gap-2"
                    style={{
                      backgroundColor: "oklch(0.62 0.19 218)",
                      color: "oklch(0.14 0.04 252)",
                    }}
                  >
                    <StickyNote size={13} />
                    {addNote.isPending ? "Adding..." : "Add Note"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
