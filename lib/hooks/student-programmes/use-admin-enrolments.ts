"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { studentProgrammesApi } from "@/lib/api/student-programmes";
import type { GetAllStudentProgrammeEnrolmentsParams } from "@/lib/interfaces/student-programmes";

type AdminEnrolmentsFilters = Pick<
  GetAllStudentProgrammeEnrolmentsParams,
  "search" | "limit"
>;

const adminEnrolmentQueryKeys = {
  all: ["admin", "student-programmes", "enrolments"] as const,
  list: (filters: AdminEnrolmentsFilters) =>
    [...adminEnrolmentQueryKeys.all, filters] as const,
};

/** Backwards-compatible base key for invalidating all admin enrolment queries. */
export const ADMIN_STUDENT_PROGRAMME_ENROLMENTS_QUERY_KEY = adminEnrolmentQueryKeys.all;

export const adminStudentProgrammeEnrolmentsQueryKeys = adminEnrolmentQueryKeys;

/** Cursor-paginated, searchable view of all student programme enrolments. */
export function useAdminStudentProgrammeEnrolments(
  filters: AdminEnrolmentsFilters = {},
) {
  const search = filters.search?.trim() || undefined;
  const limit = filters.limit;

  return useInfiniteQuery({
    queryKey: adminEnrolmentQueryKeys.list({ search, limit }),
    queryFn: ({ pageParam }) =>
      studentProgrammesApi.listAll({ search, limit, cursor: pageParam }),
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
