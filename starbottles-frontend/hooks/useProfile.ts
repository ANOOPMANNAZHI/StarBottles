import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

export function useProfile() {
  return useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: () => api.get("/v1/auth/me").then((r) => r.data.data),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; phone?: string }) =>
      api.put("/v1/auth/profile", payload).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) => api.put("/v1/auth/change-password", payload).then((r) => r.data),
  });
}
