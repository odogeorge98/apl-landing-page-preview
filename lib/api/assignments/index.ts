import { http } from "@/lib/utils/http";
import type {
  AdminAssignment,
  AdminAssignmentsApiResponse,
  AdminAssignmentsData,
  AssignmentLessonSummary,
  AssignmentProgrammeSummary,
  AssignmentStatus,
  CreateTutorAssignmentDto,
  GetAdminAssignmentsParams,
  GetTutorAssignmentsParams,
  GetStudentAssignmentsParams,
  ReviewAssignmentSubmissionApiResponse,
  ReviewAssignmentSubmissionDto,
  ReviewedAssignmentSubmissionRecord,
  StudentAssignment,
  StudentAssignmentSubmissionApiResponse,
  StudentAssignmentSubmissionRecord,
  StudentAssignmentSubmissionStatus,
  StudentAssignmentsApiResponse,
  StudentAssignmentsData,
  SubmitStudentAssignmentDto,
  TutorAssignment,
  TutorAssignmentApiResponse,
  TutorAssignmentsApiResponse,
  TutorAssignmentsData,
} from "@/lib/interfaces/assignments";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ASSIGNMENT_STATUSES: readonly AssignmentStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const STUDENT_SUBMISSION_STATUSES: readonly StudentAssignmentSubmissionStatus[] = [
  "NOT_SUBMITTED",
  "DRAFT",
  "RETURNED",
  "IN_REVIEW",
  "REVIEWED",
  "SUBMITTED",
  "GRADED",
];

function isAssignmentStatus(value: unknown): value is AssignmentStatus {
  return ASSIGNMENT_STATUSES.includes(value as AssignmentStatus);
}

function isValidProgramme(value: unknown): value is AssignmentProgrammeSummary {
  if (!value || typeof value !== "object") return false;
  const programme = value as Record<string, unknown>;
  return (
    typeof programme.id === "string" &&
    (programme.name === undefined || typeof programme.name === "string")
  );
}

function isValidLesson(value: unknown): value is AssignmentLessonSummary {
  if (!value || typeof value !== "object") return false;
  const lesson = value as Record<string, unknown>;
  return (
    typeof lesson.id === "string" &&
    (lesson.title === undefined || typeof lesson.title === "string")
  );
}

function isValidAssignment(value: unknown): value is TutorAssignment {
  if (!value || typeof value !== "object") return false;

  const assignment = value as unknown as Record<string, unknown>;
  const maxScore = assignment.maxScore;
  const numericMaxScore = typeof maxScore === "number" ? maxScore : Number(maxScore);
  const hasValidProgramme =
    assignment.programme === undefined ||
    assignment.programme === null ||
    isValidProgramme(assignment.programme);
  const hasValidLesson =
    assignment.lesson === undefined ||
    assignment.lesson === null ||
    isValidLesson(assignment.lesson);

  return (
    typeof assignment.id === "string" &&
    typeof assignment.tutorId === "string" &&
    typeof assignment.programmeId === "string" &&
    (assignment.lessonId === null || typeof assignment.lessonId === "string") &&
    typeof assignment.title === "string" &&
    typeof assignment.instructions === "string" &&
    typeof assignment.availableAt === "string" &&
    Number.isFinite(Date.parse(assignment.availableAt)) &&
    typeof assignment.dueAt === "string" &&
    Number.isFinite(Date.parse(assignment.dueAt)) &&
    (typeof maxScore === "string" || typeof maxScore === "number") &&
    Number.isFinite(numericMaxScore) &&
    isAssignmentStatus(assignment.status) &&
    typeof assignment.createdAt === "string" &&
    Number.isFinite(Date.parse(assignment.createdAt)) &&
    typeof assignment.updatedAt === "string" &&
    Number.isFinite(Date.parse(assignment.updatedAt)) &&
    (assignment.deletedAt === undefined ||
      assignment.deletedAt === null ||
      (typeof assignment.deletedAt === "string" && Number.isFinite(Date.parse(assignment.deletedAt)))) &&
    hasValidProgramme &&
    hasValidLesson
  );
}

