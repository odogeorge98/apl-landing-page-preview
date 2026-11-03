"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentReportsApi } from "@/lib/api/reports";
import { studentReportsQueryKeys } from "@/lib/hooks/reports/query-keys";
import type { StudentReportDashboardData } from "@/lib/interfaces/reports";

export interface SubmitStudentReportDraftVariables {
  reportId: string;
  programmeId: string;
}

export function useSubmitStudentReportDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId }: SubmitStudentReportDraftVariables) =>
      studentReportsApi.submitDraft(reportId),
    // A retry could submit an already-committed report again if the response was lost.
    retry: false,
    onSuccess: async (report, variables) => {
      queryClient.setQueryData<StudentReportDashboardData>(
        studentReportsQueryKeys.dashboard(variables.programmeId),
        (current) => current
          ? { ...current, today: { reportDate: report.reportDate, report } }
          : current,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: studentReportsQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: studentReportsQueryKeys.dailyCheck() }),
        queryClient.invalidateQueries({
          queryKey: studentReportsQueryKeys.dashboard(variables.programmeId),
        }),
      ]);
    },
  });
}
