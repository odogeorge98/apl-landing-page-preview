"use client";

import { useQuery } from "@tanstack/react-query";
import { tutorStudentsApi } from "@/lib/api/tutor-students";
import type { GetTutorStudentsParams } from "@/lib/interfaces/tutor-students";

export const tutorStudentsQueryKeys = {
  all: ["tutor", "students"] as const,
  lists: () => [...tutorStudentsQueryKeys.all, "list"] as const,
  list: (params: GetTutorStudentsParams) =>
    [...tutorStudentsQueryKeys.lists(), params] as const,
};

/** Fetch one search-filtered, cursor-paginated page of the tutor's students. */
export function useTutorStudents(params: GetTutorStudentsParams) {
  return useQuery({
    queryKey: tutorStudentsQueryKeys.list(params),
    queryFn: () => tutorStudentsApi.list(params),
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
