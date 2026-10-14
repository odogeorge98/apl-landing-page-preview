"use client";

import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/profile";
import type { StudentProfile } from "@/lib/interfaces/profile";

export const studentProfileQueryKey = ["student", "profile"] as const;

export function useStudentProfile() {
  return useQuery<StudentProfile, Error>({
    queryKey: studentProfileQueryKey,
    queryFn: profileApi.getStudentProfile,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: (failureCount, error) => {
      const status = (error as Error & { status?: number }).status;

      // Client errors require a corrected request or session, not a retry.
      if (typeof status === "number" && status >= 400 && status < 500) {
        return false;
      }

      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
  });
}
