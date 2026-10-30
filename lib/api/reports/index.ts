import { http } from "@/lib/utils/http";
import type {
  CreateStudentReportFeedbackDto,
  GetStudentReportDashboardParams,
  GetStudentReportsParams,
  SaveStudentReportDraftDto,
  StudentReport,
  StudentReportApiResponse,
  StudentReportDashboardApiResponse,
  StudentReportDashboardData,
  StudentReportFeedbackApiResponse,
  StudentReportFeedbackMessage,
  StudentReportsApiResponse,
  StudentReportsPage,
  UpdateStudentReportDraftDto,
} from "@/lib/interfaces/reports";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertUuid(value: string, label: string): string {
  const normalized = value.trim();
  if (!UUID_V4_PATTERN.test(normalized)) {
    throw new Error(`${label} must be a valid UUID.`);
  }
  return normalized;
}

function assertDateOnly(value: string, label: string): string {
  if (!isDateOnly(value)) throw new Error(`${label} must be a valid YYYY-MM-DD calendar date.`);
  return value;
}

function isDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_ONLY_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isTimestamp(value: unknown, nullable = false): value is string | null {
  return (nullable && value === null) ||
    (typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value)));
}

function isPersonSummary(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" &&
    (value.name === undefined || value.name === null || typeof value.name === "string");
}

function isProgrammeSummary(value: unknown): boolean {
  if (!isPersonSummary(value)) return false;
  const programme = value as Record<string, unknown>;
  if (programme.tutorProgrammes === undefined) return true;
  return Array.isArray(programme.tutorProgrammes) && programme.tutorProgrammes.every((entry) => {
    if (!isRecord(entry) || typeof entry.tutorId !== "string") return false;
    return entry.tutor === undefined || entry.tutor === null || isPersonSummary(entry.tutor);
  });
}

function isStudentReport(value: unknown): value is StudentReport {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.programmeId === "string" &&
    (typeof value.tutorId === "string" || value.tutorId === null) &&
    isDateOnly(value.reportDate) &&
    typeof value.status === "string" && value.status.length > 0 &&
    Array.isArray(value.accomplishments) && value.accomplishments.every((item) => typeof item === "string") &&
    typeof value.noProblemsToday === "boolean" &&
    (typeof value.blockerDescription === "string" || value.blockerDescription === null) &&
    (typeof value.problemStatus === "string" || value.problemStatus === null) &&
    isTimestamp(value.resolvedAt, true) &&
    isTimestamp(value.submittedAt, true) &&
    isTimestamp(value.reviewedAt, true) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt) &&
    typeof value.feedbackCount === "number" && Number.isInteger(value.feedbackCount) && value.feedbackCount >= 0 &&
    (value.programme === undefined || value.programme === null || isProgrammeSummary(value.programme)) &&
    (value.tutor === undefined || value.tutor === null || isPersonSummary(value.tutor))
  );
}

function isStudentReportsPage(value: unknown): value is StudentReportsPage {
  return isRecord(value) &&
    Array.isArray(value.items) &&
    (value.nextCursor === null || typeof value.nextCursor === "string") &&
    value.items.every(isStudentReport);
}

function isStudentReportDashboard(value: unknown): value is StudentReportDashboardData {
  if (!isRecord(value) || !isProgrammeSummary(value.programme) || !Array.isArray(value.assignedTutors)) return false;
  if (!value.assignedTutors.every(isPersonSummary)) return false;
  if (value.reportingPolicy !== null && !isRecord(value.reportingPolicy)) return false;

  const overview = value.overview;
  if (!isRecord(overview) || !isRecord(overview.thisWeek)) return false;
  const week = overview.thisWeek;
  const today = value.today;
  return (
    typeof week.reportedDays === "number" && Number.isInteger(week.reportedDays) && week.reportedDays >= 0 &&
    (week.requiredDays === null || (typeof week.requiredDays === "number" && Number.isInteger(week.requiredDays) && week.requiredDays >= 0)) &&
    (overview.streakDays === null || (typeof overview.streakDays === "number" && Number.isInteger(overview.streakDays) && overview.streakDays >= 0)) &&
    typeof overview.openProblems === "number" && Number.isInteger(overview.openProblems) && overview.openProblems >= 0 &&
    typeof overview.feedbackReceived === "number" && Number.isInteger(overview.feedbackReceived) && overview.feedbackReceived >= 0 &&
    isRecord(today) && isDateOnly(today.reportDate) &&
    (today.report === null || isStudentReport(today.report)) &&
    Array.isArray(value.recentDays) && value.recentDays.every(isRecord)
  );
}

