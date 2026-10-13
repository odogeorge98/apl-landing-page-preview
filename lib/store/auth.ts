
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/lib/interfaces/auth";

interface AuthState {
  authUser: AuthUser | null;
  token: string | null;
  requestLoading: boolean;
  newToken: string | null;
}


interface AuthActions {
  setAuthUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setNewToken: (token: string | null) => void;
  removeAuthUser: () => void;
  setRequestLoading: (loading: boolean) => void;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      authUser: null,
      token: null,
      requestLoading: false,
      newToken: null,

      setAuthUser: (authUser) => set({ authUser }),
      setToken: (token) => set({ token }),
      setNewToken: (newToken) => set({ newToken }),
      removeAuthUser: () =>
        set({ authUser: null, token: null, newToken: null }),
      setRequestLoading: (requestLoading) => set({ requestLoading }),
      login: (authUser, token) =>
        set({ authUser, token, newToken: null }),
      logout: () => {
        set({ authUser: null, token: null, newToken: null, requestLoading: false });
        try {
          window.sessionStorage.removeItem("auth_redirecting");
        } catch {}
      },
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({ authUser: s.authUser, token: s.token }),
    },
  ),
);

export default useAuthStore;
