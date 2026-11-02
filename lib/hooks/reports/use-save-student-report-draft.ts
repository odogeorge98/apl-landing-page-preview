"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentReportsApi } from "@/lib/api/reports";
import { studentReportsQueryKeys } from "@/lib/hooks/reports/query-keys";
import type { SaveStudentReportDraftDto, StudentReportDashboardData } from "@/lib/interfaces/reports";

export function useSaveStudentReportDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveStudentReportDraftDto) => studentReportsApi.saveDraft(payload),
    // Creating a draft is not documented as idempotent; a retry could create duplicates.
    retry: false,
    onSuccess: async (report) => {
      queryClient.setQueryData<StudentReportDashboardData>(
        studentReportsQueryKeys.dashboard(report.programmeId),
        (current) => current
          ? { ...current, today: { reportDate: report.reportDate, report } }
          : current,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: studentReportsQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: studentReportsQueryKeys.dashboard(report.programmeId),
        }),
      ]);
    },
  });
}