function isFeedbackMessage(value: unknown): value is StudentReportFeedbackMessage {
  if (!isRecord(value)) return false;
  const isFeedbackPerson = (person: unknown) =>
    isRecord(person) && typeof person.id === "string" && typeof person.role === "string";
  return (
    typeof value.id === "string" && typeof value.reportId === "string" &&
    typeof value.authorUserId === "string" && typeof value.recipientUserId === "string" &&
    typeof value.message === "string" && isTimestamp(value.readAt, true) &&
    isTimestamp(value.createdAt) && isTimestamp(value.updatedAt) &&
    isFeedbackPerson(value.author) && isFeedbackPerson(value.recipient)
  );
}

function validateDraftContent<T extends StudentReportDraftContentPayload>(payload: T): T {
  if (payload.accomplishments !== undefined && payload.accomplishments !== null) {
    if (!Array.isArray(payload.accomplishments) || payload.accomplishments.length > 50) {
      throw new RangeError("A report can include at most 50 accomplishments.");
    }
    payload.accomplishments.forEach((item) => {
      if (typeof item !== "string") throw new Error("Each accomplishment must be text.");
      if (item.length > 2000) throw new RangeError("Each accomplishment must be 2,000 characters or fewer.");
    });
    const combinedLength = payload.accomplishments.join("\n").length;
    if (combinedLength > 2000) throw new RangeError("Accomplishments must total 2,000 characters or fewer.");
  }

  if (payload.noProblemsToday !== undefined && payload.noProblemsToday !== null && typeof payload.noProblemsToday !== "boolean") {
    throw new Error("Choose whether you had any problems today.");
  }
  if (payload.blockerDescription !== undefined && payload.blockerDescription !== null) {
    if (typeof payload.blockerDescription !== "string") throw new Error("The blocker description must be text.");
    if (payload.blockerDescription.length > 2000) throw new RangeError("The blocker description must be 2,000 characters or fewer.");
  }

  // A positive “no problems” answer always clears a blocker to avoid storing contradictory content.
  if (payload.noProblemsToday === true) {
    return { ...payload, blockerDescription: null };
  }
  return payload;
}

interface StudentReportDraftContentPayload {
  accomplishments?: string[] | null;
  noProblemsToday?: boolean | null;
  blockerDescription?: string | null;
}

function unwrap<T extends { status: string; message: string; data: unknown }>(
  response: { data: T },
  isValidData: (data: unknown) => data is T["data"],
  fallbackMessage: string,
): T["data"] {
  const result = response.data;
  if (result.status !== "success") throw new Error(result.message || fallbackMessage);
  if (!isValidData(result.data)) throw new Error("The reports API response was incomplete or invalid.");
  return result.data;
}

function normalizeListParams(params: GetStudentReportsParams): Record<string, string | number> {
  const search = params.search?.trim();
  const cursor = params.cursor;
  if (search && search.length > 100) throw new RangeError("Report search must be 100 characters or fewer.");
  if (params.status !== undefined && (typeof params.status !== "string" || !params.status.trim())) {
    throw new Error("Choose a valid report status.");
  }
  if (params.limit !== undefined && (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 50)) {
    throw new RangeError("Report page size must be an integer between 1 and 50.");
  }
  if (typeof cursor === "string" && cursor.length > 512) throw new RangeError("Report cursor must be 512 characters or fewer.");

  const fromDate = params.fromDate ? assertDateOnly(params.fromDate, "Start date") : undefined;
  const toDate = params.toDate ? assertDateOnly(params.toDate, "End date") : undefined;
  if (fromDate && toDate && fromDate > toDate) throw new Error("Start date must be on or before end date.");

  const query: Record<string, string | number> = {};
  if (params.programmeId) query.programmeId = assertUuid(params.programmeId, "Programme ID");
  if (params.status) query.status = params.status.trim();
  if (search) query.search = search;
  if (fromDate) query.fromDate = fromDate;
  if (toDate) query.toDate = toDate;
  if (params.limit !== undefined) query.limit = params.limit;
  if (typeof cursor === "string" && cursor.length > 0) query.cursor = cursor;
  return query;
}

