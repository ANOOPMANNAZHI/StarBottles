import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface EnquiryNote {
  id: number;
  note_text: string;
  created_at: string;
  author: { id: number; name: string } | null;
}

export interface EnquiryListItem {
  id: number;
  customer_name: string;
  phone: string;
  source: "website" | "whatsapp" | "email";
  status: "new" | "contacted" | "follow_up_pending" | "qualified_lead" | "closed_won" | "closed_lost";
  received_at: string;
  received_at_raw: string;
  follow_up_date: string | null;
  is_overdue: boolean;
  response_time_minutes: number | null;
  product_title: string | null;
  assigned_to_name: string | null;
  latest_note_snippet: string | null;
}

export interface EnquiryDetail extends EnquiryListItem {
  email: string | null;
  message: string | null;
  first_action_at: string | null;
  product: { id: number; title: string; first_image: string | null } | null;
  assigned_to: { id: number; name: string; phone: string } | null;
  notes: EnquiryNote[];
}

export interface EnquiryFilters {
  status?: string;
  source?: string;
  assigned_to?: number | string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export function useEnquiries(filters: EnquiryFilters = {}, page = 1) {
  const params = Object.fromEntries(
    Object.entries({ ...filters, page }).filter(([, v]) => v !== undefined && v !== "")
  );
  return useQuery({
    queryKey: ["enquiries", params],
    queryFn: () =>
      api.get("/v1/enquiries", { params }).then((r) => ({
        data: r.data.data as EnquiryListItem[],
        meta: r.data.meta,
      })),
    refetchInterval: 30000,
  });
}

export function useEnquiry(id: number | null) {
  return useQuery({
    queryKey: ["enquiry", id],
    queryFn: () =>
      api.get(`/v1/enquiries/${id}`).then((r) => r.data.data as EnquiryDetail),
    enabled: !!id,
    staleTime: 0,
  });
}

export function useUpdateEnquiryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, follow_up_date }: { id: number; status: string; follow_up_date?: string | null }) =>
      api.patch(`/v1/enquiries/${id}/status`, { status, follow_up_date }).then((r) => r.data.data),
    onSuccess: (updated, { id }) => {
      // Update list cache optimistically
      queryClient.setQueriesData<{ data: EnquiryListItem[] }>(
        { queryKey: ["enquiries"], exact: false },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((e) =>
              e.id === id ? { ...e, status: updated.status, follow_up_date: updated.follow_up_date } : e
            ),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
    },
  });
}

export function useAddEnquiryNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enquiryId, note_text }: { enquiryId: number; note_text: string }) =>
      api.post(`/v1/enquiries/${enquiryId}/notes`, { note_text }).then((r) => r.data.data as EnquiryNote),
    onSuccess: (note, { enquiryId }) => {
      queryClient.setQueryData<EnquiryDetail>(["enquiry", enquiryId], (old) => {
        if (!old) return old;
        return { ...old, notes: [...old.notes, note] };
      });
    },
  });
}

export function useAssignEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enquiryId, assigned_to }: { enquiryId: number; assigned_to: number }) =>
      api.post(`/v1/enquiries/${enquiryId}/assign`, { assigned_to }).then((r) => r.data.data),
    onSuccess: (_, { enquiryId }) => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["enquiry", enquiryId] });
    },
  });
}
