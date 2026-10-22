"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { lessonsApi } from "@/lib/api/lessons";

export const programmeLessonOptionsQueryKeys = {
  all: ["tutor", "programme-lesson-options"] as const,
  list: (programmeId: string) =>
    [...programmeLessonOptionsQueryKeys.all, programmeId] as const,
};

/** Cursor-paginated lesson choices for a single tutor-assigned programme. */
export function useProgrammeLessonOptions(programmeId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: programmeLessonOptionsQueryKeys.list(programmeId),
    queryFn: ({ pageParam }) =>
      lessonsApi.listForTutor({
        programmeId,
        limit: 50,
        cursor: pageParam,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && Boolean(programmeId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: (failureCount, error) => {
      const status = (error as Error & { status?: number }).status;
      if (typeof status === "number" && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
