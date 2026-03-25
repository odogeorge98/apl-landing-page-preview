import { useQuery } from "@tanstack/react-query";
import { getAllRoles } from "@/lib/api/admin";
import { RolesResponse } from "@/lib/interfaces/admin";

export const useRoles = () => {
  return useQuery<RolesResponse, Error>({
    queryKey: ["roles"],
    queryFn: getAllRoles,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes("4")) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
