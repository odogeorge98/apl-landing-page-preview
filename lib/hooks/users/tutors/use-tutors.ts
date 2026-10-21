
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { tutorsApi } from "@/lib/api/users/tutors";

import type {
  CreateTutorDto,
  GetTutorsParams,
} from "@/lib/interfaces/users/tutors";

export const tutorsQueryKeys = {
  all: ["tutors"] as const,

  lists: () => [...tutorsQueryKeys.all, "list"] as const,

  list: (params: GetTutorsParams) =>
    [...tutorsQueryKeys.lists(), params] as const,

  details: () => [...tutorsQueryKeys.all, "detail"] as const,

  detail: (id: string) =>
    [...tutorsQueryKeys.details(), id] as const,
};

/**
 * Fetch a cursor-paginated tutors list.
 */
export function useTutorsList(params: GetTutorsParams) {
  return useQuery({
    queryKey: tutorsQueryKeys.list(params),
    queryFn: () => tutorsApi.list(params),
  });
}

/**
 * Fetch a tutor and their full details by ID.
 */
export function useTutorDetails(id: string) {
  return useQuery({
    queryKey: tutorsQueryKeys.detail(id),
    queryFn: () => tutorsApi.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof Error && "status" in error) {
        const status = Number(
          (error as Error & { status?: number }).status,
        );

        if (status >= 400 && status < 500) {
          return false;
        }
      }

      return failureCount < 2;
    },
  });
}

/**
 * Create a tutor and refresh cached tutor lists.
 */
export function useCreateTutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTutorDto) =>
      tutorsApi.create(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: tutorsQueryKeys.lists(),
      });
    },
  });
}
