"use client";

import { useMutation } from "@tanstack/react-query";
import { assignmentsApi } from "@/lib/api/assignments";
import type { ReviewAssignmentSubmissionDto } from "@/lib/interfaces/assignments";

/** Saves a tutor's decision for one submission. The server mutation is never retried. */
export function useReviewAssignmentSubmission() {
  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: ReviewAssignmentSubmissionDto;
    }) => assignmentsApi.reviewSubmission(submissionId, payload),
    // A retry after a lost response could repeat a review action.
    retry: false,
  });
}
