import { Admin_Role } from '@/lib/enums/admin-role.enum';

export const ADMIN_ROLE_OPTIONS: { value: Admin_Role; label: string }[] = [
  { value: Admin_Role.FINANCE_ADMIN, label: "Finance admin" },
  { value: Admin_Role.STATION_ADMIN, label: "Station admin" },
  { value: Admin_Role.SUPPORT_ADMIN, label: "Support admin" },
  { value: Admin_Role.USER_ADMIN, label: "User admin" },
  { value: Admin_Role.SUPER_ADMIN, label: "Super Admin" },
];

export function roleLabel(role: Admin_Role): string {
  return ADMIN_ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;
}


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
  roleKey: Admin_Role;
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
// ─── Invite admin ─────────────────────────────────────────────────────────────

export interface InviteAdminPayload {
  fullName: string;
  email: string;
  phoneNo: string;
  /** Backend enum e.g. "FINANCE_ADMIN", "USER_ADMIN" */
  role: string;
}

export interface InviteAdminResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    dto: InviteAdminPayload;
  };
}

// ─── Admin onboarding (public — invited admin completing signup) ───────────────

export interface AdminOnboardingPayload {
  token: string;
  password: string;
}

export interface AdminOnboardingResponse {
  status: string;
  statusCode: number;
  message: string;
  /** e.g. "Account setup complete. Please login." */
  data: string;
}