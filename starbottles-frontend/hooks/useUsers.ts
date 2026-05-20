import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface UserFilters {
  search?: string;
  role?: string;
  is_active?: number;
  per_page?: number;
  page?: number;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
}

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () =>
      api
        .get("/v1/users", { params: filters })
        .then((r) => r.data as { data: UserData[]; meta: any }),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      phone: string;
      role: string;
    }) => api.post("/v1/users", payload).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: number;
      name?: string;
      phone?: string;
      role?: string;
    }) => api.put(`/v1/users/${id}`, payload).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch(`/v1/users/${id}/toggle-active`).then((r) => r.data),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const snapshots = queryClient.getQueriesData<{ data: UserData[]; meta: any }>({
        queryKey: ["users"],
      });
      queryClient.setQueriesData<{ data: UserData[]; meta: any }>(
        { queryKey: ["users"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((u) =>
              u.id === id ? { ...u, is_active: !u.is_active } : u
            ),
          };
        }
      );
      return { snapshots };
    },
    onError: (_err, _id, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (id: number) =>
      api
        .post(`/v1/users/${id}/reset-password`)
        .then((r) => r.data.data as { message: string; temporary_password: string }),
  });
}
