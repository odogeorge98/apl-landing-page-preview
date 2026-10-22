export interface CreateLessonDto {
  programmeId: string;
  title: string;
  description: string;
  sequence: number;
  durationMinutes: number;
}

export interface CreatedLesson {
  id: string;
  programmeId: string;
  title: string;
  description: string;
  sequence: number;
  durationMinutes: number;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface CreateLessonApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: CreatedLesson;
}

export type LessonStatus = "DRAFT" | "PUBLISHED";

/** Programme data embedded in tutor lesson responses. */
export interface TutorLessonProgramme {
  id: string;
  /** The publish response may include only the programme ID. */
  name?: string;
  description?: string;
  hours?: number;
}

/** Lesson returned by GET /lessons/tutor and PATCH /lessons/:id/publish. */
export interface TutorLesson {
  id: string;
  programmeId: string;
  title: string;
  description: string;
  sequence: number;
  durationMinutes: number;
  status: LessonStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  programme: TutorLessonProgramme;
}

export interface TutorLessonsData {
  items: TutorLesson[];
  nextCursor: string | null;
}

/** Published lesson returned for a student's enrolled programme. */
export interface StudentProgrammeLesson {
  id: string;
  programmeId: string;
  title: string;
  description: string;
  sequence: number;
  durationMinutes: number;
  status: "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgrammeLessonsData {
  items: StudentProgrammeLesson[];
  nextCursor: string | null;
}

export interface StudentProgrammeLessonsApiResponse {
  status: "success" | "error" | string;
  statusCode: number;
  message: string;
  data: StudentProgrammeLessonsData;
}

export interface GetStudentProgrammeLessonsParams {
  /** Number of lessons to request; the backend cursor response drives infinite loading. */
  limit?: number;
  /** Opaque cursor returned by the previous page. */
  cursor?: string | null;
}

export interface TutorLessonsApiResponse {
  status: "success" | string;
  statusCode: number;
  message: string;
  data: TutorLessonsData;
}

export interface TutorLessonApiResponse {
  status: "success" | string;
  statusCode: number;
  message: string;
  data: TutorLesson;
}

export interface GetTutorLessonsParams {
  search?: string;
  status?: LessonStatus;
  programmeId?: string;
  limit?: number;
  cursor?: string | null;
}
