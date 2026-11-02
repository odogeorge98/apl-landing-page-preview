export type DailyReportStatus = "DRAFT" | "SUBMITTED" | "REVIEWED" | "RETURNED";
export type DailyReportProblemStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface ReportPersonSummary {
  id: string;
  name: string;
}

export interface AdminDailyReport {
  id: string;
  studentId: string;
  programmeId: string;
  tutorId: string | null;
  reportDate: string;
  status: DailyReportStatus;
  accomplishments: string[];
  noProblemsToday: boolean | null;
  blockerDescription: string | null;
  problemStatus: DailyReportProblemStatus | null;
  resolvedAt: string | null;
  resolvedByUserId?: string | null;
  resolvedBy?: ReportPersonSummary | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
  feedbackCount: number;
  student: ReportPersonSummary;
  programme: ReportPersonSummary;
  tutor: ReportPersonSummary | null;
  feedbackMessages?: ReportFeedbackMessage[];
}

/** Compact report row returned by GET /reports/admin. */
export interface AdminReportListItem extends Omit<AdminDailyReport, "studentId" | "programmeId" | "tutorId"> {
  studentId?: string;
  programmeId?: string;
  tutorId?: string | null;
}

export interface AdminReportsData {
  items: AdminReportListItem[];
  nextCursor: string | null;
}

export interface AdminReportsApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: AdminReportsData;
}

export interface GetAdminReportsParams {
  programmeId?: string;
  status?: Exclude<DailyReportStatus, "DRAFT">;
  problemStatus?: DailyReportProblemStatus;
  fromDate?: string;
  toDate?: string;
  search?: string;
  limit?: number;
  cursor?: string | null;
}

export interface AdminReportSummary {
  period: {
    fromDate: string;
    toDate: string;
  };
  summary: {
    submittedReports: number;
    expectedReports: number;
    notSubmittedReports: number;
    openProblems: number;
    awaitingReview: number;
  };
}

export interface GetAdminReportSummaryParams {
  fromDate: string;
  toDate: string;
}

export interface AdminReportSummaryApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: AdminReportSummary;
}

export interface AdminReportApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: AdminDailyReport;
}

export interface ReportFeedbackAuthor {
  id: string;
  role: string;
}

export interface ReportFeedbackMessage {
  id: string;
  reportId: string;
  authorUserId: string;
  recipientUserId: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: ReportFeedbackAuthor;
  recipient: ReportFeedbackAuthor;
}

export interface ReportFeedbackData {
  reportId: string;
  items: ReportFeedbackMessage[];
  nextCursor: string | null;
}

export interface ReportFeedbackApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: ReportFeedbackData;
}

export interface CreateReportFeedbackDto {
  message: string;
}

export interface CreateReportFeedbackApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: ReportFeedbackMessage;
}

export interface ReviewAdminReportResult {
  id: string;
  status: "REVIEWED";
  submittedAt: string | null;
  reviewedAt: string;
  updatedAt: string;
}

export interface ReviewAdminReportApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: ReviewAdminReportResult;
}

export interface MarkReportFeedbackReadResult {
  id: string;
  reportId: string;
  readAt: string;
}

export interface MarkReportFeedbackReadApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: MarkReportFeedbackReadResult;
}
