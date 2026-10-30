"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  MessageSquareText,
  Send,
} from "lucide-react";

import { ActionMenu } from "@/components/admin/shared/ActionMenu";
import { darkButtonClass, getInitials, inputClass, secondaryButtonClass } from "@/components/admin/shared/admin-ui";
import { ReportStatusBadge } from "@/components/admin/reports/ReportStatusBadge";
import type { AdminReport } from "@/lib/interfaces/reports";
import { cn } from "@/lib/utils";

type ReportReaderProps = {
  report: AdminReport;
  position: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
  onMarkReviewed: () => void;
  isMarkingReviewed: boolean;
  onSendFeedback: (message: string) => Promise<void>;
  isSendingFeedback: boolean;
  onCopy: () => void;
};

function formatReportDate(reportDate: string) {
  const [year, month, day] = reportDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day, 12));
}

function formatTimestamp(value: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Server-backed report reader. It only exposes actions supported by the API. */
export function ReportReader({
  report,
  position,
  total,
  onPrevious,
  onNext,
  onBack,
  onMarkReviewed,
  isMarkingReviewed,
  onSendFeedback,
  isSendingFeedback,
  onCopy,
}: ReportReaderProps) {
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstName = report.student.name.trim().split(/\s+/)[0] || "student";
  const hasBlocker = !report.noProblemsToday && (Boolean(report.blockerDescription?.trim()) || Boolean(report.problemStatus));
  const resolved = report.problemStatus === "RESOLVED" || Boolean(report.resolvedAt);

  useEffect(() => {
    setFeedbackDraft("");
    headingRef.current?.focus({ preventScroll: true });
  }, [report.id]);

  const sendFeedback = async () => {
    const message = feedbackDraft.trim();
    if (!message || isSendingFeedback) return;
    try {
      await onSendFeedback(message);
      setFeedbackDraft("");
    } catch {
      // Keep the message in the editor so the admin can retry after an error.
    }
  };

  const handleComposerKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void sendFeedback();
    }
  };

  return (
    <article className="flex h-full min-h-0 flex-col" aria-labelledby="report-heading">
      <div className="flex items-center gap-2 border-b border-[#edf0f6] px-4 py-3 sm:px-6">
        <button type="button" onClick={onBack} className="-ml-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#34415e] transition-colors hover:bg-[#f1f4fa] hover:text-[#101d49] lg:hidden">
          <ArrowLeft size={16} aria-hidden="true" /> Reports
        </button>
        <p className="hidden text-xs font-medium text-[#8995aa] lg:block">Report {position} of {total}</p>
        <div className="ml-auto flex items-center gap-1">
          <IconButton label="Previous report" onClick={onPrevious} disabled={position <= 1}><ChevronUp size={17} aria-hidden="true" /></IconButton>
          <IconButton label="Next report" onClick={onNext} disabled={position >= total}><ChevronDown size={17} aria-hidden="true" /></IconButton>
          <span className="mx-1 h-5 w-px bg-[#e4e9f2]" aria-hidden="true" />
          <ActionMenu label="More report actions" items={[{ label: "Copy report text", icon: Copy, onSelect: onCopy }]} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-8 sm:py-8">
          <header className="flex flex-wrap items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#101d49] text-sm font-bold text-[#f5c542]">{getInitials(report.student.name)}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="report-heading" ref={headingRef} tabIndex={-1} className="text-xl font-bold text-[#101d49] outline-none">{report.student.name}</h2>
                <ReportStatusBadge status={report.status} />
              </div>
              <p className="mt-1 text-sm text-[#64718a]">{report.programme.name}<span aria-hidden="true"> · </span>Tutor: {report.tutor.name}</p>
              <p className="mt-1 text-xs text-[#8995aa]">{formatReportDate(report.reportDate)}{report.submittedAt ? ` · submitted ${formatTimestamp(report.submittedAt)}` : ""}</p>
            </div>
            <div className="rounded-xl bg-[#f6f8fc] px-3 py-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#8995aa]">Feedback</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-[#101d49]">{report.feedbackCount}</p>
            </div>
          </header>

          <section className="mt-8" aria-labelledby="accomplished-heading">
            <h3 id="accomplished-heading" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8995aa]"><span className="h-px w-4 bg-[#f5c542]" aria-hidden="true" />Accomplished today</h3>
            {report.accomplishments.length ? (
              <ul className="mt-3 space-y-2 text-[15px] leading-7 text-[#17233f]">
                {report.accomplishments.map((item, index) => <li key={`${index}-${item}`} className="flex gap-3"><span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-[#c59400]" aria-hidden="true" /><span className="whitespace-pre-line">{item}</span></li>)}
              </ul>
            ) : <p className="mt-3 text-sm text-[#8995aa]">No accomplishments were included in this report.</p>}
          </section>

          <section className="mt-8" aria-labelledby="problems-heading">
            <h3 id="problems-heading" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8995aa]"><span className="h-px w-4 bg-[#f5c542]" aria-hidden="true" />Problems &amp; blockers</h3>
            {hasBlocker ? (
              <div className={cn("mt-3 rounded-xl border-l-4 px-5 py-4", resolved ? "border-emerald-400 bg-emerald-50/60" : "border-[#e8a317] bg-[#fff8e6]")}>
                <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide", resolved ? "text-emerald-700" : "text-[#9a6700]")}>
                  {resolved ? <CheckCircle2 size={14} aria-hidden="true" /> : <AlertTriangle size={14} aria-hidden="true" />}
                  {resolved ? "Resolved" : report.problemStatus === "IN_PROGRESS" ? "In progress" : "Needs follow-up"}
                </span>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#3b2f12]">{report.blockerDescription?.trim() || "No blocker details were provided."}</p>
                {resolved && report.resolvedAt && <p className="mt-3 text-xs font-medium text-emerald-700">Resolved {formatTimestamp(report.resolvedAt)}</p>}
              </div>
            ) : (
              <p className="mt-3 flex items-center gap-2 text-sm text-[#64718a]"><CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" />{report.noProblemsToday ? "No problems reported today." : "No blocker details were provided."}</p>
            )}
          </section>

          <section className="mt-10 border-t border-[#edf0f6] pt-6" aria-labelledby="feedback-heading">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]"><MessageSquareText size={17} aria-hidden="true" /></span>
              <div>
                <h3 id="feedback-heading" className="text-sm font-bold text-[#101d49]">Send feedback</h3>
                <p className="mt-1 text-xs leading-5 text-[#8995aa]">The service reports {report.feedbackCount} feedback message{report.feedbackCount === 1 ? "" : "s"}. Conversation history is not available in the current API.</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-[#dce3ef] bg-white transition-[border-color,box-shadow] duration-200 focus-within:border-[#f5c542] focus-within:ring-2 focus-within:ring-[#f5c542]/20 hover:border-[#c3cddf]">
              <label htmlFor={`report-feedback-${report.id}`} className="sr-only">Feedback for {firstName}</label>
              <textarea id={`report-feedback-${report.id}`} rows={3} maxLength={5000} value={feedbackDraft} onChange={(event) => setFeedbackDraft(event.target.value)} onKeyDown={handleComposerKey} placeholder={`Write feedback for ${firstName}…`} className={cn(inputClass, "resize-none border-0 bg-transparent py-3 leading-6 focus:ring-0")} />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#f0f2f7] px-3 py-2">
                <p className="text-[11px] text-[#8995aa]"><kbd className="font-sans">Ctrl</kbd>+<kbd className="font-sans">Enter</kbd> to send · {feedbackDraft.length}/5000</p>
                <button type="button" onClick={() => void sendFeedback()} disabled={!feedbackDraft.trim() || isSendingFeedback} aria-busy={isSendingFeedback} className={cn(darkButtonClass, "ml-auto min-h-9 px-3.5 disabled:cursor-not-allowed disabled:opacity-50")}>
                  {isSendingFeedback ? <><span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" /> Sending…</> : <><Send size={14} aria-hidden="true" /> Send feedback</>}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f6] bg-[#fafbfd] px-4 py-3 sm:px-6">
        {report.status === "REVIEWED" ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 size={16} aria-hidden="true" />Reviewed{report.reviewedAt ? ` · ${formatTimestamp(report.reviewedAt)}` : ""}</p>
        ) : <p className="text-sm text-[#64718a]">This report has not been reviewed.</p>}
        {report.status !== "REVIEWED" && <button type="button" onClick={onMarkReviewed} disabled={isMarkingReviewed} aria-busy={isMarkingReviewed} className={cn(secondaryButtonClass, "min-h-9 disabled:cursor-not-allowed disabled:opacity-55")}>{isMarkingReviewed ? <><span className="size-3.5 animate-spin rounded-full border-2 border-[#101d49]/25 border-t-[#101d49]" aria-hidden="true" /> Saving…</> : <><CheckCircle2 size={15} aria-hidden="true" /> Mark as reviewed</>}</button>}
      </div>
    </article>
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="rounded-lg p-2 text-[#64718a] transition-colors duration-150 hover:bg-[#eef1f7] hover:text-[#101d49] disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]">{children}</button>;
}
