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

export const useAuthStore =
  create<AuthState & AuthActions>()(
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
            isAuthenticated:
              !!user && !!get().token,
          }),

        setToken: (token) =>
          set({
            token,
            isAuthenticated:
              !!token && !!get().authUser,
          }),

        setNewToken: (token) =>
          set({
            newToken: token,
          }),

        removeAuthUser: () =>
          set({
            authUser: null,
            token: null,
            isAuthenticated: false,
          }),

        setRequestLoading: (loading) =>
          set({
            requestLoading: loading,
          }),

        login: (user, token) => {
          set({
            authUser: user,
            token,
            isAuthenticated: true,
            isInitialized: true,
          });
        },

        logout: () => {
          set({
            authUser: null,
            token: null,
            newToken: null,
            isAuthenticated: false,
            isInitialized: true,
          });

          if (typeof window !== "undefined") {
            sessionStorage.removeItem(
              "auth_redirecting"
            );
          }
        },
      }),
      {
        name: "auth-storage",

        partialize: (state) => ({
          authUser: state.authUser,
          token: state.token,
        }),

        onRehydrateStorage: () => (state) => {
          useAuthStore.setState({
            isInitialized: true,
            isAuthenticated:
              !!state?.token &&
              !!state?.authUser,
          });
        },
      }
    )
  );

export default useAuthStore;