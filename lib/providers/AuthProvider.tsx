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
  "/dashboard/overview",
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
  "/onboarding",
  "/plans",
];

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/pricing",
  "/privacy",
  "/terms",
  ...AUTH_ROUTES,
];

function matchesPattern(
  pathname: string,
  patterns: string[]
): boolean {
  return patterns.some((pattern) => {
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

  const {
    isInitialized,
    isAuthenticated,
  } = useAuthStore();

  useEffect(() => {
    // Wait for Zustand persist hydration
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

    const isPublicRoute =
      matchesPattern(
        pathname,
        PUBLIC_ROUTES
      );

    // User NOT authenticated trying to access protected page
    if (
      isProtectedRoute &&
      !isAuthenticated
    ) {
      router.replace(
        `/?redirect=${encodeURIComponent(
          pathname
        )}`
      );

      return;
    }

    // Authenticated user trying to access auth pages
    if (
      isAuthRoute &&
      isAuthenticated
    ) {
      router.replace(
        "/dashboard/overview"
      );

      return;
    }

    // Non-public route protection
    if (
      !isPublicRoute &&
      !isAuthenticated
    ) {
      router.replace(
        `/?redirect=${encodeURIComponent(
          pathname
        )}`
      );
    }
  }, [
    pathname,
    isInitialized,
    isAuthenticated,
    router,
  ]);

  // Prevent rendering before hydration completes
  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
}