
import { http, HttpError } from "@/lib/utils/http";
import type {
  AdminDashboardApiResponse,
  AdminDashboardData,
} from "@/lib/interfaces/dashboard";

/**
 * GET /admin/dashboard
 *
 * Retrieves dashboard metrics and recent education-platform activity
 * for the authenticated administrator.
 *
 * The existing HTTP client applies the /admin base path automatically.
 */
export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  try {
    const response =
      await http.get<AdminDashboardApiResponse>("/admin/dashboard");

    const result = response.data;

    if (result.status !== "success") {
      throw new Error(
        result.message || "Unable to retrieve dashboard data.",
      );
    }

    return result.data;
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "An unexpected error occurred while loading the dashboard.",
    );
  }
}
