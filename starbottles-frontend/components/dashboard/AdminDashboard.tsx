"use client";

import Link from "next/link";
import {
  Package, Users, GraduationCap, ArrowRight, TrendingUp,
  MessageSquare, BookOpen, FileBarChart, LayoutGrid, Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useErpSyncStatus } from "@/hooks/useErpSync";
import { useUsers } from "@/hooks/useUsers";
import { useEnquiries } from "@/hooks/useEnquiries";
import ErpSyncMonitor from "@/components/admin/ErpSyncMonitor";
import ErpSyncHistoryTable from "@/components/admin/ErpSyncHistoryTable";
import AssignExecutiveModal from "@/components/admin/AssignExecutiveModal";
import { SyncActivityChart, EnquirySourceChart, EnquiryStatusChart } from "@/components/admin/DashboardCharts";
import { useState } from "react";
import type { EnquiryListItem } from "@/hooks/useEnquiries";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "Enquiries", href: "/enquiries", icon: MessageSquare, color: "text-blue-500 bg-blue-50" },
  { label: "Products", href: "/admin/products", icon: Package, color: "text-emerald-500 bg-emerald-50" },
  { label: "Training", href: "/training", icon: BookOpen, color: "text-purple-500 bg-purple-50" },
  { label: "Reports", href: "/reports", icon: FileBarChart, color: "text-amber-500 bg-amber-50" },
  { label: "Users", href: "/users", icon: Users, color: "text-cyan-500 bg-cyan-50" },
  { label: "CMS", href: "/cms", icon: LayoutGrid, color: "text-rose-500 bg-rose-50" },
] as const;

const SOURCE_COLORS: Record<string, string> = {
  whatsapp: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  website: "bg-sky-50 text-sky-700 border-sky-200/60",
  email: "bg-slate-50 text-slate-600 border-slate-200/60",
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function SectionHeading({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">{children}</h2>
      {action && <div>{action}</div>}
    </div>
  );
}

function StatCard({
  title, value, icon: Icon, isLoading, accent,
}: {
  title: string; value: number | undefined; icon: React.ElementType; isLoading: boolean; accent: string;
}) {
  return (
    <Card className="group relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", accent)} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {(value ?? 0).toLocaleString()}
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

export default function AdminDashboard({ userName }: { userName: string }) {
  const [assigning, setAssigning] = useState<EnquiryListItem | null>(null);

  const { data: syncData, isLoading: syncLoading } = useErpSyncStatus();
  const { data: execData, isLoading: execLoading } = useUsers({ role: "executive", is_active: 1, per_page: 1 });
  const { data: traineeData, isLoading: traineeLoading } = useUsers({ role: "trainee", is_active: 1, per_page: 1 });
  const { data: allEnquiryData, isLoading: allEnquiryLoading } = useEnquiries({}, 1);

  const allEnquiries = allEnquiryData?.data ?? [];
  const unassignedEnquiries = allEnquiries.filter((e) => !e.assigned_to_name).slice(0, 5);

  return (
    <div className="p-5 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[oklch(0.22_0.03_260)] to-[oklch(0.18_0.04_280)] p-6 sm:p-8 text-white relative overflow-hidden">
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
                {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {getGreeting()}, {userName}
              </h1>
              <p className="text-sm text-white/60 mt-1">
                Here&apos;s what&apos;s happening with your platform today.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                <Activity size={12} className="text-emerald-400" />
                <span className="text-xs font-medium text-white/80">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Products" value={syncData?.total_products} icon={Package} isLoading={syncLoading} accent="bg-gradient-to-r from-blue-500 to-blue-400" />
        <StatCard title="Active Executives" value={execData?.meta?.pagination?.total} icon={Users} isLoading={execLoading} accent="bg-gradient-to-r from-emerald-500 to-emerald-400" />
        <StatCard title="Active Trainees" value={traineeData?.meta?.pagination?.total} icon={GraduationCap} isLoading={traineeLoading} accent="bg-gradient-to-r from-amber-500 to-amber-400" />
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <SectionHeading>Quick Actions</SectionHeading>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center gap-2.5 text-center">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", action.color)}>
                    <action.icon size={16} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Two-column: ERP Sync + Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <SectionHeading>ERP Sync Status</SectionHeading>
          <ErpSyncMonitor />
        </div>

        <div className="space-y-3">
          <SectionHeading
            action={
              <Link href="/enquiries?assigned=none" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors duration-200">
                View all <ArrowRight size={12} />
              </Link>
            }
          >
            Unassigned Enquiries
          </SectionHeading>

          <Card className="border shadow-sm overflow-hidden">
            {allEnquiryLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-md" />
                ))}
              </div>
            ) : unassignedEnquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <TrendingUp size={20} className="text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-foreground">All caught up</p>
                <p className="text-xs text-muted-foreground mt-0.5">No unassigned enquiries at the moment.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {unassignedEnquiries.map((e) => (
                  <div key={e.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors duration-150">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{e.customer_name}</p>
                        <Badge variant="outline" className={cn("text-[10px] font-medium capitalize px-1.5 py-0 shrink-0", SOURCE_COLORS[e.source] ?? "bg-slate-50 text-slate-600 border-slate-200/60")}>
                          {e.source}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">{e.phone} · {e.received_at}</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3 font-medium shrink-0 ml-3" onClick={() => setAssigning(e)}>
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="space-y-3">
        <SectionHeading>Analytics Overview</SectionHeading>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SyncActivityChart logs={syncData?.logs ?? []} isLoading={syncLoading} />
          </div>
          <EnquirySourceChart enquiries={allEnquiries} isLoading={allEnquiryLoading} />
        </div>
        <EnquiryStatusChart enquiries={allEnquiries} isLoading={allEnquiryLoading} />
      </div>

      {/* Sync History */}
      <div className="space-y-3">
        <SectionHeading>Sync History</SectionHeading>
        <ErpSyncHistoryTable />
      </div>

      <AssignExecutiveModal enquiry={assigning} onClose={() => setAssigning(null)} />
    </div>
  );
}
