"use client";

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/reports";
import type {
  AdminDailyReport,
  AdminReportListItem,
  AdminReportsData,
  CreateReportFeedbackDto,
  MarkReportFeedbackReadResult,
  ReportFeedbackData,
  ReportFeedbackMessage,
  ReviewAdminReportResult,
} from "@/lib/interfaces/reports";
import { adminReportsQueryKeys } from "@/lib/hooks/reports/use-admin-reports";

export interface SendAdminReportFeedbackInput {
  reportId: string;
  payload: CreateReportFeedbackDto;
}

export interface MarkAdminReportFeedbackReadInput {
  reportId: string;
  feedbackId: string;
}

/** Add a conversation message, then refresh all report views that show its count or content. */
export function useSendAdminReportFeedback() {
  const queryClient = useQueryClient();

  return useMutation<ReportFeedbackMessage, Error, SendAdminReportFeedbackInput>({
    mutationFn: ({ reportId, payload }) => reportsApi.sendAdminFeedback(reportId, payload),
    onSuccess: async (_message, { reportId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminReportsQueryKeys.feedback(reportId) }),
        queryClient.invalidateQueries({ queryKey: adminReportsQueryKeys.detail(reportId) }),
        queryClient.invalidateQueries({ queryKey: adminReportsQueryKeys.lists() }),
      ]);
    },
  });
}

/** Mark a submitted report reviewed and keep currently cached rows consistent. */
export function useMarkAdminReportReviewed() {
  const queryClient = useQueryClient();

  return useMutation<ReviewAdminReportResult, Error, string>({
    mutationFn: (reportId) => reportsApi.markAdminReportReviewed(reportId),
    onSuccess: async (result, reportId) => {
      queryClient.setQueryData<AdminDailyReport>(
        adminReportsQueryKeys.detail(reportId),
        (current) => current
          ? {
              ...current,
              status: result.status,
              submittedAt: result.submittedAt,
              reviewedAt: result.reviewedAt,
              updatedAt: result.updatedAt,
            }
          : current,
      );

      queryClient.setQueriesData<InfiniteData<AdminReportsData>>(
        { queryKey: adminReportsQueryKeys.lists() },
        (current) => current
          ? {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                items: page.items.map((report: AdminReportListItem) => report.id === reportId
                  ? {
                      ...report,
                      status: result.status,
                      submittedAt: result.submittedAt,
                      reviewedAt: result.reviewedAt,
                      updatedAt: result.updatedAt,
                    }
                  : report),
              })),
            }
          : current,
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminReportsQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: adminReportsQueryKeys.summaries() }),
      ]);
    },
  });
}

/** Persist a read receipt and reconcile both the chat history and detail cache. */
export function useMarkAdminReportFeedbackRead() {
  const queryClient = useQueryClient();

  return useMutation<MarkReportFeedbackReadResult, Error, MarkAdminReportFeedbackReadInput>({
    mutationFn: ({ reportId, feedbackId }) => reportsApi.markFeedbackRead(reportId, feedbackId),
    onSuccess: (receipt) => {
      const feedbackKey = adminReportsQueryKeys.feedback(receipt.reportId);
      queryClient.setQueryData<InfiniteData<ReportFeedbackData>>(feedbackKey, (current) =>
        current
          ? {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                items: page.items.map((message: ReportFeedbackMessage) => message.id === receipt.id
                  ? { ...message, readAt: receipt.readAt }
                  : message),
              })),
            }
          : current,
      );

      queryClient.setQueryData<AdminDailyReport>(
        adminReportsQueryKeys.detail(receipt.reportId),
        (current) => current?.feedbackMessages
          ? {
              ...current,
              feedbackMessages: current.feedbackMessages.map((message) => message.id === receipt.id
                ? { ...message, readAt: receipt.readAt }
                : message),
            }
          : current,
      );
    },
  });
}
