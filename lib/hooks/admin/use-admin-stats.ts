import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "@/lib/api/admin";
import { AdminStatsResponse } from "@/lib/interfaces/admin";

export const useAdminStats = () => {
  return useQuery<AdminStatsResponse, Error>({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
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
