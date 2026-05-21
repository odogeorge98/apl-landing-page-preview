import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminUsers, fetchAdminSummary, inviteAdmin, completeAdminOnboarding } from "@/lib/api/admin/admin";
import type { FindAdminFilter, InviteAdminPayload, AdminOnboardingPayload, } from "@/lib/interfaces/admin/admin";
import { showSuccess } from "@/lib/utils/error-handler";

// ─── Query key factory ────────────────────────────────────────────────────────

export const adminKeys = {
  all:     ["admin-users"] as const,
  summary: () => [...adminKeys.all, "summary"] as const,
  lists:   () => [...adminKeys.all, "list"] as const,
  list:    (params: FindAdminFilter) => [...adminKeys.lists(), params] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAdminSummary() {
  return useQuery({
    queryKey: adminKeys.summary(),
    queryFn:  fetchAdminSummary,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useAdminList(params: FindAdminFilter = {}) {
  return useQuery({
    queryKey: adminKeys.list(params),

    queryFn: () => fetchAdminUsers(params),

    staleTime: 30_000,

    placeholderData: (previousData) => previousData,
  });
}

export function useInviteAdmin(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteAdminPayload) => inviteAdmin(payload),

    onSuccess: (data) => {
      showSuccess(data.message || "Invitation sent successfully.");
      // Refresh both the list and the KPI summary counters
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.summary() });
      options?.onSuccess?.();
    },

    onError: (error: Error) => {
      // showError is called by handleApiError already — just surface it
      console.error("[inviteAdmin]", error.message);
    },
  });
}

export function useAdminOnboarding(options?: {
  onSuccess?: (successMessage: string) => void;
}) {
  return useMutation({
    mutationFn: (payload: AdminOnboardingPayload) =>
      completeAdminOnboarding(payload),

    onSuccess: (data) => {
      // data.data is the human-readable success string from the API
      options?.onSuccess?.(data.data || data.message);
    },

    // errors surface via handleApiError/showError in the API layer
  });
}