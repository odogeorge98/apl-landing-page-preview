"use client";

import { useQuery } from "@tanstack/react-query";
import { assignmentsApi } from "@/lib/api/assignments";
import type { GetStudentAssignmentsParams } from "@/lib/interfaces/assignments";

export const studentAssignmentsQueryKeys = {
  all: ["student", "assignments"] as const,
  lists: () => [...studentAssignmentsQueryKeys.all, "list"] as const,
  list: (params: GetStudentAssignmentsParams) =>
    [...studentAssignmentsQueryKeys.lists(), params] as const,
};

/** Fetches one cursor page of published assignments for the authenticated student. */
export function useStudentAssignments(params: GetStudentAssignmentsParams = {}) {
  const normalizedParams: GetStudentAssignmentsParams = {
    ...params,
    search: params.search?.trim() || undefined,
    cursor: params.cursor || undefined,
  };

  return useQuery({
    queryKey: studentAssignmentsQueryKeys.list(normalizedParams),
    queryFn: () => assignmentsApi.listForStudent(normalizedParams),
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
