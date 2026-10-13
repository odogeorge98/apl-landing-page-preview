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

    const queryParams = new URLSearchParams();
    const search = params.search?.trim();
    const cursor = params.cursor?.trim();

    if (search) queryParams.set("search", search);
    if (params.gender) queryParams.set("gender", params.gender);

    // Leave limit out unless the caller explicitly requests one. Some backend
    // ValidationPipe setups validate query strings as numbers without coercion;
    // the endpoint's own default handles the ordinary list request.
    if (params.limit !== undefined) {
      queryParams.set("limit", String(params.limit));
    }

    if (cursor) queryParams.set("cursor", cursor);

    const queryString = queryParams.toString();
    const url = queryString ? `/students?${queryString}` : "/students";
    const response = await http.get<StudentsListApiResponse>(url);
    const result = response.data;

    if (result.status !== "success") {
      throw new Error(result.message || "Failed to retrieve students.");
    }

    return result;
  },
};
