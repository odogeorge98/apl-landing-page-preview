"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentsApi } from "@/lib/api/assignments";
import { TUTOR_DASHBOARD_QUERY_KEY } from "@/lib/hooks/dashboard/use-tutor-dashboard";
import { tutorAssignmentsQueryKeys } from "@/lib/hooks/assignments/use-tutor-assignments";

/** Publishes an assignment and refreshes tutor assignment/dashboard data. */
export function usePublishAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) => assignmentsApi.publish(assignmentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tutorAssignmentsQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: TUTOR_DASHBOARD_QUERY_KEY }),
      ]);
    },
  });
}
