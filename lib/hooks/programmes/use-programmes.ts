"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { programmesApi } from "@/lib/api/programmes";
import type { GetProgrammesParams } from "@/lib/interfaces/programmes";

export const programmesQueryKeys = {
  all: ["programmes"] as const,
  details: (id: string) => [...programmesQueryKeys.all, "detail", id] as const,
  catalogue: (search: string) =>
    [...programmesQueryKeys.all, "catalogue", { search }] as const,
};

/** Programme information and administrative metrics for a single programme. */
export function useProgrammeDetails(id: string) {
  const programmeId = id.trim();

  return useQuery({
    queryKey: programmesQueryKeys.details(programmeId),
    queryFn: () => programmesApi.getById(programmeId),
    enabled: Boolean(programmeId),
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

/** Cursor-paginated catalogue of programmes available to learners. */
export function useProgrammes(params: Pick<GetProgrammesParams, "search"> = {}) {
  const search = params.search?.trim() ?? "";

  return useInfiniteQuery({
    queryKey: programmesQueryKeys.catalogue(search),
    queryFn: ({ pageParam }) => programmesApi.list({ search, cursor: pageParam }),
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
