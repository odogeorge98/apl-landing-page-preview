export type AssignmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface AssignmentProgrammeSummary {
  id: string;
  name?: string;
}

export interface AssignmentLessonSummary {
  id: string;
  title?: string;
  sequence?: number;
}

export interface AssignmentTutorSummary {
  id: string;
  name?: string;
}

export interface AdminAssignment extends TutorAssignment {
  programme?: (AssignmentProgrammeSummary & {
    description?: string;
    hours?: number;
  }) | null;
  tutor?: AssignmentTutorSummary | null;
  lesson?: (AssignmentLessonSummary & { sequence?: number }) | null;
}

export interface AdminAssignmentsData {
  items: AdminAssignment[];
  nextCursor: string | null;
}

export interface AdminAssignmentsApiResponse {
  status: "success" | "error" | string;
  statusCode: number;
  message: string;
  data: AdminAssignmentsData;
}

export interface GetAdminAssignmentsParams {
  search?: string;
  status?: AssignmentStatus;
  availableAtFrom?: string;
  availableAtTo?: string;
  dueAtFrom?: string;
  dueAtTo?: string;
  limit?: number;
  /** Opaque cursor returned by the previous page. */
  cursor?: string | null;
}

/** Assignment fields returned by tutor assignment and lifecycle endpoints. */
export interface TutorAssignment {
  id: string;
  tutorId: string;
  programmeId: string;
  lessonId: string | null;
  title: string;
  instructions: string;
  availableAt: string;
  dueAt: string;
  /** The API serializes decimal scores as strings (for example, "100.00"). */
  maxScore: string | number;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  programme?: AssignmentProgrammeSummary | null;
  lesson?: AssignmentLessonSummary | null;
}

/** Published assignment visible to the authenticated student. */
export interface StudentAssignment {
  id: string;
  tutorId: string;
  programmeId: string;
  lessonId: string | null;
  title: string;
  instructions: string;
  availableAt: string;
  dueAt: string;
  /** The API serializes decimal scores as strings (for example, "100.00"). */
  maxScore: string | number;
  status: "PUBLISHED";
  createdAt: string;
  programme: AssignmentProgrammeSummary;
  lesson: AssignmentLessonSummary | null;
  /** Optional student-specific state; absent from the current endpoint response. */
  submission?: StudentAssignmentSubmission | null;
}

export type StudentAssignmentSubmissionStatus =
  | "NOT_SUBMITTED"
  | "SUBMITTED"
  | "GRADED";

/** Optional enrichment for submission-aware student assignment UI. */
export interface StudentAssignmentSubmission {
  id?: string;
  status: StudentAssignmentSubmissionStatus;
  submittedAt?: string | null;
  score?: string | number | null;
  feedback?: string | null;
}

export interface StudentAssignmentsData {
  items: StudentAssignment[];
  nextCursor: string | null;
}

export interface StudentAssignmentsApiResponse {
  status: "success" | "error" | string;
  statusCode: number;
  message: string;
  data: StudentAssignmentsData;
}

export interface GetStudentAssignmentsParams {
  search?: string;
  programmeId?: string;
  lessonId?: string;
  limit?: number;
  /** Opaque cursor returned by the previous response. */
  cursor?: string | null;
}

export interface TutorAssignmentsData {
  items: TutorAssignment[];
  nextCursor: string | null;
}

export interface TutorAssignmentsApiResponse {
  status: "success" | "error" | string;
  statusCode: number;
  message: string;
  data: TutorAssignmentsData;
}

export interface TutorAssignmentApiResponse {
  status: "success" | "error" | string;
  statusCode: number;
  message: string;
  data: TutorAssignment;
}

export interface CreateTutorAssignmentDto {
  programmeId: string;
  /** Optional; omit or pass null to create a programme-level assignment. */
  lessonId?: string | null;
  title: string;
  instructions: string;
  /** ISO-8601 datetime string. */
  availableAt: string;
  /** ISO-8601 datetime string, later than availableAt. */
  dueAt: string;
  maxScore: number;
}

export interface GetTutorAssignmentsParams {
  search?: string;
  status?: AssignmentStatus;
  programmeId?: string;
  lessonId?: string;
  limit?: number;
  /** Opaque cursor returned by the previous response. */
  cursor?: string | null;
}
