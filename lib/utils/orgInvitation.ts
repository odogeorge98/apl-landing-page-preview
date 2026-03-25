import dayjs from "dayjs";
import { Invitation } from "@/lib/interfaces/organisation";

/**
 * Helper function to format date
 * @param dateString - ISO date string
 * @returns Formatted date string (DD MMM YYYY, HH:mm)
 */
export const formatDate = (dateString: string): string => {
  return dayjs(dateString).format("DD MMM YYYY, HH:mm");
};

/**
 * Helper function to transform API invitations data to table format
 * @param invitations - Array of invitation objects from API
 * @returns Array of transformed data for table display
 */
export const transformInvitationsToTableData = (invitations: Invitation[]) => {
  return invitations.map((invitation) => ({
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    orgRole: invitation.orgRole,
    status: invitation.status,
    createdAt: formatDate(invitation.createdAt),
    expiresAt: formatDate(invitation.expiresAt),
  }));
};

/**
 * Helper function to get status badge styling classes
 * @param status - Invitation status
 * @returns CSS classes for status badge
 */
export const getStatusBadgeClasses = (status: string): string => {
  const baseClasses = "w-max py-1 px-2 rounded-2xl font-medium";

  switch (status) {
    case "ACCEPTED":
      return `${baseClasses} bg-[#F0FDF4] text-[#166634]`;
    case "PENDING":
      return `${baseClasses} bg-[#EEF2FF] text-[#2A239F]`;
    case "EXPIRED":
      return `${baseClasses} bg-[#4755691A] text-[#475569]`;
    case "REJECTED":
      return `${baseClasses} bg-[#FEF2F2] text-[#DC2626]`;
    default:
      return `${baseClasses} bg-[#F9FAFB] text-[#6B7280]`;
  }
};

/**
 * Helper function to check if invitation is expired
 * @param expiresAt - Expiration date string
 * @returns Boolean indicating if invitation is expired
 */
export const isInvitationExpired = (expiresAt: string): boolean => {
  return dayjs().isAfter(dayjs(expiresAt));
};

/**
 * Helper function to get time until expiration
 * @param expiresAt - Expiration date string
 * @returns Human readable time until expiration
 */
export const getTimeUntilExpiration = (expiresAt: string): string => {
  const now = dayjs();
  const expiry = dayjs(expiresAt);
  const diff = expiry.diff(now);

  if (diff <= 0) {
    return "Expired";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} left`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} left`;
  } else {
    return "Less than 1 hour left";
  }
};
