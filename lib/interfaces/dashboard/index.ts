export interface StatisticItem {
  value: number;
  change: number;
  isPositive: boolean;
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
