
import type { UserType } from "@/lib/types/users";

export const AUTH_CONFIG = {
  loginPath: "/login",
  forgotPasswordPath: "/forgot-password",
  resetPasswordPath: "/reset-password",

  defaultRedirectByRole: {
    ADMIN: "/dashboard",
    TUTOR: "/tutor/dashboard",
    STUDENT: "/student/dashboard",
  } satisfies Record<UserType, string>,

  protectedRoutePrefixes: {
    ADMIN: ["/dashboard"],
    TUTOR: ["/tutor"],
    STUDENT: ["/student"],
  } satisfies Record<UserType, string[]>,

  publicRoutes: [
    "/",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/courses",
  ],

  unauthorizedPath: "/unauthorized",
} as const;

export function getDefaultRedirect(role: UserType): string {
  return AUTH_CONFIG.defaultRedirectByRole[role];
}

export function canAccessRoute(
  role: UserType,
  pathname: string,
): boolean {
  const prefixes = AUTH_CONFIG.protectedRoutePrefixes[role];

  return prefixes.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(`${prefix}/`),
  );
}
