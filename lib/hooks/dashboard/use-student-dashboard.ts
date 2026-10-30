import { useQuery } from "@tanstack/react-query";
import { fetchStudentDashboard } from "@/lib/api/dashboard";

export const STUDENT_DASHBOARD_QUERY_KEY = [
  "student",
  "dashboard",
] as const;

export function useStudentDashboard(options: { enabled?: boolean; refetchInterval?: number | false } = {}) {
  return useQuery({
    queryKey: STUDENT_DASHBOARD_QUERY_KEY,
    queryFn: fetchStudentDashboard,
    enabled: options.enabled ?? true,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchInterval: options.refetchInterval ?? 60_000,
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
