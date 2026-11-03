"use client";

import { useQuery } from "@tanstack/react-query";
import { adminReportsApi } from "@/lib/api/reports";
import { adminReportsQueryKeys } from "@/lib/hooks/reports/query-keys";
import type { GetAdminReportSummaryParams } from "@/lib/interfaces/reports";

function retryTransientFailure(failureCount: number, error: Error): boolean {
  const status = (error as Error & { status?: number }).status;
  if (typeof status === "number" && status >= 400 && status < 500) return false;
  return failureCount < 2;
}

/** Server-computed summary for a required inclusive calendar-date range. */
export function useAdminReportSummary(
  params: GetAdminReportSummaryParams,
  options: { enabled?: boolean } = {},
) {
  const normalizedParams = {
    fromDate: params.fromDate?.trim() ?? "",
    toDate: params.toDate?.trim() ?? "",
  };
  const hasDateRange = Boolean(normalizedParams.fromDate && normalizedParams.toDate);

  return useQuery({
    queryKey: adminReportsQueryKeys.summary(normalizedParams),
    queryFn: ({ signal }) => adminReportsApi.summary(normalizedParams, signal),
    enabled: (options.enabled ?? true) && hasDateRange,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: retryTransientFailure,
  });
}
