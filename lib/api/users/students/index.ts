import { http } from "@/lib/utils/http";
import type {
  GetStudentsParams,
  StudentsListApiResponse,
} from "@/lib/interfaces/users/students";

/**
 * Retrieve students using the API's cursor-based pagination.
 *
 * GET /students?search=...&gender=...&limit=...&cursor=...
 */
export const studentsApi = {
  list: async (
    params: GetStudentsParams = {},
  ): Promise<StudentsListApiResponse> => {
    if (
      params.limit !== undefined &&
      (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 50)
    ) {
      throw new RangeError("Student page size must be an integer between 1 and 50.");
    }

    // Keep limit numeric in the Axios config. Axios serializes query values
    // when building the URL; backend DTO validation must coerce it back to a
    // number before applying @IsInt/@Min.
    const queryParams: Record<string, string | number> = {};
    const search = params.search?.trim();
    const cursor = params.cursor?.trim();

    if (search) queryParams.search = search;
    if (params.gender) queryParams.gender = params.gender;

    if (params.limit !== undefined) {
      queryParams.limit = params.limit;
    }

    if (cursor) queryParams.cursor = cursor;

    const response = await http.get<StudentsListApiResponse>("/students", {
      params: queryParams,
    });
    const result = response.data;

    if (result.status !== "success") {
      throw new Error(result.message || "Failed to retrieve students.");
    }

    return result;
  },
};
