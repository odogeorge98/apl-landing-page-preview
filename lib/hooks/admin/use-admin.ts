import { useQuery } from "@tanstack/react-query";
import { fetchAdminUsers, fetchAdminSummary } from "@/lib/api/admin/admin";
import type { FindAdminFilter } from "@/lib/interfaces/admin/admin";

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