"use client";

import { useState, type KeyboardEvent } from "react";
import { AlertCircle, CheckCircle2, Clock3, Loader2, MessageSquareText, Send } from "lucide-react";
import { darkButtonClass, inputClass } from "@/components/admin/shared/admin-ui";
import { cn } from "@/lib/utils";
import type { StudentReport } from "@/lib/interfaces/reports";

function formatReportDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}

function formatTimestamp(value: string | null): string {
  if (!value || !Number.isFinite(Date.parse(value))) return "Not available";
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusLabel(status: string): string {
  return status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

type StudentReportDetailsProps = {
  report: StudentReport;
  onSendFeedback?: (message: string) => Promise<void>;
  sendingFeedback?: boolean;
  compact?: boolean;
};

export function StudentReportDetails({ report, onSendFeedback, sendingFeedback = false, compact = false }: StudentReportDetailsProps) {
  const [message, setMessage] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const isDraft = report.status === "DRAFT";
  const blocker = report.blockerDescription?.trim() ?? "";

  const send = async () => {
    if (!onSendFeedback || sendingFeedback) return;
    const trimmed = message.trim();
    if (!trimmed) {
      setFeedbackError("Write a message before sending.");
      return;
    }
    if (trimmed.length > 5000) {
      setFeedbackError("Feedback must be 5,000 characters or fewer.");
      return;
    }
    setFeedbackError(null);
    try {
      await onSendFeedback(trimmed);
      setMessage("");
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "Your message could not be sent. Try again.");
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void send();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {!compact && <p className="text-sm font-semibold text-[#101d49]">{formatReportDate(report.reportDate)}</p>}
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-[#8995aa]"><Clock3 size={13} aria-hidden="true" /> {isDraft ? "Last saved" : "Submitted"} {formatTimestamp(isDraft ? report.updatedAt : report.submittedAt)}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isDraft ? "bg-[#fff6d8] text-[#8a6500]" : report.status === "REVIEWED" ? "bg-emerald-50 text-emerald-700" : "bg-[#edf1f8] text-[#53627b]"}`}>
          {statusLabel(report.status)}
        </span>
      </div>

      <section aria-labelledby={`${report.id}-accomplishments`}>
        <h3 id={`${report.id}-accomplishments`} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8995aa]"><span className="h-px w-4 bg-[#f5c542]" aria-hidden="true" /> What I accomplished</h3>
        {report.accomplishments.length ? (
          <ul className="mt-3 space-y-2">
            {report.accomplishments.map((item, index) => <li key={`${index}-${item}`} className="flex gap-2.5 text-[15px] leading-6 text-[#17233f]"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#c59400]" aria-hidden="true" /><span className="whitespace-pre-wrap">{item}</span></li>)}
          </ul>
        ) : <p className="mt-3 text-sm text-[#8995aa]">No accomplishments were added.</p>}
      </section>

      <section aria-labelledby={`${report.id}-blockers`}>
        <h3 id={`${report.id}-blockers`} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8995aa]"><span className="h-px w-4 bg-[#f5c542]" aria-hidden="true" /> Problems &amp; blockers</h3>
        {blocker ? (
          <div className={`mt-3 rounded-xl border-l-4 px-5 py-4 ${report.problemStatus === "RESOLVED" ? "border-emerald-400 bg-emerald-50/60" : "border-[#e8a317] bg-[#fff8e6]"}`}>
            <p className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${report.problemStatus === "RESOLVED" ? "text-emerald-700" : "text-[#9a6700]"}`}>
              {report.problemStatus === "RESOLVED" ? <CheckCircle2 size={14} aria-hidden="true" /> : <AlertCircle size={14} aria-hidden="true" />}
              {report.problemStatus ? statusLabel(report.problemStatus) : "Needs follow-up"}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-[#3b2f12]">{blocker}</p>
          </div>
        ) : report.noProblemsToday ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-[#64718a]"><CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" /> No problems reported.</p>
        ) : (
          <p className="mt-3 text-sm text-[#8995aa]">No blocker details were provided.</p>
        )}
      </section>

      {report.tutor?.name && <p className="text-xs text-[#8995aa]">Assigned tutor: <span className="font-semibold text-[#52627f]">{report.tutor.name}</span></p>}

      {onSendFeedback && !isDraft && (
        <section className="border-t border-[#edf0f6] pt-5" aria-labelledby={`${report.id}-feedback`}>
          <div className="flex items-center justify-between gap-3">
            <h3 id={`${report.id}-feedback`} className="inline-flex items-center gap-2 text-sm font-bold text-[#101d49]"><MessageSquareText size={16} aria-hidden="true" /> Feedback</h3>
            <span className="text-xs text-[#8995aa]">{report.feedbackCount} message{report.feedbackCount === 1 ? "" : "s"} recorded</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-[#8995aa]">Send a note about this report. The conversation history is not available in this view yet.</p>
          <div className="mt-3 rounded-xl border border-[#dce3ef] bg-white transition-[border-color,box-shadow] focus-within:border-[#f5c542] focus-within:ring-2 focus-within:ring-[#f5c542]/20">
            <label htmlFor={`${report.id}-feedback-message`} className="sr-only">Feedback message</label>
            <textarea id={`${report.id}-feedback-message`} rows={3} maxLength={5000} value={message} onChange={(event) => { setMessage(event.target.value); setFeedbackError(null); }} onKeyDown={onKeyDown} placeholder="Write a message for your tutor…" className={cn(inputClass, "resize-y border-0 bg-transparent py-3 leading-6 focus:ring-0")} />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#f0f2f7] px-3 py-2">
              <span className="text-[11px] text-[#8995aa]">{message.length}/5000</span>
              <button type="button" onClick={() => void send()} disabled={sendingFeedback || !message.trim()} className={cn(darkButtonClass, "min-h-9 px-3.5")}>
                {sendingFeedback ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Send size={14} aria-hidden="true" />}
                {sendingFeedback ? "Sending…" : "Send message"}
              </button>
            </div>
          </div>
          {feedbackError && <p role="alert" className="mt-2 text-xs font-medium text-red-700">{feedbackError}</p>}
        </section>
      )}
      {isDraft && <p className="rounded-xl bg-[#f6f8fc] px-4 py-3 text-xs leading-5 text-[#718099]">This report is a draft. It has not been sent to your tutor yet.</p>}
    </div>
  );
}
