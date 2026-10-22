"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tutorSessionsApi } from "@/lib/api/tutor-sessions";
import type { CreateTutorSessionDto } from "@/lib/interfaces/tutor-sessions";
import { TUTOR_DASHBOARD_QUERY_KEY } from "@/lib/hooks/dashboard/use-tutor-dashboard";
import { tutorSessionsQueryKeys } from "@/lib/hooks/tutor-sessions/use-tutor-sessions";

/** Create a session, then refresh the calendar data and tutor dashboard metrics. */
export function useCreateTutorSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTutorSessionDto) =>
      tutorSessionsApi.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: tutorSessionsQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: TUTOR_DASHBOARD_QUERY_KEY,
        }),
      ]);
    },
  });
}