/** Student daily report endpoints. All methods return the `data` payload. */
export const studentReportsApi = {
  /** GET /reports/student — cursor-paginated reports for the authenticated student. */
  list: async (params: GetStudentReportsParams = {}, signal?: AbortSignal): Promise<StudentReportsPage> => {
    const response = await http.get<StudentReportsApiResponse>("/reports/student", {
      params: normalizeListParams(params),
      signal,
    });
    return unwrap(response, isStudentReportsPage, "Unable to retrieve your reports.");
  },

  /** GET /reports/student/dashboard — dashboard for one enrolled programme. */
  dashboard: async (params: GetStudentReportDashboardParams, signal?: AbortSignal): Promise<StudentReportDashboardData> => {
    const programmeId = assertUuid(params.programmeId, "Programme ID");
    const response = await http.get<StudentReportDashboardApiResponse>("/reports/student/dashboard", {
      params: { programmeId },
      signal,
    });
    return unwrap(response, isStudentReportDashboard, "Unable to retrieve your reporting dashboard.");
  },

  /** POST /reports/student/drafts — create/save the current day's report draft. */
  saveDraft: async (payload: SaveStudentReportDraftDto): Promise<StudentReport> => {
    const programmeId = assertUuid(payload.programmeId, "Programme ID");
    const tutorId = payload.tutorId ? assertUuid(payload.tutorId, "Tutor ID") : undefined;
    const content = validateDraftContent({
      accomplishments: payload.accomplishments,
      noProblemsToday: payload.noProblemsToday,
      blockerDescription: payload.blockerDescription,
    });
    const response = await http.post<StudentReportApiResponse>("/reports/student/drafts", {
      programmeId,
      ...(tutorId ? { tutorId } : {}),
      ...content,
    });
    const report = unwrap(response, isStudentReport, "Unable to save your report draft.");
    if (report.status !== "DRAFT" || report.programmeId !== programmeId) {
      throw new Error("The draft save response did not match the requested programme.");
    }
    return report;
  },

  /** PATCH /reports/student/:reportId/draft — update a saved draft only. */
  updateDraft: async (reportId: string, payload: UpdateStudentReportDraftDto): Promise<StudentReport> => {
    const normalizedReportId = assertUuid(reportId, "Report ID");
    const content = validateDraftContent(payload);
    if (Object.keys(content).length === 0) throw new Error("Change at least one draft field before saving.");
    const response = await http.patch<StudentReportApiResponse>(
      `/reports/student/${encodeURIComponent(normalizedReportId)}/draft`,
      content,
    );
    const report = unwrap(response, isStudentReport, "Unable to update your report draft.");
    if (report.id !== normalizedReportId || report.status !== "DRAFT") {
      throw new Error("The draft update response did not match the requested report.");
    }
    return report;
  },

  /** POST /reports/student/:reportId/submit — submit a previously saved draft. */
  submitDraft: async (reportId: string): Promise<StudentReport> => {
    const normalizedReportId = assertUuid(reportId, "Report ID");
    const response = await http.post<StudentReportApiResponse>(
      `/reports/student/${encodeURIComponent(normalizedReportId)}/submit`,
    );
    const report = unwrap(response, isStudentReport, "Unable to submit your report.");
    if (report.id !== normalizedReportId || report.status !== "SUBMITTED" || !report.submittedAt) {
      throw new Error("The report submission response did not confirm submission.");
    }
    return report;
  },

  /** POST /reports/admin/:reportId/feedback — add one message to a report. */
  sendFeedback: async (
    reportId: string,
    payload: CreateStudentReportFeedbackDto,
  ): Promise<StudentReportFeedbackMessage> => {
    const normalizedReportId = assertUuid(reportId, "Report ID");
    if (typeof payload.message !== "string") throw new Error("Feedback must be text.");
    const message = payload.message.trim();
    if (!message) throw new Error("Write a feedback message before sending.");
    if (message.length > 5000) throw new RangeError("Feedback must be 5,000 characters or fewer.");

    const response = await http.post<StudentReportFeedbackApiResponse>(
      `/reports/admin/${encodeURIComponent(normalizedReportId)}/feedback`,
      { message },
    );
    const feedback = unwrap(response, isFeedbackMessage, "Unable to send report feedback.");
    if (feedback.reportId !== normalizedReportId) throw new Error("Feedback was returned for a different report.");
    return feedback;
  },
};
