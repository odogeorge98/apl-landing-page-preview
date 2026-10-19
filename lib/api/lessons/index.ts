import { http } from "@/lib/utils/http";
import type {
  CreateLessonApiResponse,
  CreateLessonDto,
  CreatedLesson,
} from "@/lib/interfaces/lessons";

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
