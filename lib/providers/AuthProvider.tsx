"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/lib/store/auth';

interface AuthProviderProps {
  children: ReactNode;
}

const PROTECTED_ROUTES = [
  '/dashboard/overview',
  '/organization',
  '/admin',
  '/settings',
  '/profile',
  '/notifications',
  '/invites',
  '/calendar',
  '/conversations',
];

const AUTH_ROUTES = [
  '/',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
  '/onboarding',
  '/plans',
];

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/pricing',
  '/privacy',
  '/terms',
  ...AUTH_ROUTES,
];

function matchesPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.endsWith('*')) {
      return pathname.startsWith(pattern.slice(0, -1));
    }
    return pathname === pattern || pathname.startsWith(pattern + '/');
  });
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { initialize, isInitialized, isAuthenticated, authUser } = useAuthStore();

  // useEffect(() => {
  //   // Initialize auth state from localStorage
  //   if (!isInitialized) {
  //     initialize();
  //   }
  // }, [initialize, isInitialized]);

  useEffect(() => {
    // Don't run route protection until auth is initialized
    if (!isInitialized) return;

    const isProtectedRoute = matchesPattern(pathname, PROTECTED_ROUTES);
    const isAuthRoute = matchesPattern(pathname, AUTH_ROUTES);
    const isPublicRoute = matchesPattern(pathname, PUBLIC_ROUTES);

    // Handle protected routes
    if (isProtectedRoute && !isAuthenticated) {
      router.push(`/?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Handle auth routes (redirect authenticated users away)
    if (isAuthRoute && isAuthenticated) {
      router.push('/dashboard/overview');
      return;
    }

    // Handle root path
    if (pathname === '/' && isAuthenticated) {
      router.push('/dashboard/overview');
      return;
    }

    // For any other route that's not public, redirect to login if not authenticated
    if (!isPublicRoute && !isAuthenticated) {
      router.push(`/?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
  }, [pathname, isInitialized, isAuthenticated, router]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}