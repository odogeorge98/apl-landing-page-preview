"use client";

import { useQuery } from "@tanstack/react-query";
import { assignmentsApi } from "@/lib/api/assignments";
import type { GetAdminAssignmentsParams } from "@/lib/interfaces/assignments";

export const adminAssignmentsQueryKeys = {
  all: ["admin", "assignments"] as const,
  lists: () => [...adminAssignmentsQueryKeys.all, "list"] as const,
  list: (params: GetAdminAssignmentsParams) =>
    [...adminAssignmentsQueryKeys.lists(), params] as const,
};

/** Fetches one server-filtered cursor page for the admin assignments register. */
export function useAdminAssignments(
  params: GetAdminAssignmentsParams = {},
  enabled = true,
) {
  const normalizedParams: GetAdminAssignmentsParams = {
    ...params,
    search: params.search?.trim() || undefined,
    cursor: params.cursor || undefined,
  };

  return useQuery({
    enabled,
    queryKey: adminAssignmentsQueryKeys.list(normalizedParams),
    queryFn: () => assignmentsApi.listForAdmin(normalizedParams),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      const status = (error as Error & { status?: number }).status;
      if (typeof status === "number" && status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
  });
}
