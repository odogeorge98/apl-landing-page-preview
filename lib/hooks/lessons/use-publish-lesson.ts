"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonsApi } from "@/lib/api/lessons";
import { tutorLessonsQueryKeys } from "@/lib/hooks/lessons/use-tutor-lessons";

/** Publish a draft lesson and refresh all tutor lesson list variants. */
export function usePublishLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => lessonsApi.publish(lessonId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: tutorLessonsQueryKeys.lists(),
      });
    },
  });
}
