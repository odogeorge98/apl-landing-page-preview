import { http } from "@/lib/utils/http";
import { FeedbacksResponse } from "@/lib/interfaces/feedback";
import { handleApiError } from "@/lib/utils/error-handler";
import { buildQueryParams } from "@/lib/utils/query-params";

export async function fetchFeedbacks(
  params?: { page?: number; limit?: number; search?: string; feedbackType?: string }
): Promise<FeedbacksResponse> {
  try {
    const queryParams = buildQueryParams(params || {});
    const url = `/feedback${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await http.get<any>(url);

    const result = response.data;

    if (result.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    if (result.status === "success") {
      return {
        status: result.status,
        statusCode: result.statusCode,
        message: result.message || "Feedbacks retrieved successfully!",
        data: result.data,
      };
    }

    return {
      status: result.status || "success",
      statusCode: result.statusCode || 200,
      message: result.message || "Feedbacks retrieved successfully!",
      data: result.data,
    };
  } catch (error) {
    handleApiError(
      error,
      "Failed to fetch feedbacks. Please try again."
    );
    throw error; // Re-throw after handling
  }
}
