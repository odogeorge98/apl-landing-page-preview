"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AlertCircle, Check, CheckCheck, CheckCircle2, Clock3, Loader2, MessageSquareText, Send } from "lucide-react";
import { darkButtonClass, inputClass } from "@/components/admin/shared/admin-ui";
import { useMarkStudentReportFeedbackRead } from "@/lib/hooks/reports/use-mark-student-report-feedback-read";
import { useStudentReportFeedback } from "@/lib/hooks/reports/use-student-report-feedback";
import { cn } from "@/lib/utils";
import type { StudentReport, StudentReportFeedbackMessage } from "@/lib/interfaces/reports";

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
  onSendFeedback?: (message: string) => Promise<unknown>;
  sendingFeedback?: boolean;
  compact?: boolean;
};

export function StudentReportDetails({ report, onSendFeedback, sendingFeedback = false, compact = false }: StudentReportDetailsProps) {
  const [message, setMessage] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [readReceiptError, setReadReceiptError] = useState<string | null>(null);
  const feedbackSectionRef = useRef<HTMLElement | null>(null);
  const feedbackViewportRef = useRef<HTMLOListElement | null>(null);
  const visibleReportIdRef = useRef<string | null>(null);
  const markingIdsRef = useRef(new Set<string>());
  const isDraft = report.status === "DRAFT";
  const blocker = report.blockerDescription?.trim() ?? "";
  const feedbackQuery = useStudentReportFeedback(report.id, { enabled: Boolean(onSendFeedback) && !isDraft });
  const markFeedbackRead = useMarkStudentReportFeedbackRead();
  const feedbackMessages = useMemo(() => {
    const unique = new Map<string, StudentReportFeedbackMessage>();
    (feedbackQuery.data?.pages ?? []).flatMap((page) => page.items).forEach((item) => unique.set(item.id, item));
    return [...unique.values()].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  }, [feedbackQuery.data]);

  useEffect(() => {
    setMessage("");
    setFeedbackError(null);
    setFeedbackVisible(false);
    visibleReportIdRef.current = null;
    setReadReceiptError(null);
    markingIdsRef.current.clear();
  }, [report.id]);

  useEffect(() => {
    const element = feedbackSectionRef.current;
    if (!element || !onSendFeedback || isDraft) return;
    if (typeof IntersectionObserver === "undefined") {
      visibleReportIdRef.current = report.id;
      setFeedbackVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        visibleReportIdRef.current = report.id;
        setFeedbackVisible(true);
      } else if (visibleReportIdRef.current === report.id) {
        visibleReportIdRef.current = null;
        setFeedbackVisible(false);
      }
    }, { threshold: 0.15 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [isDraft, onSendFeedback, report.id]);

  useEffect(() => {
    if (!feedbackVisible || visibleReportIdRef.current !== report.id || feedbackQuery.isLoading || feedbackQuery.isError) return;
    const viewport = feedbackViewportRef.current;
    const markRead = (item: StudentReportFeedbackMessage) => {
      if (item.recipient.role !== "STUDENT" || item.readAt || markingIdsRef.current.has(item.id)) return;
      markingIdsRef.current.add(item.id);
      void markFeedbackRead.mutateAsync({ reportId: report.id, feedbackId: item.id })
        .catch((error) => setReadReceiptError(error instanceof Error ? error.message : "One or more messages could not be marked as read."));
    };

    if (typeof IntersectionObserver === "undefined") {
      feedbackMessages.forEach(markRead);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.65) return;
        const messageId = (entry.target as HTMLElement).dataset.feedbackId;
        const visibleMessage = feedbackMessages.find((item) => item.id === messageId);
        if (visibleMessage) markRead(visibleMessage);
      });
    }, { root: viewport, threshold: [0.65] });

    feedbackViewportRef.current?.querySelectorAll<HTMLElement>("[data-feedback-id]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [feedbackMessages, feedbackQuery.isError, feedbackQuery.isLoading, feedbackVisible, markFeedbackRead.mutateAsync, report.id]);

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
        <section ref={feedbackSectionRef} className="border-t border-[#edf0f6] pt-5" aria-labelledby={`${report.id}-feedback`}>
          <div className="flex items-center justify-between gap-3">
            <h3 id={`${report.id}-feedback`} className="inline-flex items-center gap-2 text-sm font-bold text-[#101d49]"><MessageSquareText size={16} aria-hidden="true" /> Feedback</h3>
            <span className="text-xs text-[#8995aa]">{report.feedbackCount} message{report.feedbackCount === 1 ? "" : "s"}</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-[#64718a]">Messages are shown in chronological order. Read receipts appear beneath your messages.</p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#e4e9f2] bg-[#f7f8fb]">
            {feedbackQuery.isLoading ? (
              <div className="space-y-3 p-4" role="status" aria-label="Loading feedback">
                <div className="h-12 w-3/4 animate-pulse rounded-2xl bg-white" />
                <div className="ml-auto h-12 w-2/3 animate-pulse rounded-2xl bg-[#e8eefb]" />
              </div>
            ) : feedbackQuery.isError && feedbackMessages.length === 0 ? (
              <div className="px-4 py-6 text-center" role="alert">
                <AlertCircle size={18} className="mx-auto text-red-600" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold text-[#34415e]">Could not load the conversation</p>
                <p className="mt-1 text-xs text-[#718099]">{feedbackQuery.error instanceof Error ? feedbackQuery.error.message : "Try again in a moment."}</p>
                <button type="button" onClick={() => void feedbackQuery.refetch()} className="mt-3 rounded-lg bg-[#101d49] px-3 py-1.5 text-xs font-semibold text-white">Try again</button>
              </div>
            ) : feedbackMessages.length === 0 ? (
              <div className="px-4 py-7 text-center">
                <MessageSquareText size={18} className="mx-auto text-[#8995aa]" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold text-[#34415e]">No feedback messages yet</p>
                <p className="mt-1 text-xs text-[#8995aa]">Messages about this report will appear here.</p>
              </div>
            ) : (
              <>
                {feedbackQuery.isError && <p role="status" className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-900">Showing messages already loaded; refresh failed.</p>}
                <ol ref={feedbackViewportRef} className="max-h-[360px] space-y-3 overflow-y-auto [overflow-anchor:none] p-3 sm:p-4" aria-label="Report feedback conversation" aria-live="polite">
                  {feedbackMessages.map((item) => {
                    const isMine = item.author.role === "STUDENT";
                    return (
                      <li key={item.id} data-feedback-id={item.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                        <div className={cn("flex max-w-[88%] flex-col sm:max-w-[80%]", isMine ? "items-end" : "items-start")}>
                          <article className={cn("w-fit max-w-full rounded-2xl px-3.5 py-2.5 text-left shadow-sm", isMine ? "rounded-br-md bg-[#e8eefb] text-[#17233f]" : "rounded-bl-md border border-[#e7ebf2] bg-white text-[#17233f]")}>
                            <div className="flex items-center justify-between gap-5 text-[10px] text-[#52627f]">
                              <span className="font-bold text-[#34415e]">{isMine ? "You" : statusLabel(item.author.role)}</span>
                              <time dateTime={item.createdAt}>{formatTimestamp(item.createdAt)}</time>
                            </div>
                            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6">{item.message}</p>
                          </article>
                          {isMine && (
                            <div className="mt-1 flex h-4 w-36 max-w-full shrink-0 items-center justify-end gap-1.5 overflow-hidden whitespace-nowrap text-[11px] leading-none text-[#52627f] dark:text-slate-300" aria-label={item.readAt ? `Seen ${formatTimestamp(item.readAt)}` : "Sent; not yet read"}>
                              {item.readAt ? <CheckCheck size={12} className="shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /> : <Check size={12} className="shrink-0 text-[#52627f] dark:text-slate-300" aria-hidden="true" />}
                              <span className="truncate">{item.readAt ? `Seen · ${formatTimestamp(item.readAt)}` : "Sent"}</span>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
            {feedbackQuery.hasNextPage && <div className="border-t border-[#e4e9f2] p-2.5 text-center"><button type="button" onClick={() => { if (!feedbackQuery.isFetchingNextPage) void feedbackQuery.fetchNextPage(); }} disabled={feedbackQuery.isFetchingNextPage} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#34415e] hover:bg-white disabled:opacity-60">{feedbackQuery.isFetchingNextPage ? "Loading…" : "Load more messages"}</button></div>}
            {readReceiptError && <p role="status" className="border-t border-amber-100 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">{readReceiptError}</p>}
          </div>
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
