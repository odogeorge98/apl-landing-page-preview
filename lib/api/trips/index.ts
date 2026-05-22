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
  ShareTripResponse,
  ShareTripData,
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

/**
 * POST ${baseUrl}/admin/trips/:id/share
 * Generates a 7-day public share link for the trip.
 */
export async function shareTrip(tripId: string): Promise<ShareTripResponse> {
  try {
    const response = await http.post<any>(`/trips/${tripId}/share`);
    return handleApiResponse<ShareTripData>(
      response.data,
      "Trip details retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(error, "Failed to generate share link. Please try again.");
  }
}

/**
 * GET ${baseUrl}/admin/trips/share/:token
 * Public endpoint — resolves a share token to trip summary data.
 * No auth header is required; the token in the URL acts as the credential.
 */
// export async function fetchSharedTrip(token: string): Promise<SharedTripResponse> {
//   try {
//     const response = await http.publicRequest<any>("GET", `/trips/share/${token}`);
//     return handleApiResponse<SharedTripData>(
//       response.data,
//       "Trips summary retrieved successfully",
//     );
//   } catch (error) {
//     throw handleApiError(error, "Trip not found or share link has expired.");
//   }
// }