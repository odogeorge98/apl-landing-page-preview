
import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboard } from "@/lib/api/dashboard";

export const ADMIN_DASHBOARD_QUERY_KEY = [
  "admin",
  "dashboard",
] as const;

export function useAdminDashboard() {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEY,
    queryFn: fetchAdminDashboard,

    // Reuse recent data when navigating back to the dashboard.
    staleTime: 60_000,

    // Keep cached data available briefly after the page unmounts.
    gcTime: 5 * 60_000,

    // Refresh dashboard metrics periodically.
    refetchInterval: 60_000,

    // Refresh stale data when the administrator returns to the tab.
    refetchOnWindowFocus: true,

    // Retry transient failures without repeatedly retrying client errors.
    retry: (failureCount, error) => {
      if (error instanceof Error && "status" in error) {
        const status = Number(
          (error as Error & { status?: number }).status,
        );

        if (status >= 400 && status < 500) {
          return false;
        }
      }

      return failureCount < 2;
    },
  });
}
