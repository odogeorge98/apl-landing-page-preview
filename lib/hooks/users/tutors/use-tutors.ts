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
