import { useQuery } from "@tanstack/react-query";
import {
  fetchTripsSummary,
  fetchTrips,
  fetchTripById,
  shareTrip,
} from "@/lib/api/trips";
import type { FindTripsFilter } from "@/lib/interfaces/trip";
import { useMutation } from "@tanstack/react-query";
// import { fetchSharedTrip } from "@/lib/api/trips";
import type { ShareTripResponse } from "@/lib/interfaces/trip";

// ─── Query key factory ────────────────────────────────────────────────────────

export const tripKeys = {
  all:     ["trips"] as const,
  summary: () => [...tripKeys.all, "summary"] as const,
  lists:   () => [...tripKeys.all, "list"] as const,
  list:    (params: FindTripsFilter) => [...tripKeys.lists(), params] as const,
  details: () => [...tripKeys.all, "detail"] as const,
  detail:  (id: string) => [...tripKeys.details(), id] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useTripsSummary() {
  return useQuery({
    queryKey: tripKeys.summary(),
    queryFn:  fetchTripsSummary,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useTripsList(params: FindTripsFilter) {
  return useQuery({
    queryKey: tripKeys.list(params),
    queryFn:  () => fetchTrips(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useTripDetail(id: string) {
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn:  () => fetchTripById(id),
    enabled:  Boolean(id),
    staleTime: 30_000,
  });
}

/** Generates a shareable link for a trip. */
export function useShareTrip(options?: {
  onSuccess?: (shareUrl: string) => void;
  onError?: (message: string) => void;
}) {
  return useMutation<ShareTripResponse, Error, string>({
    mutationFn: (tripId: string) => shareTrip(tripId),
    onSuccess:  (data) => options?.onSuccess?.(data.data.url),
    onError:    (err)  => options?.onError?.(err.message),
  });
}

/** Resolves a share token — used for preview or the landing page. */
// export function useSharedTrip(token: string) {
//   return useQuery({
//     queryKey:  ["shared-trip", token],
//     queryFn:   () => fetchSharedTrip(token),
//     enabled:   Boolean(token),
//     staleTime: 5 * 60 * 1000,
//     retry:     false,
//   });
// }