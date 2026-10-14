import { useQuery } from "@tanstack/react-query";
import { fetchTutorDashboard } from "@/lib/api/dashboard";

export const TUTOR_DASHBOARD_QUERY_KEY = ["tutor", "dashboard"] as const;

export function useTutorDashboard() {
  return useQuery({
    queryKey: TUTOR_DASHBOARD_QUERY_KEY,
    queryFn: fetchTutorDashboard,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
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
