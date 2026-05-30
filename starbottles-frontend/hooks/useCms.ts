import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────

export interface MediaItem {
  id: number;
  filename: string;
  url: string;
  mime_type: string;
  size: number;
  alt_text: string | null;
  created_at: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  eyebrow: string | null;
  image_url: string | null;
  video_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  cta_secondary_text: string | null;
  cta_secondary_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface SiteSetting {
  id: number;
  key: string;
  value: string | null;
  type: string;
  group: string;
}

export interface PageSection {
  id: number;
  section_key: string;
  content_type: string;
  content: string | null;
  display_order: number;
}

export interface SeoEntry {
  id: number;
  page_slug: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  extra_head_tags: string | null;
}

export interface Testimonial {
  id: number;
  quote: string;
  name: string;
  business: string;
  location: string;
  metric: string | null;
  initials: string;
  rating: number;
  order: number;
  is_active: boolean;
}

export interface Milestone {
  id: number;
  year: number;
  title: string;
  description: string | null;
  order: number;
  is_active: boolean;
}

export interface CompanyStats {
  established: number;
  clients: { value: number; suffix: string };
  skus: { value: number; suffix: string };
  states: { value: number; suffix: string };
  unitsShipped: { value: number; suffix: string };
}

// ── Media ──────────────────────────────────────────────────────────────

export function useMedia(mimeType?: string) {
  const params: Record<string, string> = {};
  if (mimeType) params.mime_type = mimeType;
  return useQuery<MediaItem[]>({
    queryKey: ["cms-media", mimeType],
    queryFn: () => api.get("/v1/cms/media", { params }).then((r) => r.data.data),
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => {
      const fd = new FormData();
      files.forEach((f) => fd.append("files[]", f));
      return api.post("/v1/cms/media", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data.data as MediaItem[]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-media"] }),
  });
}

export function useUpdateMediaAlt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, alt_text }: { id: number; alt_text: string }) =>
      api.patch(`/v1/cms/media/${id}`, { alt_text }).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-media"] }),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/v1/cms/media/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-media"] }),
  });
}

// ── Banners ────────────────────────────────────────────────────────────

export function useBanners() {
  return useQuery<Banner[]>({
    queryKey: ["cms-banners"],
    queryFn: () => api.get("/v1/cms/banners").then((r) => r.data.data),
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) =>
      api.post("/v1/cms/banners", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-banners"] }),
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fd }: { id: number; fd: FormData }) =>
      api.post(`/v1/cms/banners/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-banners"] }),
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/v1/cms/banners/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-banners"] }),
  });
}

export function useReorderBanners() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: number[]) =>
      api.post("/v1/cms/banners/reorder", { order }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-banners"] }),
  });
}

// ── Site Settings ──────────────────────────────────────────────────────

export function useSiteSettings() {
  return useQuery<Record<string, SiteSetting[]>>({
    queryKey: ["cms-settings"],
    queryFn: () => api.get("/v1/cms/settings").then((r) => r.data.data),
  });
}

export function useBulkUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: { key: string; value: string | null }[]) =>
      api.put("/v1/cms/settings", { settings }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-settings"] }),
  });
}

// ── Page Content ───────────────────────────────────────────────────────

export function usePages() {
  return useQuery<Record<string, PageSection[]>>({
    queryKey: ["cms-pages"],
    queryFn: () => api.get("/v1/cms/pages").then((r) => r.data.data),
  });
}

export function usePageSections(slug: string) {
  return useQuery<PageSection[]>({
    queryKey: ["cms-page", slug],
    queryFn: () => api.get(`/v1/cms/pages/${slug}`).then((r) => r.data.data),
    enabled: !!slug,
  });
}

export function useUpdatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, sections }: { slug: string; sections: { section_key: string; content: string | null }[] }) =>
      api.put(`/v1/cms/pages/${slug}`, { sections }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms-pages"] });
      qc.invalidateQueries({ queryKey: ["cms-page"] });
    },
  });
}

// ── SEO ────────────────────────────────────────────────────────────────

export function useSeoList() {
  return useQuery<SeoEntry[]>({
    queryKey: ["cms-seo"],
    queryFn: () => api.get("/v1/cms/seo").then((r) => r.data.data),
  });
}

export function useUpdateSeo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, ...data }: { slug: string; meta_title?: string; meta_description?: string; og_image_path?: string; extra_head_tags?: string }) =>
      api.put(`/v1/cms/seo/${slug}`, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-seo"] }),
  });
}

// ── Testimonials ────────────────────────────────────────────────────────

export function useTestimonials() {
  return useQuery<Testimonial[]>({
    queryKey: ["cms-testimonials"],
    queryFn: () => api.get("/v1/cms/testimonials").then((r) => r.data.data),
  });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Testimonial, "id">) =>
      api.post("/v1/cms/testimonials", data).then((r) => r.data.data as Testimonial),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-testimonials"] }),
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Testimonial> & { id: number }) =>
      api.put(`/v1/cms/testimonials/${id}`, data).then((r) => r.data.data as Testimonial),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-testimonials"] }),
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/v1/cms/testimonials/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-testimonials"] }),
  });
}

export function useReorderTestimonials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: number[]) =>
      api.post("/v1/cms/testimonials/reorder", { order }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-testimonials"] }),
  });
}

// ── Milestones ──────────────────────────────────────────────────────────

export function useMilestones() {
  return useQuery<Milestone[]>({
    queryKey: ["cms-milestones"],
    queryFn: () => api.get("/v1/cms/milestones").then((r) => r.data.data),
  });
}

export function useCreateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Milestone, "id">) =>
      api.post("/v1/cms/milestones", data).then((r) => r.data.data as Milestone),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-milestones"] }),
  });
}

export function useUpdateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Milestone> & { id: number }) =>
      api.put(`/v1/cms/milestones/${id}`, data).then((r) => r.data.data as Milestone),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-milestones"] }),
  });
}

export function useDeleteMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/v1/cms/milestones/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-milestones"] }),
  });
}

export function useReorderMilestones() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: number[]) =>
      api.post("/v1/cms/milestones/reorder", { order }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-milestones"] }),
  });
}

// ── Company Stats ───────────────────────────────────────────────────────

export function useCompanyStats() {
  return useQuery<CompanyStats | null>({
    queryKey: ["cms-company-stats"],
    queryFn: () =>
      api.get("/v1/cms/settings").then((r) => {
        const setting = (r.data.data?.general ?? []).find(
          (s: SiteSetting) => s.key === "company_stats"
        );
        return setting?.value ? (JSON.parse(setting.value) as CompanyStats) : null;
      }),
  });
}

export function useUpdateCompanyStats() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stats: CompanyStats) =>
      api.put("/v1/cms/settings", {
        settings: [{ key: "company_stats", value: JSON.stringify(stats) }],
      }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms-company-stats"] });
      qc.invalidateQueries({ queryKey: ["cms-settings"] });
    },
  });
}
