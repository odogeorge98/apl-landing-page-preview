import { useQuery } from "@tanstack/react-query";
import { fetchFeedbacks } from "@/lib/api/feedback";
import { FeedbacksResponse } from "@/lib/interfaces/feedback";

interface UseFeedbacksParams {
  page?: number;
  limit?: number;
  search?: string;
  feedbackType?: string;
}

export const useFeedbacks = (params?: UseFeedbacksParams) => {
  return useQuery<FeedbacksResponse, Error>({
    queryKey: [
      "feedbacks",
      params?.page,
      params?.limit,
      params?.search,
      params?.feedbackType,
    ],
    queryFn: () => fetchFeedbacks(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error instanceof Error && "status" in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};
