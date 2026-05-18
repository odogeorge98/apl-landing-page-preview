"use client";

import {
  useEffect,
  ReactNode,
} from "react";

import {
  useRouter,
  usePathname,
} from "next/navigation";

import useAuthStore from "@/lib/store/auth";

interface AuthProviderProps {
  children: ReactNode;
}

const PROTECTED_ROUTES = [
  "/dashboard",
  "/organization",
  "/admin",
  "/settings",
  "/profile",
  "/notifications",
  "/invites",
  "/calendar",
  "/conversations",
];

const AUTH_ROUTES = [
  "/",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];

function matchesPattern(
  pathname: string,
  patterns: string[]
): boolean {
  return patterns.some((pattern) => {
    // Root route must match EXACTLY
    if (pattern === "/") {
      return pathname === "/";
    }

    // Wildcard support
    if (pattern.endsWith("*")) {
      return pathname.startsWith(
        pattern.slice(0, -1)
      );
    }

    return (
      pathname === pattern ||
      pathname.startsWith(pattern + "/")
    );
  });
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const router = useRouter();

  const pathname = usePathname();

  const isInitialized =
    useAuthStore(
      (state) => state.isInitialized
    );

  const isAuthenticated =
    useAuthStore(
      (state) => state.isAuthenticated
    );

  useEffect(() => {
    if (!isInitialized) return;

    const isProtectedRoute =
      matchesPattern(
        pathname,
        PROTECTED_ROUTES
      );

    const isAuthRoute =
      matchesPattern(
        pathname,
        AUTH_ROUTES
      );

    // NOT authenticated
    if (
      isProtectedRoute &&
      !isAuthenticated
    ) {
      router.replace("/");
      return;
    }

    // Already authenticated
    if (
      isAuthRoute &&
      isAuthenticated
    ) {
      router.replace(
        "/dashboard/overview"
      );
    }
  }, [
    pathname,
    isInitialized,
    isAuthenticated,
    router,
  ]);

  // IMPORTANT
  // Prevent blank screen during hydration
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}