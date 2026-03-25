export type FeedbackType = 'FEATURE_REQUEST' | 'BUG_REPORT' | 'GENERAL_FEEDBACK' | 'OTHER';

export interface Organization {
  id: string;
  name: string;
  email: string;
}

export interface Feedback {
  id: string;
  feedbackType: FeedbackType | string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  organization: Organization;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FeedbacksResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    feedbacks: Feedback[];
    pagination: Pagination;
  };
}