function isTutorAssignmentsData(value: unknown): value is TutorAssignmentsData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    Array.isArray(data.items) &&
    (data.nextCursor === null || typeof data.nextCursor === "string") &&
    data.items.every(isValidAssignment)
  );
}

function isAdminAssignment(value: unknown): value is AdminAssignment {
  if (!isValidAssignment(value)) return false;

  const assignment = value as unknown as Record<string, unknown>;
  const tutor = assignment.tutor;
  const programme = assignment.programme as Record<string, unknown> | null | undefined;
  const lesson = assignment.lesson as Record<string, unknown> | null | undefined;
  return (
    (tutor === undefined || tutor === null || (
      typeof tutor === "object" &&
      typeof (tutor as Record<string, unknown>).id === "string" &&
      ((tutor as Record<string, unknown>).name === undefined ||
        typeof (tutor as Record<string, unknown>).name === "string")
    )) &&
    (programme === undefined || programme === null || (
      isValidProgramme(programme) &&
      (programme.description === undefined || typeof programme.description === "string") &&
      (programme.hours === undefined || (typeof programme.hours === "number" && Number.isFinite(programme.hours)))
    )) &&
    (lesson === undefined || lesson === null || (
      isValidLesson(lesson) &&
      (lesson.sequence === undefined || (typeof lesson.sequence === "number" && Number.isInteger(lesson.sequence)) )
    ))
  );
}

function isAdminAssignmentsData(value: unknown): value is AdminAssignmentsData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    Array.isArray(data.items) &&
    (data.nextCursor === null || typeof data.nextCursor === "string") &&
    data.items.every(isAdminAssignment)
  );
}

function normalizeAdminDate(value: string | undefined, fieldName: string): string | undefined {
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
    throw new Error(`Enter a valid ${fieldName} date.`);
  }
  return value;
}

function isValidStudentSubmission(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value !== "object") return false;

  const submission = value as Record<string, unknown>;
  const score = submission.score;
  return (
    STUDENT_SUBMISSION_STATUSES.includes(
      submission.status as StudentAssignmentSubmissionStatus,
    ) &&
    (submission.id === undefined || typeof submission.id === "string") &&
    (submission.submittedAt === undefined ||
      submission.submittedAt === null ||
      (typeof submission.submittedAt === "string" &&
        Number.isFinite(Date.parse(submission.submittedAt)))) &&
    (score === undefined ||
      score === null ||
      ((typeof score === "number" || typeof score === "string") &&
        Number.isFinite(Number(score)))) &&
    (submission.feedback === undefined ||
      submission.feedback === null ||
      typeof submission.feedback === "string")
  );
}

function isValidStudentAssignment(value: unknown): value is StudentAssignment {
  if (!value || typeof value !== "object") return false;

  const assignment = value as Record<string, unknown>;
  const maxScore = assignment.maxScore;
  const numericMaxScore = typeof maxScore === "number" ? maxScore : Number(maxScore);
  const programme = assignment.programme;
  const lesson = assignment.lesson;
  return (
    typeof assignment.id === "string" &&
    typeof assignment.tutorId === "string" &&
    typeof assignment.programmeId === "string" &&
    (assignment.lessonId === null || typeof assignment.lessonId === "string") &&
    typeof assignment.title === "string" &&
    typeof assignment.instructions === "string" &&
    typeof assignment.availableAt === "string" &&
    Number.isFinite(Date.parse(assignment.availableAt)) &&
    (assignment.dueAt === null ||
      (typeof assignment.dueAt === "string" && Number.isFinite(Date.parse(assignment.dueAt)))) &&
    (typeof maxScore === "string" || typeof maxScore === "number") &&
    Number.isFinite(numericMaxScore) &&
    assignment.status === "PUBLISHED" &&
    typeof assignment.createdAt === "string" &&
    Number.isFinite(Date.parse(assignment.createdAt)) &&
    isValidProgramme(programme) &&
    (lesson === null || isValidLesson(lesson)) &&
    isValidStudentSubmission(assignment.submission)
  );
}

