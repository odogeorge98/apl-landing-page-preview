"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonsApi } from "@/lib/api/lessons";
import type { CreateLessonDto } from "@/lib/interfaces/lessons";
import { tutorLessonsQueryKeys } from "@/lib/hooks/lessons/use-tutor-lessons";

/** Creates a lesson within a tutor-assigned programme. */
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLessonDto) => lessonsApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: tutorLessonsQueryKeys.lists(),
      });
    },
  });
}
