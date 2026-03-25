import { UserRole } from "@/lib/utils/roles";

/**
 * User helper functions for displaying user information
 */

/**
 * Get display name for user role
 * @param role - The user role enum value
 * @returns Formatted role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return "Super Admin";
    case UserRole.SONA_ADMIN:
      return "PEPP Admin";
    case UserRole.ADMIN:
      return "Admin";
    default:
      return "User";
  }
}

/**
 * Get user initials from name or email
 * @param name - User's name or email
 * @returns User initials (max 2 characters)
 */
export function getUserInitials(name: string): string {
  if (!name) return "U";

  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get display name from email
 * @param email - User's email address
 * @returns Username part of email or fallback
 */
export function getDisplayNameFromEmail(email: string): string {
  if (!email) return "Guest User";

  const username = email.split("@")[0];
  return username || "Guest User";
}

/**
 * Get user avatar props
 * @param user - User object with email
 * @returns Avatar display properties
 */
export function getUserAvatarProps(
  user: { email?: string; name?: string } | null
) {
  if (!user) {
    return {
      initials: "U",
      displayName: "Guest User",
      hasImage: false,
    };
  }

  const name = user.name || user.email || "";
  const initials = getUserInitials(name);
  const displayName = user.name || getDisplayNameFromEmail(user.email || "");

  return {
    initials,
    displayName,
    hasImage: false, // Set to true if you have user profile images
  };
}

/**
 * Format user role for display
 * @param role - User role enum value
 * @returns Formatted role string
 */
export function formatUserRole(role: UserRole | string | undefined): string {
  if (!role) return "User";

  // Handle string roles
  if (typeof role === "string") {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "SONA_ADMIN":
        return "PEPP Admin";
      case "ADMIN":
        return "Admin";
      default:
        return "User";
    }
  }

  return getRoleDisplayName(role);
}

/**
 * Get user display name from user object
 * @param user - User object from Zustand store
 * @returns Display name for the user
 */
export function getUserDisplayName(
  user: {
    email?: string;
    organization?: { name?: string };
  } | null
): string {
  if (!user) return "Guest User";

  // Use organization name if available, otherwise fall back to email username
  if (user.organization?.name) {
    return user.organization.name;
  }

  if (user.email) {
    const username = user.email.split("@")[0];
    return username || "Guest User";
  }

  return "Guest User";
}
