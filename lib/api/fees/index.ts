import { http }              from "@/lib/utils/http";
import { handleApiError }    from "@/lib/utils/error-handler";
import { handleApiResponse } from "@/lib/utils/response-handler";
import type {
  FeesListData,
  FeeListResponse,
  UpdateFeePayload,
  UpdateFeeResponse,
} from "@/lib/interfaces/fees";

export async function fetchFees(): Promise<FeeListResponse> {
  try {
    const response = await http.get<FeeListResponse>("/fees");
    return handleApiResponse<FeeListResponse["data"]>(
      response.data,
      "Fees retrieved successfully",
    );
  } catch (error) {
    throw handleApiError(error, "Failed to load fees.");
  }
}

export async function updateFee(
  id: string,
  payload: UpdateFeePayload,
): Promise<UpdateFeeResponse> {
  try {
    const response = await http.patch<UpdateFeeResponse>(`/fees/${id}`, payload);
    return handleApiResponse<UpdateFeeResponse["data"]>(
      response.data,
      "Fee updated successfully",
    );
  } catch (error) {
    throw handleApiError(error, "Failed to update fee.");
  }
}