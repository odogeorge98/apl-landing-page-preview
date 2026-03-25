import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOrganizationsDashboard, fetchOrganizationById, deleteOrganization } from "@/lib/api/organisation";
import { OrganizationsDashboardResponse } from "@/lib/interfaces/organisation";
import { showError, showSuccess } from "@/lib/utils/error-handler";

interface UseOrganizationsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  period?: string;
}

export const useOrganizationsDashboard = (params?: UseOrganizationsParams) => {
  return useQuery<OrganizationsDashboardResponse, Error>({
    queryKey: [
      "organizations",
      "dashboard",
      params?.page,
      params?.limit,
      params?.status,
      params?.search,
    ],
    queryFn: () => fetchOrganizationsDashboard(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error instanceof Error && "status" in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

export const useOrganizationById = (id: string) => {
  return useQuery<any, Error>({
    queryKey: ["organization", id],
    queryFn: () => fetchOrganizationById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error instanceof Error && "status" in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: (data) => {
      showSuccess(data.message || "Organization deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      showError(error.message || "Failed to delete organization. Please try again.");
    },
  });
};
