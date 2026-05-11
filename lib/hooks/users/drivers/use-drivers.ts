import { useQuery } from "@tanstack/react-query";
import { 
  fetchDriversSummary,
  fetchDrivers, 
  fetchDriverDetail,
  fetchDriverActivitySummary,
  fetchDriverRideHistory,
} from "@/lib/api/users/drivers";
import type { FindDriversFilter } from "@/lib/interfaces/users/drivers";

// ─── Query key factory ────────────────────────────────────────────────────────

export const driverKeys = {
  all:     ["drivers"] as const,

  summary: () =>
    [...driverKeys.all, "summary"] as const,

  lists: () =>
    [...driverKeys.all, "list"] as const,

  list: (params: FindDriversFilter) =>
    [...driverKeys.lists(), params] as const,

  detail: (driverId: string) =>
    [...driverKeys.all, "detail", driverId] as const,

  activitySummary: (driverId: string) =>
    [...driverKeys.all, "activity-summary", driverId] as const,

  rides: (driverId: string, cursor?: string | null) =>
    [...driverKeys.all, "rides", driverId, cursor] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useDriversSummary() {
  return useQuery({
    queryKey: driverKeys.summary(),
    queryFn:  fetchDriversSummary,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useDriversList(params: FindDriversFilter) {
  return useQuery({
    queryKey: driverKeys.list(params),
    queryFn:  () => fetchDrivers(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

// ─── Driver detail ───────────────────────────────────────────────────────────

export function useDriverDetail(
  driverId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: driverKeys.detail(driverId),
    queryFn: () => fetchDriverDetail(driverId),
    enabled: enabled && Boolean(driverId),
    staleTime: 30_000,
  });
}

// ─── Driver activity summary ────────────────────────────────────────────────

export function useDriverActivitySummary(
  driverId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: driverKeys.activitySummary(driverId),
    queryFn: () => fetchDriverActivitySummary(driverId),
    enabled: enabled && Boolean(driverId),
    staleTime: 30_000,
  });
}

// ─── Driver ride history ────────────────────────────────────────────────────

export function useDriverRideHistory({
  driverId,
  cursor,
  limit = 4,
  enabled = true,
}: {
  driverId: string;
  cursor?: string | null;
  limit?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: driverKeys.rides(driverId, cursor),
    queryFn: () => fetchDriverRideHistory(driverId, cursor, limit),
    enabled: enabled && Boolean(driverId),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}