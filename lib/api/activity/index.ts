import { http }              from "@/lib/utils/http";
import { handleApiError }    from "@/lib/utils/error-handler";
import { handleApiResponse } from "@/lib/utils/response-handler";
import type {
  GetActivityParams,
  ActivityData,
  ActivityOnlineData,
  ActivitySummary,
  ActivityResponse,
  ActivityOnlineResponse,
  ActivitySummaryResponse,
} from "@/lib/interfaces/activity";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Serialise query params: skip undefined, null, empty strings,
 * and "all" sentinel values (backend defaults to "all" already).
 */
function buildQuery(params: GetActivityParams): string {
  const entries = Object.entries(params).filter(([k, v]) => {
    if (v === undefined || v === null || v === "") {
      return false;
    }

    if (
      (k === "roleGroup" || k === "status") &&
      v === "all"
    ) {
      return false;
    }

    return true;
  });

  if (!entries.length) return "";

  return (
    "?" +
    new URLSearchParams(
      entries.map(([k, v]) => [k, String(v)])
    ).toString()
  );
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /admin/activity?roleGroup=…&status=…&period=…&search=…&cursor=…&limit=…
 * Returns paginated activity log + per-filter summary for the current request.
 */
export async function fetchActivity(
  params: GetActivityParams = {},
): Promise<ActivityData> {
  try {
    const response = await http.get<ActivityResponse>(`/activity${buildQuery(params)}`);
    const body =  handleApiResponse<ActivityResponse["data"]>(
      response.data,
      "Activity retrieved successfully",
    );
    return body.data;
  } catch (error) {
    throw handleApiError(error, "Failed to load activity data.");
  }
}

/**
 * GET /admin/activity/online
 * All currently-online staff — powers the avatar strip.
 * Always uses today's scope; no filter params needed.
 */
export async function fetchOnlineActivity(): Promise<ActivityOnlineData> {
  try {
    const response = await http.get<ActivityOnlineResponse>("/activity/online");
    const body =  handleApiResponse<ActivityOnlineResponse["data"]>(
      response.data,
      "Online staff retrieved",
    );
    return body.data;
  } catch (error) {
    throw handleApiError(error, "Failed to load online staff.");
  }
}

/**
 * GET /admin/activity/summary
 * Lightweight KPI counts — today scope, no filters.
 */
export async function fetchActivitySummary(): Promise<ActivitySummary> {
  try {
    const response = await http.get<ActivitySummaryResponse>("/activity/summary");
    const body =  handleApiResponse<ActivitySummaryResponse["data"]>(
      response.data,
      "Summary retrieved successfully",
    );
    return body.data;
  } catch (error) {
    throw handleApiError(error, "Failed to load activity summary.");
  }
}