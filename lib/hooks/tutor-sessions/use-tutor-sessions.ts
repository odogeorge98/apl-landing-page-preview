"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { tutorSessionsApi } from "@/lib/api/tutor-sessions";
import type { GetTutorSessionsParams } from "@/lib/interfaces/tutor-sessions";

export const tutorSessionsQueryKeys = {
  all: ["tutor", "sessions"] as const,
  lists: () => [...tutorSessionsQueryKeys.all, "list"] as const,
  list: (params: Omit<GetTutorSessionsParams, "cursor">) =>
    [...tutorSessionsQueryKeys.lists(), params] as const,
};

/** Cursor-paginated sessions for the authenticated tutor. */
export function useTutorSessions(
  params: Omit<GetTutorSessionsParams, "cursor"> = {},
  options: { enabled?: boolean } = {},
) {
  const normalizedParams: Omit<GetTutorSessionsParams, "cursor"> = {
    ...params,
    search: params.search?.trim() || undefined,
  };

  return useInfiniteQuery({
    queryKey: tutorSessionsQueryKeys.list(normalizedParams),
    queryFn: ({ pageParam }) =>
      tutorSessionsApi.list({ ...normalizedParams, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
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
