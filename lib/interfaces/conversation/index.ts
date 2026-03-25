export interface Conversation {
  id: string;
  date: string;
  leadEmail: string;
  qualificationStatus: string;
  meetingStatus: string;
  leadScore: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ConversationsResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    conversations: Conversation[];
    pagination: Pagination;
  };
}
