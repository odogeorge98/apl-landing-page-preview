
import { http, HttpError } from "@/lib/utils/http";
import type {
  AdminDashboardApiResponse,
  AdminDashboardData,
  StudentDashboardApiResponse,
  StudentDashboardData,
  StudentLearningProgressApiResponse,
  StudentLearningProgressData,
  TutorDashboardApiResponse,
  TutorDashboardData,
} from "@/lib/interfaces/dashboard";

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
