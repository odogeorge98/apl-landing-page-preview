import { http } from "@/lib/utils/http";
import type {
  CreateTutorSessionDto,
  GetTutorSessionsParams,
  TutorSession,
  TutorSessionApiResponse,
  TutorSessionsApiResponse,
  TutorSessionsData,
  TutorSessionStatus,
} from "@/lib/interfaces/tutor-sessions";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SESSION_STATUSES: readonly TutorSessionStatus[] = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
];
const ISO_DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/i;

function isSessionStatus(value: unknown): value is TutorSessionStatus {
  return SESSION_STATUSES.includes(value as TutorSessionStatus);
}

function isOptionalText(value: unknown, maxLength: number): boolean {
  return value === undefined || value === null ||
    (typeof value === "string" && value.length <= maxLength);
}

function isValidSession(value: unknown, requireRelations: boolean): value is TutorSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Record<string, unknown>;
  const programme = session.programme;
  const lesson = session.lesson;
  const hasValidProgramme = requireRelations
    ? Boolean(programme && typeof programme === "object" &&
        typeof (programme as Record<string, unknown>).id === "string" &&
        typeof (programme as Record<string, unknown>).name === "string")
    : programme === undefined || Boolean(programme && typeof programme === "object" &&
        typeof (programme as Record<string, unknown>).id === "string" &&
        ((programme as Record<string, unknown>).name === undefined ||
          typeof (programme as Record<string, unknown>).name === "string"));
  const hasValidLesson = lesson === undefined || lesson === null || Boolean(
    typeof lesson === "object" &&
    typeof (lesson as Record<string, unknown>).id === "string" &&
    typeof (lesson as Record<string, unknown>).title === "string" &&
    typeof (lesson as Record<string, unknown>).sequence === "number" &&
    Number.isInteger((lesson as Record<string, unknown>).sequence),
  );

  return (
    typeof session.id === "string" && UUID_V4_PATTERN.test(session.id) &&
    typeof session.tutorId === "string" && UUID_V4_PATTERN.test(session.tutorId) &&
    typeof session.programmeId === "string" && UUID_V4_PATTERN.test(session.programmeId) &&
    (session.lessonId === null || (typeof session.lessonId === "string" && UUID_V4_PATTERN.test(session.lessonId))) &&
    typeof session.title === "string" &&
    typeof session.startsAt === "string" && Number.isFinite(Date.parse(session.startsAt)) &&
    typeof session.endsAt === "string" && Number.isFinite(Date.parse(session.endsAt)) &&
    Date.parse(session.endsAt) > Date.parse(session.startsAt) &&
    isSessionStatus(session.status) &&
    isOptionalText(session.location, 2000) &&
    isOptionalText(session.meetingUrl, 2048) &&
    isOptionalText(session.notes, 20000) &&
    typeof session.createdAt === "string" && Number.isFinite(Date.parse(session.createdAt)) &&
    typeof session.updatedAt === "string" && Number.isFinite(Date.parse(session.updatedAt)) &&
    (session.deletedAt === undefined || session.deletedAt === null ||
      (typeof session.deletedAt === "string" && Number.isFinite(Date.parse(session.deletedAt)))) &&
    hasValidProgramme && hasValidLesson
  );
}

function isTutorSessionsData(value: unknown): value is TutorSessionsData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return Array.isArray(data.items) &&
    (data.nextCursor === null || typeof data.nextCursor === "string") &&
    typeof data.upcomingSessions === "number" &&
    Number.isInteger(data.upcomingSessions) &&
    data.upcomingSessions >= 0 &&
    data.items.every((item) => isValidSession(item, true));
}

