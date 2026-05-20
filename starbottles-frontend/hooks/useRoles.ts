import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface PermissionItem {
  name: string;
  label: string;
}

export interface PermissionGroup {
  group: string;
  permissions: PermissionItem[];
}

export interface RoleItem {
  id: number;
  name: string;
  is_default: boolean;
  permissions: string[];
  users_count: number;
}

export function usePermissions() {
  return useQuery<PermissionGroup[]>({
    queryKey: ["permissions"],
    queryFn: () => api.get("/v1/permissions").then((r) => r.data.data),
    staleTime: Infinity,
  });
}

export function useRoles() {
  return useQuery<RoleItem[]>({
    queryKey: ["roles"],
    queryFn: () => api.get("/v1/roles").then((r) => r.data.data),
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; permissions: string[] }) =>
      api.post("/v1/roles", data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
      name?: string;
      permissions: string[];
    }) => api.put(`/v1/roles/${id}`, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/v1/roles/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}
