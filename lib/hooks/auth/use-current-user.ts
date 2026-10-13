
"use client";

import useAuthStore from "@/lib/store/auth";
import type { UserType } from "@/lib/types/users";

export function useCurrentUser() {
  const authUser = useAuthStore((state) => state.authUser);
  const token = useAuthStore((state) => state.token);
  const isInitialized = useAuthStore(
    (state) => state.isInitialized,
  );
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  const role = authUser?.role as UserType | undefined;

  return {
    user: authUser,
    role,
    token,
    isInitialized,
    isAuthenticated:
      isAuthenticated && Boolean(authUser) && Boolean(token),
  };
}
