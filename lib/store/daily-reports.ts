import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  getRosterMember,
  getSupervisor,
  isoDay,
  mockDailyReports,
  type DailyReport,
} from "@/lib/mock/admin-daily-reports";

/**
 * Client store for daily reports, shared by the student/intern report page
 * and the admin Reports inbox.
 *
 * Sharing one store means a report submitted on /student/reports appears in
 * the admin inbox straight away in the same browser session, which is handy
 * for demos. In production this whole store is replaced by API calls
 * (React Query) and the server becomes the single source of truth:
 *   - reports       → GET  /daily-reports        (admin: all, student: own)
 *   - submitReport  → POST /daily-reports
 *   - updateReport  → PATCH /daily-reports/:id   (only while unread)
 *   - addReply      → POST /daily-reports/:id/replies
 *
 * Only the student's unsent *draft* is persisted (localStorage), so a
 * half-written report survives a refresh. Reports themselves are not
 * persisted: they reset to the mock data on reload.
 */

export type ReportDraft = {
  accomplishments: string;
  problems: string;
  /** Learner ticked "No problems today". */
  noProblems: boolean;
  /** ISO timestamp of the last autosave, for the "Draft saved" hint. */
  savedAt?: string;
};

type DailyReportsState = {
  reports: DailyReport[];
  /** Drafts keyed by author ID, so shared devices don't mix drafts up. */
  drafts: Record<string, ReportDraft>;

  /** Admin-style bulk update; accepts a value or an updater. */
  setReports: (next: DailyReport[] | ((previous: DailyReport[]) => DailyReport[])) => void;
  /** Create today's report for a learner. Returns the new report. */
  submitReport: (authorId: string, content: { accomplishments: string; problems: string }) => DailyReport;
  /** Edit a report's text (the UI only allows this while it is unread). */
  updateReport: (id: string, content: { accomplishments: string; problems: string }) => void;
  addReply: (id: string, author: string, body: string) => void;
  saveDraft: (authorId: string, draft: Omit<ReportDraft, "savedAt">) => void;
  clearDraft: (authorId: string) => void;
};

export const useDailyReportsStore = create<DailyReportsState>()(
  persist(
    (set) => ({
      reports: mockDailyReports,
      drafts: {},

      setReports: (next) =>
        set((state) => ({ reports: typeof next === "function" ? next(state.reports) : next })),

      submitReport: (authorId, { accomplishments, problems }) => {
        const member = getRosterMember(authorId);
        const report: DailyReport = {
          id: `R-${Date.now()}`,
          authorId,
          authorName: member?.name ?? "Unknown learner",
          authorEmail: member?.email ?? "",
          reporterType: member?.reporterType ?? "Student",
          team: member?.team ?? "—",
          supervisor: getSupervisor(member?.team ?? ""),
          reportDate: isoDay(0),
          submittedAt: new Date().toISOString(),
          accomplishments,
          problems,
          status: "Unread",
          problemStatus: problems.trim() ? "Open" : undefined,
          replies: [],
        };
        set((state) => ({ reports: [report, ...state.reports] }));
        return report;
      },

      updateReport: (id, { accomplishments, problems }) =>
        set((state) => ({
          reports: state.reports.map((report) =>
            report.id === id
              ? {
                  ...report,
                  accomplishments,
                  problems,
                  problemStatus: problems.trim() ? report.problemStatus ?? "Open" : undefined,
                }
              : report,
          ),
        })),

      addReply: (id, author, body) =>
        set((state) => ({
          reports: state.reports.map((report) =>
            report.id === id
              ? {
                  ...report,
                  replies: [...report.replies, { id: `RP-${Date.now()}`, author, body, createdAt: new Date().toISOString() }],
                }
              : report,
          ),
        })),

      saveDraft: (authorId, draft) =>
        set((state) => ({ drafts: { ...state.drafts, [authorId]: { ...draft, savedAt: new Date().toISOString() } } })),

      clearDraft: (authorId) =>
        set((state) => {
          const drafts = { ...state.drafts };
          delete drafts[authorId];
          return { drafts };
        }),
    }),
    {
      name: "nugi-daily-report-drafts",
      partialize: (state) => ({ drafts: state.drafts }),
      // Rehydrated on mount by the report page, avoiding SSR hydration mismatches.
      skipHydration: true,
    },
  ),
);
