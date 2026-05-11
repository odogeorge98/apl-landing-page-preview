import { http } from "@/lib/utils/http";
import { 
  InviteAdminData, 
  InviteAdminResponse, 
  RolesResponse,
  GetAdminUsersParams,
  AdminUsersResponse,
  AdminStatsResponse
} from "@/lib/interfaces/admin";
import { handleApiError } from "@/lib/utils/error-handler";
import { buildQueryParams } from "@/lib/utils/query-params";

// Re-export createRole for convenience
export { createRole } from "./roles";

export async function inviteAdmin(
  data: InviteAdminData
): Promise<InviteAdminResponse> {
  try {
    const response = await http.post<any>("/auth/invite", {
      email: data.email,
      roleId: data.roleId,
    });

    const result = response.data;

    if (result.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    return {
      success: true,
      message: result.message || "Admin invitation sent successfully!",
    };
  } catch (error) {
    handleApiError(
      error,
      "Failed to invite admin. Please try again."
    );
    throw error; // Re-throw after handling
  }
}

export async function getAllRoles(): Promise<RolesResponse> {
  try {
    const response = await http.get<any>("/roles", {});

    const result = response.data;

    if (result.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    return {
      success: true,
      roles: result.data?.roles || result.roles || [],
    };
  } catch (error) {
    handleApiError(
      error,
      "Failed to fetch roles. Please try again."
    );
    throw error; // Re-throw after handling
  }
}

export async function getAdminUsers(
  params?: GetAdminUsersParams
): Promise<AdminUsersResponse> {
  try {
    const queryParams = buildQueryParams(params || {});
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : `/users`;
    const response = await http.get<any>(endpoint, {});

    const result = response.data;

    if (result.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    return {
      success: true,
      users: result.data?.users || result.users || [],
      pagination: result.data?.pagination || result.pagination || {},
    };
  } catch (error) {
    handleApiError(
      error,
      "Failed to fetch admin users. Please try again."
    );
    throw error; // Re-throw after handling
  }
}

export async function getAdminStats(): Promise<AdminStatsResponse> {
  try {
    const response = await http.get<any>("/users/stats", {});

    const result = response.data;

    if (result.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    return {
      success: true,
      stats: result.data?.stats || result.data || result.stats || {},
    };
  } catch (error) {
    handleApiError(
      error,
      "Failed to fetch admin stats. Please try again."
    );
    throw error; // Re-throw after handling
  }
}
