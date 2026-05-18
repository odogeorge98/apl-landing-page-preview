"use client";

import { useEffect, useState, ReactNode, Suspense } from "react";
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
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const { isInitialized, isAuthenticated } = useAuthStore();

  // ── Safety net: if rehydration hasn't fired within 500ms, unblock the UI ──
  const [forceReady, setForceReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isInitialized && !forceReady) return; // still waiting

    const isProtectedRoute = matchesPattern(pathname, PROTECTED_ROUTES);
    const isAuthRoute      = matchesPattern(pathname, AUTH_ROUTES);
    const isPublicRoute    = matchesPattern(pathname, PUBLIC_ROUTES);

    if (isProtectedRoute && !isAuthenticated) {
      router.replace(`/?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isAuthRoute && isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/dashboard/overview";
      router.replace(redirectTo);
      return;
    }

    if (!isPublicRoute && !isProtectedRoute && !isAuthRoute && !isAuthenticated) {
      router.replace(`/?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, isInitialized, forceReady, isAuthenticated, router, searchParams]);

  // Block render only until either Zustand rehydrates OR the 500ms fallback fires
  if (!isInitialized && !forceReady) return null;

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