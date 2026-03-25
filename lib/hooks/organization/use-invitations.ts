import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInvitations, resendInvite, deleteInvite, inviteOrganization } from "@/lib/api/organisation";
import { InvitationsResponse, OrganizationInviteData, OrganizationInviteResponse } from "@/lib/interfaces/organisation";
import { showError, showSuccess } from "@/lib/utils/error-handler";

interface UseInvitationsParams {
  page?: number;
  limit?: number;
  status?: string;
  month?: number;
  year?: number;
  search?: string;
}

export const useInvitations = (params?: UseInvitationsParams, options?: { enabled?: boolean }) => {
  return useQuery<InvitationsResponse, Error>({
    queryKey: [
      "invitations",
      params?.page,
      params?.limit,
      params?.status,
      params?.month,
      params?.year,
      params?.search,
    ],
    queryFn: () => fetchInvitations(params),
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
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

export const useResendInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrganizationInviteData) => resendInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (error) => {
      console.error("Failed to resend invitation:", error);
    },
  });
};

export const useDeleteInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (error) => {
      console.error("Failed to delete invitation:", error);
    },
  });
};

interface UseOrganizationInviteOptions {
  onSuccess?: (data: OrganizationInviteResponse) => void;
  onError?: (error: Error) => void;
}

export const useOrganizationInvite = (
  options?: UseOrganizationInviteOptions
) => {
  const queryClient = useQueryClient();

  return useMutation<OrganizationInviteResponse, Error, OrganizationInviteData>(
    {
      mutationFn: inviteOrganization,
      onSuccess: (data) => {
        showSuccess(
          data.message || "Organization invitation sent successfully!"
        );

        queryClient.invalidateQueries({ queryKey: ["invitations"] });

        options?.onSuccess?.(data);
      },
      onError: (error) => {
        showError(error.message);
        options?.onError?.(error);
      },
    }
  );
};
