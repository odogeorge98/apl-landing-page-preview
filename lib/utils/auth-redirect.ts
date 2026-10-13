
import type { UserType } from "@/lib/types/users";

export const defaultRedirectByRole = {
  ADMIN: "/dashboard",
  TUTOR: "/tutor/dashboard",
  STUDENT: "/student/dashboard",
} satisfies Record<UserType, string>;

export function getDashboardPath(
  userType: UserType | string | undefined | null,
): string {
  if (userType && userType in defaultRedirectByRole) {
    return defaultRedirectByRole[userType as UserType];
  }

  // Safe fallback if the stored role is missing or unrecognized.
  return "/dashboard";
}

/**
 * Only accept internal application paths as redirect destinations.
 * This prevents redirects to external websites.
 */
export function getSafeRedirectPath(
  redirect: string | null,
): string | null {
  if (
    !redirect ||
    !redirect.startsWith("/") ||
    redirect.startsWith("//") ||
    redirect.includes("\\")
  ) {
    return null;
  }

  return redirect;
}
