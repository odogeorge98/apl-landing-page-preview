"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquare, NotebookPen } from "lucide-react";

import { clockTime } from "@/components/admin/reports/report-utils";
import { DEMO_REPORTER_ID, isoDay } from "@/lib/mock/admin-daily-reports";
import { useDailyReportsStore } from "@/lib/store/daily-reports";
import { cn } from "@/lib/utils";

/**
 * Dashboard nudge for the daily report.
 *  - Not submitted yet → gold-edged prompt with "Write today's report".
 *  - Submitted         → quiet confirmation, review state and feedback count.
 *
 * Reads the shared daily-reports store, so it updates the moment the learner
 * submits on /student/reports.
 * TODO(api): replace with `useMyDailyReport(today)` and the session user.
 */
export function DailyReportPrompt() {
  const today = useDailyReportsStore((state) =>
    state.reports.find((report) => report.authorId === DEMO_REPORTER_ID && report.reportDate === isoDay(0)),
  );
  const feedback = today?.replies.length ?? 0;

  return (
    <Link
      href="/student/reports"
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-white px-5 py-4 transition-[border-color,box-shadow] duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#101d49]/10",
        today
          ? "border-[#e4e9f2] hover:border-[#d2dae8] hover:shadow-[0_14px_32px_-16px_rgba(16,29,73,0.22)]"
          : "border-[#f5c542]/60 hover:border-[#f5c542] hover:shadow-[0_14px_32px_-16px_rgba(197,148,0,0.45)]",
      )}
    >
      {!today && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#f5c542]" />}
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
          today ? "bg-emerald-50 text-emerald-700" : "bg-[#fff6d8] text-[#765800] group-hover:bg-[#f5c542] group-hover:text-[#101d49]",
        )}
      >
        {today ? <CheckCircle2 size={21} aria-hidden="true" /> : <NotebookPen size={20} aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-[#101d49]">
          {today ? "Today's report is in" : "Today's report isn't in yet"}
        </span>
        <span className="mt-0.5 block text-sm text-[#718099]">
          {today
            ? `Sent at ${clockTime(today.submittedAt)} · ${today.status === "Reviewed" ? "reviewed" : today.status === "Read" ? "seen by your tutor" : "waiting to be seen"}`
            : "Take two minutes to share what you got done and anything that got in your way."}
        </span>
      </span>
      {today && feedback > 0 && (
        <span className="hidden items-center gap-1 rounded-full bg-[#eaf0ff] px-2.5 py-1 text-xs font-semibold text-[#2a3f86] sm:inline-flex">
          <MessageSquare size={12} aria-hidden="true" /> {feedback} feedback
        </span>
      )}
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold",
          today ? "text-[#64718a] group-hover:text-[#101d49]" : "rounded-xl bg-[#f5c542] px-3.5 py-2 text-[#101d49] transition-shadow group-hover:shadow-[0_8px_18px_-8px_rgba(197,148,0,0.8)]",
        )}
      >
        <span className="hidden sm:inline">{today ? "View" : "Write today's report"}</span>
        <ArrowRight size={15} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </span>
    </Link>
  );
}
