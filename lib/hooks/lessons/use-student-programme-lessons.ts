"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { lessonsApi } from "@/lib/api/lessons";
import type { GetStudentProgrammeLessonsParams } from "@/lib/interfaces/lessons";

export const studentProgrammeLessonsQueryKeys = {
  all: ["student", "programme-lessons"] as const,
  programme: (programmeId: string, params: GetStudentProgrammeLessonsParams) =>
    [...studentProgrammeLessonsQueryKeys.all, programmeId, params] as const,
};

/** Infinite cursor query for the published lessons in one enrolled programme. */
export function useStudentProgrammeLessons(
  programmeId: string,
  params: Omit<GetStudentProgrammeLessonsParams, "cursor"> = {},
  options: { enabled?: boolean } = {},
) {
  return useInfiniteQuery({
    queryKey: studentProgrammeLessonsQueryKeys.programme(programmeId, params),
    queryFn: ({ pageParam }) =>
      lessonsApi.listForStudentProgramme(programmeId, {
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(programmeId) && (options.enabled ?? true),
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
