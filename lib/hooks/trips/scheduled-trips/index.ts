import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  fetchScheduledTrip,
  fetchScheduledTrips,
  updateScheduledTripStatus,
} from "@/lib/api/trips/scheduled-trips";

import type {
  FindScheduledTripsFilter,
  UpdateScheduledTripStatusPayload,
} from "@/lib/interfaces/trip/scheduled-trip";

export const scheduledTripsQueryKeys = {
  all: ["scheduled-trips"] as const,

  lists: () =>
    [...scheduledTripsQueryKeys.all, "list"] as const,

  list: (filter?: FindScheduledTripsFilter) =>
    [...scheduledTripsQueryKeys.lists(), filter] as const,

  details: () =>
    [...scheduledTripsQueryKeys.all, "detail"] as const,

  detail: (id: string) =>
    [...scheduledTripsQueryKeys.details(), id] as const,
};

/**
 * Scheduled airport trips list.
 */
export function useScheduledTrips(
  filter?: FindScheduledTripsFilter,
) {
  return useQuery({
    queryKey: scheduledTripsQueryKeys.list(filter),
    queryFn: () => fetchScheduledTrips(filter),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    enabled: true,
  });
}

/**
 * Scheduled airport trip detail.
 */
export function useScheduledTrip(id: string) {
  return useQuery({
    queryKey: scheduledTripsQueryKeys.detail(id),
    queryFn: () => fetchScheduledTrip(id),
    enabled: Boolean(id),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

/**
 * Update scheduled airport trip status.
 */
export function useUpdateScheduledTripStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateScheduledTripStatusPayload;
    }) =>
      updateScheduledTripStatus(id, payload),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: scheduledTripsQueryKeys.detail(
            variables.id,
          ),
        }),

        queryClient.invalidateQueries({
          queryKey: scheduledTripsQueryKeys.lists(),
        }),
      ]);
    },
  });
}