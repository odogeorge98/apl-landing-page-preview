// 1. Import UserType as a value, not just a type
import { UserType } from "@/lib/types/users";

export type RoutePermission = {
  pattern: string;
  // 2. Updated to use the Enum type
  roles: readonly UserType[];
};

/**
 * Add each protected route here.
 *
 * A route matches both its exact path and its nested routes.
 * More specific matching rules take precedence.
 */
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Admin dashboard and administration.
  { pattern: "/dashboard", roles: [UserType.ADMIN] },
  { pattern: "/business", roles: [UserType.ADMIN] },
  { pattern: "/organization", roles: [UserType.ADMIN] },
  { pattern: "/system", roles: [UserType.ADMIN] },

  // Tutor portal.
  { pattern: "/tutor/dashboard", roles: [UserType.TUTOR] },

  // Student portal.
  { pattern: "/student/dashboard", roles: [UserType.STUDENT] },

  // Shared authenticated pages.
  {
    pattern: "/settings",
    roles: [/* UserType.ADMIN, UserType.TUTOR, */UserType.STUDENT],
  },
  {
    pattern: "/profile",
    roles: [UserType.ADMIN, UserType.TUTOR, UserType.STUDENT],
  },
  {
    pattern: "/notifications",
    roles: [UserType.ADMIN, UserType.TUTOR, UserType.STUDENT],
  },
  {
    pattern: "/calendar",
    roles: [UserType.ADMIN, UserType.TUTOR, UserType.STUDENT],
  },
  {
    pattern: "/conversations",
    roles: [UserType.ADMIN, UserType.TUTOR, UserType.STUDENT],
  },
  {
    pattern: "/invites",
    roles: [UserType.ADMIN, UserType.TUTOR],
  },
  {
    pattern: "/support",
    roles: [UserType.STUDENT],
  },
];

export const AUTH_ROUTES = [
  "/",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/onboarding",
  "/plans",
];

export const PUBLIC_ROUTES = [
  "/about",
  "/pricing",
  "/privacy",
  "/terms",
];

export function matchesRoute(
  pathname: string,
  pattern: string,
): boolean {
  return (
    pathname === pattern ||
    pathname.startsWith(`${pattern}/`)
  );
}

export function getRoutePermission(pathname: string) {
  // Match the most specific route first.
  return ROUTE_PERMISSIONS
    .filter((rule) => matchesRoute(pathname, rule.pattern))
    .sort((a, b) => b.pattern.length - a.pattern.length)[0];
}
