

export const ADMIN_ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: "finance_admin", label: "Finance admin" },
  { value: "station_admin", label: "Station admin" },
  { value: "support_admin", label: "Support admin" },
  { value: "user_admin", label: "User admin" },
];

export function roleLabel(role: AdminRole): string {
  return ADMIN_ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;
}


/** Admin portal roles (invitation / assignment). */
export type AdminRole =
  | "finance_admin"
  | "station_admin"
  | "support_admin"
  | "user_admin";

export type AdminUserStatus = "pending" | "active" | "expired";
// ─── List ─────────────────────────────────────────────────────────────────────

export interface AdminApiUser {
  id: string;
  initials: string;
  name: string;
  email: string;
  phone: string;
  /** Human-readable label from the API e.g. "Finance Admin" */
  role: string;
  /** Enum key used for filtering e.g. "finance_admin" */
  roleKey: AdminRole;
  status: AdminUserStatus;
  /** e.g. "Joined Jan 12, 2026" — maps to dateLabel in AdminUser */
  activity: string;
}

export interface AdminListResponse {
  items: AdminApiUser[];
  nextCursor: string | null;
}

// ─── Summary / KPI ────────────────────────────────────────────────────────────

export interface AdminSummaryData {
  total: number;
  active: number;
  pendingInvite: number;
  expired: number;
}

// ─── Filter ───────────────────────────────────────────────────────────────────

export interface FindAdminFilter {
  limit?: number;
  cursor?: string | null;
  search?: string;
  role?: string;
  status?: string;
}