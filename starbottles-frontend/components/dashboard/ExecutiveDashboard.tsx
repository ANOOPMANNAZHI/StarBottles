"use client";

import Link from "next/link";
import {
  MessageSquare, ArrowRight, Clock, AlertTriangle,
  CheckCircle2, PhoneCall, Activity, Inbox,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnquiries } from "@/hooks/useEnquiries";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  new:                { label: "New",              color: "bg-blue-50 text-blue-700 border-blue-200/60",       icon: Inbox },
  contacted:          { label: "Contacted",        color: "bg-emerald-50 text-emerald-700 border-emerald-200/60", icon: PhoneCall },
  follow_up_pending:  { label: "Follow-up",        color: "bg-amber-50 text-amber-700 border-amber-200/60",   icon: Clock },
  qualified_lead:     { label: "Qualified",        color: "bg-purple-50 text-purple-700 border-purple-200/60", icon: CheckCircle2 },
  closed_won:         { label: "Won",              color: "bg-green-50 text-green-700 border-green-200/60",    icon: CheckCircle2 },
  closed_lost:        { label: "Lost",             color: "bg-slate-50 text-slate-500 border-slate-200/60",    icon: AlertTriangle },
};

const SOURCE_COLORS: Record<string, string> = {
  whatsapp: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  website: "bg-sky-50 text-sky-700 border-sky-200/60",
  email: "bg-slate-50 text-slate-600 border-slate-200/60",
};

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  isLoading: boolean;
  accent: string;
}) {
  return (
    <Card className="relative overflow-hidden border shadow-sm">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", accent)} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {title}
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {value.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/40">
            <Icon size={16} className="text-muted-foreground" strokeWidth={1.75} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExecutiveDashboard({ userName }: { userName: string }) {
  const { data: enquiryData, isLoading } = useEnquiries({}, 1);
  const enquiries = enquiryData?.data ?? [];

  const totalAssigned = enquiryData?.meta?.pagination?.total ?? 0;
  const overdueCount = enquiries.filter((e) => e.is_overdue).length;
  const newCount = enquiries.filter((e) => e.status === "new").length;
  const followUpCount = enquiries.filter((e) => e.status === "follow_up_pending").length;

  const recentEnquiries = enquiries.slice(0, 6);
  const overdueEnquiries = enquiries.filter((e) => e.is_overdue).slice(0, 5);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="p-5 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[oklch(0.22_0.06_200)] to-[oklch(0.18_0.08_220)] p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.06]">
          <svg viewBox="0 0 200 200" fill="currentColor">
            {Array.from({ length: 100 }).map((_, i) => (
              <circle key={i} cx={(i % 10) * 20 + 10} cy={Math.floor(i / 10) * 20 + 10} r="2" />
            ))}
          </svg>
        </div>
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50 mb-1">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {greeting}, {userName}
              </h1>
              <p className="text-sm text-white/60 mt-1">
                Here&apos;s your enquiry overview for today.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/inbox"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-sm font-medium transition-all duration-200"
              >
                <Inbox size={15} />
                Go to Inbox
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Assigned"
          value={totalAssigned}
          icon={MessageSquare}
          isLoading={isLoading}
          accent="bg-gradient-to-r from-blue-500 to-blue-400"
        />
        <StatCard
          title="New Enquiries"
          value={newCount}
          icon={Inbox}
          isLoading={isLoading}
          accent="bg-gradient-to-r from-emerald-500 to-emerald-400"
        />
        <StatCard
          title="Follow-ups Due"
          value={followUpCount}
          icon={Clock}
          isLoading={isLoading}
          accent="bg-gradient-to-r from-amber-500 to-amber-400"
        />
        <StatCard
          title="Overdue"
          value={overdueCount}
          icon={AlertTriangle}
          isLoading={isLoading}
          accent="bg-gradient-to-r from-red-500 to-red-400"
        />
      </div>

      {/* Two-column: Recent + Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent enquiries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity size={14} />
              Recent Enquiries
            </h2>
            <Link
              href="/inbox"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors duration-200"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <Card className="border shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-md" />
                ))}
              </div>
            ) : recentEnquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <MessageSquare size={20} className="text-blue-400" />
                </div>
                <p className="text-sm font-medium text-foreground">No enquiries yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enquiries assigned to you will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentEnquiries.map((e) => {
                  const sc = STATUS_CONFIG[e.status];
                  return (
                    <Link
                      key={e.id}
                      href={`/inbox/${e.id}`}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors duration-150"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {e.customer_name}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-medium capitalize px-1.5 py-0 shrink-0", SOURCE_COLORS[e.source])}
                          >
                            {e.source}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                          {e.phone} · {e.received_at}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] font-medium px-2 py-0.5 shrink-0 ml-3", sc?.color)}
                      >
                        {sc?.label ?? e.status}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Overdue follow-ups */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500" />
              Overdue Follow-ups
            </h2>
          </div>
          <Card className="border shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-md" />
                ))}
              </div>
            ) : overdueEnquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  No overdue follow-ups. Great job!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {overdueEnquiries.map((e) => (
                  <Link
                    key={e.id}
                    href={`/inbox/${e.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors duration-150"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {e.customer_name}
                        </p>
                        <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0 shrink-0 bg-red-50 text-red-600 border-red-200/60">
                          Overdue
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Follow-up was due: {e.follow_up_date ?? "—"}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground shrink-0 ml-3" />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
