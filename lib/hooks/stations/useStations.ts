import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchStationsSummary, fetchStations, fetchStationDetail, createStation } from "@/lib/api/stations";
import type {
  // CreateStationPayload,
  StationBadge,
  StationSource,
} from "@/lib/types/stations";
import type {
  CreateStationPayload,
  CreateStationResponse,
} from "@/lib/interfaces/stations";
import { showSuccess, showError } from "@/lib/utils/error-handler";

// ─── Query Key Factory ────────────────────────────────────────────────────────
// Centralised key factory keeps cache invalidation predictable across the app.

export const stationKeys = {
  all: ["stations"] as const,
  summary: () => [...stationKeys.all, "summary"] as const,
  lists: () => [...stationKeys.all, "list"] as const,
  list: ({
    stationType,
    cursor,
    limit,
    status,
    search
  }: {
    stationType: StationSource;
    status?: boolean;
    cursor?: string | null;
    limit?: number;
    search?: string;
  }) =>
    [...stationKeys.lists(), { stationType, cursor, limit, status, search }] as const,
  details: () => [...stationKeys.all, "detail"] as const,
  detail: (source: StationSource, id: string) =>
    [...stationKeys.details(), source, id] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useStationsSummary() {
  return useQuery({
    queryKey: stationKeys.summary(),
    queryFn: () => fetchStationsSummary(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

interface UseStationsListParams {
  cursor?: string | null;
  limit?: number;
  stationType: StationSource;
  status?: boolean;
  search?: string;
}

export function useStationsList({
  cursor,
  limit,
  stationType,
  status,
  search,
}: UseStationsListParams) {
  return useQuery({
    queryKey: stationKeys.list({
    //   badge,
      cursor,
      limit,
      stationType,
      status,
      search,
    }),

    queryFn: () =>
      fetchStations({
        // badge,
        cursor,
        limit,
        stationType,
        status,
        search,
      }),

    staleTime: 30_000,
    refetchInterval: 60_000,

    // keeps previous page while next page loads
    placeholderData: (previousData) => previousData,
  });
}

export function useStationDetail(source: StationSource, id: string) {
  return useQuery({
    queryKey: stationKeys.detail(source, id),
    queryFn: () => fetchStationDetail(source, id),
    enabled: Boolean(source && id),
    staleTime: 30_000,
  });
}

interface UseCreateStationOptions {
  onSuccess?: (data: CreateStationResponse) => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
}

export const useCreateStation = (options?: UseCreateStationOptions) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<CreateStationResponse, Error, CreateStationPayload>({
    mutationFn: createStation,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stationKeys.summary() });

      showSuccess(data.message || "Station created successfully!");
      options?.onSuccess?.(data);

      router.push(options?.redirectTo ?? "/dashboard/stations/cng-conversion");
    },

    onError: (error) => {
      showError(error.message);
      options?.onError?.(error);
    },
  });
};