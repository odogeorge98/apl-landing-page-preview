"use client";

import { useQuery } from "@tanstack/react-query";
import { assignmentsApi } from "@/lib/api/assignments";
import type { GetTutorAssignmentsParams } from "@/lib/interfaces/assignments";

export const tutorAssignmentsQueryKeys = {
  all: ["tutor", "assignments"] as const,
  lists: () => [...tutorAssignmentsQueryKeys.all, "list"] as const,
  list: (params: GetTutorAssignmentsParams) =>
    [...tutorAssignmentsQueryKeys.lists(), params] as const,
};

/** Fetches one cursor page of the authenticated tutor's filtered assignments. */
export function useTutorAssignments(params: GetTutorAssignmentsParams = {}) {
  const normalizedParams: GetTutorAssignmentsParams = {
    ...params,
    search: params.search?.trim() || undefined,
    cursor: params.cursor || undefined,
  };

  return useQuery({
    queryKey: tutorAssignmentsQueryKeys.list(normalizedParams),
    queryFn: () => assignmentsApi.listForTutor(normalizedParams),
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
