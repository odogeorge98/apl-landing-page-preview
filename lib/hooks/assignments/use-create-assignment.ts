"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentsApi } from "@/lib/api/assignments";
import type { CreateTutorAssignmentDto } from "@/lib/interfaces/assignments";
import { TUTOR_DASHBOARD_QUERY_KEY } from "@/lib/hooks/dashboard/use-tutor-dashboard";
import { tutorAssignmentsQueryKeys } from "@/lib/hooks/assignments/use-tutor-assignments";

/** Creates a draft assignment and refreshes tutor assignment/dashboard data. */
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTutorAssignmentDto) => assignmentsApi.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tutorAssignmentsQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: TUTOR_DASHBOARD_QUERY_KEY }),
      ]);
    },
  });
}