function isStudentAssignmentsData(value: unknown): value is StudentAssignmentsData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    Array.isArray(data.items) &&
    (data.nextCursor === null || typeof data.nextCursor === "string") &&
    data.items.every(isValidStudentAssignment)
  );
}

function isValidStudentAssignmentSubmissionRecord(
  value: unknown,
): value is StudentAssignmentSubmissionRecord {
  if (!value || typeof value !== "object") return false;

  const submission = value as Record<string, unknown>;
  const score = submission.score;
  const hasValidScore =
    score === null ||
    ((typeof score === "string" || typeof score === "number") &&
      Number.isFinite(Number(score)));

  return (
    typeof submission.id === "string" && UUID_V4_PATTERN.test(submission.id) &&
    typeof submission.assignmentId === "string" && UUID_V4_PATTERN.test(submission.assignmentId) &&
    typeof submission.tutorId === "string" && UUID_V4_PATTERN.test(submission.tutorId) &&
    typeof submission.programmeId === "string" && UUID_V4_PATTERN.test(submission.programmeId) &&
    typeof submission.studentId === "string" && UUID_V4_PATTERN.test(submission.studentId) &&
    typeof submission.attemptNumber === "number" &&
    Number.isInteger(submission.attemptNumber) && submission.attemptNumber >= 1 &&
    typeof submission.answerText === "string" &&
    (submission.fileUrl === null || typeof submission.fileUrl === "string") &&
    typeof submission.submittedAt === "string" && Number.isFinite(Date.parse(submission.submittedAt)) &&
    (submission.status === "SUBMITTED" ||
      submission.status === "IN_REVIEW" ||
      submission.status === "REVIEWED" ||
      submission.status === "RETURNED" ||
      submission.status === "GRADED") &&
    typeof submission.updatedAt === "string" && Number.isFinite(Date.parse(submission.updatedAt)) &&
    typeof submission.createdAt === "string" && Number.isFinite(Date.parse(submission.createdAt)) &&
    hasValidScore &&
    (submission.feedback === null || typeof submission.feedback === "string") &&
    (submission.reviewedAt === null ||
      (typeof submission.reviewedAt === "string" && Number.isFinite(Date.parse(submission.reviewedAt))))
  );
}

function assertUuid(value: string, fieldName: string): string {
  const normalized = value.trim();
  if (!UUID_V4_PATTERN.test(normalized)) {
    throw new Error(`A valid ${fieldName} is required.`);
  }
  return normalized;
}

function isReviewSubmissionStatus(value: unknown): value is "RETURNED" | "REVIEWED" {
  return value === "RETURNED" || value === "REVIEWED";
}

function isValidReviewedSubmission(
  value: unknown,
): value is ReviewedAssignmentSubmissionRecord {
  if (!value || typeof value !== "object") return false;

  const submission = value as Record<string, unknown>;
  const score = submission.score;
  const assignment = submission.assignment;
  const validAssignment =
    assignment === undefined || assignment === null ||
    (typeof assignment === "object" &&
      typeof (assignment as Record<string, unknown>).id === "string" &&
      typeof (assignment as Record<string, unknown>).title === "string" &&
      typeof (assignment as Record<string, unknown>).programmeId === "string" &&
      (typeof (assignment as Record<string, unknown>).maxScore === "string" ||
        typeof (assignment as Record<string, unknown>).maxScore === "number"));

  return (
    typeof submission.id === "string" && UUID_V4_PATTERN.test(submission.id) &&
    typeof submission.assignmentId === "string" && UUID_V4_PATTERN.test(submission.assignmentId) &&
    typeof submission.tutorId === "string" && UUID_V4_PATTERN.test(submission.tutorId) &&
    typeof submission.programmeId === "string" && UUID_V4_PATTERN.test(submission.programmeId) &&
    typeof submission.studentId === "string" && UUID_V4_PATTERN.test(submission.studentId) &&
    typeof submission.attemptNumber === "number" && Number.isInteger(submission.attemptNumber) &&
    submission.attemptNumber >= 1 && isReviewSubmissionStatus(submission.status) &&
    typeof submission.answerText === "string" &&
    (submission.fileUrl === null || typeof submission.fileUrl === "string") &&
    typeof submission.submittedAt === "string" && Number.isFinite(Date.parse(submission.submittedAt)) &&
    (score === null || ((typeof score === "string" || typeof score === "number") && Number.isFinite(Number(score)))) &&
    (submission.feedback === null || typeof submission.feedback === "string") &&
    (submission.reviewedAt === null ||
      (typeof submission.reviewedAt === "string" && Number.isFinite(Date.parse(submission.reviewedAt)))) &&
    typeof submission.createdAt === "string" && Number.isFinite(Date.parse(submission.createdAt)) &&
    typeof submission.updatedAt === "string" && Number.isFinite(Date.parse(submission.updatedAt)) &&
    validAssignment
  );
}

