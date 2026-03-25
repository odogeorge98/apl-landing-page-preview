import { http } from "@/lib/utils/http";
import { CreateRoleData, CreateRoleResponse } from "@/lib/interfaces/admin";
import { handleApiError } from "@/lib/utils/error-handler";

export async function createRole(
  data: CreateRoleData
): Promise<CreateRoleResponse> {
  try {
    const response = await http.post<any>("/roles", {
      name: data.name,
      description: data.description,
      permissions: data.permissions || {},
    });

    const result = response.data;

    if (result.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    return {
      success: true,
      message: result.message || "Role created successfully!",
      role: result.data,
    };
  } catch (error) {
    handleApiError(
      error,
      "Failed to create role. Please try again."
    );
    throw error; // Re-throw after handling
  }
}
