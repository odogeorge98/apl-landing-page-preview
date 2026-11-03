"use client";

import { AlertTriangle, CheckCircle2, ChevronRight, MessageSquare, MinusCircle } from "lucide-react";

import { dayLabel, preview } from "@/components/admin/reports/report-utils";
import type { DailyReport } from "@/lib/mock/admin-daily-reports";
import { cn } from "@/lib/utils";
import { recentWorkingDays } from "./report-stats";

type ReportHistoryProps = {
  /** The learner's own reports (any order). Today's report is excluded here. */
  reports: DailyReport[];
  onOpen: (report: DailyReport) => void;
  /** How many calendar days back to show. */
  days?: number;
};

const STATUS_LABEL: Record<DailyReport["status"], string> = {
  Unread: "Sent",
  Read: "Seen",
  Reviewed: "Reviewed",
};

/**
 * The learner's recent reports, newest first, with *missed working days*
 * shown in place, so gaps are visible without being preachy. Each report
 * opens in a drawer with its feedback.
 */
export function ReportHistory({ reports, onOpen, days = 14 }: ReportHistoryProps) {
  const byDate = new Map(reports.map((report) => [report.reportDate, report]));
  const rows = recentWorkingDays(days).map((date) => ({ date, report: byDate.get(date) }));

  if (!rows.length) {
    return <p className="px-5 py-8 text-center text-sm text-[#8995aa]">Your past reports will appear here.</p>;
  }

  return (
    <ul className="divide-y divide-[#f0f2f7]">
      {rows.map(({ date, report }) =>
        report ? (
          <li key={date}>
            <button
              type="button"
              onClick={() => onOpen(report)}
              className="group relative flex w-full items-start gap-3 px-5 py-3.5 text-left outline-none transition-colors duration-150 hover:bg-[#f8faff] focus-visible:bg-[#f4f7ff]"
            >
              {/* Gold edge on hover, matching the admin inbox. */}
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] origin-center scale-y-0 rounded-r-full bg-[#f5c542] transition-transform duration-200 group-hover:scale-y-100 motion-reduce:transition-none" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[#101d49]">{dayLabel(date)}</span>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                      report.status === "Reviewed" ? "bg-emerald-50 text-emerald-700" : "bg-[#f1f4f9] text-[#64718a]",
                    )}
                  >
                    {STATUS_LABEL[report.status]}
                  </span>
                </span>
                <span className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#64718a]">{preview(report.accomplishments, 110)}</span>
                <span className="mt-1.5 flex flex-wrap gap-3 text-[11px] font-semibold">
                  {report.problems.trim() &&
                    (report.problemStatus === "Resolved" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 size={12} aria-hidden="true" /> Problem resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#9a6700]">
                        <AlertTriangle size={12} aria-hidden="true" /> Problem open
                      </span>
                    ))}
                  {report.replies.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[#2a3f86]">
                      <MessageSquare size={12} aria-hidden="true" /> {report.replies.length} feedback
                    </span>
                  )}
                </span>
              </span>
              <ChevronRight size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[#c3cad8] transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-[#101d49] motion-reduce:transition-none" />
            </button>
          </li>
        ) : (
          <li key={date} className="flex items-center gap-3 px-5 py-3">
            <span className="flex-1 text-sm text-[#8995aa]">{dayLabel(date)}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#b3474a]">
              <MinusCircle size={12} aria-hidden="true" /> No report
            </span>
          </li>
        ),
      )}
    </ul>
  );
}
