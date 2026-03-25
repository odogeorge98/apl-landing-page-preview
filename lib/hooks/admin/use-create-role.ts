import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRole } from "@/lib/api/admin/roles";
import { CreateRoleData, CreateRoleResponse } from "@/lib/interfaces/admin";
import { showError, showSuccess } from "@/lib/utils/error-handler";

interface UseCreateRoleOptions {
  onSuccess?: (data: CreateRoleResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateRole = (options?: UseCreateRoleOptions) => {
  const queryClient = useQueryClient();

  return useMutation<CreateRoleResponse, Error, CreateRoleData>({
    mutationFn: createRole,
    onSuccess: (data) => {
      showSuccess(data.message || "Role created successfully!");
      
      // Invalidate roles query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      showError(error.message);
      options?.onError?.(error);
    },
  });
};
