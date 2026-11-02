"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { reportPoliciesApi } from "@/lib/api/report-policies";

export const reportPolicyProgrammeOptionsQueryKeys = {
  all: ["report-policies", "programme-options"] as const,
};

/** Cursor-paginated programmes annotated with active reporting-policy state. */
export function useReportPolicyProgrammes() {
  return useInfiniteQuery({
    queryKey: reportPolicyProgrammeOptionsQueryKeys.all,
    queryFn: ({ pageParam }) =>
      reportPoliciesApi.listProgrammeOptions({ cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      const status = (error as Error & { status?: number }).status;
      if (typeof status === "number" && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
