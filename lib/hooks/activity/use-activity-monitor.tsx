import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  fetchActivity,
  fetchOnlineActivity,
  fetchActivitySummary,
} from "@/lib/api/activity";
import type { GetActivityParams } from "@/lib/interfaces/activity";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const activityKeys = {
  all:     ["activity"]                                       as const,
  list:    (p: GetActivityParams) => [...activityKeys.all, "list",    p] as const,
  online:  ()                     => [...activityKeys.all, "online"     ] as const,
  summary: ()                     => [...activityKeys.all, "summary"    ] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Powers the main activity table.
 * Every filter change (roleGroup, status, period, search, cursor, limit)
 * is encoded in the query key, so React Query automatically re-fetches
 * when any param changes.
 *
 * `keepPreviousData` keeps the last page visible while a new page loads,
 * preventing the table from flickering to empty on cursor navigation.
 */
export function useActivityMonitor(params: GetActivityParams) {
  return useQuery({
    queryKey:        activityKeys.list(params),
    queryFn:         () => fetchActivity(params),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,   // 30 s — near-real-time feel
    staleTime:       20_000,
  });
}

/**
 * Powers the "Currently Online" avatar strip.
 * Fetches the dedicated /online endpoint so the strip always reflects
 * the full set of online staff, independent of the table's active filters.
 */
export function useOnlineStaff() {
  return useQuery({
    queryKey:        activityKeys.online(),
    queryFn:         fetchOnlineActivity,
    refetchInterval: 30_000,
    staleTime:       20_000,
  });
}

/**
 * Powers the KPI cards.
 * Lighter endpoint; refreshes more frequently than the full table.
 */
export function useActivitySummary() {
  return useQuery({
    queryKey:        activityKeys.summary(),
    queryFn:         fetchActivitySummary,
    refetchInterval: 15_000,
    staleTime:       10_000,
  });
}