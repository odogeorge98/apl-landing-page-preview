import { http } from "@/lib/utils/http";
import type {
  CreateTutorApiResponse,
  CreateTutorDto,
  CreateTutorResponseData,
  GetTutorsParams,
  TutorsListApiResponse,
} from "@/lib/interfaces/users/tutors";

export const tutorsApi = {
  /**
   * Retrieve tutors using cursor-based pagination.
   *
   * GET /tutors?limit=10&cursor=...&search=...
   */
  list: async (
    params: GetTutorsParams = {},
  ): Promise<TutorsListApiResponse> => {
    const queryParams = new URLSearchParams();

    const search = params.search?.trim();

    if (search) {
      queryParams.set("search", search);
    }

    queryParams.set("limit", String(params.limit ?? 10));

    if (params.cursor) {
      queryParams.set("cursor", params.cursor);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/tutors?${queryString}` : "/tutors";

    const response = await http.get<TutorsListApiResponse>(url);

    const result = response.data;

    if (result.status !== "success") {
      throw new Error(
        result.message || "Failed to retrieve tutors.",
      );
    }

    // Returns { items: [...], nextCursor: string | null }
    return result;
  },

  /**
   * Create a tutor.
   *
   * POST /tutors
   */
  create: async (
    payload: CreateTutorDto,
  ): Promise<CreateTutorResponseData> => {
    const response = await http.post<CreateTutorApiResponse>(
      "/tutors",
      {
        name: payload.name.trim(),
        email: payload.email.trim(),
        ...(payload.phone?.trim()
          ? { phone: payload.phone.trim() }
          : {}),
      },
    );

    const result = response.data;

    if (result.status !== "success") {
      throw new Error(
        result.message || "Failed to create tutor.",
      );
    }

    return result.data;
  },
};
