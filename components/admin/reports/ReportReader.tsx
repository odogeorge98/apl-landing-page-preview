"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Mail,
  MailOpen,
  RotateCcw,
  Send,
  UserRound,
} from "lucide-react";

import { ActionMenu } from "@/components/admin/shared/ActionMenu";
import {
  darkButtonClass,
  getInitials,
  inputClass,
  secondaryButtonClass,
} from "@/components/admin/shared/admin-ui";
import type { DailyReport } from "@/lib/mock/admin-daily-reports";
import { cn } from "@/lib/utils";
import { clockTime, longDate, stampLabel } from "./report-utils";
import { ReporterBadge } from "./ReporterBadge";

type ReportReaderProps = {
  report: DailyReport;
  /** 1-based position of this report in the current list, for "3 of 12". */
  position: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  /** Mobile only: return to the list. */
  onBack: () => void;
  onMarkReviewed: () => void;
  onMarkUnread: () => void;
  onToggleProblem: () => void;
  onReply: (body: string) => void;
  onCopy: () => void;
};

/**
 * Reading pane for one daily report.
 *
 * The report text is the hero: it is shown exactly as the learner typed it
 * (line breaks and "- " bullets preserved) at a comfortable reading width.
 * Problems get a distinct amber panel with an Open/Resolved follow-up state
 * so nothing a learner raised gets lost. Admins can reply in plain text; a
 * reply also marks the report as reviewed.
 */
