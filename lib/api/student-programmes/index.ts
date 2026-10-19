import { http } from "@/lib/utils/http";
import type {
  CreateStudentProgrammeEnrolmentApiResponse,
  CreateStudentProgrammeEnrolmentDto,
  GetStudentProgrammeEnrolmentsParams,
  StudentProgrammeEnrolmentsApiResponse,
  StudentProgrammeEnrolmentsData,
} from "@/lib/interfaces/student-programmes";

function isValidEnrolment(value: unknown): value is StudentProgrammeEnrolmentsData["items"][number] {
  if (!value || typeof value !== "object") return false;

  const enrolment = value as Record<string, unknown>;
  return (
    typeof enrolment.id === "string" &&
    typeof enrolment.studentId === "string" &&
    typeof enrolment.programmeId === "string" &&
    typeof enrolment.createdAt === "string" &&
    typeof enrolment.updatedAt === "string"
  );
}

/**
 * GET /student-programmes/my-programmes
 *
 * Fetches the authenticated student's programme enrolments. The shared HTTP
 * client adds the configured API base URL and bearer token. The endpoint uses
 * an opaque response cursor for pagination.
 */
export const studentProgrammesApi = {
  /** POST /student-programmes — enrol the authenticated student in a programme. */
  enrol: async (
    payload: CreateStudentProgrammeEnrolmentDto,
  ): Promise<StudentProgrammeEnrolmentsData["items"][number]> => {
    const programmeId = payload.programmeId.trim();
    if (!programmeId) {
      throw new Error("Choose a programme before enrolling.");
    }

    const response = await http.post<CreateStudentProgrammeEnrolmentApiResponse>(
      "/student-programmes",
      { programmeId },
    );

    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to enrol in this programme.");
    }

    if (!isValidEnrolment(result.data)) {
      throw new Error("The enrolment response was incomplete or invalid.");
    }

    return result.data;
  },

  listMyProgrammes: async (
    params: GetStudentProgrammeEnrolmentsParams = {},
  ): Promise<StudentProgrammeEnrolmentsData> => {
    const cursor = params.cursor?.trim();
    const queryParams: Record<string, string> = {};

    if (cursor) queryParams.cursor = cursor;

    const response = await http.get<StudentProgrammeEnrolmentsApiResponse>(
      "/student-programmes/my-programmes",
      { params: queryParams },
    );

    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to retrieve your programmes.");
    }

    const data = result.data;
    if (
      !data ||
      !Array.isArray(data.items) ||
      !(data.nextCursor === null || typeof data.nextCursor === "string") ||
      !data.items.every(isValidEnrolment)
    ) {
      throw new Error("The programme enrolments response was incomplete.");
    }

    return data;
  },
};
