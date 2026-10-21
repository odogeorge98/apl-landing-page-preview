import { http } from "@/lib/utils/http";
import type {
  CreateLessonApiResponse,
  CreateLessonDto,
  CreatedLesson,
  GetTutorLessonsParams,
  TutorLesson,
  TutorLessonApiResponse,
  TutorLessonsApiResponse,
  TutorLessonsData,
} from "@/lib/interfaces/lessons";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isTutorLesson(value: unknown): value is TutorLesson {
  if (!value || typeof value !== "object") return false;

  const lesson = value as Record<string, unknown>;
  const programme = lesson.programme;
  if (!programme || typeof programme !== "object") return false;

  const programmeRecord = programme as Record<string, unknown>;
  return (
    typeof lesson.id === "string" &&
    typeof lesson.programmeId === "string" &&
    typeof lesson.title === "string" &&
    typeof lesson.description === "string" &&
    typeof lesson.sequence === "number" &&
    Number.isInteger(lesson.sequence) &&
    typeof lesson.durationMinutes === "number" &&
    Number.isInteger(lesson.durationMinutes) &&
    (lesson.status === "DRAFT" || lesson.status === "PUBLISHED") &&
    (lesson.publishedAt === null || typeof lesson.publishedAt === "string") &&
    typeof lesson.createdAt === "string" &&
    typeof lesson.updatedAt === "string" &&
    typeof programmeRecord.id === "string" &&
    (programmeRecord.name === undefined || typeof programmeRecord.name === "string") &&
    (programmeRecord.description === undefined || typeof programmeRecord.description === "string") &&
    (programmeRecord.hours === undefined ||
      (typeof programmeRecord.hours === "number" && Number.isFinite(programmeRecord.hours)))
  );
}

function isTutorLessonsData(value: unknown): value is TutorLessonsData {
  if (!value || typeof value !== "object") return false;

  const data = value as Record<string, unknown>;
  return (
    Array.isArray(data.items) &&
    (data.nextCursor === null || typeof data.nextCursor === "string") &&
    data.items.every(isTutorLesson)
  );
}

function isCreatedLesson(value: unknown): value is CreatedLesson {
  if (!value || typeof value !== "object") return false;

  const lesson = value as Record<string, unknown>;
  return (
    typeof lesson.id === "string" &&
    typeof lesson.programmeId === "string" &&
    typeof lesson.title === "string" &&
    typeof lesson.description === "string" &&
    typeof lesson.sequence === "number" &&
    Number.isInteger(lesson.sequence) &&
    typeof lesson.durationMinutes === "number" &&
    Number.isInteger(lesson.durationMinutes) &&
    typeof lesson.status === "string" &&
    (lesson.publishedAt === null || typeof lesson.publishedAt === "string") &&
    typeof lesson.updatedAt === "string" &&
    typeof lesson.createdAt === "string" &&
    (lesson.deletedAt === null || typeof lesson.deletedAt === "string")
  );
}

/** POST /lessons — creates a lesson in a tutor-assigned programme. */
export const lessonsApi = {
  /** GET /lessons/tutor — cursor-paginated lessons assigned to this tutor. */
  listForTutor: async (
    params: GetTutorLessonsParams = {},
  ): Promise<TutorLessonsData> => {
    const search = params.search?.trim();
    const cursor = params.cursor?.trim();
    const programmeId = params.programmeId?.trim();

    if (search && search.length > 100) {
      throw new RangeError("Lesson search must be 100 characters or fewer.");
    }
    if (
      params.limit !== undefined &&
      (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 50)
    ) {
      throw new RangeError("Lesson page size must be an integer between 1 and 50.");
    }
    if (cursor && cursor.length > 512) {
      throw new RangeError("Lesson pagination cursor must be 512 characters or fewer.");
    }
    if (programmeId && !UUID_V4_PATTERN.test(programmeId)) {
      throw new Error("Choose a valid programme to filter lessons.");
    }
    if (params.status && params.status !== "DRAFT" && params.status !== "PUBLISHED") {
      throw new Error("Choose a valid lesson status.");
    }

    // Numeric limits remain numbers in Axios config; Axios serializes them
    // into the URL and the backend DTO transforms the query value to a number.
    const queryParams: Record<string, string | number> = {};
    if (search) queryParams.search = search;
    if (params.status) queryParams.status = params.status;
    if (programmeId) queryParams.programmeId = programmeId;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (cursor) queryParams.cursor = cursor;

    const response = await http.get<TutorLessonsApiResponse>("/lessons/tutor", {
      params: queryParams,
    });
    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to retrieve your lessons.");
    }
    if (!isTutorLessonsData(result.data)) {
      throw new Error("The tutor lessons response was incomplete or invalid.");
    }

    return result.data;
  },

  /** PATCH /lessons/:id/publish — publish a draft lesson. */
  publish: async (id: string): Promise<TutorLesson> => {
    const lessonId = id.trim();
    if (!UUID_V4_PATTERN.test(lessonId)) {
      throw new Error("A valid lesson ID is required to publish this lesson.");
    }

    const response = await http.patch<TutorLessonApiResponse>(
      `/lessons/${encodeURIComponent(lessonId)}/publish`,
    );
    const result = response.data;

    if (result.status !== "success") {
      throw new Error(result.message || "Unable to publish this lesson.");
    }
    if (!isTutorLesson(result.data) || result.data.status !== "PUBLISHED") {
      throw new Error("The lesson publishing response was incomplete or invalid.");
    }

    return result.data;
  },

  create: async (payload: CreateLessonDto): Promise<CreatedLesson> => {
    const normalizedPayload: CreateLessonDto = {
      programmeId: payload.programmeId.trim(),
      title: payload.title.trim(),
      description: payload.description.trim(),
      sequence: payload.sequence,
      durationMinutes: payload.durationMinutes,
    };

    if (!normalizedPayload.programmeId) {
      throw new Error("The course programme is missing. Refresh your courses and try again.");
    }
    if (!normalizedPayload.title) {
      throw new Error("Enter a lesson title.");
    }
    if (!normalizedPayload.description) {
      throw new Error("Enter a lesson description.");
    }
    if (!Number.isInteger(normalizedPayload.sequence) || normalizedPayload.sequence < 1) {
      throw new Error("Lesson sequence must be a whole number greater than zero.");
    }
    if (!Number.isInteger(normalizedPayload.durationMinutes) || normalizedPayload.durationMinutes < 1) {
      throw new Error("Lesson duration must be a whole number greater than zero.");
    }

    const response = await http.post<CreateLessonApiResponse>(
      "/lessons",
      normalizedPayload,
    );

    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to create this lesson.");
    }
    if (!isCreatedLesson(result.data)) {
      throw new Error("The lesson creation response was incomplete or invalid.");
    }

    return result.data;
  },
};