export function ReportReader({
  report,
  position,
  total,
  onPrevious,
  onNext,
  onBack,
  onMarkReviewed,
  onMarkUnread,
  onToggleProblem,
  onReply,
  onCopy,
}: ReportReaderProps) {
  const [draft, setDraft] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstName = report.authorName.split(" ")[0];

  // New report → clear the composer and move focus to the heading so
  // screen-reader users hear which report they are on.
  useEffect(() => {
    setDraft("");
    headingRef.current?.focus({ preventScroll: true });
  }, [report.id]);

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    onReply(body);
    setDraft("");
  };

  const handleComposerKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // ⌘/Ctrl + Enter sends, like most mail clients.
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      send();
    }
  };

  const hasProblems = Boolean(report.problems.trim());
  const resolved = report.problemStatus === "Resolved";

  return (
    <article className="flex h-full flex-col" aria-labelledby="report-heading">
      {/* ---- Toolbar ------------------------------------------------------- */}
      <div className="flex items-center gap-2 border-b border-[#edf0f6] px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#34415e] transition-colors hover:bg-[#f1f4fa] hover:text-[#101d49] lg:hidden"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Reports
        </button>

        <p className="hidden text-xs font-medium text-[#8995aa] lg:block">
          Report {position} of {total}
        </p>

        <div className="ml-auto flex items-center gap-1">
          <IconButton label="Previous report" onClick={onPrevious} disabled={position <= 1}>
            <ChevronUp size={17} aria-hidden="true" />
          </IconButton>
          <IconButton label="Next report" onClick={onNext} disabled={position >= total}>
            <ChevronDown size={17} aria-hidden="true" />
          </IconButton>
          <span className="mx-1 h-5 w-px bg-[#e4e9f2]" aria-hidden="true" />
          <ActionMenu
            label="More report actions"
            items={[
              { label: "Copy report text", icon: Copy, onSelect: onCopy },
              { label: `Email ${firstName}`, icon: Mail, onSelect: () => window.open(`mailto:${report.authorEmail}?subject=${encodeURIComponent(`Your daily report — ${longDate(report.reportDate)}`)}`) },
              { label: "Mark as unread", icon: MailOpen, onSelect: onMarkUnread, separated: true },
            ]}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[720px] px-4 py-6 sm:px-8 sm:py-8">
          {/* ---- Author + date ---------------------------------------------- */}
          <header className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#101d49] text-sm font-bold text-[#f5c542]">
              {getInitials(report.authorName)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="report-heading" ref={headingRef} tabIndex={-1} className="text-xl font-bold text-[#101d49] outline-none">
                  {report.authorName}
                </h2>
                <ReporterBadge type={report.reporterType} />
              </div>
              <p className="mt-1 text-sm text-[#64718a]">
                {report.team}
                <span aria-hidden="true"> · </span>
                <span className="inline-flex items-center gap-1">
                  <UserRound size={13} aria-hidden="true" />
                  {report.reporterType === "Intern" ? "Manager" : "Tutor"}: {report.supervisor}
                </span>
              </p>
              <p className="mt-1 text-xs text-[#8995aa]">
                {longDate(report.reportDate)} · submitted {clockTime(report.submittedAt)}
              </p>
            </div>
          </header>

          {/* ---- What they accomplished --------------------------------------- */}
          <section className="mt-8" aria-labelledby="accomplished-heading">
            <h3 id="accomplished-heading" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8995aa]">
              <span className="h-px w-4 bg-[#f5c542]" aria-hidden="true" />
              Accomplished today
            </h3>
            {/* whitespace-pre-line keeps the learner's line breaks and bullets. */}
            <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#17233f]">
              {report.accomplishments}
            </p>
          </section>

          {/* ---- Problems / blockers ------------------------------------------ */}
          <section className="mt-8" aria-labelledby="problems-heading">
            <h3 id="problems-heading" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8995aa]">
              <span className="h-px w-4 bg-[#f5c542]" aria-hidden="true" />
              Problems &amp; blockers
            </h3>

            {hasProblems ? (
              <div
                className={cn(
                  "mt-3 rounded-xl border-l-4 px-5 py-4 transition-colors duration-300",
                  resolved ? "border-emerald-400 bg-emerald-50/60" : "border-[#e8a317] bg-[#fff8e6]",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide",
                      resolved ? "text-emerald-700" : "text-[#9a6700]",
                    )}
                  >
                    {resolved ? <CheckCircle2 size={14} aria-hidden="true" /> : <AlertTriangle size={14} aria-hidden="true" />}
                    {resolved ? "Resolved" : "Needs follow-up"}
                  </span>
                  <button
                    type="button"
                    onClick={onToggleProblem}
                    className={cn(
                      "group inline-flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1 text-xs font-semibold transition-colors duration-150",
                      resolved
                        ? "border-emerald-200 text-emerald-800 hover:border-emerald-400"
                        : "border-[#f0d58c] text-[#7a5200] hover:border-[#c59400] hover:bg-[#fffdf5]",
                    )}
                  >
                    {resolved ? (
                      <>
                        <RotateCcw size={12} aria-hidden="true" className="transition-transform duration-300 group-hover:-rotate-180 motion-reduce:transition-none" /> Reopen
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={12} aria-hidden="true" /> Mark resolved
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#3b2f12]">{report.problems}</p>
              </div>
            ) : (
              <p className="mt-3 flex items-center gap-2 text-sm text-[#64718a]">
                <CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" />
                No problems reported today.
              </p>
            )}
          </section>

          {/* ---- Replies ------------------------------------------------------ */}
          <section className="mt-10 border-t border-[#edf0f6] pt-6" aria-labelledby="replies-heading">
            <h3 id="replies-heading" className="text-sm font-bold text-[#101d49]">
              Feedback {report.replies.length > 0 && <span className="font-medium text-[#8995aa]">· {report.replies.length}</span>}
            </h3>

            {report.replies.length > 0 && (
              <ol className="mt-4 space-y-4">
                {report.replies.map((reply) => (
                  <li key={reply.id} className="flex gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-[11px] font-bold text-[#101d49]">
                      {getInitials(reply.author.replace(/^Admin · /, ""))}
                    </span>
                    <div className="min-w-0 flex-1 rounded-xl rounded-tl-sm bg-[#f6f8fc] px-4 py-3">
                      <p className="text-xs">
                        <span className="font-semibold text-[#101d49]">{reply.author}</span>
                        <span className="text-[#8995aa]"> · {stampLabel(reply.createdAt)}</span>
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#34415e]">{reply.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {/* Composer */}
            <div className="mt-4 rounded-xl border border-[#dce3ef] bg-white transition-[border-color,box-shadow] duration-200 focus-within:border-[#f5c542] focus-within:ring-2 focus-within:ring-[#f5c542]/20 hover:border-[#c3cddf]">
              <label htmlFor="report-reply" className="sr-only">
                Reply to {firstName}
              </label>
              <textarea
                id="report-reply"
                rows={3}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKey}
                placeholder={`Reply to ${firstName}…`}
                className={cn(inputClass, "resize-none border-0 bg-transparent py-3 leading-6 focus:ring-0")}
              />
              <div className="flex items-center justify-between gap-3 border-t border-[#f0f2f7] px-3 py-2">
                <p className="hidden text-xs text-[#8995aa] sm:block">
                  Sent by email and shown on {firstName}&apos;s portal · <kbd className="font-sans">Ctrl</kbd>+<kbd className="font-sans">Enter</kbd>
                </p>
                <button type="button" onClick={send} disabled={!draft.trim()} className={cn(darkButtonClass, "ml-auto min-h-9 px-3.5")}>
                  <Send size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  Send reply
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ---- Review footer -------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f6] bg-[#fafbfd] px-4 py-3 sm:px-6">
        {report.status === "Reviewed" ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={16} aria-hidden="true" />
            Reviewed{report.reviewedAt ? ` · ${stampLabel(report.reviewedAt)}` : ""}
          </p>
        ) : (
          <p className="text-sm text-[#64718a]">Not reviewed yet</p>
        )}
        {report.status !== "Reviewed" && (
          <button type="button" onClick={onMarkReviewed} className={cn(secondaryButtonClass, "min-h-9")}>
            <CheckCircle2 size={15} aria-hidden="true" /> Mark as reviewed
          </button>
        )}
      </div>
    </article>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg p-2 text-[#64718a] transition-colors duration-150 hover:bg-[#eef1f7] hover:text-[#101d49] disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
    >
      {children}
    </button>
  );
}
