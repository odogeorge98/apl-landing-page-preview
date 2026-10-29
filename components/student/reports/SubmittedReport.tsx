"use client";

import { useState, type KeyboardEvent } from "react";
import { AlertTriangle, CheckCircle2, Eye, Lock, Pencil, Send } from "lucide-react";

import {
  darkButtonClass,
  getInitials,
  inputClass,
  secondaryButtonClass,
} from "@/components/admin/shared/admin-ui";
import { clockTime, longDate, stampLabel } from "@/components/admin/reports/report-utils";
import type { DailyReport } from "@/lib/mock/admin-daily-reports";
import { cn } from "@/lib/utils";

type SubmittedReportProps = {
  report: DailyReport;
  /** Learner's own name, so their replies show as "You". */
  viewerName: string;
  /** Shown only for today's report while the admin hasn't opened it. */
  onEdit?: () => void;
  onReply: (body: string) => void;
  /** Compact mode for the history drawer (no date heading, no lock note). */
  compact?: boolean;
  /** Hide the date line when the surrounding card already shows it. */
  showDate?: boolean;
};

/** Learner-facing wording for the admin's review state. */
const STEPS = [
  { key: "Unread", label: "Sent" },
  { key: "Read", label: "Seen" },
  { key: "Reviewed", label: "Reviewed" },
] as const;

/**
 * A report the learner has already sent: their text as submitted, where it
 * is in review (Sent → Seen → Reviewed), whether their problem was resolved,
 * and the feedback conversation with the admin (they can reply).
 */
export function SubmittedReport({ report, viewerName, onEdit, onReply, compact = false, showDate = true }: SubmittedReportProps) {
  const [draft, setDraft] = useState("");
  const stepIndex = STEPS.findIndex((step) => step.key === report.status);
  const hasProblems = Boolean(report.problems.trim());
  const resolved = report.problemStatus === "Resolved";
  const supervisorFirstName = report.supervisor.split(" ")[0];

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    onReply(body);
    setDraft("");
  };

  const handleKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className="space-y-7">
      {/* ---- Status ------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {!compact && showDate && <p className="text-sm font-semibold text-[#101d49]">{longDate(report.reportDate)}</p>}
          <p className="text-xs text-[#8995aa]">Submitted at {clockTime(report.submittedAt)}</p>
        </div>

        {/* Three-step progress: Sent → Seen → Reviewed */}
        <ol className="flex items-center gap-1.5" aria-label="Review progress">
          {STEPS.map((step, index) => {
            const done = index <= stepIndex;
            return (
              <li key={step.key} className="flex items-center gap-1.5">
                {index > 0 && <span className={cn("h-px w-5 transition-colors duration-500", done ? "bg-[#101d49]" : "bg-[#dce3ef]")} aria-hidden="true" />}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-500",
                    done ? "bg-[#101d49] text-white" : "bg-[#f1f4f9] text-[#8995aa]",
                  )}
                  aria-current={index === stepIndex ? "step" : undefined}
                >
                  {index === 1 && done && <Eye size={11} aria-hidden="true" />}
                  {index === 2 && done && <CheckCircle2 size={11} aria-hidden="true" />}
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ---- Text as submitted -------------------------------------------- */}
      <section aria-labelledby={`${report.id}-acc`}>
        <h3 id={`${report.id}-acc`} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8995aa]">
          <span className="h-px w-4 bg-[#f5c542]" aria-hidden="true" /> What I accomplished
        </h3>
        <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#17233f]">{report.accomplishments}</p>
      </section>

      <section aria-labelledby={`${report.id}-prob`}>
        <h3 id={`${report.id}-prob`} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8995aa]">
          <span className="h-px w-4 bg-[#f5c542]" aria-hidden="true" /> Problems &amp; blockers
        </h3>
        {hasProblems ? (
          <div className={cn("mt-3 rounded-xl border-l-4 px-5 py-4", resolved ? "border-emerald-400 bg-emerald-50/60" : "border-[#e8a317] bg-[#fff8e6]")}>
            <p className={cn("inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide", resolved ? "text-emerald-700" : "text-[#9a6700]")}>
              {resolved ? <CheckCircle2 size={14} aria-hidden="true" /> : <AlertTriangle size={14} aria-hidden="true" />}
              {resolved ? "Marked resolved" : `Waiting for ${supervisorFirstName}`}
            </p>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-[#3b2f12]">{report.problems}</p>
          </div>
        ) : (
          <p className="mt-3 flex items-center gap-2 text-sm text-[#64718a]">
            <CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" /> No problems reported.
          </p>
        )}
      </section>

      {/* ---- Edit (only while unread) -------------------------------------- */}
      {onEdit && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f6f8fc] px-4 py-3">
          <p className="text-sm text-[#52627f]">Forgot something? You can edit this report until it&apos;s been seen.</p>
          <button type="button" onClick={onEdit} className={cn(secondaryButtonClass, "min-h-9")}>
            <Pencil size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:-rotate-12 motion-reduce:transition-none" /> Edit report
          </button>
        </div>
      )}
      {!onEdit && report.status !== "Unread" && !compact && (
        <p className="flex items-center gap-2 text-xs text-[#8995aa]">
          <Lock size={12} aria-hidden="true" /> This report has been seen, so it can&apos;t be edited. Add anything new as a reply below.
        </p>
      )}

      {/* ---- Feedback conversation ---------------------------------------- */}
      <section className="border-t border-[#edf0f6] pt-6" aria-labelledby={`${report.id}-fb`}>
        <h3 id={`${report.id}-fb`} className="text-sm font-bold text-[#101d49]">
          Feedback {report.replies.length > 0 && <span className="font-medium text-[#8995aa]">· {report.replies.length}</span>}
        </h3>

        {report.replies.length === 0 ? (
          <p className="mt-2 text-sm text-[#8995aa]">No feedback yet. Replies from {report.supervisor} or the admin team will appear here.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {report.replies.map((reply) => {
              const mine = reply.author === viewerName;
              return (
                <li key={reply.id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      mine ? "bg-[#101d49] text-[#f5c542]" : "bg-[#eaf0ff] text-[#101d49]",
                    )}
                  >
                    {getInitials(reply.author.replace(/^Admin · /, ""))}
                  </span>
                  <div className={cn("min-w-0 max-w-[85%] rounded-xl px-4 py-3", mine ? "rounded-tr-sm bg-[#fff6d8]" : "rounded-tl-sm bg-[#f6f8fc]")}>
                    <p className="text-xs">
                      <span className="font-semibold text-[#101d49]">{mine ? "You" : reply.author}</span>
                      <span className="text-[#8995aa]"> · {stampLabel(reply.createdAt)}</span>
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#34415e]">{reply.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-4 rounded-xl border border-[#dce3ef] bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#c3cddf] focus-within:border-[#f5c542] focus-within:ring-2 focus-within:ring-[#f5c542]/20">
          <label htmlFor={`${report.id}-reply`} className="sr-only">
            Add a reply
          </label>
          <textarea
            id={`${report.id}-reply`}
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKey}
            placeholder={report.replies.length ? "Reply…" : `Add a note for ${supervisorFirstName}…`}
            className={cn(inputClass, "resize-none border-0 bg-transparent py-3 leading-6 focus:ring-0")}
          />
          <div className="flex justify-end border-t border-[#f0f2f7] px-3 py-2">
            <button type="button" onClick={send} disabled={!draft.trim()} className={cn(darkButtonClass, "min-h-9 px-3.5")}>
              <Send size={14} aria-hidden="true" /> Send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
