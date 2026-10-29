"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentsApi } from "@/lib/api/assignments";
import type { SubmitStudentAssignmentDto } from "@/lib/interfaces/assignments";
import { studentAssignmentsQueryKeys } from "@/lib/hooks/assignments/use-student-assignments";

/** Submit an answer once, then refresh submission-aware student assignment data. */
export function useSubmitStudentAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      payload,
    }: {
      assignmentId: string;
      payload: SubmitStudentAssignmentDto;
    }) => assignmentsApi.submitForStudent(assignmentId, payload),
    // A retry can create another attempt if the first response is lost after commit.
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: studentAssignmentsQueryKeys.lists(),
      });
    },
  });
}
