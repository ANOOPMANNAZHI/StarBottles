import { create } from "zustand";

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  role: string | null;
  setUser: (user: AuthUser, token: string, role: string) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  role: null,
  setUser: (user, token, role) => set({ user, token, role }),
  clearUser: () => set({ user: null, token: null, role: null }),
}));
