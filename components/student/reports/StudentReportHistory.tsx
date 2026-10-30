"use client";

import { AlertCircle, ArrowDown, CalendarDays, ChevronRight, MessageSquareText } from "lucide-react";
import type { StudentReport } from "@/lib/interfaces/reports";

function formatReportDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusLabel(status: string): string {
  return status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

type StudentReportHistoryProps = {
  reports: StudentReport[];
  onOpen: (report: StudentReport) => void;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

export function StudentReportHistory({
  reports,
  onOpen,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: StudentReportHistoryProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]" aria-labelledby="reports-history-title">
      <div className="border-b border-[#edf0f6] px-5 py-4">
        <h2 id="reports-history-title" className="font-bold text-[#101d49]">Report history</h2>
        <p className="mt-0.5 text-xs text-[#8995aa]">Your saved and submitted daily reports</p>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5" role="status" aria-label="Loading report history">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="animate-pulse border-b border-[#f0f2f7] pb-3 last:border-0">
              <div className="h-4 w-36 rounded bg-[#edf0f6]" />
              <div className="mt-2 h-3 w-3/4 rounded bg-[#f2f4f8]" />
            </div>
          ))}
        </div>
      ) : isError && reports.length === 0 ? (
        <div className="px-5 py-8 text-center" role="alert">
          <AlertCircle size={22} className="mx-auto text-red-600" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-[#101d49]">Could not load reports</p>
          <p className="mt-1 text-sm text-[#64718a]">{errorMessage || "Try again in a moment."}</p>
          <button type="button" onClick={onRetry} className="mt-4 rounded-lg bg-[#101d49] px-3.5 py-2 text-sm font-semibold text-white">Try again</button>
        </div>
      ) : reports.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-[#f3f5f9] text-[#64718a]"><CalendarDays size={20} aria-hidden="true" /></span>
          <p className="mt-3 text-sm font-semibold text-[#101d49]">No earlier reports</p>
          <p className="mt-1 text-sm text-[#64718a]">Reports for this programme will appear here.</p>
        </div>
      ) : (
        <>
          {isError && <p role="status" className="border-b border-amber-100 bg-amber-50 px-5 py-2.5 text-xs text-amber-900">Showing saved results; the latest refresh failed.</p>}
          <ul className="divide-y divide-[#f0f2f7]">
            {reports.map((report) => {
              const accomplishments = report.accomplishments.map((item) => item.trim()).filter(Boolean).join(" · ");
              return (
                <li key={report.id}>
                  <button type="button" onClick={() => onOpen(report)} className="group relative flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[#f8faff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f5c542]">
                    <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] origin-center scale-y-0 rounded-r-full bg-[#f5c542] transition-transform duration-200 group-hover:scale-y-100 motion-reduce:transition-none" />
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]"><CalendarDays size={17} aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[#101d49]">{formatReportDate(report.reportDate)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${report.status === "DRAFT" ? "bg-[#fff6d8] text-[#8a6500]" : report.status === "REVIEWED" ? "bg-emerald-50 text-emerald-700" : "bg-[#edf1f8] text-[#53627b]"}`}>
                          {statusLabel(report.status)}
                        </span>
                      </span>
                      <span className="mt-1 block line-clamp-2 text-[13px] leading-5 text-[#64718a]">{accomplishments || "No accomplishments added."}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-[#718099]">
                        {report.blockerDescription && <span className="inline-flex items-center gap-1"><AlertCircle size={12} aria-hidden="true" /> Blocker reported</span>}
                        <span className="inline-flex items-center gap-1"><MessageSquareText size={12} aria-hidden="true" /> {report.feedbackCount} feedback messages</span>
                      </span>
                    </span>
                    <ChevronRight size={16} aria-hidden="true" className="mt-1 shrink-0 text-[#aab4c5] transition-transform group-hover:translate-x-0.5 group-hover:text-[#101d49] motion-reduce:transition-none" />
                  </button>
                </li>
              );
            })}
          </ul>
          {hasNextPage && (
            <div className="border-t border-[#edf0f6] p-4 text-center">
              <button type="button" onClick={onLoadMore} disabled={isFetchingNextPage} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dce3ef] bg-white px-4 text-sm font-semibold text-[#34415e] transition hover:border-[#c3cddf] hover:bg-[#f8f9fc] disabled:cursor-wait disabled:opacity-60">
                <ArrowDown size={15} className={isFetchingNextPage ? "animate-bounce" : ""} aria-hidden="true" />
                {isFetchingNextPage ? "Loading reports…" : "Load more reports"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
