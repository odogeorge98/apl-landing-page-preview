export type TutorSessionStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface TutorSessionProgrammeSummary {
  id: string;
  name: string;
}

export interface TutorSessionLessonSummary {
  id: string;
  title: string;
  sequence: number;
}

/** Session record returned by GET/POST /tutor-sessions. */
export interface TutorSession {
  id: string;
  tutorId: string;
  programmeId: string;
  lessonId: string | null;
  title: string;
  startsAt: string;
  endsAt: string;
  status: TutorSessionStatus;
  location: string | null;
  meetingUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  programme?: TutorSessionProgrammeSummary;
  lesson?: TutorSessionLessonSummary | null;
}

export interface CreateTutorSessionDto {
  programmeId: string;
  /** Optional lesson in programme; omit or pass null for a programme-wide session. */
  lessonId?: string | null;
  title: string;
  /** ISO 8601 timestamp with timezone. */
  startsAt: string;
  /** ISO 8601 timestamp with timezone; must be later than startsAt. */
  endsAt: string;
  location?: string | null;
  meetingUrl?: string | null;
  notes?: string | null;
}

export interface GetTutorSessionsParams {
  search?: string;
  status?: TutorSessionStatus;
  limit?: number;
  /** Opaque cursor returned by the previous page. */
  cursor?: string | null;
}

export interface TutorSessionsData {
  items: TutorSession[];
  nextCursor: string | null;
  /** Server-calculated count of upcoming sessions across the tutor's schedule. */
  upcomingSessions: number;
}

export interface TutorSessionsApiResponse {
  status: "success" | "error" | string;
  statusCode: number;
  message: string;
  data: TutorSessionsData;
}

export interface TutorSessionApiResponse {
  status: "success" | "error" | string;
  statusCode: number;
  message: string;
  data: TutorSession;
}
