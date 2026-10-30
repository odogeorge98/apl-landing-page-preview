"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminReportsApi } from "@/lib/api/reports";
import { adminReportsQueryKeys, studentReportsQueryKeys } from "@/lib/hooks/reports/query-keys";
import type { CreateStudentReportFeedbackDto } from "@/lib/interfaces/reports";

export interface SendAdminReportFeedbackVariables {
  reportId: string;
  payload: CreateStudentReportFeedbackDto;
}

/** Writes one feedback message; the API does not expose a thread read endpoint. */
export function useSendAdminReportFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, payload }: SendAdminReportFeedbackVariables) =>
      adminReportsApi.sendFeedback(reportId, payload),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminReportsQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: studentReportsQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: studentReportsQueryKeys.dashboards() }),
      ]);
    },
  });
}
