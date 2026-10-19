"use client";

import { useMutation } from "@tanstack/react-query";
import { lessonsApi } from "@/lib/api/lessons";
import type { CreateLessonDto } from "@/lib/interfaces/lessons";

/** Creates a lesson within a tutor-assigned programme. */
export function useCreateLesson() {
  return useMutation({
    mutationFn: (payload: CreateLessonDto) => lessonsApi.create(payload),
  });
}
