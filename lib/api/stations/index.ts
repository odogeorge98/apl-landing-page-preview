import { http } from "@/lib/utils/http";
import { handleApiError } from "@/lib/utils/error-handler";
import { handleApiResponse } from "@/lib/utils/response-handler";
import { buildQueryParams } from "@/lib/utils/query-params";

import type {
  StationBadge,
  StationSource,
} from "@/lib/types/stations";
import { 
  CreateStationPayload,
  CreateStationResponse,
  StationDetailResponse,
  StationsListResponse,
  StationsSummaryResponse,
} from "@/lib/interfaces/stations"

/**
 * GET /stations/summary
 * Returns KPI totals for the stations overview cards.
 */
export async function fetchStationsSummary(): Promise<StationsSummaryResponse> {
  try {
    const url = "/stations/summary";
    const response = await http.get<any>(url);

    const result = response.data;

    return handleApiResponse<StationsSummaryResponse["data"]>(
      result,
      "Stations summary retrieved successfully"
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch stations summary. Please try again."
    );
  }
}

/**
 * GET /stations/all?badge=DISCOVERY_ONLY&cursor=xxx
 * Returns a paginated list of all stations.
 */
export async function fetchStations(params?: {
  badge?: StationBadge;
  cursor?: string | null;
  stationType: StationSource;
}): Promise<StationsListResponse> {
  try {
    const queryParams = buildQueryParams(params || {});
    console.log('Params: ', params);
    const url = `/stations/all${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await http.get<any>(url);

    const result = response.data;

    return handleApiResponse<StationsListResponse["data"]>(
      result,
      "Stations retrieved successfully"
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch stations. Please try again."
    );
  }
}

/**
 * GET /stations/:source/:id
 * Returns full details for a single station.
 */
export async function fetchStationDetail(
  source: StationSource,
  id: string
): Promise<StationDetailResponse> {
  try {
    const url = `/stations/${source}/${id}`;
    const response = await http.get<any>(url);

    const result = response.data;

    return handleApiResponse<StationDetailResponse["data"]>(
      result,
      "Station details retrieved successfully"
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch station details. Please try again."
    );
  }
}

/**
 * POST /stations
 */
export async function createStation(
  payload: CreateStationPayload
): Promise<CreateStationResponse> {
  try {
    const url = "/stations";
    const response = await http.post<any>(url, payload);

    const result = response.data;

    return handleApiResponse<CreateStationResponse["data"]>(
      result,
      "Station created successfully"
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to create station. Please try again."
    );
  }
}