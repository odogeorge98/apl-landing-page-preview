import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStatistics, fetchDashboardAnalytics } from "@/lib/api/dashboard";
import { DashboardStatisticsResponse, DashboardAnalyticsResponse } from "@/lib/interfaces/dashboard";
import { DashboardFilter } from "@/lib/enums/dashboard-filter";

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
