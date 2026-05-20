"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ErpSyncLog } from "@/hooks/useErpSync";
import type { EnquiryListItem } from "@/hooks/useEnquiries";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/* ─── Sync Activity Chart (Area) ─── */
export function SyncActivityChart({
  logs,
  isLoading,
}: {
  logs: ErpSyncLog[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-5">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-52 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Take last 10 logs, reversed for chronological order
  const chartData = [...logs]
    .slice(0, 10)
    .reverse()
    .map((log) => ({
      date: format(new Date(log.synced_at), "dd MMM"),
      added: log.products_added,
      updated: log.products_updated,
      status: log.status,
    }));

  if (chartData.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Sync Activity</h3>
          <p className="text-xs text-muted-foreground">No sync data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Sync Activity</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Products synced per session</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              Added
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
              Updated
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradAdded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.19 162)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.72 0.19 162)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradUpdated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.62 0.18 250)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.62 0.18 250)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0 0 / 0.08)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "oklch(0.55 0 0)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "oklch(0.55 0 0)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid oklch(0.90 0 0)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="added"
              stroke="oklch(0.72 0.19 162)"
              strokeWidth={2}
              fill="url(#gradAdded)"
              dot={{ r: 3, fill: "oklch(0.72 0.19 162)", strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="updated"
              stroke="oklch(0.62 0.18 250)"
              strokeWidth={2}
              fill="url(#gradUpdated)"
              dot={{ r: 3, fill: "oklch(0.62 0.18 250)", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ─── Enquiry Source Pie Chart ─── */
const SOURCE_COLORS: Record<string, string> = {
  whatsapp: "oklch(0.72 0.19 162)",
  website: "oklch(0.62 0.18 230)",
  email: "oklch(0.60 0.04 260)",
};

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  website: "Website",
  email: "Email",
};

export function EnquirySourceChart({
  enquiries,
  isLoading,
}: {
  enquiries: EnquiryListItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-5">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-52 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Count by source
  const sourceCounts = enquiries.reduce<Record<string, number>>((acc, e) => {
    acc[e.source] = (acc[e.source] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(sourceCounts).map(([source, count]) => ({
    name: SOURCE_LABELS[source] ?? source,
    value: count,
    color: SOURCE_COLORS[source] ?? "oklch(0.55 0 0)",
  }));

  if (pieData.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Enquiry Sources</h3>
          <p className="text-xs text-muted-foreground">No enquiry data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Enquiry Sources</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Distribution by channel</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-36 h-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            {pieData.map((entry) => {
              const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
              return (
                <div key={entry.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs font-medium text-foreground">{entry.name}</span>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      {entry.value}
                      <span className="text-muted-foreground font-normal ml-1">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: entry.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Enquiry Status Bar Chart ─── */
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "oklch(0.62 0.18 250)" },
  contacted: { label: "Contacted", color: "oklch(0.72 0.19 162)" },
  follow_up_pending: { label: "Follow Up", color: "oklch(0.75 0.18 75)" },
  qualified_lead: { label: "Qualified", color: "oklch(0.60 0.19 300)" },
  closed_won: { label: "Won", color: "oklch(0.72 0.21 152)" },
  closed_lost: { label: "Lost", color: "oklch(0.60 0.18 25)" },
};

export function EnquiryStatusChart({
  enquiries,
  isLoading,
}: {
  enquiries: EnquiryListItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-5">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-52 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const statusCounts = enquiries.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(statusCounts)
    .map(([status, count]) => ({
      name: STATUS_CONFIG[status]?.label ?? status,
      count,
      color: STATUS_CONFIG[status]?.color ?? "oklch(0.55 0 0)",
    }))
    .sort((a, b) => b.count - a.count);

  if (barData.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Enquiry Pipeline</h3>
          <p className="text-xs text-muted-foreground">No enquiry data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-foreground">Enquiry Pipeline</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Breakdown by status</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.55 0 0 / 0.08)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "oklch(0.55 0 0)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "oklch(0.55 0 0)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid oklch(0.90 0 0)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
