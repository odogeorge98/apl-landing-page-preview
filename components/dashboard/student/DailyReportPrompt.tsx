"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, NotebookPen, RefreshCw } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/auth/use-current-user";
import { useStudentDailyReportCheck } from "@/lib/hooks/reports/use-student-daily-report-check";
import { UserType } from "@/lib/types/users";
import { cn } from "@/lib/utils";

/** Shows the daily-report prompt only when the server says a report is due. */
export function DailyReportPrompt() {
  const { isInitialized, isAuthenticated, user } = useCurrentUser();
  const isStudent = isInitialized && isAuthenticated && user?.role === UserType.STUDENT;
  const dailyCheck = useStudentDailyReportCheck({ enabled: isStudent });

  // Avoid a misleading flash before the server has answered.
  if (!isStudent || dailyCheck.isLoading || dailyCheck.isPending) return null;

  if (dailyCheck.isError) {
    return (
      <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="inline-flex items-center gap-2"><AlertCircle size={16} aria-hidden="true" /> We couldn&apos;t check whether today&apos;s report is due.</p>
        <button type="button" onClick={() => void dailyCheck.refetch()} disabled={dailyCheck.isFetching} className="inline-flex items-center gap-1.5 font-semibold hover:underline disabled:opacity-60">
          {dailyCheck.isFetching ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <RefreshCw size={14} aria-hidden="true" />}
          Try again
        </button>
      </div>
    );
  }

  if (dailyCheck.data !== true) return null;

  return (
    <Link
      href="/student/reports"
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[#f5c542]/60 bg-white px-5 py-4 transition-[border-color,box-shadow] duration-200 hover:border-[#f5c542] hover:shadow-[0_14px_32px_-16px_rgba(197,148,0,0.45)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#101d49]/10",
      )}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#f5c542]" />
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff6d8] text-[#765800] transition-colors duration-200 group-hover:bg-[#f5c542] group-hover:text-[#101d49]">
        <NotebookPen size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-[#101d49]">Today&apos;s report isn&apos;t in yet</span>
        <span className="mt-0.5 block text-sm text-[#718099]">Take two minutes to share what you got done and anything that got in your way.</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#f5c542] px-3.5 py-2 text-sm font-semibold text-[#101d49] transition-shadow group-hover:shadow-[0_8px_18px_-8px_rgba(197,148,0,0.8)]">
        <span className="hidden sm:inline">Write today&apos;s report</span>
        <ArrowRight size={15} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </span>
    </Link>
  );
}
