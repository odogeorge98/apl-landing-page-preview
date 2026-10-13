
"use client";

import useAuthStore from "@/lib/store/auth";
import { useAuthHydrated } from "./use-auth-hydrated";
import type { UserType } from "@/lib/types/users";

export function useCurrentUser() {
  const authUser = useAuthStore((s) => s.authUser);
  const token = useAuthStore((s) => s.token);
  const isInitialized = useAuthHydrated();

  return {
    user: authUser,
    role: authUser?.role as UserType | undefined,
    token,
    isInitialized,
    isAuthenticated: Boolean(authUser && token),
  };
}