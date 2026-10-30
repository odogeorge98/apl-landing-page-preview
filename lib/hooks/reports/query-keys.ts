import type { GetStudentReportsParams } from "@/lib/interfaces/reports";

export const studentReportsQueryKeys = {
  all: ["student", "reports"] as const,
  lists: () => [...studentReportsQueryKeys.all, "list"] as const,
  list: (params: Omit<GetStudentReportsParams, "cursor">) =>
    [...studentReportsQueryKeys.lists(), params] as const,
  dashboards: () => [...studentReportsQueryKeys.all, "dashboard"] as const,
  dashboard: (programmeId: string) =>
    [...studentReportsQueryKeys.dashboards(), programmeId] as const,
};
