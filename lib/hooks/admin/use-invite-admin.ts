import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteAdmin } from "@/lib/api/admin";
import { InviteAdminData, InviteAdminResponse } from "@/lib/interfaces/admin";
import { showError, showSuccess } from "@/lib/utils/error-handler";

interface UseInviteAdminOptions {
  onSuccess?: (data: InviteAdminResponse) => void;
  onError?: (error: Error) => void;
}

export const useInviteAdmin = (options?: UseInviteAdminOptions) => {
  const queryClient = useQueryClient();

  return useMutation<InviteAdminResponse, Error, InviteAdminData>({
    mutationFn: inviteAdmin,
    onSuccess: (data) => {
      showSuccess(data.message || "Admin invitation sent successfully!");
      
      // Invalidate admin users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      showError(error.message);
      options?.onError?.(error);
    },
  });
};
