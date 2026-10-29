"use client";

/**
 * STUDENT / INTERN · Daily Report
 * Route: /student/reports  (sidebar: "Daily report", under Workspace)
 *
 * The learner-side counterpart of the admin inbox at
 * app/(admin)/dashboard/reports. Each working day the learner writes a short
 * plain-text report with two parts — the same two fields the admin reads:
 *   1. what they accomplished today
 *   2. any problems or blockers (or an explicit "No problems today")
 *
 * Features
 *   • autosaved draft (survives refresh) and ⌘/Ctrl+Enter to submit
 *   • edit today's report until an admin has seen it
 *   • review progress (Sent → Seen → Reviewed) and problem follow-up state
 *   • feedback conversation with the tutor/manager (learner can reply)
 *   • history of recent working days, with missed days shown in place
 *   • week progress and reporting streak
 *
 * FRONT-END ONLY. Data flows through the shared client store
 * `lib/store/daily-reports.ts`, so a report submitted here appears in the
 * admin inbox in the same session. Look for `TODO(api)`.
 *
 * NOTE: there is no INTERN role yet. Interns would use this same page; the
 * copy adapts ("manager" vs "tutor") from the reporter's type.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Flame, MessageSquare, NotebookPen, Sparkles, TriangleAlert, X } from "lucide-react";

import MainLayout from "@/components/layout/dashboard/MainLayout";
import { toast } from "@/components/ui/Toaster";
import { AdminModal } from "@/components/admin/shared/AdminModal";
import { cardClass } from "@/components/admin/shared/admin-ui";
import { useDelayedAction, useLastDefined } from "@/components/admin/shared/motion";
import { ReporterBadge } from "@/components/admin/reports/ReporterBadge";
import { longDate } from "@/components/admin/reports/report-utils";
import { ReportComposer, type ReportFormValues } from "@/components/student/reports/ReportComposer";
import { ReportHistory } from "@/components/student/reports/ReportHistory";
import { SubmittedReport } from "@/components/student/reports/SubmittedReport";
import { reportingStreak, thisWeek } from "@/components/student/reports/report-stats";
import {
  DEMO_REPORTER_ID,
  getRosterMember,
  getSupervisor,
  isoDay,
} from "@/lib/mock/admin-daily-reports";
import { useDailyReportsStore } from "@/lib/store/daily-reports";
import { cn } from "@/lib/utils";

const EMPTY_FORM: ReportFormValues = { accomplishments: "", problems: "", noProblems: false };

export default function StudentDailyReportPage() {
  return (
    <MainLayout>
      <DailyReportWorkspace />
    </MainLayout>
  );
}

function DailyReportWorkspace() {
  // TODO(api): the signed-in learner (and their supervisor) come from the session.
  const me = getRosterMember(DEMO_REPORTER_ID)!;
  const supervisor = getSupervisor(me.team);
  const supervisorRole = me.reporterType === "Intern" ? "manager" : "tutor";

  const reports = useDailyReportsStore((state) => state.reports);
  const draft = useDailyReportsStore((state) => state.drafts[me.id]);
  const { submitReport, updateReport, addReply, saveDraft, clearDraft } = useDailyReportsStore.getState();

  // The draft lives in localStorage; load it after mount (never during SSR).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    void Promise.resolve(useDailyReportsStore.persist.rehydrate()).finally(() => setHydrated(true));
  }, []);

  const [editing, setEditing] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const opener = useDelayedAction();

  /* ---------------------------- Derived data ----------------------------- */

  const mine = useMemo(
    () => reports.filter((report) => report.authorId === me.id).sort((a, b) => b.reportDate.localeCompare(a.reportDate)),
    [reports, me.id],
  );
  const today = mine.find((report) => report.reportDate === isoDay(0)) ?? null;
  const past = mine.filter((report) => report !== today);
  const week = thisWeek(mine);
  const streak = reportingStreak(mine);
  const openProblems = mine.filter((report) => report.problems.trim() && report.problemStatus !== "Resolved").length;
  const feedbackCount = mine.reduce((sum, report) => sum + report.replies.filter((reply) => reply.author !== me.name).length, 0);

  const historyReport = useLastDefined(historyId ? mine.find((report) => report.id === historyId) : null);

  /* ------------------------------ Actions -------------------------------- */

  // Debounced autosave of the unsent draft.
  const saveTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(saveTimer.current), []);
  const autosave = (values: ReportFormValues) => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveDraft(me.id, values), 600);
  };

  const submit = (values: { accomplishments: string; problems: string }) =>
    opener.run("submit", () => {
      window.clearTimeout(saveTimer.current);
      // TODO(api): POST /daily-reports { reportDate, accomplishments, problems }
      submitReport(me.id, values);
      clearDraft(me.id);
      setJustSubmitted(true);
      toast.success("Report submitted", { description: `${supervisor} will see it in their inbox.` });
    });

  const saveEdit = (values: { accomplishments: string; problems: string }) =>
    opener.run("submit", () => {
      if (!today) return;
      // TODO(api): PATCH /daily-reports/:id (server rejects edits once seen)
      updateReport(today.id, values);
      setEditing(false);
      toast.success("Report updated");
    });

  const reply = (reportId: string, body: string) => {
    // TODO(api): POST /daily-reports/:id/replies
    addReply(reportId, me.name, body);
    toast.success("Reply sent");
  };

  /* -------------------------------- Render ------------------------------- */

  // <div>, not <main>: MainLayout already renders the <main> landmark.
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-10 sm:space-y-8">
      {/* ---- Heading ---------------------------------------------------- */}
      <header className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
          <Sparkles size={15} className="text-[#c59400]" aria-hidden="true" /> Daily work
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">Daily report</h1>
        <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">
          Two minutes at the end of each day: what you got done, and anything that got in your way. Your {supervisorRole} reads every report.
        </p>
      </header>

      {/* ---- Progress strip (one card, four cells) ---------------------- */}
      <section aria-label="Your reporting" className={cn(cardClass, "grid grid-cols-2 divide-[#edf0f6] [&>*]:border-[#edf0f6] max-xl:[&>*:nth-child(-n+2)]:border-b max-xl:[&>*:nth-child(odd)]:border-r xl:grid-cols-4 xl:divide-x")}>
        <Stat label="This week" value={`${week.submitted}/${week.expected}`} note="working days reported">
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf0f6]" aria-hidden="true">
            <div className="h-full rounded-full bg-[#101d49] transition-[width] duration-700" style={{ width: `${(week.submitted / Math.max(week.expected, 1)) * 100}%` }} />
          </div>
        </Stat>
        <Stat label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} note="in a row" icon={<Flame size={16} className={streak > 0 ? "text-[#e8a317]" : "text-[#c3cad8]"} aria-hidden="true" />} />
        <Stat label="Open problems" value={String(openProblems)} note={openProblems ? "waiting for follow-up" : "all resolved"} icon={<TriangleAlert size={16} className={openProblems ? "text-[#e8a317]" : "text-[#c3cad8]"} aria-hidden="true" />} />
        <Stat label="Feedback" value={String(feedbackCount)} note="replies received" icon={<MessageSquare size={16} className="text-[#2a3f86]" aria-hidden="true" />} />
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ================= Today ================= */}
        <section className={cn(cardClass, "overflow-hidden")} aria-labelledby="today-title">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf0f6] px-5 py-4 sm:px-7">
            <div>
              <h2 id="today-title" className="flex items-center gap-2 text-lg font-bold text-[#101d49]">
                <NotebookPen size={19} className="text-[#c59400]" aria-hidden="true" /> Today&apos;s report
              </h2>
              <p className="mt-0.5 text-sm text-[#64718a]">{longDate(isoDay(0))}</p>
            </div>
            <div className="text-right text-xs text-[#8995aa]">
              <p className="inline-flex items-center gap-1.5">
                <ReporterBadge type={me.reporterType} /> {me.team}
              </p>
              <p className="mt-1">Goes to {supervisor} ({supervisorRole})</p>
            </div>
          </div>

          {/* Confirmation banner right after submitting. */}
          {justSubmitted && today && !editing && (
            <div role="status" className="flex items-start gap-3 border-b border-emerald-100 bg-emerald-50 px-5 py-3.5 sm:px-7">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              <p className="flex-1 text-sm text-emerald-800">
                <strong className="font-semibold">Sent. Nice work today.</strong> You&apos;ll see {supervisor.split(" ")[0]}&apos;s feedback here.
              </p>
              <button type="button" onClick={() => setJustSubmitted(false)} aria-label="Dismiss" className="rounded-md p-1 text-emerald-700 transition-colors hover:bg-emerald-100">
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="px-5 py-6 sm:px-7 sm:py-7">
            {!hydrated ? (
              <div className="space-y-4" role="status" aria-label="Loading your report">
                <div className="h-5 w-64 animate-pulse rounded bg-[#edf0f6]" />
                <div className="h-40 animate-pulse rounded-xl bg-[#f2f4f8]" />
                <div className="h-5 w-48 animate-pulse rounded bg-[#edf0f6]" />
                <div className="h-24 animate-pulse rounded-xl bg-[#f2f4f8]" />
              </div>
            ) : !today ? (
              <ReportComposer
                mode="new"
                initial={draft ? { accomplishments: draft.accomplishments, problems: draft.problems, noProblems: draft.noProblems } : EMPTY_FORM}
                supervisor={supervisor}
                onChange={autosave}
                draftSavedAt={draft?.savedAt}
                submitting={opener.isPending("submit")}
                onSubmit={submit}
              />
            ) : editing ? (
              <ReportComposer
                key={`edit-${today.id}`}
                mode="edit"
                initial={{ accomplishments: today.accomplishments, problems: today.problems, noProblems: !today.problems.trim() }}
                supervisor={supervisor}
                submitting={opener.isPending("submit")}
                onSubmit={saveEdit}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <SubmittedReport
                showDate={false}
                report={today}
                viewerName={me.name}
                onEdit={today.status === "Unread" ? () => setEditing(true) : undefined}
                onReply={(body) => reply(today.id, body)}
              />
            )}
          </div>
        </section>

        {/* ================= History ================= */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          <section className={cn(cardClass, "overflow-hidden")} aria-labelledby="history-title">
            <div className="border-b border-[#edf0f6] px-5 py-4">
              <h2 id="history-title" className="font-bold text-[#101d49]">Previous reports</h2>
              <p className="mt-0.5 text-xs text-[#8995aa]">Last two weeks of working days</p>
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              <ReportHistory reports={past} onOpen={(report) => opener.run(`history-${report.id}`, () => setHistoryId(report.id))} />
            </div>
          </section>

          <section className="rounded-2xl border border-dashed border-[#dce3ef] px-5 py-4">
            <h2 className="text-sm font-bold text-[#101d49]">What makes a useful report</h2>
            <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#64718a]">
              <li>Be specific: &ldquo;finished exercises 1–8&rdquo; beats &ldquo;did SQL&rdquo;.</li>
              <li>Name the blocker and what you already tried.</li>
              <li>One line per task keeps it easy to scan.</li>
            </ul>
          </section>
        </aside>
      </div>

      {/* Past report + its feedback */}
      <AdminModal
        open={Boolean(historyId)}
        onClose={() => setHistoryId(null)}
        variant="drawer"
        eyebrow="Previous report"
        title={historyReport ? longDate(historyReport.reportDate) : ""}
        description={historyReport ? `${historyReport.team} · sent to ${historyReport.supervisor}` : undefined}
      >
        {historyReport && (
          <SubmittedReport compact report={historyReport} viewerName={me.name} onReply={(body) => reply(historyReport.id, body)} />
        )}
      </AdminModal>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
  icon,
  children,
}: {
  label: string;
  value: string;
  note: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="px-5 py-4 transition-colors duration-200 hover:bg-[#fafbfd]">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-[#8995aa]">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-[#101d49]">{value}</p>
      <p className="text-xs text-[#8995aa]">{note}</p>
      {children}
    </div>
  );
}
