import type {
  GetAdminReportSummaryParams,
  GetAdminReportsParams,
  GetStudentReportsParams,
} from "@/lib/interfaces/reports";

export const studentReportsQueryKeys = {
  all: ["student", "reports"] as const,
  lists: () => [...studentReportsQueryKeys.all, "list"] as const,
  list: (params: Omit<GetStudentReportsParams, "cursor">) =>
    [...studentReportsQueryKeys.lists(), params] as const,
  dashboards: () => [...studentReportsQueryKeys.all, "dashboard"] as const,
  dashboard: (programmeId: string) =>
    [...studentReportsQueryKeys.dashboards(), programmeId] as const,
  dailyCheck: () => [...studentReportsQueryKeys.all, "daily-check"] as const,
};

export type AdminReportsListFilters = Omit<GetAdminReportsParams, "cursor">;

/** Isolated key namespace for the admin inbox and its date-window summary. */
export const adminReportsQueryKeys = {
  all: ["admin", "reports"] as const,
  lists: () => [...adminReportsQueryKeys.all, "list"] as const,
  list: (params: AdminReportsListFilters) =>
    [...adminReportsQueryKeys.lists(), params] as const,
  summaries: () => [...adminReportsQueryKeys.all, "summary"] as const,
  summary: (params: GetAdminReportSummaryParams) =>
    [...adminReportsQueryKeys.summaries(), params] as const,
};
