"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { tutorProgrammesApi } from "@/lib/api/tutor-programmes";

export const tutorProgrammesQueryKeys = {
  all: ["tutor", "programmes"] as const,
  myProgrammes: () => [...tutorProgrammesQueryKeys.all, "assignments"] as const,
};

/** Cursor-paginated course assignments for the authenticated tutor. */
export function useMyTutorProgrammes() {
  return useInfiniteQuery({
    queryKey: tutorProgrammesQueryKeys.myProgrammes(),
    queryFn: ({ pageParam }) =>
      tutorProgrammesApi.listMyProgrammes({ cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
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
