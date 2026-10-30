"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { adminReportsApi } from "@/lib/api/reports";
import {
  adminReportsQueryKeys,
  type AdminReportsListFilters,
} from "@/lib/hooks/reports/query-keys";

function normalizeFilters(filters: AdminReportsListFilters): AdminReportsListFilters {
  return {
    programmeId: filters.programmeId?.trim() || undefined,
    status: filters.status || undefined,
    problemStatus: filters.problemStatus || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    search: filters.search?.trim() || undefined,
    limit: filters.limit,
  };
}

function retryTransientFailure(failureCount: number, error: Error): boolean {
  const status = (error as Error & { status?: number }).status;
  if (typeof status === "number" && status >= 400 && status < 500) return false;
  return failureCount < 2;
}

/** Cursor-paginated, server-filtered admin report inbox. */
export function useAdminReports(
  filters: AdminReportsListFilters = {},
  options: { enabled?: boolean } = {},
) {
  const normalizedFilters = normalizeFilters(filters);

  return useInfiniteQuery({
    queryKey: adminReportsQueryKeys.list(normalizedFilters),
    queryFn: ({ pageParam, signal }) =>
      adminReportsApi.list({ ...normalizedFilters, cursor: pageParam }, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: options.enabled ?? true,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: retryTransientFailure,
  });
}
