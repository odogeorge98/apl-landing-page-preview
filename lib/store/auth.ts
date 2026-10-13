
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "@/lib/interfaces/auth";

interface AuthState {
  authUser: AuthUser | null;
  token: string | null;
  requestLoading: boolean;
  newToken: string | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
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
    (set, get) => ({
      authUser: null,
      token: null,
      requestLoading: false,
      newToken: null,
      isInitialized: false,
      isAuthenticated: false,

      setAuthUser: (user) =>
        set({
          authUser: user,
          isAuthenticated: Boolean(user && get().token),
        }),

      setToken: (token) =>
        set({
          token,
          isAuthenticated: Boolean(token && get().authUser),
        }),

      setNewToken: (newToken) => set({ newToken }),

      removeAuthUser: () =>
        set({
          authUser: null,
          token: null,
          newToken: null,
          isAuthenticated: false,
        }),

      setRequestLoading: (requestLoading) =>
        set({ requestLoading }),

      login: (authUser, token) =>
        set({
          authUser,
          token,
          isAuthenticated: true,
          isInitialized: true,
          newToken: null,
        }),

      logout: () => {
        set({
          authUser: null,
          token: null,
          newToken: null,
          isAuthenticated: false,
          isInitialized: true,
          requestLoading: false,
        });

        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.removeItem("auth_redirecting");
          } catch {
            // Storage can be unavailable in restricted browser contexts.
          }
        }
      },
    }),
    {
      name: "auth-storage",

      // Do not persist transient request or initialization state.
      partialize: (state) => ({
        authUser: state.authUser,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => (state, error) => {
        if (error) {
          useAuthStore.setState({
            authUser: null,
            token: null,
            isAuthenticated: false,
            isInitialized: true,
          });
          return;
        }

        useAuthStore.setState({
          isInitialized: true,
          isAuthenticated: Boolean(
            state?.token && state?.authUser,
          ),
        });
      },
    },
  ),
);

export default useAuthStore;
