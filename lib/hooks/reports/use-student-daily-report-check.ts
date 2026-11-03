"use client";

import { useQuery } from "@tanstack/react-query";
import { studentReportsApi } from "@/lib/api/reports";
import { studentReportsQueryKeys } from "@/lib/hooks/reports/query-keys";

function retryTransientFailure(failureCount: number, error: Error): boolean {
  const status = (error as Error & { status?: number }).status;
  if (typeof status === "number" && status >= 400 && status < 500) return false;
  return failureCount < 2;
}

/** Boolean requirement check. `true` means the dashboard should prompt a report. */
export function useStudentDailyReportCheck(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: studentReportsQueryKeys.dailyCheck(),
    queryFn: ({ signal }) => studentReportsApi.dailyCheck(signal),
    enabled: options.enabled ?? true,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: retryTransientFailure,
  });
}
