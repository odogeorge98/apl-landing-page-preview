"use client";

import { useEffect, ReactNode, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import useAuthStore from "@/lib/store/auth";

// ─── Route lists ──────────────────────────────────────────────────────────────
//
// Use trailing * to match entire route subtrees.
// matchesPattern strips the * and checks pathname.startsWith().

const PROTECTED_ROUTES = [
  "/dashboard*",      // covers /dashboard/overview, /dashboard/users, etc.
  "/organization*",
  "/settings*",
  "/profile*",
  "/notifications*",
  "/invites*",
  "/calendar*",
  "/conversations*",
  "/system*"
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

// Routes that do NOT require auth and do NOT redirect authenticated users
const PUBLIC_ROUTES = [
  "/about",
  "/pricing",
  "/privacy",
  "/terms",
];

function matchesPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.endsWith("*")) {
      return pathname.startsWith(pattern.slice(0, -1));
    }
    return pathname === pattern || pathname.startsWith(pattern + "/");
  });
}

// ─── Inner guard (needs useSearchParams → must be under a Suspense boundary) ─

function AuthGuard({ children }: { children: ReactNode }) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const { isInitialized, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    const isProtectedRoute = matchesPattern(pathname, PROTECTED_ROUTES);
    const isAuthRoute      = matchesPattern(pathname, AUTH_ROUTES);
    const isPublicRoute    = matchesPattern(pathname, PUBLIC_ROUTES);

    // ── Unauthenticated on a protected route → send to login ──────────────
    if (isProtectedRoute && !isAuthenticated) {
      router.replace(`/?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // ── Authenticated on an auth page (login, OTP, etc.) → send to dashboard
    // Reads the ?redirect= param so deep-link URLs are preserved after login.
    if (isAuthRoute && isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/dashboard/overview";
      router.replace(redirectTo);
      return;
    }

    // ── Non-public, non-auth, non-protected route without auth → login ────
    if (!isPublicRoute && !isProtectedRoute && !isAuthRoute && !isAuthenticated) {
      router.replace(`/?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, isInitialized, isAuthenticated, router, searchParams]);

  // Block rendering until Zustand persist rehydrates — prevents flash of
  // protected content and premature route decisions.
  if (!isInitialized) return null;

  return <>{children}</>;
}

// ─── Public export — wraps in Suspense (required for useSearchParams) ────────

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthGuard>{children}</AuthGuard>
    </Suspense>
  );
}