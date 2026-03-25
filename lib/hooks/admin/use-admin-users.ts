import { useQuery } from "@tanstack/react-query";
import { getAdminUsers } from "@/lib/api/admin";
import { AdminUsersResponse, GetAdminUsersParams } from "@/lib/interfaces/admin";

export const useAdminUsers = (params?: GetAdminUsersParams) => {
  return useQuery<AdminUsersResponse, Error>({
    queryKey: ["admin-users", params],
    queryFn: () => getAdminUsers(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes("4")) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
