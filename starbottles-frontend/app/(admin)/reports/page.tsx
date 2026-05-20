"use client";

import { useState } from "react";
import { subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Download, ChevronDown, ChevronUp, BarChart2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import DateRangePicker from "@/components/ui/DateRangePicker";
import {
  useEnquiryReport,
  useExecutiveReport,
  useProductInterestReport,
  useExportReport,
  DateRange,
  ExecutiveRow,
} from "@/hooks/useReports";

// ── Palette constants ─────────────────────────────────────────────────────────
// These raw hex values correspond to our oklch design tokens for Recharts (which doesn't understand oklch)
const NAVY   = "#1a2744";  // ~oklch(0.26 0.10 252)
const CYAN   = "#2b8fca";  // ~oklch(0.62 0.19 218)
const TEAL   = "#1eab87";  // ~oklch(0.68 0.19 162)
const AMBER  = "#d4a017";  // ~oklch(0.75 0.18 60)
const COBALT = "#4d5dcc";  // ~oklch(0.64 0.22 270)
const CORAL  = "#e05a3a";  // ~oklch(0.72 0.20 30)
const SLATE  = "#94a3b8";

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  accentColor?: string;
  borderColor?: string;
}

function StatCard({ label, value, accentColor, borderColor }: StatCardProps) {
  return (
    <div
      className="rounded-2xl border bg-card shadow-sm p-5 flex flex-col gap-1 overflow-hidden relative"
      style={borderColor ? { borderLeftWidth: "4px", borderLeftColor: borderColor } : {}}
    >
      <p className="text-2xl font-bold tracking-tight text-foreground">{value.toLocaleString()}</p>
      <p className="text-xs font-semibold uppercase tracking-[0.10em] text-muted-foreground">{label}</p>
      {accentColor && (
        <div
          className="absolute right-4 top-4 w-8 h-8 rounded-full opacity-10"
          style={{ backgroundColor: accentColor }}
        />
      )}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  new: "#64748b",
  contacted: CYAN,
  follow_up_pending: AMBER,
  qualified_lead: COBALT,
  closed_won: TEAL,
  closed_lost: CORAL,
};

// ── Shared: Loading + Error states ────────────────────────────────────────────
function TabLoader() {
  return (
    <div className="rounded-2xl border bg-card shadow-sm flex items-center justify-center py-24 gap-3 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm font-medium">Loading report…</span>
    </div>
  );
}

function TabError({ message }: { message?: string }) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
      <AlertCircle className="h-8 w-8 text-destructive opacity-60" />
      <p className="text-sm font-medium text-foreground">Failed to load report</p>
      <p className="text-xs text-muted-foreground">{message ?? "Please try again."}</p>
    </div>
  );
}

// ── Tab 1: Enquiry Overview ───────────────────────────────────────────────────
function EnquiryTab({ range }: { range: DateRange }) {
  const { data, isLoading, isError, error } = useEnquiryReport(range);

  if (isLoading) return <TabLoader />;
  if (isError)   return <TabError message={(error as Error)?.message} />;
  if (!data)     return null;

  const { summary, daily_counts } = data;

  const statusData = Object.entries(summary.by_status).map(([key, value]) => ({
    name: key.replace(/_/g, " "),
    value,
    color: STATUS_COLORS[key] ?? "#ccc",
  }));

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Enquiries" value={summary.total} borderColor={NAVY} accentColor={NAVY} />
        <StatCard label="Website" value={summary.by_source.website} borderColor={CYAN} accentColor={CYAN} />
        <StatCard label="WhatsApp" value={summary.by_source.whatsapp} borderColor={TEAL} accentColor={TEAL} />
        <StatCard label="Email" value={summary.by_source.email} borderColor={SLATE} accentColor={SLATE} />
      </div>

      {/* Line chart */}
      <div className="rounded-2xl border bg-card shadow-sm p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-5">Daily Enquiry Trend</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={daily_counts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              labelStyle={{ fontWeight: 600, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="count"    name="Total"    stroke={NAVY}  strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="website"  name="Website"  stroke={CYAN}  strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="whatsapp" name="WhatsApp" stroke={TEAL}  strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status distribution */}
      <div className="rounded-2xl border bg-card shadow-sm p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-5">Status Distribution</p>
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ percent }) =>
                  (percent ?? 0) > 0.04 ? `${Math.round((percent ?? 0) * 100)}%` : ""
                }
                labelLine={false}
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2.5 min-w-0 flex-1">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-2.5 text-sm">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="capitalize text-muted-foreground flex-1">{s.name}</span>
                <span className="font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Executive Performance ──────────────────────────────────────────────
type SortKey = keyof Pick<ExecutiveRow, "assigned_count" | "contacted_count" | "qualified_count" | "closed_won" | "closed_lost" | "avg_response_time_minutes">;

