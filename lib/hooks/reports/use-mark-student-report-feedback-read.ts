"use client";

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { reportFeedbackApi } from "@/lib/api/reports";
import { studentReportsQueryKeys } from "@/lib/hooks/reports/query-keys";
import type { ReportFeedbackPage } from "@/lib/interfaces/reports";

export interface MarkStudentReportFeedbackReadVariables {
  reportId: string;
  feedbackId: string;
}

/** Marks one received message as read and patches the cached thread from the server receipt. */
export function useMarkStudentReportFeedbackRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, feedbackId }: MarkStudentReportFeedbackReadVariables) =>
      reportFeedbackApi.markAsRead(reportId, feedbackId),
    retry: false,
    onSuccess: (receipt, variables) => {
      queryClient.setQueryData<InfiniteData<ReportFeedbackPage, string | null>>(
        studentReportsQueryKeys.feedback(variables.reportId),
        (current) => {
          if (!current) return current;
          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((message) =>
                message.id === receipt.id && message.reportId === receipt.reportId
                  ? { ...message, readAt: receipt.readAt }
                  : message,
              ),
            })),
          };
        },
      );
    },
  });
}
