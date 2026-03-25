import { useQuery } from "@tanstack/react-query";
import { fetchConversations } from "@/lib/api/conversation";
import { ConversationsResponse } from "@/lib/interfaces/conversation";

interface UseConversationsParams {
  page?: number;
  limit?: number;
  search?: string;
  qualificationStatus?: string;
  meetingStatus?: string;
}

export const useConversations = (params?: UseConversationsParams) => {
  return useQuery<ConversationsResponse, Error>({
    queryKey: [
      "conversations",
      params?.page,
      params?.limit,
      params?.search,
      params?.qualificationStatus,
      params?.meetingStatus,
    ],
    queryFn: () => fetchConversations(params),
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
