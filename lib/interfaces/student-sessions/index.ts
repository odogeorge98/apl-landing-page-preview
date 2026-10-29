export type StudentSessionStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface StudentSessionProgrammeSummary {
  id: string;
  name: string;
}

export interface StudentSessionLessonSummary {
  id: string;
  title: string;
  sequence: number;
}

export interface StudentSessionTutorSummary {
  id: string;
  name: string;
}

/** A tutor-created session visible to a student enrolled in its programme. */
export interface StudentSession {
  id: string;
  tutorId: string;
  programmeId: string;
  lessonId: string | null;
  title: string;
  startsAt: string;
  endsAt: string;
  status: StudentSessionStatus;
  location: string | null;
  meetingUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  programme: StudentSessionProgrammeSummary;
  lesson: StudentSessionLessonSummary | null;
  tutor: StudentSessionTutorSummary;
}

export interface GetStudentSessionsParams {
  limit?: number;
  /** Opaque cursor returned by the previous page. */
  cursor?: string | null;
}

export interface StudentSessionsData {
  items: StudentSession[];
  nextCursor: string | null;
}

export interface StudentSessionsApiResponse {
  status: "success" | "error" | string;
  statusCode: number;
  message: string;
  data: StudentSessionsData;
}
