import { http } from "@/lib/utils/http";
import {
  InvitationsResponse,
  OrganizationInviteData,
  OrganizationInviteResponse,
  OrganizationsDashboardResponse,
} from "@/lib/interfaces/organisation";
import {
  buildInvitationParams,
  InvitationParams,
} from "@/lib/utils/param-utils";
import { buildQueryParams } from "@/lib/utils/query-params";
import { handleApiError } from "@/lib/utils/error-handler";

export async function inviteOrganization(
  data: OrganizationInviteData
): Promise<OrganizationInviteResponse> {
  try {
    const response = await http.post<any>("/organization/invite", {
      email: data.email,
    });

    const result = response.data;

    if (result.data?.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    if (result.data?.status === "success") {
      return {
        success: true,
        message: result.message || "Invitation sent successfully!",
        data: result.data,
      };
    }

    return {
      success: true,
      message: result.message || "Invitation sent successfully!",
      data: result.data,
    };
  } catch (error) {
    return handleApiError(
      error,
      "Failed to send organization invitation. Please try again."
    );
  }
}

export async function fetchInvitations(
  params?: InvitationParams
): Promise<InvitationsResponse> {
  try {
    const filteredParams = buildInvitationParams(params || {});
    const queryParams = buildQueryParams(filteredParams);
    const url = `/organization/invite${
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
        message: result.message || "Invitations retrieved successfully!",
        data: result.data,
      };
    }

    return {
      status: result.status,
      statusCode: result.statusCode,
      message: result.message || "Invitations retrieved successfully!",
      data: result.data,
    };
  } catch (error) {
    return handleApiError(
      error,
      "Failed to fetch invitations. Please try again."
    );
  }
}

export async function resendInvite(
  data: OrganizationInviteData
): Promise<OrganizationInviteResponse> {
  try {
    const response = await http.post<any>("/organization/resend-invite", {
      email: data.email,
    });

    const result = response.data;

    if (result.data?.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    if (result.data?.status === "success") {
      return {
        success: true,
        message: result.message || "Invitation resent successfully!",
        data: result.data,
      };
    }

    return {
      success: true,
      message: result.message || "Invitation resent successfully!",
      data: result.data,
    };
  } catch (error) {
    return handleApiError(
      error,
      "Failed to resend invitation. Please try again."
    );
  }
}

export async function deleteInvite(
  id: string
): Promise<OrganizationInviteResponse> {
  try {
    const response = await http.delete<any>(`/organization/invite/${id}`);

    const result = response.data;

    if (result.data?.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    if (result.data?.status === "success") {
      return {
        success: true,
        message: result.message || "Invitation deleted successfully!",
        data: result.data,
      };
    }

    return {
      success: true,
      message: result.message || "Invitation deleted successfully!",
      data: result.data,
    };
  } catch (error) {
    return handleApiError(
      error,
      "Failed to delete invitation. Please try again."
    );
  }
}

export async function fetchOrganizationsDashboard(
  params?: { page?: number; limit?: number; status?: string; search?: string }
): Promise<OrganizationsDashboardResponse> {
  try {
    // Period is not included in params - period should never be sent to organization API
    const queryParams = buildQueryParams(params || {});
    const url = `/organization${
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
        message: result.message || "Organizations dashboard retrieved successfully!",
        data: result.data,
      };
    }

    return {
      status: result.status,
      statusCode: result.statusCode,
      message: result.message || "Organizations dashboard retrieved successfully!",
      data: result.data,
    };
  } catch (error) {
    return handleApiError(
      error,
      "Failed to fetch organizations dashboard. Please try again."
    );
  }
}

export async function fetchOrganizationById(
  id: string
): Promise<any> {
  try {
    const response = await http.get<any>(`/organization/${id}`);

    const result = response.data;

    if (result.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    if (result.status === "success") {
      return {
        status: result.status,
        statusCode: result.statusCode,
        message: result.message || "Organization retrieved successfully!",
        data: result.data,
      };
    }

    return {
      status: result.status,
      statusCode: result.statusCode,
      message: result.message || "Organization retrieved successfully!",
      data: result.data,
    };
  } catch (error) {
    return handleApiError(
      error,
      "Failed to fetch organization. Please try again."
    );
  }
}

export async function deleteOrganization(
  id: string
): Promise<any> {
  try {
    const response = await http.delete<any>(`/organization/${id}`);

    const result = response.data;

    if (result.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    if (result.status === "success") {
      return {
        status: result.status,
        statusCode: result.statusCode,
        message: result.message || "Organization deleted successfully!",
        data: result.data,
      };
    }

    return {
      status: result.status,
      statusCode: result.statusCode,
      message: result.message || "Organization deleted successfully!",
      data: result.data,
    };
  } catch (error) {
    return handleApiError(
      error,
      "Failed to delete organization. Please try again."
    );
  }
}
