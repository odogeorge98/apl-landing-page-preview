import { useQuery } from "@tanstack/react-query";
import { fetchRidersKpi, fetchRiders, fetchUserById, fetchUserActivitySummary, fetchUserRideHistory } from "@/lib/api/users/riders";
import type { FindRidersFilter } from "@/lib/interfaces/users/filters";

// ─── Query key factory ────────────────────────────────────────────────────────

export const riderKeys = {
  all:     ["riders"] as const,
  summary: () => [...riderKeys.all, "summary"] as const,
  lists:   () => [...riderKeys.all, "list"] as const,
  list:    (params: FindRidersFilter) => [...riderKeys.lists(), params] as const,
  detail:  (userId: string) => [...riderKeys.all, "detail", userId] as const,
  activitySummary: (userId: string) =>
    [...riderKeys.all, "activity-summary", userId] as const,
  rideHistory: (userId: string, cursor?: string | null) =>
    [...riderKeys.all, "ride-history", userId, cursor ?? null] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useRidersKpi() {
  return useQuery({
    queryKey: riderKeys.summary(),
    queryFn:  fetchRidersKpi,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useRidersList(params: FindRidersFilter) {
  return useQuery({
    queryKey: riderKeys.list(params),
    queryFn:  () => fetchRiders(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev, // keeps previous page visible while fetching
  });
}

export function useUserDetail(
  userId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...riderKeys.all, "detail", userId],
    queryFn:  () => fetchUserById(userId),
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
  });
}

export function useUserActivitySummary(
  userId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: riderKeys.activitySummary(userId),
    queryFn:  () => fetchUserActivitySummary(userId),
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
  });
}

export function useUserRideHistory({
  userId,
  cursor,
  limit = 4,
  enabled = true,
}: {
  userId: string;
  cursor?: string | null;
  limit?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: riderKeys.rideHistory(userId, cursor),
    queryFn: () => fetchUserRideHistory(userId, cursor, limit),
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}