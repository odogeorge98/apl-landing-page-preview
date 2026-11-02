"use client";

import { useQuery } from "@tanstack/react-query";

import { studentsApi } from "@/lib/api/users/students";
import type { GetStudentsParams } from "@/lib/interfaces/users/students";

export const studentsQueryKeys = {
  all: ["students"] as const,
  lists: () => [...studentsQueryKeys.all, "list"] as const,
  list: (params: GetStudentsParams) =>
    [...studentsQueryKeys.lists(), params] as const,
  details: () => [...studentsQueryKeys.all, "detail"] as const,
  detail: (studentId: string) =>
    [...studentsQueryKeys.details(), studentId] as const,
};

/** Fetch one cursor-paginated students list. */
export function useStudentsList(params: GetStudentsParams) {
  return useQuery({
    queryKey: studentsQueryKeys.list(params),
    queryFn: () => studentsApi.list(params),
  });
}

/** Fetch one student's full details. */
export function useStudentDetails(studentId: string) {
  return useQuery({
    queryKey: studentsQueryKeys.detail(studentId),
    queryFn: () => studentsApi.getById(studentId),
    enabled: Boolean(studentId),
  });
}