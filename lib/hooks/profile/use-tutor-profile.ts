"use client";

import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/profile";
import type { TutorProfile } from "@/lib/interfaces/profile";

export const tutorProfileQueryKey = ["tutor", "profile"] as const;

export function useTutorProfile() {
  return useQuery<TutorProfile, Error>({
    queryKey: tutorProfileQueryKey,
    queryFn: profileApi.getTutorProfile,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: (failureCount, error) => {
      const status = (error as Error & { status?: number }).status;

      // Do not retry client errors such as authorization and validation failures.
      if (typeof status === "number" && status >= 400 && status < 500) {
        return false;
      }

      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
  });
}
