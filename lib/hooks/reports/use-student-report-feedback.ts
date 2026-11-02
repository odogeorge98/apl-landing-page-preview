"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { reportFeedbackApi } from "@/lib/api/reports";
import { studentReportsQueryKeys } from "@/lib/hooks/reports/query-keys";

function retryTransientFailure(failureCount: number, error: Error): boolean {
  const status = (error as Error & { status?: number }).status;
  if (typeof status === "number" && status >= 400 && status < 500) return false;
  return failureCount < 2;
}

/** Cursor-paginated chronological feedback for one report. */
export function useStudentReportFeedback(
  reportId: string,
  options: { enabled?: boolean } = {},
) {
  const normalizedReportId = reportId.trim();

  return useInfiniteQuery({
    queryKey: studentReportsQueryKeys.feedback(normalizedReportId),
    queryFn: ({ pageParam, signal }) => reportFeedbackApi.list(normalizedReportId, { cursor: pageParam }, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: (options.enabled ?? true) && normalizedReportId.length > 0,
    staleTime: 20_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: retryTransientFailure,
  });
}
