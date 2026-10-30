"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { studentProgrammesApi } from "@/lib/api/student-programmes";
import type { CreateStudentProgrammeEnrolmentDto } from "@/lib/interfaces/student-programmes";
import { STUDENT_DASHBOARD_QUERY_KEY } from "@/lib/hooks/dashboard/use-student-dashboard";
import { STUDENT_LEARNING_PROGRESS_QUERY_KEY } from "@/lib/hooks/dashboard/use-student-learning-progress";

export const studentProgrammesQueryKeys = {
  all: ["student", "programmes"] as const,
  myProgrammes: () => [...studentProgrammesQueryKeys.all, "enrolments"] as const,
};

/** Cursor-paginated programme enrolments for the authenticated student. */
export function useMyProgrammes(options: { enabled?: boolean } = {}) {
  return useInfiniteQuery({
    queryKey: studentProgrammesQueryKeys.myProgrammes(),
    queryFn: ({ pageParam }) =>
      studentProgrammesApi.listMyProgrammes({ cursor: pageParam }),
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

/** Enrol the current student and refresh cached learning summaries. */
export function useEnrolInProgramme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStudentProgrammeEnrolmentDto) =>
      studentProgrammesApi.enrol(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: studentProgrammesQueryKeys.myProgrammes(),
        }),
        queryClient.invalidateQueries({
          queryKey: STUDENT_DASHBOARD_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: STUDENT_LEARNING_PROGRESS_QUERY_KEY,
        }),
      ]);
    },
  });
}
