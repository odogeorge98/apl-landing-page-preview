import { http } from "@/lib/utils/http";
import type {
  GetTutorStudentsParams,
  TutorStudent,
  TutorStudentsApiResponse,
  TutorStudentsData,
} from "@/lib/interfaces/tutor-students";

function isTutorStudent(value: unknown): value is TutorStudent {
  if (!value || typeof value !== "object") return false;

  const student = value as Record<string, unknown>;
  const user = student.user;
  if (!user || typeof user !== "object") return false;

  const userRecord = user as Record<string, unknown>;
  return (
    typeof student.id === "string" &&
    typeof student.name === "string" &&
    (typeof student.gender === "string" || student.gender === null) &&
    (typeof student.photoUrl === "string" || student.photoUrl === null) &&
    typeof student.createdAt === "string" &&
    typeof userRecord.id === "string" &&
    typeof userRecord.email === "string" &&
    (typeof userRecord.phoneNo === "string" || userRecord.phoneNo === null) &&
    typeof userRecord.isActive === "boolean"
  );
}

/** Retrieve the authenticated tutor's students using cursor pagination. */
export const tutorStudentsApi = {
  list: async (
    params: GetTutorStudentsParams = {},
  ): Promise<TutorStudentsApiResponse> => {
    if (
      params.limit !== undefined &&
      (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 50)
    ) {
      throw new RangeError("Student page size must be an integer between 1 and 50.");
    }

    const search = params.search?.trim();
    if (search && search.length > 100) {
      throw new RangeError("Student search must be 100 characters or fewer.");
    }

    // Keep the numeric page size numeric until Axios serializes the URL.
    const queryParams: Record<string, string | number> = {};
    const cursor = params.cursor?.trim();
    if (search) queryParams.search = search;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (cursor) queryParams.cursor = cursor;

    const response = await http.get<TutorStudentsApiResponse>("/tutors/students", {
      params: queryParams,
    });
    const result = response.data;

    if (result.status !== "success") {
      throw new Error(result.message || "Unable to retrieve your students.");
    }

    const data = result.data as TutorStudentsData | undefined;
    if (
      !data ||
      !Array.isArray(data.items) ||
      !(data.nextCursor === null || typeof data.nextCursor === "string") ||
      !data.items.every(isTutorStudent)
    ) {
      throw new Error("The tutor students response was incomplete or invalid.");
    }

    return result;
  },
};
