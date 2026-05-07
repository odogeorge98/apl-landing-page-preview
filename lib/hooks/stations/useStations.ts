import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchStationsSummary, fetchStations, fetchStationDetail, createStation } from "@/lib/api/stations";
import type {
  CreateStationPayload,
  StationBadge,
  StationSource,
} from "@/lib/types/stations";

// ─── Query Key Factory ────────────────────────────────────────────────────────
// Centralised key factory keeps cache invalidation predictable across the app.

export const stationKeys = {
  all: ["stations"] as const,
  summary: () => [...stationKeys.all, "summary"] as const,
  lists: () => [...stationKeys.all, "list"] as const,
  list: (badge?: StationBadge, cursor?: string) =>
    [...stationKeys.lists(), { badge, cursor }] as const,
  details: () => [...stationKeys.all, "detail"] as const,
  detail: (source: StationSource, id: string) =>
    [...stationKeys.details(), source, id] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useStationsSummary() {
  return useQuery({
    queryKey: stationKeys.summary(),
    queryFn: () => fetchStationsSummary(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

interface UseStationsListParams {
  cursor?: string | null;
  limit?: number;
  stationType?: StationSource | "ALL";
}

export function useStationsList({
//   badge,
  cursor,
  limit,
  stationType,
}: UseStationsListParams = {}) {
  return useQuery({
    queryKey: stationKeys.list({
    //   badge,
      cursor,
      limit,
      stationType,
    }),

    queryFn: () =>
      fetchStations({
        // badge,
        cursor,
        limit,
        stationType
      }),

    staleTime: 30_000,
    refetchInterval: 60_000,

    // keeps previous page while next page loads
    placeholderData: (previousData) => previousData,
  });
}

export function useStationDetail(source: StationSource, id: string) {
  return useQuery({
    queryKey: stationKeys.detail(source, id),
    queryFn: () => fetchStationDetail(source, id),
    enabled: Boolean(source && id),
    staleTime: 30_000,
  });
}

export function useCreateStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStationPayload) => createStation(payload),
    onSuccess: () => {
      // Invalidate both the list and summary so counts and rows refresh
      queryClient.invalidateQueries({ queryKey: stationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stationKeys.summary() });
    },
  });
}