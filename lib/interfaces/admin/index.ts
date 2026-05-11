// export interface InviteAdminData {
//   email: string;
//   roleId: string;
// }

// export interface InviteAdminResponse {
//   success: boolean;
//   message?: string;
// }

// export interface Role {
//   id: string;
//   name: string;
//   description?: string;
//   permissions?: Record<string, any>;
//   isSystem: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface RolesResponse {
//   success: boolean;
//   roles: Role[];
// }

// export interface GetAdminUsersParams {
//   page?: number;
//   limit?: number;
//   search?: string;
//   status?: 'active' | 'inactive' | 'pending_invite';
// }

// export interface AdminUser {
//   id: string;
//   name?: string;
//   email: string;
//   role: string;
//   status: string;
//   createdAt: string;
//   expiresAt?: string;
// }

// export interface PaginationInfo {
//   currentPage: number;
//   totalPages: number;
//   totalItems: number;
//   itemsPerPage: number;
//   hasNextPage: boolean;
//   hasPreviousPage: boolean;
// }

// export interface AdminUsersResponse {
//   success: boolean;
//   users: AdminUser[];
//   pagination: PaginationInfo;
// }

// export interface AdminStats {
//   totalAdmins: {
//     count: number;
//     change: number;
//   };
//   activeAdmins: {
//     count: number;
//     change: number;
//   };
//   inactiveAdmins: {
//     count: number;
//     change: number;
//   };
//   pendingInvites: {
//     count: number;
//     change: number;
//   };
// }

// export interface AdminStatsResponse {
//   success: boolean;
//   stats: AdminStats;
// }

// export interface CreateRoleData {
//   name: string;
//   description?: string;
//   permissions?: Record<string, any>;
// }

// export interface CreateRoleResponse {
//   success: boolean;
//   message?: string;
//   role?: Role;
// }


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
}