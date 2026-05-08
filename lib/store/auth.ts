import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "@/lib/interfaces/auth";
import { dashboardAuthBypass } from "@/lib/config/dashboard-auth";
import {
  MOCK_ADMIN_USER,
  MOCK_PREVIEW_TOKEN,
} from "@/lib/dev/mock-admin-user";

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

      setAuthUser: (user) => set({ authUser: user }),

      setToken: (token) => {
        set({ token });

        if (typeof window !== "undefined") {
          if (token) {
            localStorage.setItem("auth_token", token);
          } else {
            localStorage.removeItem("auth_token");
          }
        }
      },

      setNewToken: (token) => set({ newToken: token }),

      removeAuthUser: () =>
        set({
          authUser: null,
          isAuthenticated: false,
        }),

      setRequestLoading: (loading) =>
        set({ requestLoading: loading }),

      setInitialized: (initialized) =>
        set({ isInitialized: initialized }),

      login: (user, token) => {
        set({
          authUser: user,
          token,
          isInitialized: true,
          isAuthenticated: true,
        });

        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token);
          localStorage.setItem(
            "auth_user",
            JSON.stringify(user),
          );
        }
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
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        }
      },

      initialize: () => {
        if (typeof window !== "undefined") {
          if (dashboardAuthBypass) {
            const token =
              localStorage.getItem("auth_token");

            const userStr =
              localStorage.getItem("auth_user");

            if (!token || !userStr) {
              get().login(
                MOCK_ADMIN_USER,
                MOCK_PREVIEW_TOKEN,
              );

              return;
            }
          }

          const token =
            localStorage.getItem("auth_token");

          const userStr =
            localStorage.getItem("auth_user");

          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);

              set({
                authUser: user,
                token,
                isInitialized: true,
                isAuthenticated: true,
              });

              return;
            } catch (error) {
              console.error(
                "Error parsing stored user data:",
                error,
              );

              localStorage.removeItem("auth_token");
              localStorage.removeItem("auth_user");
            }
          }
        }

        set({
          isInitialized: true,
        });
      },

      checkAuthStatus: () => {
        const state = get();

        return !!state.token && !!state.authUser;
      },
    }),
    {
      name: "auth-storage",

      partialize: (state) => ({
        authUser: state.authUser,
        token: state.token,
        isInitialized: state.isInitialized,
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

// Add default export for compatibility
export default useAuthStore;
