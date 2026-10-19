import { http } from "@/lib/utils/http";
import type {
  GetProgrammesParams,
  Programme,
  ProgrammeDetailsApiResponse,
  ProgrammeDetailsData,
  ProgrammeMetrics,
  ProgrammesApiResponse,
  ProgrammesData,
} from "@/lib/interfaces/programmes";

function isProgramme(value: unknown): value is Programme {
  if (!value || typeof value !== "object") return false;

  const programme = value as Record<string, unknown>;
  return (
    typeof programme.id === "string" &&
    typeof programme.name === "string" &&
    typeof programme.description === "string" &&
    typeof programme.hours === "number" &&
    Number.isFinite(programme.hours) &&
    typeof programme.createdAt === "string" &&
    typeof programme.updatedAt === "string"
  );
}

function isProgrammeMetrics(value: unknown): value is ProgrammeMetrics {
  if (!value || typeof value !== "object") return false;

  const metrics = value as Record<string, unknown>;
  const metricKeys: (keyof ProgrammeMetrics)[] = [
    "totalStudents",
    "activeStudents",
    "activeTutors",
    "totalLessons",
    "publishedLessons",
    "lessonCompletions",
    "totalAssignments",
    "publishedAssignments",
    "totalSubmissions",
    "pendingReviews",
    "upcomingSessions",
  ];

  return metricKeys.every(
    (key) =>
      typeof metrics[key] === "number" &&
      Number.isFinite(metrics[key]) &&
      (metrics[key] as number) >= 0,
  );
}

function isProgrammeDetailsData(value: unknown): value is ProgrammeDetailsData {
  if (!value || typeof value !== "object") return false;

  const data = value as Record<string, unknown>;
  return isProgramme(data.programme) && isProgrammeMetrics(data.metrics);
}

/** GET /programmes — lists the available programmes using cursor pagination. */
export const programmesApi = {
  /** GET /programmes/:id — retrieves programme information and admin metrics. */
  getById: async (id: string): Promise<ProgrammeDetailsData> => {
    const programmeId = id.trim();
    if (!programmeId) {
      throw new Error("A programme ID is required.");
    }

    const response = await http.get<ProgrammeDetailsApiResponse>(
      `/programmes/${encodeURIComponent(programmeId)}`,
    );

    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to retrieve this programme.");
    }

    if (!isProgrammeDetailsData(result.data)) {
      throw new Error("The programme details response was incomplete or invalid.");
    }

    return result.data;
  },

  list: async (params: GetProgrammesParams = {}): Promise<ProgrammesData> => {
    const search = params.search?.trim();
    const cursor = params.cursor?.trim();
    const queryParams: Record<string, string | number> = {};

    if (search) queryParams.search = search;
    if (typeof params.limit === "number" && Number.isInteger(params.limit)) {
      queryParams.limit = Math.min(50, Math.max(1, params.limit));
    }
    if (cursor) queryParams.cursor = cursor;

    const response = await http.get<ProgrammesApiResponse>("/programmes", {
      params: queryParams,
    });

    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to retrieve programmes.");
    }

    const data = result.data;
    if (
      !data ||
      !Array.isArray(data.items) ||
      !(data.nextCursor === null || typeof data.nextCursor === "string") ||
      !data.items.every(isProgramme)
    ) {
      throw new Error("The programmes response was incomplete or invalid.");
    }

    return data;
  },
};
