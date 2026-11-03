"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { studentReportsApi } from "@/lib/api/reports";
import { studentReportsQueryKeys } from "@/lib/hooks/reports/query-keys";
import type { GetStudentReportsParams } from "@/lib/interfaces/reports";

function normalizeParams(params: Omit<GetStudentReportsParams, "cursor">): Omit<GetStudentReportsParams, "cursor"> {
  return {
    programmeId: params.programmeId?.trim() || undefined,
    status: params.status || undefined,
    search: params.search?.trim() || undefined,
    fromDate: params.fromDate || undefined,
    toDate: params.toDate || undefined,
    limit: params.limit,
  };
}

function retryTransientFailure(failureCount: number, error: Error): boolean {
  const status = (error as Error & { status?: number }).status;
  if (typeof status === "number" && status >= 400 && status < 500) return false;
  return failureCount < 2;
}

/** Cursor-paginated report history, filtered by server-supported parameters. */
export function useStudentReports(
  params: Omit<GetStudentReportsParams, "cursor"> = {},
  options: { enabled?: boolean } = {},
) {
  const normalizedParams = normalizeParams(params);

  return useInfiniteQuery({
    queryKey: studentReportsQueryKeys.list(normalizedParams),
    queryFn: ({ pageParam, signal }) =>
      studentReportsApi.list({ ...normalizedParams, cursor: pageParam }, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: options.enabled ?? true,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: retryTransientFailure,
  });
}
