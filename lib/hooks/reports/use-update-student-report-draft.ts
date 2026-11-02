"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentReportsApi } from "@/lib/api/reports";
import { studentReportsQueryKeys } from "@/lib/hooks/reports/query-keys";
import type { StudentReportDashboardData, UpdateStudentReportDraftDto } from "@/lib/interfaces/reports";

export interface UpdateStudentReportDraftVariables {
  reportId: string;
  programmeId: string;
  payload: UpdateStudentReportDraftDto;
}

export function useUpdateStudentReportDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, payload }: UpdateStudentReportDraftVariables) =>
      studentReportsApi.updateDraft(reportId, payload),
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
        queryClient.invalidateQueries({
          queryKey: studentReportsQueryKeys.dashboard(variables.programmeId),
        }),
      ]);
    },
  });
}
