// import { http } from "@/lib/utils/http";
// import { 
//   InviteAdminData, 
//   InviteAdminResponse, 
//   RolesResponse,
//   GetAdminUsersParams,
//   AdminUsersResponse,
//   AdminStatsResponse
// } from "@/lib/interfaces/admin";
// import { handleApiError } from "@/lib/utils/error-handler";
// import { buildQueryParams } from "@/lib/utils/query-params";

// // Re-export createRole for convenience
// export { createRole } from "./roles";

// export async function inviteAdmin(
//   data: InviteAdminData
// ): Promise<InviteAdminResponse> {
//   try {
//     const response = await http.post<any>("/auth/invite", {
//       email: data.email,
//       roleId: data.roleId,
//     });

//     const result = response.data;

//     if (result.status === "error") {
//       const errorMessage = result.message || "An error occurred";
//       throw new Error(errorMessage);
//     }

//     return {
//       success: true,
//       message: result.message || "Admin invitation sent successfully!",
//     };
//   } catch (error) {
//     handleApiError(
//       error,
//       "Failed to invite admin. Please try again."
//     );
//     throw error; // Re-throw after handling
//   }
// }

// export async function getAllRoles(): Promise<RolesResponse> {
//   try {
//     const response = await http.get<any>("/roles", {});

//     const result = response.data;

//     if (result.status === "error") {
//       const errorMessage = result.message || "An error occurred";
//       throw new Error(errorMessage);
//     }

//     return {
//       success: true,
//       roles: result.data?.roles || result.roles || [],
//     };
//   } catch (error) {
//     handleApiError(
//       error,
//       "Failed to fetch roles. Please try again."
//     );
//     throw error; // Re-throw after handling
//   }
// }

// export async function getAdminUsers(
//   params?: GetAdminUsersParams
// ): Promise<AdminUsersResponse> {
//   try {
//     const queryParams = buildQueryParams(params || {});
//     const queryString = queryParams.toString();
//     const endpoint = queryString ? `/users?${queryString}` : `/users`;
//     const response = await http.get<any>(endpoint, {});

//     const result = response.data;

//     if (result.status === "error") {
//       const errorMessage = result.message || "An error occurred";
//       throw new Error(errorMessage);
//     }

//     return {
//       success: true,
//       users: result.data?.users || result.users || [],
//       pagination: result.data?.pagination || result.pagination || {},
//     };
//   } catch (error) {
//     handleApiError(
//       error,
//       "Failed to fetch admin users. Please try again."
//     );
//     throw error; // Re-throw after handling
//   }
// }

// export async function getAdminStats(): Promise<AdminStatsResponse> {
//   try {
//     const response = await http.get<any>("/users/stats", {});

//     const result = response.data;

//     if (result.status === "error") {
//       const errorMessage = result.message || "An error occurred";
//       throw new Error(errorMessage);
//     }

//     return {
//       success: true,
//       stats: result.data?.stats || result.data || result.stats || {},
//     };
//   } catch (error) {
//     handleApiError(
//       error,
//       "Failed to fetch admin stats. Please try again."
//     );
//     throw error; // Re-throw after handling
//   }
// }

import { http } from "@/lib/utils/http";
import { handleApiError } from "@/lib/utils/error-handler";
import { buildQueryParams } from "@/lib/utils/query-params";
import type {
  AdminListResponse,
  AdminSummaryData,
  FindAdminFilter,
} from "@/lib/interfaces/admin";

/**
 * GET ${config.api.baseUrl}/admin
 *
 * Passing "" as the endpoint makes makeRequest produce:
 *   `${config.api.baseUrl}/admin` + "" = the admin list URL
 *
 * Passing "?limit=50" produces:
 *   `${config.api.baseUrl}/admin?limit=50`
 *
 * Both resolve correctly because makeRequest uses:
 *   `${config.api.baseUrl}/admin${endpoint}`
 */
export async function fetchAdminUsers(
  filter?: FindAdminFilter,
): Promise<AdminListResponse> {
  try {
    const params = buildQueryParams({
      ...(filter?.limit  ? { limit:  filter.limit  } : {}),
      ...(filter?.cursor ? { cursor: filter.cursor } : {}),
    });

    const endpoint = params.toString() ? `?${params.toString()}` : "";
    const response  = await http.get<any>(endpoint);
    const body      = response.data;

    // Handle both:
    //   • Wrapped:   { status, data: { items, nextCursor } }
    //   • Unwrapped: { items, nextCursor }
    const items      = body?.data?.items      ?? body?.items      ?? [];
    const nextCursor = body?.data?.nextCursor ?? body?.nextCursor ?? null;

    console.log('Data: ', items);
    return { items, nextCursor };
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch admin users. Please try again.",
    );
  }
}

/**
 * GET ${config.api.baseUrl}/admin/summary
 *
 * "/summary" → `${config.api.baseUrl}/admin/summary`
 */
export async function fetchAdminSummary(): Promise<AdminSummaryData> {
  try {
    const response = await http.get<any>("/summary");
    const body     = response.data;

    // Handle both:
    //   • { success: true, data: { total, active, ... } }
    //   • { total, active, ... }
    return body?.data ?? body;
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch admin summary. Please try again.",
    );
  }
}
