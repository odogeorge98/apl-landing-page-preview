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

export interface StudentEnrollmentAnalyticsPeriod {
  fromDate: string;
  toDate: string;
  /** Returned for calendar-year queries; omitted for custom date ranges. */
  year?: number;
}

export interface StudentEnrollmentAnalyticsSummary {
  totalStudents: number;
}

export interface StudentEnrollmentAnalyticsMonth {
  /** Calendar month in YYYY-MM format. */
  month: string;
  newStudents: number;
  cumulativeStudents: number;
}

export interface StudentEnrollmentAnalyticsData {
  period: StudentEnrollmentAnalyticsPeriod;
  summary: StudentEnrollmentAnalyticsSummary;
  series: StudentEnrollmentAnalyticsMonth[];
}

export interface StudentEnrollmentAnalyticsApiResponse {
  status: "success" | "error" | string;
  statusCode: number;
  message: string;
  data: StudentEnrollmentAnalyticsData;
}

export interface GetStudentEnrollmentAnalyticsParams {
  /** Calendar year (2000–2100). Mutually exclusive with fromDate/toDate. */
  year?: number;
  /** Inclusive UTC calendar start date; must be paired with toDate. */
  fromDate?: string;
  /** Inclusive UTC calendar end date; must be paired with fromDate. */
  toDate?: string;
}

export interface StudentDashboardAssignments {
  total: number;
  submitted: number;
  pending: number;
}

export interface StudentDashboardOverview {
  totalProgrammes: number;
  totalProgrammeHours: number;
  lessonsCompleted: number | null;
  assignments: StudentDashboardAssignments;
}

export interface StudentDashboardProgramme {
  id: string;
  name: string;
  description: string;
  hours: number;
}

export interface StudentDashboardData {
  overview: StudentDashboardOverview;
  programmes: StudentDashboardProgramme[];
}

export interface StudentDashboardApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: StudentDashboardData;
}

export interface StudentProgrammeLearningProgress {
  id: string;
  name: string;
  lessonsCompleted: number | null;
  totalLessons: number | null;
  progressPercentage: number | null;
}

export interface StudentLearningProgressData {
  overallProgress: number | null;
  lessonsCompleted: number | null;
  totalLessons: number | null;
  programmes: StudentProgrammeLearningProgress[];
}

export interface StudentLearningProgressApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: StudentLearningProgressData;
}

export interface TutorDashboardOverview {
  totalCourses: number;
  totalStudents: number;
  pendingReviews: number;
  upcomingSessions: number;
}

/** Programme attached to a tutor's course assignment. */
export interface TutorDashboardProgramme {
  id: string;
  name: string;
  description?: string | null;
  hours?: number;
}

/** Supports the current course-assignment response as well as legacy flat fields. */
export interface TutorDashboardCourse {
  id: string;
  tutorId?: string;
  programmeId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  programme?: TutorDashboardProgramme | null;
  /** Flat fields are kept for compatibility with older dashboard responses. */
  name?: string;
  title?: string;
  description?: string | null;
  programmeName?: string | null;
  studentCount?: number;
  totalStudents?: number;
}

export interface TutorDashboardStudent {
  id: string;
  name?: string;
  fullName?: string;
  email?: string;
  photoUrl?: string | null;
  courseName?: string | null;
  programmeName?: string | null;
}

export interface TutorDashboardPendingSubmission {
  id: string;
  title?: string;
  assignmentTitle?: string;
  studentName?: string;
  learnerName?: string;
  courseName?: string | null;
  submittedAt?: string | null;
}

export interface TutorDashboardUpcomingSession {
  id: string;
  title?: string;
  topic?: string;
  courseName?: string | null;
  startsAt?: string | null;
  scheduledAt?: string | null;
  startTime?: string | null;
  date?: string | null;
}

export interface TutorDashboardData {
  overview: TutorDashboardOverview;
  courses: TutorDashboardCourse[];
  students: TutorDashboardStudent[];
  pendingSubmissions: TutorDashboardPendingSubmission[];
  upcomingSessions: TutorDashboardUpcomingSession[];
}

export interface TutorDashboardApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: TutorDashboardData;
}
