import { http } from "@/lib/utils/http";
import type {
  AdminsListApiResponse,
  GetAdminsParams,
} from "@/lib/interfaces/users/admins";

/**
 * Retrieve admins using server-side search and cursor pagination.
 *
 * GET /admin?search=...&limit=10&cursor=...
 */
export const adminsApi = {
  list: async (
    params: GetAdminsParams = {},
  ): Promise<AdminsListApiResponse> => {
    const limit = params.limit ?? 10;

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new RangeError("Admin page size must be an integer between 1 and 50.");
    }

    const queryParams = new URLSearchParams();
    const search = params.search?.trim();

    if (search) {
      queryParams.set("search", search);
    }

    queryParams.set("limit", String(limit));

    if (params.cursor) {
      queryParams.set("cursor", params.cursor);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/admin?${queryString}` : "/admin";
    const response = await http.get<AdminsListApiResponse>(url);
    const result = response.data;

    if (result.status !== "success") {
      throw new Error(result.message || "Failed to retrieve admins.");
    }

    return result;
  },
};