function normalizeReviewPayload(
  payload: ReviewAssignmentSubmissionDto,
): ReviewAssignmentSubmissionDto {
  if (!isReviewSubmissionStatus(payload.status)) {
    throw new Error("Choose whether to return or finalize this submission.");
  }

  if (payload.score !== undefined && payload.score !== null) {
    if (!Number.isFinite(payload.score) || payload.score < 0 || payload.score > 999999.99) {
      throw new RangeError("Score must be between 0 and 999999.99.");
    }
    if (Math.round(payload.score * 100) !== payload.score * 100) {
      throw new RangeError("Score can have no more than two decimal places.");
    }
  }

  if (payload.feedback !== undefined && payload.feedback !== null && payload.feedback.length > 20000) {
    throw new RangeError("Feedback must be 20000 characters or fewer.");
  }

  return {
    status: payload.status,
    ...(payload.score !== undefined ? { score: payload.score } : {}),
    ...(payload.feedback !== undefined ? { feedback: payload.feedback } : {}),
  };
}

function normalizeCreatePayload(payload: CreateTutorAssignmentDto): CreateTutorAssignmentDto {
  const normalized: CreateTutorAssignmentDto = {
    programmeId: assertUuid(payload.programmeId, "programme"),
    title: payload.title.trim(),
    instructions: payload.instructions.trim(),
    availableAt: payload.availableAt.trim(),
    dueAt: payload.dueAt.trim(),
    maxScore: payload.maxScore,
  };

  if (payload.lessonId !== undefined && payload.lessonId !== null) {
    normalized.lessonId = assertUuid(payload.lessonId, "lesson");
  }

  if (!normalized.title) throw new Error("Enter an assignment title.");
  if (!normalized.instructions) throw new Error("Enter assignment instructions.");
  if (!normalized.availableAt || !Number.isFinite(Date.parse(normalized.availableAt))) {
    throw new Error("Enter a valid assignment availability date and time.");
  }
  if (!normalized.dueAt || !Number.isFinite(Date.parse(normalized.dueAt))) {
    throw new Error("Enter a valid assignment due date and time.");
  }
  if (Date.parse(normalized.dueAt) <= Date.parse(normalized.availableAt)) {
    throw new Error("The due date must be later than the availability date.");
  }
  if (!Number.isFinite(normalized.maxScore) || normalized.maxScore <= 0) {
    throw new Error("Maximum score must be a number greater than zero.");
  }

  return normalized;
}

