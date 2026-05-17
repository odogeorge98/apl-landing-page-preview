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
  setInitialized: (initialized: boolean) => void;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  initialize: () => void;
  checkAuthStatus: () => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
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
          isAuthenticated: !!user && !!get().token,
        }),

      setToken: (token) =>
        set({
          token,
          isAuthenticated: !!token && !!get().authUser,
        }),

      setNewToken: (token) =>
        set({
          newToken: token,
        }),

      removeAuthUser: () =>
        set({
          authUser: null,
          isAuthenticated: false,
        }),

      setRequestLoading: (loading) =>
        set({
          requestLoading: loading,
        }),

      setInitialized: (initialized) =>
        set({
          isInitialized: initialized,
        }),

      login: (user, token) => {
        set({
          authUser: user,
          token,
          isInitialized: true,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          authUser: null,
          token: null,
          newToken: null,
          isInitialized: true,
          isAuthenticated: false,
        });

        if (typeof window !== "undefined") {
          sessionStorage.removeItem("auth_redirecting");
        }
      },

      initialize: () => {
        set({
          isInitialized: true,
        });
      },

      checkAuthStatus: () => {
        return get().isAuthenticated;
      },
    }),
    {
      name: "auth-storage",

      partialize: (state) => ({
        authUser: state.authUser,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isInitialized = true;
        }
      },
    }
  )
);

export default useAuthStore;

