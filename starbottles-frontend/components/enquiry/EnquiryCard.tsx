"use client";

import { Phone, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EnquiryListItem } from "@/hooks/useEnquiries";

const STATUS_COLORS: Record<string, string> = {
  new:                "bg-purple-100 text-purple-700",
  contacted:          "bg-sky-100 text-sky-700",
  follow_up_pending:  "bg-amber-100 text-amber-700",
  qualified_lead:     "bg-green-100 text-green-700",
  closed_won:         "bg-emerald-100 text-emerald-700",
  closed_lost:        "bg-red-100 text-red-700",
};

const STATUS_BORDER: Record<string, string> = {
  new:                "border-l-purple-500",
  contacted:          "border-l-sky-500",
  follow_up_pending:  "border-l-amber-500",
  qualified_lead:     "border-l-green-500",
  closed_won:         "border-l-emerald-500",
  closed_lost:        "border-l-red-500",
};

const SOURCE_COLORS: Record<string, string> = {
  whatsapp: "bg-green-100 text-green-700",
  website:  "bg-blue-100 text-blue-700",
  email:    "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<string, string> = {
  new:               "New",
  contacted:         "Contacted",
  follow_up_pending: "Follow-up Pending",
  qualified_lead:    "Qualified Lead",
  closed_won:        "Closed Won",
  closed_lost:       "Closed Lost",
};

interface Props {
  enquiry: EnquiryListItem;
  onClick: (enquiry: EnquiryListItem) => void;
}

export default function EnquiryCard({ enquiry, onClick }: Props) {
  return (
    <div
      className={`flex items-center gap-4 border-l-4 ${STATUS_BORDER[enquiry.status] ?? "border-l-slate-300"} bg-white rounded-r-lg border border-l-4 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors`}
      onClick={() => onClick(enquiry)}
    >
      {/* Left */}
      <div className="min-w-0 w-40 shrink-0">
        <p className="font-semibold text-sm truncate">{enquiry.customer_name}</p>
        <a
          href={`tel:${enquiry.phone}`}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600"
          onClick={(e) => e.stopPropagation()}
        >
          <Phone size={11} />
          {enquiry.phone}
        </a>
        <p className="text-xs text-slate-400 mt-0.5">{enquiry.received_at}</p>
      </div>

      {/* Middle */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={`text-xs ${SOURCE_COLORS[enquiry.source]}`}>
            {enquiry.source === "whatsapp" ? "WhatsApp" : enquiry.source === "website" ? "Website" : "Email"}
          </Badge>
          <Badge className={`text-xs ${STATUS_COLORS[enquiry.status]}`}>
            {STATUS_LABELS[enquiry.status]}
          </Badge>
          {enquiry.product_title && (
            <span className="text-xs text-slate-500 truncate max-w-[160px]">
              📦 {enquiry.product_title}
            </span>
          )}
        </div>
        {enquiry.latest_note_snippet && (
          <p className="text-xs text-slate-400 italic truncate">{enquiry.latest_note_snippet}</p>
        )}
      </div>

      {/* Right */}
      <div className="shrink-0 text-right space-y-1">
        {enquiry.is_overdue && (
          <div className="flex items-center justify-end gap-1 text-xs text-red-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Overdue
          </div>
        )}
        {enquiry.status === "new" && !enquiry.is_overdue && (
          <Badge className="text-xs bg-purple-100 text-purple-700 font-bold">NEW</Badge>
        )}
        {enquiry.follow_up_date && (
          <p className="text-xs text-slate-500">Follow up: {enquiry.follow_up_date}</p>
        )}
        {enquiry.assigned_to_name && (
          <p className="text-xs text-slate-400">{enquiry.assigned_to_name}</p>
        )}
      </div>

      <ChevronRight size={16} className="text-slate-400 shrink-0" />
    </div>
  );
}
