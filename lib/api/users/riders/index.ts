import { http } from "@/lib/utils/http";
import { RidersKpiResponse, RidersListResponse } from "@/lib/interfaces/users/riders";
import { handleApiError } from "@/lib/utils/error-handler";
import { handleApiResponse } from "@/lib/utils/response-handler";
import { FindRidersFilter } from "@/lib/interfaces/users/filters";
import { buildQueryParams } from "@/lib/utils/query-params";

export async function fetchRidersKpi(): Promise<RidersKpiResponse> {
  try {
    const url = "/users/summary";
    const response = await http.get<any>(url);

    const result = response.data;

    return handleApiResponse<RidersKpiResponse["data"]>(
      result,
      "Riders metrics retrieved successfully"
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch riders metrics. Please try again."
    );
  }
}

export async function fetchRiders(
  filter?: FindRidersFilter
): Promise<RidersListResponse> {
  try {
    const queryParams = buildQueryParams(filter || {});
    const url = `/users${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await http.get<any>(url);

    const result = response.data;

    return handleApiResponse<RidersListResponse["data"]>(
      result,
      "Riders retrieved successfully"
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch riders. Please try again."
    );
  }
}
