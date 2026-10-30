"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { adminReportsApi } from "@/lib/api/reports";
import { adminReportsQueryKeys, studentReportsQueryKeys } from "@/lib/hooks/reports/query-keys";
import type { AdminReportsPage } from "@/lib/interfaces/reports";

export interface MarkAdminReportReviewedVariables {
  reportId: string;
}

/** Marks one report reviewed, then refreshes affected server-derived views. */
export function useMarkAdminReportReviewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId }: MarkAdminReportReviewedVariables) =>
      adminReportsApi.markReviewed(reportId),
    retry: false,
    onSuccess: async (reviewResult) => {
      // The endpoint returns only review fields. Merge those fields into all
      // cached filtered pages without replacing each complete report record.
      queryClient.setQueriesData<InfiniteData<AdminReportsPage>>(
        { queryKey: adminReportsQueryKeys.lists() },
        (current) => current
          ? {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                items: page.items.map((report) => report.id === reviewResult.id
                  ? {
                      ...report,
                      status: reviewResult.status,
                      submittedAt: reviewResult.submittedAt,
                      reviewedAt: reviewResult.reviewedAt,
                    }
                  : report),
              })),
            }
          : current,
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminReportsQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: adminReportsQueryKeys.summaries() }),
        queryClient.invalidateQueries({ queryKey: studentReportsQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: studentReportsQueryKeys.dashboards() }),
      ]);
    },
  });
}
