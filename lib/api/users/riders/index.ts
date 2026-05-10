import { http } from "@/lib/utils/http";
import type {
  RidersKpiResponse,
  RidersListResponse,
  RiderStatusFilter,
  UserDetailResponse,
  UserActivitySummaryResponse,
  RideHistoryResponse,
} from "@/lib/interfaces/users/riders";
import { handleApiError } from "@/lib/utils/error-handler";
import { handleApiResponse } from "@/lib/utils/response-handler";
import type { FindRidersFilter } from "@/lib/interfaces/users/filters";
import { buildQueryParams } from "@/lib/utils/query-params";

// ─── Temporary status conversion ──────────────────────────────────────────────
// Backend currently accepts boolean: true = active, false = inactive.
// "pending" and "banned" have no backend equivalent yet — omit them from
// the query so all records are returned (unfiltered) in those cases.
//
// TODO: Delete this function and pass status directly once the backend
// accepts RiderStatusFilter string values.

// function convertStatus(status?: RiderStatusFilter): boolean | undefined {
//   switch (status) {
//     case "active":   return true;
//     case "inactive": return false;
//     case "pending":
//     case "banned":
//     default:         return undefined; // no backend support yet
//   }
// }

// ─── API functions ────────────────────────────────────────────────────────────

export async function fetchRidersKpi(): Promise<RidersKpiResponse> {
  try {
    const response = await http.get<any>("/users/summary");

    return handleApiResponse<RidersKpiResponse["data"]>(
      response.data,
      "Riders metrics retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch riders metrics. Please try again.",
    );
  }
}

export async function fetchRiders(
  filter?: FindRidersFilter,
): Promise<RidersListResponse> {
  try {
    const { status, cursor, ...rest } = filter ?? {};

    const params = buildQueryParams({
      ...rest,
      ...(cursor ? { cursor } : {}),
      ...(status !== undefined ? { status } : {}),
    });

    console.log("Params: ", { cursor, ...rest, status });

    const url = `/users${params.toString() ? `?${params.toString()}` : ""}`;

    console.log("Url: ", `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`);

    const response = await http.get<any>(url);

    return handleApiResponse<RidersListResponse["data"]>(
      response.data,
      "Riders retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch riders. Please try again.",
    );
  }
}

export async function fetchUserById(id: string): Promise<UserDetailResponse> {
  try {
    const response = await http.get<any>(`/users/${id}`);

    return handleApiResponse<UserDetailResponse["data"]>(
      response.data,
      "User retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch user details. Please try again.",
    );
  }
}

export async function fetchUserActivitySummary(
  userId: string,
): Promise<UserActivitySummaryResponse> {
  try {
    const response = await http.get<any>(`/users/${userId}/summary`);
    return handleApiResponse<UserActivitySummaryResponse["data"]>(
      response.data,
      "User's ride activity retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(error, "Failed to fetch activity summary. Please try again.");
  }
}

export async function fetchUserRideHistory(
  userId: string,
  cursor?: string | null,
  limit = 4,
): Promise<RideHistoryResponse> {
  try {
    const params = buildQueryParams({
      limit,
      ...(cursor ? { cursor } : {}),
    });

    const url = `/users/${userId}/rides${params.toString() ? `?${params}` : ""}`;
    const response = await http.get<any>(url);

    return handleApiResponse<RideHistoryResponse["data"]>(
      response.data,
      "User's ride history retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(error, "Failed to fetch ride history. Please try again.");
  }
}