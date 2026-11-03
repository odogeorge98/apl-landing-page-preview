"use client";

import { useQuery } from "@tanstack/react-query";
import { studentReportsApi } from "@/lib/api/reports";
import { studentReportsQueryKeys } from "@/lib/hooks/reports/query-keys";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function retryTransientFailure(failureCount: number, error: Error): boolean {
  const status = (error as Error & { status?: number }).status;
  if (typeof status === "number" && status >= 400 && status < 500) return false;
  return failureCount < 2;
}

/** Programme-scoped dashboard. It stays disabled until a valid enrolment is selected. */
export function useStudentReportDashboard(
  programmeId: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const normalizedProgrammeId = programmeId?.trim() ?? "";
  const hasValidProgrammeId = UUID_V4_PATTERN.test(normalizedProgrammeId);

  return useQuery({
    queryKey: studentReportsQueryKeys.dashboard(normalizedProgrammeId),
    queryFn: ({ signal }) =>
      studentReportsApi.dashboard({ programmeId: normalizedProgrammeId }, signal),
    enabled: (options.enabled ?? true) && hasValidProgrammeId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: retryTransientFailure,
  });
}
