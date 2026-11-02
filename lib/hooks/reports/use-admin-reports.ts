"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/reports";
import type {
  GetAdminReportsParams,
  GetAdminReportSummaryParams,
} from "@/lib/interfaces/reports";

export const adminReportsQueryKeys = {
  all: ["reports", "admin"] as const,
  lists: () => [...adminReportsQueryKeys.all, "list"] as const,
  list: (params: Omit<GetAdminReportsParams, "cursor">) =>
    [...adminReportsQueryKeys.lists(), params] as const,
  summaries: () => [...adminReportsQueryKeys.all, "summary"] as const,
  summary: (params: GetAdminReportSummaryParams) =>
    [...adminReportsQueryKeys.summaries(), params] as const,
  details: () => [...adminReportsQueryKeys.all, "detail"] as const,
  detail: (reportId: string) => [...adminReportsQueryKeys.details(), reportId] as const,
  feedback: (reportId: string) => [...adminReportsQueryKeys.all, "feedback", reportId] as const,
};

function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = (error as Error & { status?: number })?.status;
  if (typeof status === "number" && status >= 400 && status < 500) return false;
  return failureCount < 2;
}

/** Cursor-paginated admin report feed. Changing any filter starts a fresh cursor chain. */
export function useAdminReports(params: GetAdminReportsParams = {}) {
  const normalized = {
    programmeId: params.programmeId?.trim() || undefined,
    status: params.status,
    problemStatus: params.problemStatus,
    fromDate: params.fromDate,
    toDate: params.toDate,
    search: params.search?.trim() || undefined,
    limit: params.limit,
  };

  return useInfiniteQuery({
    queryKey: adminReportsQueryKeys.list(normalized),
    queryFn: ({ pageParam }) => reportsApi.listAdmin({ ...normalized, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: shouldRetry,
  });
}

/** Date-range summary. Both dates are required by the server contract. */
export function useAdminReportSummary(params: GetAdminReportSummaryParams) {
  const fromDate = params.fromDate.trim();
  const toDate = params.toDate.trim();
  const enabled = Boolean(fromDate && toDate);

  return useQuery({
    queryKey: adminReportsQueryKeys.summary({ fromDate, toDate }),
    queryFn: () => reportsApi.getAdminSummary({ fromDate, toDate }),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: shouldRetry,
  });
}

/** Full report record for a reader/detail view. */
export function useAdminReport(reportId: string | null | undefined) {
  const normalizedId = reportId?.trim() ?? "";

  return useQuery({
    queryKey: adminReportsQueryKeys.detail(normalizedId),
    queryFn: () => reportsApi.getAdminById(normalizedId),
    enabled: Boolean(normalizedId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: shouldRetry,
  });
}

/** Cursor-paginated report conversation history. */
export function useAdminReportFeedback(reportId: string | null | undefined) {
  const normalizedId = reportId?.trim() ?? "";

  return useInfiniteQuery({
    queryKey: adminReportsQueryKeys.feedback(normalizedId),
    queryFn: ({ pageParam }) => reportsApi.getFeedback(normalizedId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(normalizedId),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: shouldRetry,
  });
}