/** Tutor assignment endpoints: create, list and publish. */
export const assignmentsApi = {
  /** GET /assignments/admin — cursor-paginated assignments for the admin workspace. */
  listForAdmin: async (
    params: GetAdminAssignmentsParams = {},
  ): Promise<AdminAssignmentsData> => {
    const search = params.search?.trim();
    const cursor = params.cursor;
    const availableAtFrom = normalizeAdminDate(params.availableAtFrom, "availability start");
    const availableAtTo = normalizeAdminDate(params.availableAtTo, "availability end");
    const dueAtFrom = normalizeAdminDate(params.dueAtFrom, "due date start");
    const dueAtTo = normalizeAdminDate(params.dueAtTo, "due date end");

    if (search && search.length > 100) {
      throw new RangeError("Assignment search must be 100 characters or fewer.");
    }
    if (params.status && !isAssignmentStatus(params.status)) {
      throw new Error("Choose a valid assignment status.");
    }
    if (
      params.limit !== undefined &&
      (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 50)
    ) {
      throw new RangeError("Assignment page size must be an integer between 1 and 50.");
    }
    if (typeof cursor === "string" && cursor.length > 512) {
      throw new RangeError("Assignment pagination cursor must be 512 characters or fewer.");
    }
    if (availableAtFrom && availableAtTo && Date.parse(availableAtFrom) > Date.parse(availableAtTo)) {
      throw new Error("Availability start must be on or before availability end.");
    }
    if (dueAtFrom && dueAtTo && Date.parse(dueAtFrom) > Date.parse(dueAtTo)) {
      throw new Error("Due date start must be on or before due date end.");
    }

    const queryParams: Record<string, string | number> = {};
    if (search) queryParams.search = search;
    if (params.status) queryParams.status = params.status;
    if (availableAtFrom) queryParams.availableAtFrom = availableAtFrom;
    if (availableAtTo) queryParams.availableAtTo = availableAtTo;
    if (dueAtFrom) queryParams.dueAtFrom = dueAtFrom;
    if (dueAtTo) queryParams.dueAtTo = dueAtTo;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (typeof cursor === "string" && cursor.length > 0) queryParams.cursor = cursor;

    const response = await http.get<AdminAssignmentsApiResponse>("/assignments/admin", {
      params: queryParams,
    });
    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to retrieve assignments.");
    }
    if (!isAdminAssignmentsData(result.data)) {
      throw new Error("The admin assignments response was incomplete or invalid.");
    }

    return result.data;
  },

  /** GET /assignments/student — cursor-paginated published assignments for the authenticated student. */
  listForStudent: async (
    params: GetStudentAssignmentsParams = {},
  ): Promise<StudentAssignmentsData> => {
    const search = params.search?.trim();
    const cursor = params.cursor;
    const programmeId = params.programmeId
      ? assertUuid(params.programmeId, "programme")
      : undefined;
    const lessonId = params.lessonId
      ? assertUuid(params.lessonId, "lesson")
      : undefined;

    if (search && search.length > 100) {
      throw new RangeError("Assignment search must be 100 characters or fewer.");
    }
    if (
      params.limit !== undefined &&
      (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 50)
    ) {
      throw new RangeError("Assignment page size must be an integer between 1 and 50.");
    }
    if (typeof cursor === "string" && cursor.length > 512) {
      throw new RangeError("Assignment pagination cursor must be 512 characters or fewer.");
    }

    const queryParams: Record<string, string | number> = {};
    if (search) queryParams.search = search;
    if (programmeId) queryParams.programmeId = programmeId;
    if (lessonId) queryParams.lessonId = lessonId;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    // Cursors are opaque values; preserve their contents exactly.
    if (typeof cursor === "string" && cursor.length > 0) queryParams.cursor = cursor;

    const response = await http.get<StudentAssignmentsApiResponse>("/assignments/student", {
      params: queryParams,
    });
    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to retrieve your assignments.");
    }
    if (!isStudentAssignmentsData(result.data)) {
      throw new Error("The student assignments response was incomplete or invalid.");
    }

    return result.data;
  },

  /** POST /assignments/:id/submit — submit the authenticated student's answer. */
  submitForStudent: async (
    assignmentId: string,
    payload: SubmitStudentAssignmentDto,
  ): Promise<StudentAssignmentSubmissionRecord> => {
    const normalizedAssignmentId = assertUuid(assignmentId, "assignment ID");
    if (typeof payload.answerText !== "string" || payload.answerText.trim().length === 0) {
      throw new Error("Write an answer before submitting this assignment.");
    }

    // Keep the answer text intact so Markdown and intentional whitespace survive the request.
    const response = await http.post<StudentAssignmentSubmissionApiResponse>(
      `/assignments/${encodeURIComponent(normalizedAssignmentId)}/submit`,
      { answerText: payload.answerText },
    );
    const result = response.data;

    if (result.status !== "success") {
      throw new Error(result.message || "Unable to submit this assignment.");
    }
    if (
      !isValidStudentAssignmentSubmissionRecord(result.data) ||
      result.data.assignmentId !== normalizedAssignmentId
    ) {
      throw new Error("The assignment submission response was incomplete or invalid.");
    }

    return result.data;
  },

  /** GET /assignments/tutor — cursor-paginated assignments for the authenticated tutor. */
  listForTutor: async (
    params: GetTutorAssignmentsParams = {},
  ): Promise<TutorAssignmentsData> => {
    const search = params.search?.trim();
    const cursor = params.cursor;
    const programmeId = params.programmeId
      ? assertUuid(params.programmeId, "programme")
      : undefined;
    const lessonId = params.lessonId
      ? assertUuid(params.lessonId, "lesson")
      : undefined;

    if (search && search.length > 100) {
      throw new RangeError("Assignment search must be 100 characters or fewer.");
    }
    if (params.status && !isAssignmentStatus(params.status)) {
      throw new Error("Choose a valid assignment status.");
    }
    if (
      params.limit !== undefined &&
      (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 50)
    ) {
      throw new RangeError("Assignment page size must be an integer between 1 and 50.");
    }
    if (typeof cursor === "string" && cursor.length > 512) {
      throw new RangeError("Assignment pagination cursor must be 512 characters or fewer.");
    }

    const queryParams: Record<string, string | number> = {};
    if (search) queryParams.search = search;
    if (params.status) queryParams.status = params.status;
    if (programmeId) queryParams.programmeId = programmeId;
    if (lessonId) queryParams.lessonId = lessonId;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    // Cursor values are opaque; do not trim or otherwise rewrite them.
    if (typeof cursor === "string" && cursor.length > 0) queryParams.cursor = cursor;

    const response = await http.get<TutorAssignmentsApiResponse>("/assignments/tutor", {
      params: queryParams,
    });
    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to retrieve your assignments.");
    }
    if (!isTutorAssignmentsData(result.data)) {
      throw new Error("The tutor assignments response was incomplete or invalid.");
    }

    return result.data;
  },

  /** POST /assignments — create a draft assignment for a tutor programme. */
  create: async (payload: CreateTutorAssignmentDto): Promise<TutorAssignment> => {
    const normalizedPayload = normalizeCreatePayload(payload);
    const response = await http.post<TutorAssignmentApiResponse>(
      "/assignments",
      normalizedPayload,
    );
    const result = response.data;

    if (result.status !== "success") {
      throw new Error(result.message || "Unable to create this assignment.");
    }
    if (!isValidAssignment(result.data) || result.data.status !== "DRAFT") {
      throw new Error("The assignment creation response was incomplete or invalid.");
    }

    return result.data;
  },

  /** PATCH /assignments/:id/publish — publish a tutor assignment. */
  publish: async (id: string): Promise<TutorAssignment> => {
    const assignmentId = assertUuid(id, "assignment ID");
    const response = await http.patch<TutorAssignmentApiResponse>(
      `/assignments/${encodeURIComponent(assignmentId)}/publish`,
    );
    const result = response.data;

    if (result.status !== "success") {
      throw new Error(result.message || "Unable to publish this assignment.");
    }
    if (!isValidAssignment(result.data) || result.data.status !== "PUBLISHED") {
      throw new Error("The assignment publishing response was incomplete or invalid.");
    }

    return result.data;
  },

  /** PATCH /assignments/submissions/:id/review — return or finalize a student submission. */
  reviewSubmission: async (
    id: string,
    payload: ReviewAssignmentSubmissionDto,
  ): Promise<ReviewedAssignmentSubmissionRecord> => {
    const submissionId = assertUuid(id, "submission ID");
    const normalizedPayload = normalizeReviewPayload(payload);
    const response = await http.patch<ReviewAssignmentSubmissionApiResponse>(
      `/assignments/submissions/${encodeURIComponent(submissionId)}/review`,
      normalizedPayload,
    );
    const result = response.data;

    if (result.status !== "success") {
      throw new Error(result.message || "Unable to save this submission review.");
    }
    if (!isValidReviewedSubmission(result.data) || result.data.id !== submissionId) {
      throw new Error("The submission review response was incomplete or invalid.");
    }

    return result.data;
  },
};
