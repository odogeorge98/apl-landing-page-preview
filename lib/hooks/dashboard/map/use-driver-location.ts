import { useQuery } from "@tanstack/react-query";
import { fetchDriverLocations } from "@/lib/api/dashboard/map";

export const mapKeys = {
  all:             ["map"] as const,
  driverLocations: () => [...mapKeys.all, "driver-locations"] as const,
};

/**
 * Polls driver locations every 15 s for near-real-time map updates.
 * Swap `fetchDriverLocations` implementation to point at the real API —
 * this hook and every component using it update automatically.
 */
export function useDriverLocations() {
  return useQuery({
    queryKey:        mapKeys.driverLocations(),
    queryFn:         fetchDriverLocations,
    refetchInterval: 15_000,
    staleTime:       10_000,
  });
}