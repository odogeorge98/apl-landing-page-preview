import { http } from "@/lib/utils/http";
import type {
  GetStudentSessionsParams,
  StudentSession,
  StudentSessionsApiResponse,
  StudentSessionsData,
  StudentSessionStatus,
} from "@/lib/interfaces/student-sessions";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SESSION_STATUSES: readonly StudentSessionStatus[] = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
];

function isDateTime(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isNullableText(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isStudentSession(value: unknown): value is StudentSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Record<string, unknown>;
  const programme = session.programme;
  const lesson = session.lesson;
  const tutor = session.tutor;
  const validProgramme = Boolean(
    programme &&
      typeof programme === "object" &&
      UUID_V4_PATTERN.test(String((programme as Record<string, unknown>).id ?? "")) &&
      typeof (programme as Record<string, unknown>).name === "string",
  );
  const validLesson = lesson === null || Boolean(
    lesson &&
      typeof lesson === "object" &&
      UUID_V4_PATTERN.test(String((lesson as Record<string, unknown>).id ?? "")) &&
      typeof (lesson as Record<string, unknown>).title === "string" &&
      typeof (lesson as Record<string, unknown>).sequence === "number" &&
      Number.isInteger((lesson as Record<string, unknown>).sequence),
  );
  const validTutor = Boolean(
    tutor &&
      typeof tutor === "object" &&
      UUID_V4_PATTERN.test(String((tutor as Record<string, unknown>).id ?? "")) &&
      typeof (tutor as Record<string, unknown>).name === "string",
  );

  return (
    UUID_V4_PATTERN.test(String(session.id ?? "")) &&
    UUID_V4_PATTERN.test(String(session.tutorId ?? "")) &&
    UUID_V4_PATTERN.test(String(session.programmeId ?? "")) &&
    (session.lessonId === null ||
      (typeof session.lessonId === "string" && UUID_V4_PATTERN.test(session.lessonId))) &&
    typeof session.title === "string" &&
    isDateTime(session.startsAt) &&
    isDateTime(session.endsAt) &&
    Date.parse(session.endsAt) > Date.parse(session.startsAt) &&
    SESSION_STATUSES.includes(session.status as StudentSessionStatus) &&
    isNullableText(session.location) &&
    isNullableText(session.meetingUrl) &&
    isNullableText(session.notes) &&
    isDateTime(session.createdAt) &&
    isDateTime(session.updatedAt) &&
    validProgramme && validLesson && validTutor
  );
}

function isStudentSessionsData(value: unknown): value is StudentSessionsData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    Array.isArray(data.items) &&
    (data.nextCursor === null || typeof data.nextCursor === "string") &&
    data.items.every(isStudentSession)
  );
}

/** Read-only session access for the authenticated student's calendar. */
export const studentSessionsApi = {
  /** GET /tutor-sessions/student — cursor-paginated sessions for enrolled students. */
  list: async (params: GetStudentSessionsParams = {}): Promise<StudentSessionsData> => {
    if (
      params.limit !== undefined &&
      (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 50)
    ) {
      throw new RangeError("Session page size must be an integer between 1 and 50.");
    }
    const cursor = params.cursor;
    if (typeof cursor === "string" && cursor.length > 512) {
      throw new RangeError("Session pagination cursor must be 512 characters or fewer.");
    }

    const queryParams: Record<string, string | number> = {};
    if (params.limit !== undefined) queryParams.limit = params.limit;
    // Cursor values are opaque and must not be trimmed or otherwise rewritten.
    if (typeof cursor === "string" && cursor.length > 0) queryParams.cursor = cursor;

    const response = await http.get<StudentSessionsApiResponse>("/tutor-sessions/student", {
      params: queryParams,
    });
    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to retrieve your schedule.");
    }
    if (!isStudentSessionsData(result.data)) {
      throw new Error("The student sessions response was incomplete or invalid.");
    }
    return result.data;
  },
};
