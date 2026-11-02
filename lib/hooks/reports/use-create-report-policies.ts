"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportPoliciesApi } from "@/lib/api/report-policies";
import type { CreateReportPoliciesDto } from "@/lib/interfaces/report-policies";

export const reportPoliciesQueryKeys = {
  all: ["report-policies"] as const,
};

/** Create a batch of programme policies and refresh any policy-backed views. */
export function useCreateReportPolicies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReportPoliciesDto) => reportPoliciesApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: reportPoliciesQueryKeys.all });
    },
  });
}
