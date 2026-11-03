"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import MainLayout from "@/components/layout/dashboard/MainLayout";
import { useStudentAssignments } from "@/lib/hooks/assignments/use-student-assignments";
import { useSubmitStudentAssignment } from "@/lib/hooks/assignments/use-submit-student-assignment";
import type { StudentAssignment } from "@/lib/interfaces/assignments";
import useStudentAssignmentAttemptStore from "@/lib/store/student-assignment-attempts";

const cardClass = "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";
const secondaryButtonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e4e9f2] bg-white px-4 py-2.5 text-sm font-semibold text-[#34415e] transition hover:border-[#cbd4e3] hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]";
const primaryButtonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#192c65] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] focus-visible:ring-offset-2";

function formatDateTime(value: string | null) {
  if (value === null) return "No deadline";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function getRequestError(error: unknown): string {
  if (error && typeof error === "object") {
    const responseData = (error as { response?: { data?: { message?: unknown } } }).response?.data;
    const message = responseData?.message;
    if (Array.isArray(message)) return message.filter((item) => typeof item === "string").join(" ");
    if (typeof message === "string" && message.trim()) return message;
  }
  return error instanceof Error ? error.message : "We could not submit this assignment. Please try again.";
}

function isAttemptAllowed(assignment: StudentAssignment, now = Date.now()) {
  const availableAt = Date.parse(assignment.availableAt);
  const notYetAvailable = Number.isFinite(availableAt) && availableAt > now;
  const deadlinePassed = assignment.dueAt !== null && Date.parse(assignment.dueAt) < now;
  const submissionStatus = assignment.submission?.status;
  const mayStart = !submissionStatus || submissionStatus === "NOT_SUBMITTED" || submissionStatus === "DRAFT";
  const mayResubmit = submissionStatus === "RETURNED";
  return { allowed: !notYetAvailable && !deadlinePassed && (mayStart || mayResubmit), notYetAvailable, deadlinePassed, mayResubmit };
}

export default function StudentAssignmentAttemptPage() {
  const params = useParams<{ id: string }>();
  const assignmentId = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const hasHydrated = useStudentAssignmentAttemptStore((state) => state.hasHydrated);
  const remembered = useStudentAssignmentAttemptStore((state) => state.rememberedAssignments[assignmentId]);
  const localDraft = useStudentAssignmentAttemptStore((state) => state.drafts[assignmentId]);
  const localReceipt = useStudentAssignmentAttemptStore((state) => state.submissionReceipts[assignmentId]);
  const rememberAssignment = useStudentAssignmentAttemptStore((state) => state.rememberAssignment);
  const saveDraft = useStudentAssignmentAttemptStore((state) => state.saveDraft);
  const saveSubmissionReceipt = useStudentAssignmentAttemptStore((state) => state.saveSubmissionReceipt);

  const [answerText, setAnswerText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [receipt, setReceipt] = useState(localReceipt ?? null);
  const [draftInitialized, setDraftInitialized] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const initializedForId = useRef<string | null>(null);
  const submitMutation = useSubmitStudentAssignment();

  const assignmentsQuery = useStudentAssignments({ limit: 50 });
  const listedAssignment = useMemo(
    () => assignmentsQuery.data?.items.find((item) => item.id === assignmentId) ?? null,
    [assignmentsQuery.data, assignmentId],
  );
  const assignment = listedAssignment ?? remembered?.assignment;
  const attemptRules = assignment ? isAttemptAllowed(assignment) : null;

  useEffect(() => {
    if (hasHydrated) return;
    try {
      void Promise.resolve(useStudentAssignmentAttemptStore.persist.rehydrate()).catch(() => {
        useStudentAssignmentAttemptStore.getState().setHasHydrated(true);
      });
    } catch {
      useStudentAssignmentAttemptStore.getState().setHasHydrated(true);
    }
  }, [hasHydrated]);

  useEffect(() => {
    if (!assignment || !hasHydrated || initializedForId.current === assignmentId) return;
    initializedForId.current = assignmentId;
    rememberAssignment(assignment);
    setAnswerText(localDraft?.answerText ?? assignment.submission?.answerText ?? "");
    setReceipt(localReceipt ?? null);
    setDraftInitialized(true);
  }, [assignment, assignmentId, hasHydrated, localDraft?.answerText, localReceipt, rememberAssignment]);

  useEffect(() => {
    if (!draftInitialized || !assignment || receipt || submitMutation.isPending) return;
    const timeoutId = window.setTimeout(() => saveDraft(assignment.id, answerText), 350);
    return () => window.clearTimeout(timeoutId);
  }, [answerText, assignment, draftInitialized, receipt, saveDraft, submitMutation.isPending]);

  useEffect(() => {
    if (!draftInitialized || receipt || submitMutation.isPending || !answerText) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [answerText, draftInitialized, receipt, submitMutation.isPending]);

  const handleSubmit = useCallback(async () => {
    if (!assignment || !isAttemptAllowed(assignment).allowed || !answerText.trim() || submitMutation.isPending) return;
    setSubmitError(null);
    try {
      const result = await submitMutation.mutateAsync({
        assignmentId: assignment.id,
        payload: { answerText },
      });
      saveSubmissionReceipt(assignment.id, result);
      setReceipt(result);
      setShowConfirm(false);
    } catch (error) {
      setSubmitError(getRequestError(error));
      setShowConfirm(false);
    }
  }, [answerText, assignment, attemptRules?.allowed, saveSubmissionReceipt, submitMutation]);

  const currentDraftLabel = localDraft?.updatedAt
    ? `Saved on this device at ${formatDateTime(localDraft.updatedAt)}`
    : "Your answer will be saved on this device as you type.";

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1200px] space-y-6 pb-10">
        <button type="button" disabled={submitMutation.isPending} onClick={() => { if (assignment && !receipt) saveDraft(assignment.id, answerText); router.push("/student/assignments"); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-[#64718a] transition hover:text-[#101d49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] disabled:opacity-50">
          <ArrowLeft size={17} /> Back to assignments
        </button>

        {!hasHydrated ? (
          <div className={`${cardClass} flex min-h-64 items-center justify-center gap-3 text-sm text-[#64718a]`}>
            <LoaderCircle size={18} className="animate-spin" /> Restoring your assignment workspace…
          </div>
        ) : !assignment && assignmentsQuery.isLoading ? (
          <div className={`${cardClass} flex min-h-64 items-center justify-center gap-3 text-sm text-[#64718a]`}>
            <LoaderCircle size={18} className="animate-spin" /> Loading assignment details…
          </div>
        ) : !assignment ? (
          <section className={`${cardClass} mx-auto max-w-2xl p-8 text-center sm:p-12`}>
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><AlertCircle size={25} /></span>
            <h1 className="mt-5 text-xl font-bold text-[#101d49]">Assignment details are unavailable</h1>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#64718a]">
              Open this assignment from your assignments list first. The student API does not currently provide an assignment-by-ID endpoint, so a new direct link cannot recover details on its own.
            </p>
            <button type="button" onClick={() => router.push("/student/assignments")} className={`${primaryButtonClass} mt-6`}>
              Go to assignments <ArrowRight size={16} />
            </button>
          </section>
        ) : receipt ? (
          <section className={`${cardClass} mx-auto max-w-3xl overflow-hidden`}>
            <div className="border-b border-[#e4e9f2] bg-emerald-50/70 p-6 sm:p-8">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><CheckCircle2 size={25} /></span>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Submission received</p>
              <h1 className="mt-2 text-2xl font-bold text-[#101d49]">Your work is with your tutor.</h1>
              <p className="mt-2 text-sm leading-6 text-[#64718a]">This submission receipt is saved on this device. The assignment API does not yet provide a latest-submission lookup for restoring the server state on a different device.</p>
            </div>
            <div className="space-y-4 p-6 sm:p-8">
              <div>
                <p className="text-sm font-semibold text-[#101d49]">{assignment.title}</p>
                <p className="mt-1 text-sm text-[#64718a]">{assignment.programme?.name ?? "Programme"}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ReceiptItem label="Attempt" value={`#${receipt.attemptNumber}`} />
                <ReceiptItem label="Submitted" value={formatDateTime(receipt.submittedAt)} />
                <ReceiptItem label="Status" value={receipt.status.replaceAll("_", " ")} />
              </div>
              <div className="rounded-xl bg-[#f8f9fc] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8490a6]">Your submitted answer</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#34415e]">{receipt.answerText}</p>
              </div>
              {receipt.feedback && <div className="rounded-xl border border-[#e4e9f2] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#8490a6]">Tutor feedback</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#34415e]">{receipt.feedback}</p></div>}
              <button type="button" onClick={() => router.push("/student/assignments")} className={primaryButtonClass}>Return to assignments</button>
            </div>
          </section>
        ) : (
          <>
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#64718a]">Assignment attempt</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#101d49]">{assignment.title}</h1>
                <p className="mt-2 text-sm font-semibold text-[#64718a]">{assignment.programme?.name ?? "Programme details unavailable"}</p>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#eaf0ff] px-3 py-2 text-xs font-semibold text-[#34415e] sm:self-auto">
                <ShieldCheck size={15} /> Saved locally on this device
              </div>
            </header>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className={`${cardClass} overflow-hidden`}>
                <div className="border-b border-[#e4e9f2] p-5 sm:p-7">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]"><FileText size={19} /></span>
                    <div>
                      <h2 className="font-bold text-[#101d49]">Your response</h2>
                      <p className="mt-1 text-sm leading-6 text-[#64718a]">Write your response below. Formatting and line breaks are preserved when you submit.</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 sm:p-7">
                  <label htmlFor="assignment-answer" className="mb-2 block text-sm font-semibold text-[#101d49]">Answer</label>
                  <textarea
                    id="assignment-answer"
                    value={answerText}
                    onChange={(event) => { setAnswerText(event.target.value); setSubmitError(null); }}
                    maxLength={50000}
                    rows={18}
                    placeholder="Write your answer here…"
                    className="w-full resize-y rounded-xl border border-[#dce3ef] bg-white px-4 py-3 text-sm leading-6 text-[#24314f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#c59400] focus:ring-4 focus:ring-[#f5c542]/20"
                    aria-describedby="answer-local-save answer-counter"
                    disabled={!attemptRules?.allowed}
                  />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8490a6]">
                    <p id="answer-local-save" aria-live="polite">{currentDraftLabel}</p>
                    <p id="answer-counter">{answerText.length.toLocaleString()} / 50,000 characters</p>
                  </div>
                  {submitError && <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-800"><AlertCircle size={17} className="mt-0.5 shrink-0" />{submitError}</div>}
                  <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#e9edf4] pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" disabled={submitMutation.isPending} onClick={() => { saveDraft(assignment.id, answerText); router.push("/student/assignments"); }} className={secondaryButtonClass}>Save and leave</button>
                    <button type="button" onClick={() => setShowConfirm(true)} disabled={!attemptRules?.allowed || !answerText.trim() || submitMutation.isPending} className={primaryButtonClass}>
                      {submitMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : null}
                      Submit assignment <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </section>

              <aside className="space-y-5">
                <section className={`${cardClass} p-5`}>
                  <h2 className="font-bold text-[#101d49]">Assignment brief</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#64718a]">{assignment.instructions}</p>
                  <div className="mt-5 border-t border-[#e9edf4] pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8490a6]">Maximum score</p>
                    <p className="mt-1 text-lg font-bold text-[#101d49]">{Number(assignment.maxScore).toLocaleString()} points</p>
                  </div>
                </section>
                <section className={`${cardClass} space-y-4 p-5`}>
                  <h2 className="font-bold text-[#101d49]">Availability and deadline</h2>
                  <ScheduleItem icon={<Clock3 size={16} />} label="Available from" value={formatDateTime(assignment.availableAt)} />
                  <ScheduleItem icon={<Clock3 size={16} />} label="Due" value={formatDateTime(assignment.dueAt)} />
                  {attemptRules?.notYetAvailable && <Notice>Submissions open {formatDateTime(assignment.availableAt)}. You can return then.</Notice>}
                  {attemptRules?.deadlinePassed && <Notice tone="error">The submission deadline has passed. The server does not accept late submissions.</Notice>}
                  {attemptRules?.mayResubmit && !attemptRules.deadlinePassed && <Notice tone="amber">Your previous attempt was returned. You can revise and submit another attempt before the deadline.</Notice>}
                  {assignment.submission && ["SUBMITTED", "IN_REVIEW", "REVIEWED", "GRADED"].includes(assignment.submission.status) && <Notice tone="amber">The latest attempt is {assignment.submission.status.replaceAll("_", " ")}. The backend only accepts another attempt after it is returned.</Notice>}
                </section>
                <p className="px-1 text-xs leading-5 text-[#8490a6]">Drafts stay in this browser’s local storage and are not visible to your tutor until you submit. Avoid using a shared device for private work.</p>
              </aside>
            </div>
          </>
        )}

        <AnimatePresence>
          {showConfirm && assignment && (
            <motion.div
              key="assignment-submit-confirm-backdrop"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-[#071027]/60 p-4 backdrop-blur-sm"
              onMouseDown={(event) => { if (event.target === event.currentTarget && !submitMutation.isPending) setShowConfirm(false); }}
            >
              <motion.section
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="submit-confirm-title"
                className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><ShieldCheck size={21} /></span>
                  <button type="button" aria-label="Close confirmation" disabled={submitMutation.isPending} onClick={() => setShowConfirm(false)} className="rounded-lg p-2 text-[#64718a] hover:bg-[#f3f5f9] disabled:opacity-50"><X size={18} /></button>
                </div>
                <h2 id="submit-confirm-title" className="mt-4 text-xl font-bold text-[#101d49]">Submit this assignment?</h2>
                <p className="mt-2 text-sm leading-6 text-[#64718a]">You are submitting <strong className="text-[#101d49]">{assignment.title}</strong>. Your answer will be sent to your tutor and this action will create an attempt.</p>
                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">The backend does not support editing a submitted attempt. Resubmission is available only if your tutor returns it.</p>
                {submitError && <p role="alert" className="mt-3 text-sm text-red-700">{submitError}</p>}
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button type="button" disabled={submitMutation.isPending} onClick={() => setShowConfirm(false)} className={secondaryButtonClass}>Review answer</button>
                  <button type="button" disabled={submitMutation.isPending} onClick={() => void handleSubmit()} className={primaryButtonClass}>
                    {submitMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : null}
                    Confirm submission
                  </button>
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MainLayout>
  );
}

function ReceiptItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[#f8f9fc] p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-[#8490a6]">{label}</p><p className="mt-1 text-sm font-semibold text-[#101d49]">{value}</p></div>;
}

function ScheduleItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex items-start gap-3"><span className="mt-0.5 text-[#8490a6]">{icon}</span><div><p className="text-xs text-[#8490a6]">{label}</p><p className="mt-1 text-sm font-semibold text-[#34415e]">{value}</p></div></div>;
}

function Notice({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "amber" | "error" }) {
  const styles = tone === "error" ? "bg-red-50 text-red-800" : tone === "amber" ? "bg-amber-50 text-amber-900" : "bg-blue-50 text-blue-800";
  return <p className={`rounded-xl p-3 text-xs leading-5 ${styles}`}>{children}</p>;
}
