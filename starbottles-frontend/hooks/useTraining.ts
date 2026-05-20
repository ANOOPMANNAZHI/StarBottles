import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface TrainingMaterialItem {
  id: number;
  title: string;
  type: "video" | "pdf" | "document";
  description: string | null;
  download_url: string;
  created_at: string;
}

export interface TrainingMaterials {
  videos: TrainingMaterialItem[];
  pdfs: TrainingMaterialItem[];
  documents: TrainingMaterialItem[];
}

export interface CompanyInfoSection {
  id: number;
  section_key: string;
  title: string;
  content: string;
  display_order: number;
}

export function useTrainingMaterials() {
  return useQuery<TrainingMaterials>({
    queryKey: ["training-materials"],
    queryFn: () =>
      api.get("/v1/training/materials").then((r) => r.data.data as TrainingMaterials),
  });
}

export function useCompanyInfo() {
  return useQuery<CompanyInfoSection[]>({
    queryKey: ["company-info"],
    queryFn: () =>
      api.get("/v1/training/company-info").then((r) => r.data.data as CompanyInfoSection[]),
  });
}

export function useUploadMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post("/v1/training/materials", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-materials"] });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/v1/training/materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-materials"] });
    },
  });
}

export function useUpdateCompanyInfo(key: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string; display_order: number }) =>
      api.put(`/v1/training/company-info/${key}`, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-info"] });
    },
  });
}
