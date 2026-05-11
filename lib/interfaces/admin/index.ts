export interface InviteAdminData {
  email: string;
  roleId: string;
}

export interface InviteAdminResponse {
  success: boolean;
  message?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Record<string, any>;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolesResponse {
  success: boolean;
  roles: Role[];
}

export interface GetAdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'pending_invite';
}

export interface AdminUser {
  id: string;
  name?: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminUsersResponse {
  success: boolean;
  users: AdminUser[];
  pagination: PaginationInfo;
}

export interface AdminStats {
  totalAdmins: {
    count: number;
    change: number;
  };
  activeAdmins: {
    count: number;
    change: number;
  };
  inactiveAdmins: {
    count: number;
    change: number;
  };
  pendingInvites: {
    count: number;
    change: number;
  };
}

export interface AdminStatsResponse {
  success: boolean;
  stats: AdminStats;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions?: Record<string, any>;
}

export interface CreateRoleResponse {
  success: boolean;
  message?: string;
  role?: Role;
}
