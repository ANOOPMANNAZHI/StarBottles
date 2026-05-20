"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import EnquiryCard from "@/components/enquiry/EnquiryCard";
import EnquiryDetailPanel from "@/components/enquiry/EnquiryDetailPanel";
import { useEnquiries, type EnquiryListItem, type EnquiryFilters } from "@/hooks/useEnquiries";

type TabValue = "all" | "new" | "contacted" | "follow_up_pending" | "qualified_lead" | "overdue";

function InboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<TabValue>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<EnquiryListItem | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }

  const filters: EnquiryFilters = {
    ...(tab !== "all" && tab !== "overdue" ? { status: tab } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { data, isLoading } = useEnquiries(filters, page);

  let enquiries = data?.data ?? [];

  // Client-side overdue filter (API doesn't have dedicated overdue endpoint)
  if (tab === "overdue") {
    enquiries = enquiries.filter((e) => e.is_overdue);
  }

  const pagination = data?.meta?.pagination;
  const totalCount = pagination?.total ?? 0;
  const newCount = enquiries.filter((e) => e.status === "new").length;
  const overdueCount = enquiries.filter((e) => e.is_overdue).length;

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">My Enquiries</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-white px-4 py-3 text-center">
          <p className="text-2xl font-bold">{totalCount}</p>
          <p className="text-xs text-slate-500">Total Assigned</p>
        </div>
        <div className={`rounded-lg border px-4 py-3 text-center ${newCount > 0 ? "bg-red-50 border-red-200" : "bg-white"}`}>
          <p className={`text-2xl font-bold ${newCount > 0 ? "text-red-600" : ""}`}>{newCount}</p>
          <p className="text-xs text-slate-500">New</p>
        </div>
        <div className={`rounded-lg border px-4 py-3 text-center ${overdueCount > 0 ? "bg-amber-50 border-amber-200" : "bg-white"}`}>
          <p className={`text-2xl font-bold ${overdueCount > 0 ? "text-amber-600" : ""}`}>{overdueCount}</p>
          <p className="text-xs text-slate-500">Overdue</p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <Tabs value={tab} onValueChange={(v) => { setTab(v as TabValue); setPage(1); }}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="contacted">Contacted</TabsTrigger>
            <TabsTrigger value="follow_up_pending">Follow-up</TabsTrigger>
            <TabsTrigger value="qualified_lead">Qualified</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Input
            placeholder="Search name or phone..."
            className="flex-1"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="followup">Follow-up Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-medium text-slate-600">All caught up!</p>
          <p className="text-sm mt-1">No enquiries in this view.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {enquiries.map((e) => (
            <EnquiryCard key={e.id} enquiry={e} onClick={setSelected} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {page} of {pagination.last_page}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pagination.last_page} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* Detail panel */}
      <EnquiryDetailPanel enquiry={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default function ExecutiveInboxPage() {
  return (
    <Suspense>
      <InboxContent />
    </Suspense>
  );
}
