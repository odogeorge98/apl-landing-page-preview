import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStatistics, fetchDashboardAnalytics } from "@/lib/api/dashboard";
import { DashboardStatisticsResponse, DashboardAnalyticsResponse } from "@/lib/interfaces/dashboard";
import { DashboardFilter } from "@/lib/enums/dashboard-filter";
import { fetchDashboardKpi } from "@/lib/api/dashboard";
import { fetchTripAnalytics } from "@/lib/api/trips";
import type { TripAnalyticsPeriod } from "@/lib/interfaces/trip";

export const useDashboardStatistics = (filter?: DashboardFilter) => {
  return useQuery<DashboardStatisticsResponse, Error>({
    queryKey: ["dashboard", "statistics", filter],
    queryFn: () => fetchDashboardStatistics(filter),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error instanceof Error && "status" in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

export const useDashboardAnalytics = (filter?: DashboardFilter) => {
  return useQuery<DashboardAnalyticsResponse, Error>({
    queryKey: ["dashboard", "analytics", filter],
    queryFn: () => fetchDashboardAnalytics(filter),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error instanceof Error && "status" in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

// ─── Query key factory ────────────────────────────────────────────────────────

export const dashboardKeys = {
  all:           ["dashboard"] as const,
  kpi:           () => [...dashboardKeys.all, "kpi"] as const,
  tripAnalytics: (period: TripAnalyticsPeriod) =>
    [...dashboardKeys.all, "trip-analytics", period] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Live KPI row — ongoing trips, active drivers, active passengers, etc.
 * Refetches every 60 s automatically.
 */
export function useDashboardKpi() {
  return useQuery({
    queryKey: dashboardKeys.kpi(),
    queryFn:  fetchDashboardKpi,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/**
 * Time-series trip analytics for the selected period.
 * Returns aggregated buckets ready to feed into the chart.
 */
export function useTripAnalytics(period: TripAnalyticsPeriod) {
  return useQuery({
    queryKey: dashboardKeys.tripAnalytics(period),
    queryFn:  () => fetchTripAnalytics(period),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
