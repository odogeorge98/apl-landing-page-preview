import { http } from "@/lib/utils/http";
import { handleApiError } from "@/lib/utils/error-handler";
import { handleApiResponse } from "@/lib/utils/response-handler";
import { buildQueryParams } from "@/lib/utils/query-params";

import type {
  FindScheduledTripsFilter,
  ScheduledTripDetailResponse,
  ScheduledTripsListResponse,
  UpdateScheduledTripStatusPayload,
  UpdateScheduledTripStatusResponse,
} from "@/lib/interfaces/trip/scheduled-trip";

const SCHEDULED_TRIPS_ENDPOINT =
  "/scheduled-trips";

export async function fetchScheduledTrips(
  filter?: FindScheduledTripsFilter,
): Promise<ScheduledTripsListResponse> {
  try {
    const { cursor, ...rest } =
      filter ?? {};

    const params =
      buildQueryParams({
        ...rest,
        ...(cursor ? { cursor } : {}),
      });

    const url =
      `${SCHEDULED_TRIPS_ENDPOINT}` +
      (
        params.toString()
          ? `?${params.toString()}`
          : ""
      );

    const response =
      await http.get<any>(
        url,
        {
          namespace: "website",
        },
      );

    return handleApiResponse<
      ScheduledTripsListResponse["data"]
    >(
      response.data,
      "Scheduled trips retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch scheduled trips. Please try again.",
    );
  }
}

/**
 * Get one scheduled airport trip by ID.
 */
export async function fetchScheduledTrip(
  id: string,
): Promise<ScheduledTripDetailResponse> {
  try {
    const response =
      await http.get<ScheduledTripDetailResponse>(
        `${SCHEDULED_TRIPS_ENDPOINT}/${id}`,
        {
          namespace: "website",
        },
      );

    return handleApiResponse<ScheduledTripDetailResponse["data"]>(
      response.data,
      "Scheduled trip retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to fetch scheduled trip. Please try again.",
    );
  }
}

/**
 * Update the status of a scheduled airport trip.
 */
export async function updateScheduledTripStatus(
  id: string,
  payload: UpdateScheduledTripStatusPayload,
): Promise<UpdateScheduledTripStatusResponse> {
  try {
    const response =
      await http.patch<UpdateScheduledTripStatusResponse>(
        `${SCHEDULED_TRIPS_ENDPOINT}/${id}/status`,
        payload,
        {
          namespace: "website",
        },
      );

    return handleApiResponse<UpdateScheduledTripStatusResponse["data"]>(
      response.data,
      "Scheduled trip status updated successfully",
    );
  } catch (error) {
    throw handleApiError(
      error,
      "Failed to update scheduled trip status. Please try again.",
    );
  }
}