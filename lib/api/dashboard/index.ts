
import { http, HttpError } from "@/lib/utils/http";
import type {
  AdminDashboardApiResponse,
  AdminDashboardData,
  GetStudentEnrollmentAnalyticsParams,
  StudentEnrollmentAnalyticsApiResponse,
  StudentEnrollmentAnalyticsData,
  StudentDashboardApiResponse,
  StudentDashboardData,
  StudentLearningProgressApiResponse,
  StudentLearningProgressData,
  TutorDashboardApiResponse,
  TutorDashboardData,
} from "@/lib/interfaces/dashboard";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_ONLY_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isStudentEnrollmentAnalyticsData(
  value: unknown,
): value is StudentEnrollmentAnalyticsData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  const period = data.period;
  const summary = data.summary;
  if (!period || typeof period !== "object" || !summary || typeof summary !== "object") {
    return false;
  }

  const periodValue = period as Record<string, unknown>;
  const summaryValue = summary as Record<string, unknown>;
  if (
    !isValidDateOnly(periodValue.fromDate) ||
    !isValidDateOnly(periodValue.toDate) ||
    periodValue.fromDate > periodValue.toDate ||
    (periodValue.year !== undefined && !isNonNegativeInteger(periodValue.year)) ||
    !isNonNegativeInteger(summaryValue.totalStudents) ||
    !Array.isArray(data.series)
  ) {
    return false;
  }

  const seenMonths = new Set<string>();
  return data.series.every((item) => {
    if (!item || typeof item !== "object") return false;
    const point = item as Record<string, unknown>;
    if (
      typeof point.month !== "string" ||
      !MONTH_PATTERN.test(point.month) ||
      !isNonNegativeInteger(point.newStudents) ||
      !isNonNegativeInteger(point.cumulativeStudents) ||
      seenMonths.has(point.month)
    ) {
      return false;
    }
    seenMonths.add(point.month);
    return true;
  });
}

/**
 * GET /students/analytics/enrollments
 * Returns student registration totals and monthly enrollment series.
 */
export async function fetchStudentEnrollmentAnalytics(
  params: GetStudentEnrollmentAnalyticsParams = {},
): Promise<StudentEnrollmentAnalyticsData> {
  const hasFromDate = params.fromDate !== undefined && params.fromDate !== "";
  const hasToDate = params.toDate !== undefined && params.toDate !== "";
  const hasDateRange = hasFromDate || hasToDate;

  if (params.year !== undefined && hasDateRange) {
    throw new Error("Choose a calendar year or a date range, not both.");
  }
  if (
    params.year !== undefined &&
    (!Number.isInteger(params.year) || params.year < 2000 || params.year > 2100)
  ) {
    throw new RangeError("Analytics year must be an integer between 2000 and 2100.");
  }
  if (hasFromDate !== hasToDate) {
    throw new Error("Select both a start date and an end date for the analytics range.");
  }
  if (hasFromDate && (!isValidDateOnly(params.fromDate) || !isValidDateOnly(params.toDate))) {
    throw new Error("Enter valid dates in YYYY-MM-DD format.");
  }
  if (hasFromDate && params.fromDate! > params.toDate!) {
    throw new Error("The start date must be on or before the end date.");
  }

  const queryParams: Record<string, string | number> = {};
  if (params.year !== undefined) queryParams.year = params.year;
  if (hasFromDate) {
    queryParams.fromDate = params.fromDate!;
    queryParams.toDate = params.toDate!;
  }

  try {
    const response = await http.get<StudentEnrollmentAnalyticsApiResponse>(
      "/students/analytics/enrollments",
      { params: queryParams },
    );
    const result = response.data;

    if (result.status !== "success") {
      throw new Error(result.message || "Unable to retrieve student enrollment analytics.");
    }
    if (!isStudentEnrollmentAnalyticsData(result.data)) {
      throw new Error("The student enrollment analytics response was incomplete or invalid.");
    }
    return result.data;
  } catch (error: unknown) {
    if (error instanceof HttpError || error instanceof Error) throw error;
    throw new Error("An unexpected error occurred while loading enrollment analytics.");
  }
}

/**
 * GET /admin/dashboard
 *
 * Retrieves dashboard metrics and recent education-platform activity
 * for the authenticated administrator.
 *
 * The existing HTTP client applies the /admin base path automatically.
 */
export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  try {
    const response =
      await http.get<AdminDashboardApiResponse>("/admin/dashboard");

    const result = response.data;

    if (result.status !== "success") {
      throw new Error(
        result.message || "Unable to retrieve dashboard data.",
      );
    }

    return result.data;
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "An unexpected error occurred while loading the dashboard.",
    );
  }
}

/**
 * GET /students/dashboard
 *
 * Retrieves the authenticated student's programme and assignment overview.
 * The shared HTTP client adds the configured API base URL and auth token.
 */
export async function fetchStudentDashboard(): Promise<StudentDashboardData> {
  try {
    const response =
      await http.get<StudentDashboardApiResponse>("/students/dashboard");

    const result = response.data;

    if (result.status !== "success") {
      throw new Error(
        result.message || "Unable to retrieve student dashboard data.",
      );
    }

    if (!result.data || !result.data.overview || !Array.isArray(result.data.programmes)) {
      throw new Error("The student dashboard response was incomplete.");
    }

    return result.data;
  } catch (error: unknown) {
    if (error instanceof HttpError || error instanceof Error) {
      throw error;
    }

    throw new Error(
      "An unexpected error occurred while loading the student dashboard.",
    );
  }
}

/**
 * GET /students/learning-progress
 *
 * Retrieves the authenticated student's overall and per-programme progress.
 * Progress values may be null until learning activity has been recorded.
 */
export async function fetchStudentLearningProgress(): Promise<StudentLearningProgressData> {
  try {
    const response = await http.get<StudentLearningProgressApiResponse>(
      "/students/learning-progress",
    );
    const result = response.data;

    if (result.status !== "success") {
      throw new Error(
        result.message || "Unable to retrieve student learning progress.",
      );
    }

    const data = result.data;
    if (!data || !Array.isArray(data.programmes)) {
      throw new Error("The student learning progress response was incomplete.");
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof HttpError || error instanceof Error) {
      throw error;
    }

    throw new Error(
      "An unexpected error occurred while loading student learning progress.",
    );
  }
}

/**
 * GET /tutors/dashboard
 *
 * Retrieves the authenticated tutor's teaching overview and dashboard lists.
 * The shared HTTP client supplies the configured API base URL and auth token.
 */
export async function fetchTutorDashboard(): Promise<TutorDashboardData> {
  try {
    const response =
      await http.get<TutorDashboardApiResponse>("/tutors/dashboard");

    const result = response.data;

    if (result.status !== "success") {
      throw new Error(
        result.message || "Unable to retrieve tutor dashboard data.",
      );
    }

    const data = result.data;
    if (
      !data?.overview ||
      !Array.isArray(data.courses) ||
      !Array.isArray(data.students) ||
      !Array.isArray(data.pendingSubmissions) ||
      !Array.isArray(data.upcomingSessions)
    ) {
      throw new Error("The tutor dashboard response was incomplete.");
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof HttpError || error instanceof Error) {
      throw error;
    }

    throw new Error(
      "An unexpected error occurred while loading the tutor dashboard.",
    );
  }
}
