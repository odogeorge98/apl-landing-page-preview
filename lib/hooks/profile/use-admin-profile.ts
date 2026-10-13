
"use client";

import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/profile";
import type { AdminProfile } from "@/lib/interfaces/profile";

export const adminProfileQueryKey = ["admin", "profile"] as const;

export function useAdminProfile() {
  return useQuery<AdminProfile, Error>({
    queryKey: adminProfileQueryKey,
    queryFn: profileApi.getAdminProfile,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: (failureCount, error) => {
      const status = (
        error as Error & {
          response?: { status?: number };
        }
      ).response?.status;

      // Avoid retrying client errors such as 401, 403, and 404.
      if (status && status >= 400 && status < 500) {
        return false;
      }

      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
  });
}
