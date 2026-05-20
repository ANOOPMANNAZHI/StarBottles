"use client";

import { Suspense, useRef, useState } from "react";
import { format, subDays } from "date-fns";
import { InboxIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EnquiryDetailPanel from "@/components/enquiry/EnquiryDetailPanel";
import AssignExecutiveModal from "@/components/admin/AssignExecutiveModal";
import { useEnquiries, type EnquiryListItem, type EnquiryFilters } from "@/hooks/useEnquiries";
import { useUsers } from "@/hooks/useUsers";

const SOURCE_COLORS: Record<string, string> = {
  whatsapp: "bg-green-100 text-green-700",
  website:  "bg-blue-100 text-blue-700",
  email:    "bg-slate-100 text-slate-600",
};

const STATUS_COLORS: Record<string, string> = {
  new:               "bg-purple-100 text-purple-700",
  contacted:         "bg-sky-100 text-sky-700",
  follow_up_pending: "bg-amber-100 text-amber-700",
  qualified_lead:    "bg-green-100 text-green-700",
  closed_won:        "bg-emerald-100 text-emerald-700",
  closed_lost:       "bg-red-100 text-red-700",
};

function formatResponseTime(minutes: number | null): string {
  if (minutes === null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function AdminEnquiriesContent() {
  const today = new Date();
  const [filters, setFilters] = useState<EnquiryFilters>({
    date_from: format(subDays(today, 7), "yyyy-MM-dd"),
    date_to: format(today, "yyyy-MM-dd"),
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<EnquiryListItem | null>(null);
  const [assigning, setAssigning] = useState<EnquiryListItem | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useEnquiries(filters, page);
  const { data: execData } = useUsers({ role: "executive", is_active: 1, per_page: 100 });

  const enquiries = data?.data ?? [];
  const pagination = data?.meta?.pagination;
  const executives = execData?.data ?? [];

  const totalToday = pagination?.total ?? 0;
  const unassigned = enquiries.filter((e) => !e.assigned_to_name).length;
  const overdue = enquiries.filter((e) => e.is_overdue).length;

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value || undefined }));
      setPage(1);
    }, 300);
  }

  const respondedEnquiries = enquiries.filter((e) => e.response_time_minutes !== null);
  const avgResponseTime =
    respondedEnquiries.length > 0
      ? formatResponseTime(
          Math.round(
            respondedEnquiries.reduce((sum, e) => sum + (e.response_time_minutes ?? 0), 0) /
              respondedEnquiries.length
          )
        )
      : "—";

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enquiry Monitor</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track and manage all incoming enquiries</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-card rounded-xl border border-border shadow-sm border-l-4 border-l-[oklch(0.62_0.19_218)] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Total
          </p>
          <p className="text-3xl font-bold tracking-tight">{totalToday}</p>
          <p className="text-xs text-muted-foreground mt-0.5">This period</p>
        </div>

        {/* Unassigned */}
        <div
          className={`bg-card rounded-xl border shadow-sm border-l-4 px-5 py-4 ${
            unassigned > 0
              ? "border-l-red-500 border-red-200"
              : "border-l-border border-border"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Unassigned
          </p>
          <p
            className={`text-3xl font-bold tracking-tight ${
              unassigned > 0 ? "text-red-600" : ""
            }`}
          >
            {unassigned}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Need assignment</p>
        </div>

        {/* Overdue */}
        <div
          className={`bg-card rounded-xl border shadow-sm border-l-4 px-5 py-4 ${
            overdue > 0
              ? "border-l-amber-500 border-amber-200"
              : "border-l-border border-border"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Overdue
          </p>
          <p
            className={`text-3xl font-bold tracking-tight ${
              overdue > 0 ? "text-amber-600" : ""
            }`}
          >
            {overdue}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Past SLA deadline</p>
        </div>

        {/* Avg response */}
        <div className="bg-card rounded-xl border border-border shadow-sm border-l-4 border-l-[oklch(0.68_0.19_162)] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Avg Response
          </p>
          <p className="text-3xl font-bold tracking-tight">{avgResponseTime}</p>
          <p className="text-xs text-muted-foreground mt-0.5">First reply time</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Search name or phone..."
          className="w-52 h-9"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Select
          value={filters.status ?? "all"}
          onValueChange={(v) => {
            setFilters((f) => ({ ...f, status: v === "all" ? undefined : v }));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="follow_up_pending">Follow-up Pending</SelectItem>
            <SelectItem value="qualified_lead">Qualified Lead</SelectItem>
            <SelectItem value="closed_won">Closed Won</SelectItem>
            <SelectItem value="closed_lost">Closed Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.source ?? "all"}
          onValueChange={(v) => {
            setFilters((f) => ({ ...f, source: v === "all" ? undefined : v }));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.assigned_to ? String(filters.assigned_to) : "all"}
          onValueChange={(v) => {
            setFilters((f) => ({ ...f, assigned_to: v === "all" ? undefined : Number(v) }));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="All Executives" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Executives</SelectItem>
            {executives.map((e) => (
              <SelectItem key={e.id} value={String(e.id)}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10">
                  Customer
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10">
                  Phone
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10">
                  Product
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10">
                  Source
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10">
                  Status
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10">
                  Assigned To
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10">
                  Received
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10 text-right">
                  Response
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!isLoading && enquiries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <InboxIcon
                        size={40}
                        className="text-muted-foreground opacity-20"
                        strokeWidth={1.5}
                      />
                      <p className="text-sm font-medium text-foreground">No enquiries found</p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your filters or date range.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                enquiries.map((enquiry) => (
                  <TableRow
                    key={enquiry.id}
                    className={`cursor-pointer hover:bg-muted/30 transition-colors duration-150 ${
                      enquiry.is_overdue
                        ? "border-l-4 border-l-red-400"
                        : !enquiry.assigned_to_name
                        ? "border-l-4 border-l-amber-400"
                        : ""
                    }`}
                    onClick={() => setSelected(enquiry)}
                  >
                    <TableCell className="font-medium text-sm py-3">
                      {enquiry.customer_name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-3">
                      {enquiry.phone}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate py-3">
                      {enquiry.product_title ?? "—"}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge className={`text-xs font-medium ${SOURCE_COLORS[enquiry.source]}`}>
                        {enquiry.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge className={`text-xs font-medium ${STATUS_COLORS[enquiry.status]}`}>
                        {enquiry.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-3">
                      {enquiry.assigned_to_name ?? (
                        <span className="text-amber-600 text-xs font-semibold">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-3">
                      {enquiry.received_at}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground py-3">
                      {formatResponseTime(enquiry.response_time_minutes)}
                    </TableCell>
                    <TableCell className="py-3">
                      <Button
                        size="sm"
                        className="text-xs bg-primary text-primary-foreground hover:opacity-90 h-7 px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssigning(enquiry);
                        }}
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <EnquiryDetailPanel enquiry={selected} onClose={() => setSelected(null)} />
      <AssignExecutiveModal enquiry={assigning} onClose={() => setAssigning(null)} />
    </div>
  );
}

export default function AdminEnquiriesPage() {
  return (
    <Suspense>
      <AdminEnquiriesContent />
    </Suspense>
  );
}
