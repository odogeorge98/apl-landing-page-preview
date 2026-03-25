import { useQuery } from "@tanstack/react-query";
import { fetchSubscriptions, fetchOrganizationSubscriptions } from "@/lib/api/subscription";
import { SubscriptionsResponse } from "@/lib/interfaces/subscription";

interface UseSubscriptionsParams {
  page?: number;
  limit?: number;
  status?: string;
  subscriptionType?: string;
  month?: number;
  year?: number;
  search?: string;
}

export const useSubscriptions = (params?: UseSubscriptionsParams) => {
  return useQuery<SubscriptionsResponse, Error>({
    queryKey: [
      "subscriptions",
      params?.page,
      params?.limit,
      params?.status,
      params?.subscriptionType,
      params?.month,
      params?.year,
      params?.search,
    ],
    queryFn: () => fetchSubscriptions(params),
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

export const useOrganizationSubscriptions = (
  organizationId: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery<SubscriptionsResponse, Error>({
    queryKey: [
      "organization-subscriptions",
      organizationId,
      params?.page,
      params?.limit,
    ],
    queryFn: () => fetchOrganizationSubscriptions(organizationId, params),
    enabled: !!organizationId,
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
