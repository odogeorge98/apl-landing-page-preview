"use client";

import { useQuery } from "@tanstack/react-query";

import { studentsApi } from "@/lib/api/users/students";
import type { GetStudentsParams } from "@/lib/interfaces/users/students";

export const studentsQueryKeys = {
  all: ["students"] as const,
  lists: () => [...studentsQueryKeys.all, "list"] as const,
  list: (params: GetStudentsParams) =>
    [...studentsQueryKeys.lists(), params] as const,
};

/** Fetch one cursor-paginated students list. */
export function useStudentsList(params: GetStudentsParams) {
  return useQuery({
    queryKey: studentsQueryKeys.list(params),
    queryFn: () => studentsApi.list(params),
  });
}
