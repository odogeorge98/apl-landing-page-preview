export interface StatisticItem {
  value: number;
  change: number;
  isPositive: boolean;
}

export interface DashboardKpiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: DashboardKpi;
}

export interface DashboardKpi {
  ongoingTrips: number;
  activeDrivers: number;
  activeUsers: number;
  pendingDisputes?: number;
  pendingPayouts?: number;
}
export interface DashboardStatistics {
  totalOrganizationsOnboarded: StatisticItem;
  totalSubscriptions: StatisticItem;
  meetingsScheduled: StatisticItem;
  paymentsCollected: StatisticItem;
}

export interface DashboardStatisticsResponse {
  status: string;
  statusCode: number;
  message: string;
  data: DashboardStatistics;
}

export interface LeadQualificationFunnel {
  usersInteracted: number;
  completedChats: number;
  qualifiedLeads: number;
  meetingsBooked: number;
}

export interface SubscriptionBreakdownItem {
  tier: string;
  count: number;
  percentage: number;
}

export interface SubscriptionBreakdown {
  active: SubscriptionBreakdownItem[];
  ended: SubscriptionBreakdownItem;
}

export interface DashboardAnalytics {
  leadQualificationFunnel: LeadQualificationFunnel;
  subscriptionBreakdown: SubscriptionBreakdown;
}

export interface DashboardAnalyticsResponse {
  status: string;
  statusCode: number;
  message: string;
  data: DashboardAnalytics;
}


export interface DashboardOverview {
  totalAdmins: number;
  activeAdmins: number;
  totalStudents: number;
  activeStudents: number;
  totalTutors: number;
  activeTutors: number;
  totalProgrammes: number;
}

export type DashboardUserRole = "ADMIN" | "TUTOR" | "STUDENT";

export interface RecentDashboardUser {
  id: string;
  name: string;
  email: string;
  role: DashboardUserRole;
  isActive: boolean;
  createdAt: string;
}

export interface ProgrammeOverview {
  id: string;
  name: string;
  studentCount: number;
}

export interface AdminDashboardData {
  overview: DashboardOverview;
  recentStudents: RecentDashboardUser[];
  recentTutors: RecentDashboardUser[];
  programmeOverview: ProgrammeOverview[];
}

export interface AdminDashboardApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: AdminDashboardData;
}
