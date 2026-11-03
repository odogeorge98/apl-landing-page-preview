"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { studentSessionsApi } from "@/lib/api/student-sessions";
import type { GetStudentSessionsParams } from "@/lib/interfaces/student-sessions";

export const studentSessionsQueryKeys = {
  all: ["student", "sessions"] as const,
  lists: () => [...studentSessionsQueryKeys.all, "list"] as const,
  list: (params: Omit<GetStudentSessionsParams, "cursor">) =>
    [...studentSessionsQueryKeys.lists(), params] as const,
};

/** Cursor-paginated, read-only sessions for the authenticated student. */
export function useStudentSessions(
  params: Omit<GetStudentSessionsParams, "cursor"> = {},
  options: { enabled?: boolean } = {},
) {
  const normalizedParams: Omit<GetStudentSessionsParams, "cursor"> = { ...params };

  return useInfiniteQuery({
    queryKey: studentSessionsQueryKeys.list(normalizedParams),
    queryFn: ({ pageParam }) =>
      studentSessionsApi.list({ ...normalizedParams, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: options.enabled ?? true,
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
