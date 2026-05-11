
import { http } from "@/lib/utils/http";
import { handleApiError } from "@/lib/utils/error-handler";
import { buildQueryParams } from "@/lib/utils/query-params";
import type {
  AdminListResponse,
  AdminSummaryData,
  FindAdminFilter,
} from "@/lib/interfaces/admin/admin";

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
      ...(filter?.limit ? { limit: filter.limit } : {}),

      ...(filter?.cursor
        ? { cursor: filter.cursor }
        : {}),

      ...(filter?.search
        ? { search: filter.search }
        : {}),

      ...(filter?.role
        ? { role: filter.role }
        : {}),

      ...(filter?.status
        ? { status: filter.status }
        : {}),
    });

    const endpoint = params.toString()
      ? `?${params.toString()}`
      : "";

    console.log(
      "Fetching admin users with endpoint:",
      endpoint,
    );

    const response = await http.get<any>(endpoint);

    const body = response.data;

    const items =
      body?.data?.items ??
      body?.items ??
      [];

    const nextCursor =
      body?.data?.nextCursor ??
      body?.nextCursor ??
      null;

    console.log("Fetched admin data:", items);

    return {
      items,
      nextCursor,
    };
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
