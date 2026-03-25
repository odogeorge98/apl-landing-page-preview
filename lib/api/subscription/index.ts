import { http } from "@/lib/utils/http";
import { SubscriptionsResponse } from "@/lib/interfaces/subscription";
import { handleApiError } from "@/lib/utils/error-handler";
import { buildQueryParams } from "@/lib/utils/query-params";

export async function fetchSubscriptions(
  params?: { page?: number; limit?: number; status?: string; subscriptionType?: string; month?: number; year?: number; search?: string }
): Promise<SubscriptionsResponse> {
  try {
    const queryParams = buildQueryParams(params || {});
    const url = `/subscription${
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
        message: result.message || "Subscriptions retrieved successfully!",
        data: result.data,
      };
    }

    return {
      status: result.status,
      statusCode: result.statusCode,
      message: result.message || "Subscriptions retrieved successfully!",
      data: result.data,
    };
  } catch (error) {
    return handleApiError(
      error,
      "Failed to fetch subscriptions. Please try again."
    );
  }
}

export async function fetchOrganizationSubscriptions(
  organizationId: string,
  params?: { page?: number; limit?: number }
): Promise<SubscriptionsResponse> {
  try {
    const queryParams = buildQueryParams(params || {});
    const url = `/subscription/organization/${organizationId}${
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
        message: result.message || "Organization subscriptions retrieved successfully!",
        data: result.data,
      };
    }

    return {
      status: result.status,
      statusCode: result.statusCode,
      message: result.message || "Organization subscriptions retrieved successfully!",
      data: result.data,
    };
  } catch (error) {
    return handleApiError(
      error,
      "Failed to fetch organization subscriptions. Please try again."
    );
  }
}