function normalizeCreatePayload(payload: CreateTutorSessionDto): CreateTutorSessionDto {
  const programmeId = payload.programmeId.trim();
  if (!UUID_V4_PATTERN.test(programmeId)) throw new Error("Choose a valid assigned programme.");

  const lessonId = payload.lessonId?.trim() || null;
  if (lessonId && !UUID_V4_PATTERN.test(lessonId)) throw new Error("Choose a valid lesson.");

  const title = payload.title.trim();
  if (!title) throw new Error("Enter a session title.");
  if (title.length > 255) throw new RangeError("Session title must be 255 characters or fewer.");

  const startsAt = payload.startsAt.trim();
  const endsAt = payload.endsAt.trim();
  if (!ISO_DATETIME_PATTERN.test(startsAt) || !Number.isFinite(Date.parse(startsAt))) {
    throw new Error("Enter the session start as an ISO 8601 date and time with a timezone.");
  }
  if (!ISO_DATETIME_PATTERN.test(endsAt) || !Number.isFinite(Date.parse(endsAt))) {
    throw new Error("Enter the session end as an ISO 8601 date and time with a timezone.");
  }
  if (Date.parse(endsAt) <= Date.parse(startsAt)) throw new Error("Session end must be later than session start.");

  const location = payload.location?.trim() || null;
  const meetingUrl = payload.meetingUrl?.trim() || null;
  const notes = payload.notes?.trim() || null;
  if (location && location.length > 2000) throw new RangeError("Location must be 2,000 characters or fewer.");
  if (meetingUrl) {
    if (meetingUrl.length > 2048) throw new RangeError("Meeting URL must be 2,048 characters or fewer.");
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(meetingUrl);
    } catch {
      throw new Error("Enter a valid meeting URL beginning with http:// or https://.");
    }
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error("Meeting URL must use http:// or https://.");
    }
  }
  if (notes && notes.length > 20000) throw new RangeError("Session notes must be 20,000 characters or fewer.");

  return {
    programmeId,
    ...(lessonId ? { lessonId } : {}),
    title,
    startsAt: new Date(startsAt).toISOString(),
    endsAt: new Date(endsAt).toISOString(),
    ...(location ? { location } : {}),
    ...(meetingUrl ? { meetingUrl } : {}),
    ...(notes ? { notes } : {}),
  };
}

/** Authenticated tutor session endpoints. */
export const tutorSessionsApi = {
  /** GET /tutor-sessions — cursor-paginated sessions for the authenticated tutor. */
  list: async (params: GetTutorSessionsParams = {}): Promise<TutorSessionsData> => {
    const search = params.search?.trim();
    const cursor = params.cursor;

    if (search && search.length > 100) throw new RangeError("Session search must be 100 characters or fewer.");
    if (params.status && !isSessionStatus(params.status)) throw new Error("Choose a valid session status.");
    if (params.limit !== undefined && (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 50)) {
      throw new RangeError("Session page size must be an integer between 1 and 50.");
    }
    if (typeof cursor === "string" && cursor.length > 512) {
      throw new RangeError("Session pagination cursor must be 512 characters or fewer.");
    }

    const queryParams: Record<string, string | number> = {};
    if (search) queryParams.search = search;
    if (params.status) queryParams.status = params.status;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (typeof cursor === "string" && cursor.length > 0) queryParams.cursor = cursor;

    const response = await http.get<TutorSessionsApiResponse>("/tutor-sessions", {
      params: queryParams,
    });
    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to retrieve tutor sessions.");
    }
    if (!isTutorSessionsData(result.data)) {
      throw new Error("The tutor sessions response was incomplete or invalid.");
    }
    return result.data;
  },

  /** POST /tutor-sessions — create a scheduled tutor session. */
  create: async (payload: CreateTutorSessionDto): Promise<TutorSession> => {
    const normalizedPayload = normalizeCreatePayload(payload);
    const response = await http.post<TutorSessionApiResponse>("/tutor-sessions", normalizedPayload);
    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to create this session.");
    }
    if (!isValidSession(result.data, false) || result.data.status !== "SCHEDULED") {
      throw new Error("The session creation response was incomplete or invalid.");
    }
    return result.data;
  },
};
