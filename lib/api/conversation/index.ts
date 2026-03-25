import { http } from "@/lib/utils/http";
import { ConversationsResponse } from "@/lib/interfaces/conversation";
import { handleApiError } from "@/lib/utils/error-handler";
import { buildQueryParams } from "@/lib/utils/query-params";

export async function fetchConversations(
  params?: { page?: number; limit?: number; search?: string; qualificationStatus?: string; meetingStatus?: string }
): Promise<ConversationsResponse> {
  try {
    const queryParams = buildQueryParams(params || {});
    const url = `/conversation${
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
        message: result.message || "Conversations retrieved successfully!",
        data: result.data,
      };
    }

    return {
      status: result.status,
      statusCode: result.statusCode,
      message: result.message || "Conversations retrieved successfully!",
      data: result.data,
    };
  } catch (error) {
    return handleApiError(
      error,
      "Failed to fetch conversations. Please try again."
    );
  }
}
