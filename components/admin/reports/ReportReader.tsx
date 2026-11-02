"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
  MessageSquare,
  Send,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import { ReporterBadge } from "@/components/admin/reports/ReporterBadge";
import { clockTime, longDate, stampLabel } from "@/components/admin/reports/report-utils";
import { ActionMenu } from "@/components/admin/shared/ActionMenu";
import { darkButtonClass, getInitials, inputClass, secondaryButtonClass } from "@/components/admin/shared/admin-ui";
import type { AdminDailyReport, ReportFeedbackMessage } from "@/lib/interfaces/reports";
import { cn } from "@/lib/utils";

type ReportReaderProps = {
  report: AdminDailyReport;
  messages: ReportFeedbackMessage[];
  currentUserId?: string;
  position: number;
  total: number;
  hasOlderMessages: boolean;
  loadingMessages: boolean;
  loadingOlderMessages: boolean;
  sending: boolean;
  reviewing: boolean;
  onLoadOlderMessages: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
  onMarkReviewed: () => void;
  onReply: (body: string) => Promise<void>;
  onCopy: () => void;
};

export function ReportReader({
  report, messages, currentUserId, position, total, hasOlderMessages, loadingMessages, loadingOlderMessages,
  sending, reviewing, onLoadOlderMessages, onPrevious, onNext, onBack, onMarkReviewed, onReply, onCopy,
}: ReportReaderProps) {
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstName = report.student.name.split(" ")[0] || "student";
  const hasBlocker = Boolean(report.blockerDescription?.trim());
  const problemResolved = report.problemStatus === "RESOLVED" || Boolean(report.resolvedAt);

  useEffect(() => {
    setDraft("");
    setSendError(null);
    headingRef.current?.focus({ preventScroll: true });
  }, [report.id]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSendError(null);
    try {
      await onReply(body);
      setDraft("");
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Message could not be sent. Please try again.");
    }
  };

  const handleComposerKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void send();
    }
  };

  return (
    <article className="flex h-full min-h-0 flex-col" aria-labelledby="report-heading">
      <div className="flex items-center gap-2 border-b border-[#edf0f6] px-4 py-3 sm:px-6">
        <button type="button" onClick={onBack} className="-ml-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#34415e] transition-colors hover:bg-[#f1f4fa] hover:text-[#101d49] lg:hidden">
          <ArrowLeft size={16} aria-hidden="true" /> Reports
        </button>
        <p className="hidden text-xs font-medium text-[#718099] lg:block">Report {position} of {total} loaded</p>
        <div className="ml-auto flex items-center gap-1">
          <IconButton label="Previous report" onClick={onPrevious} disabled={position <= 1}><ChevronUp size={17} aria-hidden="true" /></IconButton>
          <IconButton label="Next report" onClick={onNext} disabled={position >= total}><ChevronDown size={17} aria-hidden="true" /></IconButton>
          <span className="mx-1 h-5 w-px bg-[#e4e9f2]" aria-hidden="true" />
          <ActionMenu label="More report actions" items={[{ label: "Copy report text", icon: Copy, onSelect: onCopy }]} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-8 sm:py-8">
          <header className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#101d49] text-sm font-bold text-[#f5c542]">{getInitials(report.student.name)}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="report-heading" ref={headingRef} tabIndex={-1} className="text-xl font-bold text-[#101d49] outline-none">{report.student.name}</h2>
                <ReporterBadge type="Student" />
              </div>
              <p className="mt-1 text-sm text-[#64718a]">
                <strong className="font-semibold text-[#34415e]">{report.programme.name}</strong>
                {report.tutor?.name && <><span aria-hidden="true"> · </span><span className="inline-flex items-center gap-1"><UserRound size={13} aria-hidden="true" /> Tutor: {report.tutor.name}</span></>}
              </p>
              <p className="mt-1 text-xs text-[#718099]">{longDate(report.reportDate)} · submitted {clockTime(report.submittedAt)}</p>
            </div>
          </header>

          <section className="mt-8" aria-labelledby="accomplished-heading">
            <SectionLabel id="accomplished-heading">Accomplished today</SectionLabel>
            {report.accomplishments.length ? (
              <ul className="mt-3 space-y-2 text-[15px] leading-7 text-[#17233f]">
                {report.accomplishments.map((item, index) => <li key={`${index}-${item}`} className="flex gap-2"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-[#c59400]" aria-hidden="true" /><span className="whitespace-pre-line">{item}</span></li>)}
              </ul>
            ) : <p className="mt-3 text-sm text-[#64718a]">No accomplishments were included in this report.</p>}
          </section>

          <section className="mt-8" aria-labelledby="problems-heading">
            <SectionLabel id="problems-heading">Problems &amp; blockers</SectionLabel>
            {hasBlocker ? (
              <div className={cn("mt-3 rounded-xl border-l-4 px-5 py-4", problemResolved ? "border-emerald-400 bg-emerald-50/70" : "border-[#e8a317] bg-[#fff8e6]")}>
                <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide", problemResolved ? "text-emerald-700" : "text-[#9a6700]")}>
                  {problemResolved ? <CheckCircle2 size={14} aria-hidden="true" /> : <TriangleAlert size={14} aria-hidden="true" />}
                  {problemResolved ? "Resolved" : report.problemStatus === "IN_PROGRESS" ? "In progress" : "Needs follow-up"}
                </span>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#3b2f12]">{report.blockerDescription}</p>
                {report.resolvedAt && <p className="mt-2 text-xs font-medium text-emerald-800">Resolved {stampLabel(report.resolvedAt)}{report.resolvedBy?.name ? ` by ${report.resolvedBy.name}` : ""}</p>}
              </div>
            ) : report.noProblemsToday ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-[#64718a]"><CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" /> No problems reported today.</p>
            ) : <p className="mt-3 text-sm text-[#64718a]">No blocker details were provided.</p>}
          </section>

          <section className="mt-10 border-t border-[#edf0f6] pt-6" aria-labelledby="feedback-heading">
            <div className="flex items-center justify-between gap-3">
              <h3 id="feedback-heading" className="flex items-center gap-2 text-sm font-bold text-[#101d49]"><MessageSquare size={16} aria-hidden="true" /> Feedback <span className="font-medium text-[#718099]">· {messages.length}</span></h3>
              <span className="text-xs text-[#718099]">Conversation</span>
            </div>
            <div className="mt-4 overflow-y-auto rounded-2xl border border-[#e2e8f2] bg-[#f6f8fc] p-3 sm:p-4" style={{ maxHeight: 360, overflowAnchor: "none" }} aria-label="Report feedback messages" aria-live="polite">
              {hasOlderMessages && <div className="mb-3 text-center"><button type="button" onClick={onLoadOlderMessages} disabled={loadingOlderMessages} className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#dce3ef] bg-white px-3 text-xs font-semibold text-[#34415e] hover:bg-[#f9fafc] disabled:opacity-60">{loadingOlderMessages && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}{loadingOlderMessages ? "Loading…" : "Load more messages"}</button></div>}
              {loadingMessages ? <div className="flex min-h-28 items-center justify-center gap-2 text-sm text-[#64718a]" role="status"><Loader2 size={16} className="animate-spin" aria-hidden="true" />Loading conversation…</div> : messages.length === 0 ? <div className="flex min-h-28 flex-col items-center justify-center text-center"><MessageSquare size={20} className="text-[#8995aa]" aria-hidden="true" /><p className="mt-2 text-sm font-semibold text-[#34415e]">No messages yet</p><p className="mt-1 text-xs text-[#718099]">Send feedback to start the conversation.</p></div> : (
                <ol className="space-y-3" style={{ overflowAnchor: "none" }}>
                  {messages.map((message) => {
                    const own = currentUserId ? message.authorUserId === currentUserId : message.author.role.toUpperCase() === "ADMIN";
                    return <li key={message.id} className={cn("flex", own ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[88%] min-w-[160px] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[80%]", own ? "rounded-br-md bg-[#e8eefc] text-[#17233f]" : "rounded-bl-md border border-[#e2e8f2] bg-white text-[#17233f]")}>
                        <div className="flex items-center justify-between gap-5 text-[11px]">
                          <span className="font-bold text-[#34415e]">{own ? "You" : roleLabel(message.author.role)}</span>
                          <time dateTime={message.createdAt} className="shrink-0 text-[#64718a]">{stampLabel(message.createdAt)}</time>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{message.message}</p>
                        {own && <div className="mt-1 flex h-4 items-center justify-end gap-1 text-[10px] font-medium text-[#52627f]" aria-label={message.readAt ? `Seen ${stampLabel(message.readAt)}` : "Sent"}>
                          {message.readAt ? <CheckCheck size={13} className="shrink-0 text-[#16845b]" aria-hidden="true" /> : <Check size={13} className="shrink-0" aria-hidden="true" />}
                          <span className="min-w-[78px] text-right">{message.readAt ? `Seen · ${clockTime(message.readAt)}` : "Sent"}</span>
                        </div>}
                      </div>
                    </li>;
                  })}
                </ol>
              )}
            </div>
            {sendError && <p role="alert" className="mt-2 text-xs font-medium text-red-700">{sendError}</p>}
            <div className="mt-3 rounded-xl border border-[#dce3ef] bg-white transition-[border-color,box-shadow] duration-200 focus-within:border-[#f5c542] focus-within:ring-2 focus-within:ring-[#f5c542]/20">
              <label htmlFor="report-reply" className="sr-only">Reply to {firstName}</label>
              <textarea id="report-reply" rows={3} maxLength={5000} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleComposerKey} placeholder={`Reply to ${firstName}…`} className={cn(inputClass, "resize-none border-0 bg-transparent py-3 leading-6 focus:ring-0")} />
              <div className="flex items-center justify-between gap-3 border-t border-[#f0f2f7] px-3 py-2">
                <p className="hidden text-xs text-[#64718a] sm:block"><span className="tabular-nums">{draft.length}/5000</span> · Ctrl+Enter to send</p>
                <button type="button" onClick={() => void send()} disabled={!draft.trim() || sending} className={cn(darkButtonClass, "ml-auto min-h-9 px-3.5 disabled:cursor-not-allowed disabled:opacity-50")}>
                  {sending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Send size={14} aria-hidden="true" />}{sending ? "Sending…" : "Send feedback"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f6] bg-[#fafbfd] px-4 py-3 sm:px-6">
        {report.status === "REVIEWED" ? <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 size={16} aria-hidden="true" /> Reviewed{report.reviewedAt ? ` · ${stampLabel(report.reviewedAt)}` : ""}</p> : <p className="text-sm text-[#64718a]">Awaiting review</p>}
        {report.status !== "REVIEWED" && <button type="button" onClick={onMarkReviewed} disabled={reviewing} className={cn(secondaryButtonClass, "min-h-9 disabled:opacity-60")}>{reviewing ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <CheckCircle2 size={15} aria-hidden="true" />} {reviewing ? "Updating…" : "Mark as reviewed"}</button>}
      </div>
    </article>
  );
}

function SectionLabel({ id, children }: { id: string; children: ReactNode }) {
  return <h3 id={id} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8995aa]"><span className="h-px w-4 bg-[#f5c542]" aria-hidden="true" />{children}</h3>;
}

function roleLabel(role: string): string {
  const normalized = role.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="rounded-lg p-2 text-[#64718a] transition-colors duration-150 hover:bg-[#eef1f7] hover:text-[#101d49] disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]">{children}</button>;
}
