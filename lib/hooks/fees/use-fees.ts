import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFees, updateFee, deleteFee }  from "@/lib/api/fees";
import { showSuccess, showError } from "@/lib/utils/error-handler";
import type { UpdateFeePayload }  from "@/lib/interfaces/fees";

const feeKeys = {
  all:  ["fees"] as const,
  list: () => [...feeKeys.all, "list"] as const,
};

export function useFeesList() {
  return useQuery({
    queryKey:  feeKeys.list(),
    queryFn:   fetchFees,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFeePayload }) =>
      updateFee(id, payload),
    onSuccess: (_data, { id }) => {
      showSuccess("Fee updated successfully.");
      // Invalidate so the list refreshes with server values
      queryClient.invalidateQueries({ queryKey: feeKeys.list() });
    },
    onError: (err: Error) => {
      showError(err.message || "Failed to update fee.");
    },
  });
}

export function useDeleteFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFee(id),
    onSuccess: () => {
      showSuccess("Ride class deleted.");
      queryClient.invalidateQueries({ queryKey: feeKeys.list() });
    },
    onError: (err: Error) => {
      showError(err.message || "Failed to delete ride class.");
    },
  });
}