function ExecutiveTab({ range }: { range: DateRange }) {
  const { data, isLoading, isError, error } = useExecutiveReport(range);
  const [sortKey, setSortKey] = useState<SortKey>("qualified_count");
  const [sortAsc, setSortAsc] = useState(false);

  if (isLoading) return <TabLoader />;
  if (isError)   return <TabError message={(error as Error)?.message} />;
  if (!data || data.length === 0)
    return (
      <div className="rounded-2xl border bg-card shadow-sm py-20 text-center text-muted-foreground">
        <BarChart2 className="h-12 w-12 mx-auto mb-3 opacity-[0.15]" />
        <p className="font-medium">No executive data in range.</p>
      </div>
    );

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const topId = sorted[0]?.executive_id;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((p) => !p);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortAsc ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />
    ) : null;

  return (
    <div className="space-y-5">
      {/* Bar chart */}
      <div className="rounded-2xl border bg-card shadow-sm p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-5">Performance Overview</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="executive_name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              labelStyle={{ fontWeight: 600, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="assigned_count"  name="Assigned"        fill={SLATE}  radius={[4, 4, 0, 0]} />
            <Bar dataKey="qualified_count" name="Qualified Leads" fill={COBALT} radius={[4, 4, 0, 0]} />
            <Bar dataKey="closed_won"      name="Closed Won"      fill={TEAL}   radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sortable table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold text-foreground pl-5">Executive</TableHead>
              {(
                [
                  ["assigned_count",             "Assigned"],
                  ["contacted_count",            "Contacted"],
                  ["qualified_count",            "Qualified"],
                  ["closed_won",                 "Won"],
                  ["closed_lost",                "Lost"],
                  ["avg_response_time_minutes",  "Avg Response"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <TableHead
                  key={key}
                  className="cursor-pointer hover:bg-muted/60 select-none text-right font-semibold text-foreground transition-colors duration-150 text-xs uppercase tracking-wide"
                  onClick={() => toggleSort(key)}
                >
                  {label}
                  <SortIcon k={key} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow
                key={row.executive_id}
                className={row.executive_id === topId ? "bg-teal-50/50" : ""}
              >
                <TableCell className="font-semibold pl-5 py-4">
                  {row.executive_name}
                  {row.executive_id === topId && (
                    <Badge
                      className="ml-2 text-[10px] font-bold uppercase tracking-wide text-white"
                      style={{ background: TEAL }}
                    >
                      Top
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{row.assigned_count}</TableCell>
                <TableCell className="text-right text-muted-foreground">{row.contacted_count}</TableCell>
                <TableCell className="text-right font-semibold" style={{ color: COBALT }}>{row.qualified_count}</TableCell>
                <TableCell className="text-right font-semibold" style={{ color: TEAL }}>{row.closed_won}</TableCell>
                <TableCell className="text-right font-semibold" style={{ color: CORAL }}>{row.closed_lost}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {row.avg_response_time_minutes !== null
                    ? `${row.avg_response_time_minutes} min`
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Tab 3: Product Interest ───────────────────────────────────────────────────
function ProductInterestTab({ range }: { range: DateRange }) {
  const { data, isLoading, isError, error } = useProductInterestReport(range);

  if (isLoading) return <TabLoader />;
  if (isError)   return <TabError message={(error as Error)?.message} />;
  if (!data)     return null;

  const maxViews   = data.most_viewed[0]?.view_count ?? 1;
  const maxEnquiry = data.most_enquired[0]?.enquiry_count ?? 1;

  const RankedList = ({
    items,
    countKey,
    label,
    max,
    barColor,
  }: {
    items: { product_id: number; title: string; category: string | null; view_count?: number; enquiry_count?: number }[];
    countKey: "view_count" | "enquiry_count";
    label: string;
    max: number;
    barColor: string;
  }) => (
    <div className="rounded-2xl border bg-card shadow-sm p-6 flex-1">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-5">{label}</p>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No data in range.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => {
            const count = (item[countKey] as number) ?? 0;
            const pct   = max > 0 ? (count / max) * 100 : 0;
            return (
              <div key={item.product_id} className="space-y-1.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <span className="font-bold text-muted-foreground w-5 text-right text-xs">{i + 1}</span>
                  <span className="flex-1 font-medium truncate text-foreground">{item.title}</span>
                  {item.category && (
                    <Badge variant="outline" className="text-[10px] shrink-0 font-semibold">
                      {item.category}
                    </Badge>
                  )}
                  <span className="font-bold shrink-0 text-foreground">{count.toLocaleString()}</span>
                </div>
                <div className="ml-7 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <RankedList items={data.most_viewed}   countKey="view_count"    label="Most Viewed Products"   max={maxViews}   barColor={NAVY} />
      <RankedList items={data.most_enquired} countKey="enquiry_count" label="Most Enquired Products" max={maxEnquiry} barColor={CYAN} />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TAB_REPORT_TYPE: Record<string, "enquiries" | "executive" | "product"> = {
  "enquiry-overview":      "enquiries",
  "executive-performance": "executive",
  "product-interest":      "product",
};

export default function ReportsPage() {
  const [range, setRange] = useState<DateRange>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState("enquiry-overview");
  const exportReport = useExportReport();

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    toast.info("Preparing download...");
    try {
      await exportReport({
        report_type: TAB_REPORT_TYPE[activeTab],
        format,
        date_from: range.from.toISOString().split("T")[0],
        date_to: range.to.toISOString().split("T")[0],
      });
    } catch {
      toast.error("Export failed. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Insights into your business performance</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="font-semibold text-white shrink-0 transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(90deg, oklch(0.26 0.10 252) 0%, oklch(0.62 0.19 218) 100%)",
              }}
            >
              <Download className="h-4 w-4 mr-2" /> Export
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("xlsx")}>Export as Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("pdf")}>Export as PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Date range picker ── */}
      <DateRangePicker value={range} onChange={setRange} />

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="rounded-xl bg-muted/50">
          <TabsTrigger value="enquiry-overview" className="rounded-lg text-xs font-semibold uppercase tracking-wide">
            Enquiry Overview
          </TabsTrigger>
          <TabsTrigger value="executive-performance" className="rounded-lg text-xs font-semibold uppercase tracking-wide">
            Executive Performance
          </TabsTrigger>
          <TabsTrigger value="product-interest" className="rounded-lg text-xs font-semibold uppercase tracking-wide">
            Product Interest
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enquiry-overview" className="mt-6">
          <EnquiryTab range={range} />
        </TabsContent>

        <TabsContent value="executive-performance" className="mt-6">
          <ExecutiveTab range={range} />
        </TabsContent>

        <TabsContent value="product-interest" className="mt-6">
          <ProductInterestTab range={range} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
