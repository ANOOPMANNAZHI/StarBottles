import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface DateRange {
  from: Date;
  to: Date;
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export interface EnquiryReportData {
  summary: {
    total: number;
    by_source: { website: number; whatsapp: number; email: number };
    by_status: {
      new: number;
      contacted: number;
      follow_up_pending: number;
      qualified_lead: number;
      closed_won: number;
      closed_lost: number;
    };
  };
  daily_counts: { date: string; count: number; website: number; whatsapp: number; email: number }[];
}

export interface ExecutiveRow {
  executive_id: number;
  executive_name: string;
  assigned_count: number;
  contacted_count: number;
  qualified_count: number;
  closed_won: number;
  closed_lost: number;
  avg_response_time_minutes: number | null;
}

export interface ProductInterestData {
  most_viewed: { product_id: number; title: string; category: string | null; view_count: number }[];
  most_enquired: { product_id: number; title: string; category: string | null; enquiry_count: number }[];
}

export function useEnquiryReport(range: DateRange) {
  return useQuery<EnquiryReportData>({
    queryKey: ["report-enquiries", formatDate(range.from), formatDate(range.to)],
    queryFn: () =>
      api
        .get("/v1/reports/enquiries", {
          params: { date_from: formatDate(range.from), date_to: formatDate(range.to) },
        })
        .then((r) => r.data.data as EnquiryReportData),
  });
}

export function useExecutiveReport(range: DateRange) {
  return useQuery<ExecutiveRow[]>({
    queryKey: ["report-executive", formatDate(range.from), formatDate(range.to)],
    queryFn: () =>
      api
        .get("/v1/reports/executive-performance", {
          params: { date_from: formatDate(range.from), date_to: formatDate(range.to) },
        })
        .then((r) => r.data.data as ExecutiveRow[]),
  });
}

export function useProductInterestReport(range: DateRange) {
  return useQuery<ProductInterestData>({
    queryKey: ["report-product-interest", formatDate(range.from), formatDate(range.to)],
    queryFn: () =>
      api
        .get("/v1/reports/product-interest", {
          params: { date_from: formatDate(range.from), date_to: formatDate(range.to) },
        })
        .then((r) => r.data.data as ProductInterestData),
  });
}

export function useExportReport() {
  return async (params: {
    report_type: "enquiries" | "executive" | "product";
    format: "csv" | "xlsx" | "pdf";
    date_from: string;
    date_to: string;
  }) => {
    const ext = params.format === "xlsx" ? "xlsx" : params.format;
    const filename = `${params.report_type}-report-${params.date_from}-to-${params.date_to}.${ext}`;

    const response = await api.get("/v1/reports/export", {
      params,
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };
}
