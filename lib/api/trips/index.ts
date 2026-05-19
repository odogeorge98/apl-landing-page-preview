import { http } from "@/lib/utils/http";
import { handleApiError } from "@/lib/utils/error-handler";
import { handleApiResponse } from "@/lib/utils/response-handler";
import { buildQueryParams } from "@/lib/utils/query-params";
import type {
  FindTripsFilter,
  TripDetailResponse,
  TripsListResponse,
  TripsSummaryResponse,
  TripAnalyticsPeriod,
  TripAnalyticsResponse,
} from "@/lib/interfaces/trip";

export async function fetchTripsSummary(): Promise<TripsSummaryResponse> {
  try {
    const response = await http.get<any>("/trips/summary");
    return handleApiResponse<TripsSummaryResponse["data"]>(
      response.data,
      "Trips summary retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(error, "Failed to fetch trips summary. Please try again.");
  }
}

export async function fetchTrips(
  filter?: FindTripsFilter,
): Promise<TripsListResponse> {
  try {
    const { cursor, ...rest } = filter ?? {};

    const params = buildQueryParams({
      ...rest,
      ...(cursor ? { cursor } : {}),
    });

    const url = `/trips${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await http.get<any>(url);

    return handleApiResponse<TripsListResponse["data"]>(
      response.data,
      "Trips retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(error, "Failed to fetch trips. Please try again.");
  }
}

export async function fetchTripById(id: string): Promise<TripDetailResponse> {
  try {
    const response = await http.get<any>(`/trips/${id}`);
    return handleApiResponse<TripDetailResponse["data"]>(
      response.data,
      "Trip details retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(error, "Failed to fetch trip details. Please try again.");
  }
}

export async function fetchTripAnalytics(
  period: TripAnalyticsPeriod,
): Promise<TripAnalyticsResponse> {
  try {
    // console.log("period:", period);
    // console.log("typeof:", typeof period);
    const response = await http.get<any>(
      `/trips/analytics?period=${period}`,
    );
    // console.log('Response analytics: ', response);
    return handleApiResponse<TripAnalyticsResponse["data"]>(
      response.data,
      "Trip analytics retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(error, "Failed to fetch trip analytics. Please try again.");
  }
}