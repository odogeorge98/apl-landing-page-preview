import { http } from "@/lib/utils/http";
import type {
  AdminDailyReport,
  AdminReportListItem,
  AdminReportSummary,
  AdminReportsApiResponse,
  AdminReportApiResponse,
  AdminReportSummaryApiResponse,
  CreateReportFeedbackApiResponse,
  CreateReportFeedbackDto,
  DailyReportProblemStatus,
  DailyReportStatus,
  GetAdminReportsParams,
  GetAdminReportSummaryParams,
  MarkReportFeedbackReadApiResponse,
  MarkReportFeedbackReadResult,
  ReportFeedbackApiResponse,
  ReportFeedbackAuthor,
  ReportFeedbackData,
  ReportFeedbackMessage,
  ReviewAdminReportApiResponse,
  ReviewAdminReportResult,
} from "@/lib/interfaces/reports";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const REPORT_STATUSES = new Set<DailyReportStatus>([
  "DRAFT",
  "SUBMITTED",
  "REVIEWED",
  "RETURNED",
]);
const ADMIN_REPORT_STATUSES = new Set(["SUBMITTED", "REVIEWED", "RETURNED"]);
const PROBLEM_STATUSES = new Set<DailyReportProblemStatus>([
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isCalendarDate(value: string): boolean {
  if (!DATE_KEY_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateDateRange(fromDate?: string, toDate?: string): void {
  if (Boolean(fromDate) !== Boolean(toDate)) {
    throw new Error("Provide both a start date and an end date.");
  }
  if (!fromDate || !toDate) return;
  if (!isCalendarDate(fromDate) || !isCalendarDate(toDate)) {
    throw new Error("Report dates must be valid calendar dates in YYYY-MM-DD format.");
  }
  if (fromDate > toDate) {
    throw new Error("The start date cannot be later than the end date.");
  }
}

function isPerson(value: unknown): boolean {
  return isRecord(value) && typeof value.id === "string" && typeof value.name === "string";
}

function isFeedbackAuthor(value: unknown): value is ReportFeedbackAuthor {
  return isRecord(value) && typeof value.id === "string" && typeof value.role === "string";
}

function isFeedbackMessage(value: unknown): value is ReportFeedbackMessage {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.reportId === "string" &&
    typeof value.authorUserId === "string" &&
    typeof value.recipientUserId === "string" &&
    typeof value.message === "string" &&
    (value.readAt === null || typeof value.readAt === "string") &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    isFeedbackAuthor(value.author) &&
    isFeedbackAuthor(value.recipient)
  );
}

function isReportFields(value: unknown): value is AdminReportListItem {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    (!('studentId' in value) || typeof value.studentId === "string") &&
    (!('programmeId' in value) || typeof value.programmeId === "string") &&
    (!('tutorId' in value) || value.tutorId === null || typeof value.tutorId === "string") &&
    isCalendarDate(String(value.reportDate)) &&
    typeof value.status === "string" &&
    REPORT_STATUSES.has(value.status as DailyReportStatus) &&
    Array.isArray(value.accomplishments) &&
    value.accomplishments.every((item) => typeof item === "string") &&
    (typeof value.noProblemsToday === "boolean" || value.noProblemsToday === null) &&
    (typeof value.blockerDescription === "string" || value.blockerDescription === null) &&
    (typeof value.problemStatus === "string" || value.problemStatus === null) &&
    (value.problemStatus === null || PROBLEM_STATUSES.has(value.problemStatus as DailyReportProblemStatus)) &&
    (typeof value.resolvedAt === "string" || value.resolvedAt === null) &&
    (value.submittedAt === null || typeof value.submittedAt === "string") &&
    (value.reviewedAt === null || typeof value.reviewedAt === "string") &&
    typeof value.feedbackCount === "number" &&
    Number.isFinite(value.feedbackCount) &&
    isPerson(value.student) &&
    isPerson(value.programme) &&
    (value.tutor === null || isPerson(value.tutor)) &&
    (value.feedbackMessages === undefined ||
      (Array.isArray(value.feedbackMessages) && value.feedbackMessages.every(isFeedbackMessage)))
  );
}

function isAdminReport(value: unknown): value is AdminDailyReport {
  return (
    isReportFields(value) &&
    typeof value.studentId === "string" &&
    typeof value.programmeId === "string" &&
    (typeof value.tutorId === "string" || value.tutorId === null) &&
    isRecord(value) &&
    (value.resolvedBy === undefined || value.resolvedBy === null || isPerson(value.resolvedBy)) &&
    (value.resolvedByUserId === undefined || value.resolvedByUserId === null || typeof value.resolvedByUserId === "string") &&
    (value.createdAt === undefined || typeof value.createdAt === "string") &&
    (value.updatedAt === undefined || typeof value.updatedAt === "string")
  );
}

function isAdminReportSummary(value: unknown): value is AdminReportSummary {
  if (!isRecord(value) || !isRecord(value.period) || !isRecord(value.summary)) return false;
  const period = value.period;
  const summary = value.summary;
  const summaryKeys = [
    "submittedReports",
    "expectedReports",
    "notSubmittedReports",
    "openProblems",
    "awaitingReview",
  ] as const;

  return (
    typeof period.fromDate === "string" &&
    isCalendarDate(period.fromDate) &&
    typeof period.toDate === "string" &&
    isCalendarDate(period.toDate) &&
    summaryKeys.every(
      (key) => typeof summary[key] === "number" && Number.isFinite(summary[key]),
    )
  );
}

function assertSuccess(result: { status: string; message: string }, fallback: string): void {
  if (result.status !== "success") throw new Error(result.message || fallback);
}

function validateReportListParams(params: GetAdminReportsParams): void {
  if (params.status && !ADMIN_REPORT_STATUSES.has(params.status)) {
    throw new Error("Choose a valid admin report status.");
  }
  if (params.problemStatus && !PROBLEM_STATUSES.has(params.problemStatus)) {
    throw new Error("Choose a valid blocker status.");
  }
  validateDateRange(params.fromDate, params.toDate);
  if (params.search && params.search.length > 100) {
    throw new Error("Search must be 100 characters or fewer.");
  }
  if (params.limit !== undefined && (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 50)) {
    throw new Error("Page size must be an integer between 1 and 50.");
  }
  if (params.cursor && params.cursor.length > 512) {
    throw new Error("The pagination cursor is invalid.");
  }
}

function validateId(id: string, label: string): string {
  const normalizedId = id.trim();
  if (!normalizedId) throw new Error(`${label} is required.`);
  return encodeURIComponent(normalizedId);
}

export const reportsApi = {
  /** GET /reports/admin — cursor-paginated reports visible to administrators. */
  listAdmin: async (params: GetAdminReportsParams = {}): Promise<{ items: AdminReportListItem[]; nextCursor: string | null }> => {
    validateReportListParams(params);
    const queryParams: Record<string, string | number> = {};
    if (params.programmeId?.trim()) queryParams.programmeId = params.programmeId.trim();
    if (params.status) queryParams.status = params.status;
    if (params.problemStatus) queryParams.problemStatus = params.problemStatus;
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;
    if (params.search?.trim()) queryParams.search = params.search.trim();
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (params.cursor?.trim()) queryParams.cursor = params.cursor.trim();

    const response = await http.get<AdminReportsApiResponse>("/reports/admin", { params: queryParams });
    const result = response.data;
    assertSuccess(result, "Unable to retrieve admin reports.");
    if (
      !isRecord(result.data) ||
      !Array.isArray(result.data.items) ||
      !(result.data.nextCursor === null || typeof result.data.nextCursor === "string") ||
      !result.data.items.every(isReportFields)
    ) {
      throw new Error("The admin reports response was incomplete or invalid.");
    }
    return result.data;
  },

  /** GET /reports/admin/summary — reporting metrics for an inclusive date range. */
  getAdminSummary: async (params: GetAdminReportSummaryParams): Promise<AdminReportSummary> => {
    validateDateRange(params.fromDate, params.toDate);
    if (!params.fromDate || !params.toDate) {
      throw new Error("Choose a start date and end date for the report summary.");
    }
    const response = await http.get<AdminReportSummaryApiResponse>("/reports/admin/summary", {
      params: { fromDate: params.fromDate, toDate: params.toDate },
    });
    const result = response.data;
    assertSuccess(result, "Unable to retrieve the admin report summary.");
    if (!isAdminReportSummary(result.data)) {
      throw new Error("The admin report summary response was incomplete or invalid.");
    }
    return result.data;
  },

  /** GET /reports/admin/:id — retrieve a complete report for the reader pane. */
  getAdminById: async (reportId: string): Promise<AdminDailyReport> => {
    const encodedId = validateId(reportId, "Report ID");
    const response = await http.get<AdminReportApiResponse>(`/reports/admin/${encodedId}`);
    const result = response.data;
    assertSuccess(result, "Unable to retrieve this report.");
    if (!isAdminReport(result.data)) {
      throw new Error("The admin report response was incomplete or invalid.");
    }
    return result.data;
  },

  /** POST /reports/admin/:id/feedback — add a message to a report conversation. */
  sendAdminFeedback: async (reportId: string, payload: CreateReportFeedbackDto): Promise<ReportFeedbackMessage> => {
    const encodedId = validateId(reportId, "Report ID");
    const message = payload.message.trim();
    if (!message || message.length > 5000) {
      throw new Error("Feedback must contain 1–5000 non-whitespace characters.");
    }
    const response = await http.post<CreateReportFeedbackApiResponse>(
      `/reports/admin/${encodedId}/feedback`,
      { message },
    );
    const result = response.data;
    assertSuccess(result, "Unable to send report feedback.");
    if (!isFeedbackMessage(result.data)) {
      throw new Error("The feedback response was incomplete or invalid.");
    }
    return result.data;
  },

  /** PATCH /reports/admin/:id/review — mark a submitted report as reviewed. */
  markAdminReportReviewed: async (reportId: string): Promise<ReviewAdminReportResult> => {
    const encodedId = validateId(reportId, "Report ID");
    const response = await http.patch<ReviewAdminReportApiResponse>(`/reports/admin/${encodedId}/review`);
    const result = response.data;
    assertSuccess(result, "Unable to mark this report as reviewed.");
    if (
      !isRecord(result.data) ||
      typeof result.data.id !== "string" ||
      result.data.status !== "REVIEWED" ||
      !(result.data.submittedAt === null || typeof result.data.submittedAt === "string") ||
      typeof result.data.reviewedAt !== "string" ||
      typeof result.data.updatedAt !== "string"
    ) {
      throw new Error("The report review response was incomplete or invalid.");
    }
    return result.data;
  },

  /** GET /reports/:id/feedback — cursor-paginated conversation messages. */
  getFeedback: async (reportId: string, cursor?: string | null): Promise<ReportFeedbackData> => {
    const encodedId = validateId(reportId, "Report ID");
    const normalizedCursor = cursor?.trim();
    if (normalizedCursor && normalizedCursor.length > 512) throw new Error("The pagination cursor is invalid.");
    const response = await http.get<ReportFeedbackApiResponse>(
      `/reports/${encodedId}/feedback`,
      { params: normalizedCursor ? { cursor: normalizedCursor } : {} },
    );
    const result = response.data;
    assertSuccess(result, "Unable to retrieve report feedback.");
    if (
      !isRecord(result.data) ||
      result.data.reportId !== reportId.trim() ||
      !Array.isArray(result.data.items) ||
      !(result.data.nextCursor === null || typeof result.data.nextCursor === "string") ||
      !result.data.items.every(isFeedbackMessage)
    ) {
      throw new Error("The report feedback response was incomplete or invalid.");
    }
    return result.data;
  },

  /** PATCH /reports/:id/feedback/:messageId/read — mark a message read. */
  markFeedbackRead: async (reportId: string, feedbackId: string): Promise<MarkReportFeedbackReadResult> => {
    const encodedReportId = validateId(reportId, "Report ID");
    const encodedFeedbackId = validateId(feedbackId, "Feedback ID");
    const response = await http.patch<MarkReportFeedbackReadApiResponse>(
      `/reports/${encodedReportId}/feedback/${encodedFeedbackId}/read`,
    );
    const result = response.data;
    assertSuccess(result, "Unable to mark this feedback as read.");
    if (
      !isRecord(result.data) ||
      result.data.id !== feedbackId.trim() ||
      result.data.reportId !== reportId.trim() ||
      typeof result.data.readAt !== "string"
    ) {
      throw new Error("The feedback read receipt response was incomplete or invalid.");
    }
    return result.data;
  },
};
