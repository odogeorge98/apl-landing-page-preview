export interface OrganizationInviteData {
  email: string;
}

export interface OrganizationInviteResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    email: string;
    status: string;
    invitedBy: string;
    sentDate: string;
    expiryDate: string;
  };
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  orgRole: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REJECTED";
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface InvitationsResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    invitations: Invitation[];
    pagination: Pagination;
  };
}

export interface IModal {
  trigger?: React.ReactNode;
  open?: boolean;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit?: (data: {
    fullName: string;
    email: string;
  }) => void | Promise<void>;
  className?: string;
  handlers?: {
    handleAgentsModal?: () => void;
    handleConfirmationModal?: () => void;
    handleAlertModal?: () => void;
    handleDeleteOrganization?: () => void;
  };
  organizationName?: string;
  isDeleting?: boolean;
}

export interface StatisticItem {
  value: number;
  change: number;
  isPositive: boolean;
}

export interface OrganizationDashboardStatistics {
  totalOrganizationsOnboarded: StatisticItem;
  totalActiveOrganizations: StatisticItem;
  totalInactiveOrganizations: StatisticItem;
}

export interface Organization {
  id: string;
  organizationName: string;
  industry: string;
  subTier: string;
  accountStatus: string;
  onboardedDate: string;
  lastActive: string;
}

export interface OrganizationsDashboardData {
  statistics: OrganizationDashboardStatistics;
  organizations: Organization[];
  pagination: Pagination;
}

export interface OrganizationsDashboardResponse {
  status: string;
  statusCode: number;
  message: string;
  data: OrganizationsDashboardData;
}