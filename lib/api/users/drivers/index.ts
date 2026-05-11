import { http } from "@/lib/utils/http";
import { handleApiError } from "@/lib/utils/error-handler";
import { handleApiResponse } from "@/lib/utils/response-handler";
import { buildQueryParams } from "@/lib/utils/query-params";
import type {
  DriversListResponse,
  DriversSummaryResponse,
  FindDriversFilter,
  DriverDetailResponse,
  DriverActivitySummaryResponse,
  DriverRideHistoryResponse,
} from "@/lib/interfaces/users/drivers";

export async function fetchDriversSummary(): Promise<DriversSummaryResponse> {
  try {
    const response = await http.get<any>("/drivers/summary");
    return handleApiResponse<DriversSummaryResponse["data"]>(
      response.data,
      "Drivers' summary retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch drivers summary. Please try again.",
    );
  }
}

export async function fetchDrivers(
  filter?: FindDriversFilter,
): Promise<DriversListResponse> {
  try {
    const { cursor, ...rest } = filter ?? {};

    const params = buildQueryParams({
      ...rest,
      ...(cursor ? { cursor } : {}),
    });

    const url = `/drivers${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await http.get<any>(url);

    return handleApiResponse<DriversListResponse["data"]>(
      response.data,
      "Drivers retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch drivers. Please try again.",
    );
  }
}

// ─── Driver detail ───────────────────────────────────────────────────────────

export async function fetchDriverDetail(
  driverId: string,
): Promise<DriverDetailResponse> {
  try {
    const response = await http.get<any>(`/drivers/${driverId}`);

    return handleApiResponse<DriverDetailResponse["data"]>(
      response.data,
      "Driver retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch driver details. Please try again.",
    );
  }
}

// ─── Driver activity summary ────────────────────────────────────────────────

export async function fetchDriverActivitySummary(
  driverId: string,
): Promise<DriverActivitySummaryResponse> {
  try {
    const response = await http.get<any>(
      `/drivers/${driverId}/summary`,
    );

    return handleApiResponse<DriverActivitySummaryResponse["data"]>(
      response.data,
      "Driver activity summary retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch driver activity summary. Please try again.",
    );
  }
}

// ─── Driver ride history ────────────────────────────────────────────────────

export async function fetchDriverRideHistory(
  driverId: string,
  cursor?: string | null,
  limit?: number,
): Promise<DriverRideHistoryResponse> {
  try {
    const params = buildQueryParams({
      limit,
      ...(cursor ? { cursor } : {}),
    });

    const url =
      `/drivers/${driverId}/rides` +
      (params.toString() ? `?${params.toString()}` : "");

    const response = await http.get<any>(url);

    return handleApiResponse<DriverRideHistoryResponse["data"]>(
      response.data,
      "Driver ride history retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch driver ride history. Please try again.",
    );
  }
}