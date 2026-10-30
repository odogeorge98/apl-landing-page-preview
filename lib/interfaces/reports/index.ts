/**
 * Report API contracts. Keep these server-shaped types separate from the
 * legacy mock report models in `lib/mock/admin-daily-reports.ts`.
 */

/** Backend enum values may expand; unknown non-empty values remain representable. */
export type DailyReportStatus = "DRAFT" | "SUBMITTED" | (string & {});
export type DailyReportProblemStatus = "OPEN" | "RESOLVED" | (string & {});

export interface ReportPersonSummary {
  id: string;
  name?: string;
}

export interface ReportProgrammeSummary extends ReportPersonSummary {
  tutorProgrammes?: Array<{
    tutorId: string;
    tutor?: ReportPersonSummary | null;
  }>;
}

/** Record returned in student report lists and draft/submission mutations. */
export interface StudentReport {
  id: string;
  programmeId: string;
  tutorId: string | null;
  reportDate: string;
  status: DailyReportStatus;
  accomplishments: string[];
  noProblemsToday: boolean;
  blockerDescription: string | null;
  problemStatus: DailyReportProblemStatus | null;
  resolvedAt: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  feedbackCount: number;
  programme?: ReportProgrammeSummary | null;
  tutor?: ReportPersonSummary | null;
}

export interface StudentReportsPage {
  items: StudentReport[];
  nextCursor: string | null;
}

export interface StudentReportsApiResponse {
  status: "success" | "error" | string;
  statusCode: number;
  message: string;
  data: StudentReportsPage;
}

export interface GetStudentReportsParams {
  programmeId?: string;
  status?: DailyReportStatus;
  search?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  /** Opaque cursor returned by the preceding response. */
  cursor?: string | null;
}

export interface StudentReportDashboardOverview {
  thisWeek: {
    reportedDays: number;
    requiredDays: number | null;
  };
  streakDays: number | null;
  openProblems: number;
  feedbackReceived: number;
}

/**
 * The backend has not finalized reporting-policy or recent-day schemas yet.
 * Keep those opaque JSON objects typed as records rather than guessing fields.
 */
export interface StudentReportDashboardData {
  programme: ReportProgrammeSummary;
  assignedTutors: ReportPersonSummary[];
  reportingPolicy: Record<string, unknown> | null;
  overview: StudentReportDashboardOverview;
  today: {
    reportDate: string;
    report: StudentReport | null;
  };
  recentDays: Array<Record<string, unknown>>;
}

export interface StudentReportDashboardApiResponse {
  status: "success" | "error" | string;
  statusCode: number;
  message: string;
  data: StudentReportDashboardData;
}

export interface GetStudentReportDashboardParams {
  programmeId: string;
}

export interface StudentReportDraftContentDto {
  accomplishments?: string[] | null;
  noProblemsToday?: boolean | null;
  blockerDescription?: string | null;
}

export interface SaveStudentReportDraftDto extends StudentReportDraftContentDto {
  programmeId: string;
  /** Required by the backend when multiple active tutors teach this programme. */
  tutorId?: string;
}

export interface UpdateStudentReportDraftDto extends StudentReportDraftContentDto {}

export interface StudentReportApiResponse {
  status: "success" | "error" | string;
  statusCode: number;
  message: string;
  data: StudentReport;
}

export interface ReportFeedbackPerson {
  id: string;
  role: string;
}

/** One feedback message returned by POST; this is not a conversation history. */
export interface StudentReportFeedbackMessage {
  id: string;
  reportId: string;
  authorUserId: string;
  recipientUserId: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: ReportFeedbackPerson;
  recipient: ReportFeedbackPerson;
}

export interface CreateStudentReportFeedbackDto {
  message: string;
}

export interface StudentReportFeedbackApiResponse {
  status: "success" | "error" | string;
  statusCode: number;
  message: string;
  data: StudentReportFeedbackMessage;
}
