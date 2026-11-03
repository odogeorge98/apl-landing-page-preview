"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStudentEnrollmentAnalytics } from "@/lib/api/dashboard";
import type { GetStudentEnrollmentAnalyticsParams } from "@/lib/interfaces/dashboard";

export const studentEnrollmentAnalyticsQueryKeys = {
  all: ["admin", "student-enrollment-analytics"] as const,
  detail: (params: GetStudentEnrollmentAnalyticsParams) =>
    [...studentEnrollmentAnalyticsQueryKeys.all, params] as const,
};

/** Fetch enrollment analytics for one calendar year or inclusive date range. */
export function useStudentEnrollmentAnalytics(
  params: GetStudentEnrollmentAnalyticsParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: studentEnrollmentAnalyticsQueryKeys.detail(params),
    queryFn: () => fetchStudentEnrollmentAnalytics(params),
    enabled: options.enabled ?? true,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      const status = (error as Error & { status?: number }).status;
      if (typeof status === "number" && status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
  });
}
