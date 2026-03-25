export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceNaira: number;
  priceUsd: number;
  currency: string;
  duration: number;
}

export interface Organization {
  id: string;
  name: string;
  email: string;
}

export interface Subscription {
  id: string;
  status: string;
  paymentStatus: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  subscriptionPlan: SubscriptionPlan;
  organization: Organization;
  user: any;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SubscriptionsResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    subscriptions: Subscription[];
    pagination: Pagination;
  };
}
