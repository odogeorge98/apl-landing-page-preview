import { http } from "@/lib/utils/http";
import {
  DashboardStatisticsResponse,
  DashboardAnalyticsResponse,
  DashboardKpiResponse,
} from "@/lib/interfaces/dashboard";
import { handleApiError } from "@/lib/utils/error-handler";
import { DashboardFilter } from "@/lib/enums/dashboard-filter";
import { buildQueryParams } from "@/lib/utils/query-params";

export async function fetchDashboardKpi(): Promise<DashboardKpiResponse> {
  try {
    const url = "/dashboard";
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
        message: result.message || "Dashboard metrics retrieved successfully!",
        data: result.data,
      };
    }

    return {
      status: result.status,
      statusCode: result.statusCode,
      message: result.message || "Dashboard metrics retrieved successfully!",
      data: result.data,
    };
  } catch (error) {
    return handleApiError(
      error,
      "Failed to fetch dashboard metrics. Please try again."
    );
  }
}

export async function fetchDashboardStatistics(
  filter?: DashboardFilter
): Promise<DashboardStatisticsResponse> {
  try {
    const params = filter ? { filter } : {};
    const queryParams = buildQueryParams(params);
    const url = `/dashboard/statistics${
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
        message: result.message || "Dashboard statistics retrieved successfully!",
        data: result.data,
      };
    }

    return {
      status: result.status,
      statusCode: result.statusCode,
      message: result.message || "Dashboard statistics retrieved successfully!",
      data: result.data,
    };
  } catch (error) {
    return handleApiError(
      error,
      "Failed to fetch dashboard statistics. Please try again."
    );
  }
}

export async function fetchDashboardAnalytics(
  filter?: DashboardFilter
): Promise<DashboardAnalyticsResponse> {
  try {
    const params = filter ? { filter } : {};
    const queryParams = buildQueryParams(params);
    const url = `/dashboard/analytics${
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
        message: result.message || "Dashboard analytics retrieved successfully!",
        data: result.data,
      };
    }

    return {
      status: result.status,
      statusCode: result.statusCode,
      message: result.message || "Dashboard analytics retrieved successfully!",
      data: result.data,
    };
  } catch (error) {
    return handleApiError(
      error,
      "Failed to fetch dashboard analytics. Please try again."
    );
  }
}
