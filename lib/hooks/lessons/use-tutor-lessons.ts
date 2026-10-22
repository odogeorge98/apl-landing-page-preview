"use client";

import { useQuery } from "@tanstack/react-query";
import { lessonsApi } from "@/lib/api/lessons";
import type { GetTutorLessonsParams } from "@/lib/interfaces/lessons";

export const tutorLessonsQueryKeys = {
  all: ["tutor", "lessons"] as const,
  lists: () => [...tutorLessonsQueryKeys.all, "list"] as const,
  list: (params: GetTutorLessonsParams) =>
    [...tutorLessonsQueryKeys.lists(), params] as const,
};

/** Fetch a filtered, cursor-paginated lesson list for the authenticated tutor. */
export function useTutorLessons(
  params: GetTutorLessonsParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: tutorLessonsQueryKeys.list(params),
    queryFn: () => lessonsApi.listForTutor(params),
    enabled: options.enabled ?? true,
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
