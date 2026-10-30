"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentReportsApi } from "@/lib/api/reports";
import { studentReportsQueryKeys } from "@/lib/hooks/reports/query-keys";
import type { CreateStudentReportFeedbackDto } from "@/lib/interfaces/reports";

export interface SendStudentReportFeedbackVariables {
  reportId: string;
  /** Optional because the POST response is message-only and callers may not have the programme at hand. */
  programmeId?: string;
  payload: CreateStudentReportFeedbackDto;
}

export function useSendStudentReportFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, payload }: SendStudentReportFeedbackVariables) =>
      studentReportsApi.sendFeedback(reportId, payload),
    retry: false,
    onSuccess: async (_feedback, variables) => {
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: studentReportsQueryKeys.lists() }),
      ];
      if (variables.programmeId) {
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: studentReportsQueryKeys.dashboard(variables.programmeId),
          }),
        );
      } else {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: studentReportsQueryKeys.dashboards() }),
        );
      }
      await Promise.all(invalidations);
    },
  });
}
