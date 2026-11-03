"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Flame, Loader2, MessageSquareText, NotebookPen, RefreshCw, Sparkles, TriangleAlert } from "lucide-react";
import MainLayout from "@/components/layout/dashboard/MainLayout";
import { AdminModal } from "@/components/admin/shared/AdminModal";
import { cardClass, darkButtonClass } from "@/components/admin/shared/admin-ui";
import { useLastDefined } from "@/components/admin/shared/motion";
import { AnimatedSelect, type AnimatedSelectOption } from "@/components/ui/AnimatedSelect";
import { toast } from "@/components/ui/Toaster";
import { ReportComposer, type ReportFormValues } from "@/components/student/reports/ReportComposer";
import { StudentReportDetails } from "@/components/student/reports/StudentReportDetails";
import { StudentReportHistory } from "@/components/student/reports/StudentReportHistory";
import { useCurrentUser } from "@/lib/hooks/auth/use-current-user";
import { useStudentDashboard } from "@/lib/hooks/dashboard/use-student-dashboard";
import { useMyProgrammes } from "@/lib/hooks/student-programmes/use-my-programmes";
import { useSaveStudentReportDraft } from "@/lib/hooks/reports/use-save-student-report-draft";
import { useSendStudentReportFeedback } from "@/lib/hooks/reports/use-send-student-report-feedback";
import { useStudentReportDashboard } from "@/lib/hooks/reports/use-student-report-dashboard";
import { useStudentReports } from "@/lib/hooks/reports/use-student-reports";
import { useSubmitStudentReportDraft } from "@/lib/hooks/reports/use-submit-student-report-draft";
import { useUpdateStudentReportDraft } from "@/lib/hooks/reports/use-update-student-report-draft";
import type { StudentRecentReportDay, StudentReport } from "@/lib/interfaces/reports";
import type { StudentProgrammeEnrolment } from "@/lib/interfaces/student-programmes";
import { UserType } from "@/lib/types/users";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const EMPTY_FORM: ReportFormValues = { accomplishments: "", problems: "", noProblems: false };

function formatDate(value: string, options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" }) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-NG", options).format(date);
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function accomplishmentLines(value: string): string[] {
  return value.split(/\r?\n/).map((line) => line.trim().replace(/^[-•]\s*/, "")).filter(Boolean);
}

function formFromReport(report: StudentReport | null): ReportFormValues {
  if (!report) return EMPTY_FORM;
  return {
    accomplishments: report.accomplishments.join("\n"),
    problems: report.blockerDescription ?? "",
    noProblems: report.noProblemsToday ?? false,
  };
}

export default function StudentDailyReportPage() {
  return <MainLayout><DailyReportWorkspace /></MainLayout>;
}

function DailyReportWorkspace() {
  const { user, isInitialized, isAuthenticated } = useCurrentUser();
  const isStudent = isInitialized && isAuthenticated && user?.role === UserType.STUDENT;
  const studentDashboardQuery = useStudentDashboard({ enabled: isStudent, refetchInterval: false });
  const programmesQuery = useMyProgrammes({ enabled: isStudent });
  const programmeNames = useMemo(() => new Map((studentDashboardQuery.data?.programmes ?? []).map((item) => [item.id, item.name])), [studentDashboardQuery.data]);
  const enrolments = useMemo(() => {
    const pages = programmesQuery.data?.pages ?? [];
    const unique = new Map<string, StudentProgrammeEnrolment>();
    pages.flatMap((page) => page.items).forEach((item) => unique.set(item.programmeId, item));
    return [...unique.values()];
  }, [programmesQuery.data]);
  const programmeOptions: AnimatedSelectOption[] = useMemo(() => enrolments.map((enrolment) => ({
    value: enrolment.programmeId,
    label: programmeNames.get(enrolment.programmeId) ?? enrolment.programme?.name ?? `Programme ${enrolment.programmeId.slice(0, 8)}`,
  })), [enrolments, programmeNames]);

  const [programmeId, setProgrammeId] = useState("");
  useEffect(() => {
    if (!programmeId && programmeOptions.length) setProgrammeId(programmeOptions[0].value);
    else if (programmeId && !programmeOptions.some((option) => option.value === programmeId)) {
      setProgrammeId(programmeOptions[0]?.value ?? "");
    }
  }, [programmeId, programmeOptions]);

  // Load all pages of the student's own enrolments so the selector is complete.
  useEffect(() => {
    if (isStudent && programmesQuery.hasNextPage && !programmesQuery.isFetchingNextPage) {
      void programmesQuery.fetchNextPage();
    }
  }, [isStudent, programmesQuery.hasNextPage, programmesQuery.isFetchingNextPage, programmesQuery.fetchNextPage]);

  const dashboardQuery = useStudentReportDashboard(programmeId, { enabled: isStudent && Boolean(programmeId) });
  const reportsQuery = useStudentReports({ programmeId, limit: PAGE_SIZE }, { enabled: isStudent && Boolean(programmeId) });
  const saveDraftMutation = useSaveStudentReportDraft();
  const updateDraftMutation = useUpdateStudentReportDraft();
  const submitDraftMutation = useSubmitStudentReportDraft();
  const feedbackMutation = useSendStudentReportFeedback();

  const [historyId, setHistoryId] = useState<string | null>(null);
  const [localDraftsByProgramme, setLocalDraftsByProgramme] = useState<Record<string, ReportFormValues>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | undefined>();
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const selectedTutorIdRef = useRef("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSwitchingProgramme, setIsSwitchingProgramme] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const todayReport = dashboardQuery.data?.today.report ?? null;
  const dashboardReport = todayReport?.reportDate === dashboardQuery.data?.today.reportDate ? todayReport : null;
  const isExistingDraft = dashboardReport?.status === "DRAFT";
  const formValuesRef = useRef<ReportFormValues>(formFromReport(dashboardReport));
  const revisionRef = useRef(0);
  const savedRevisionRef = useRef(0);
  const draftIdRef = useRef<string | null>(isExistingDraft ? dashboardReport.id : null);
  const saveRunnerRef = useRef<Promise<string | null> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitLockRef = useRef(false);

  useEffect(() => {
    draftIdRef.current = isExistingDraft ? dashboardReport.id : null;
    if (isExistingDraft) {
      setSavedAt(dashboardReport.updatedAt);
      if (revisionRef.current === 0 && savedRevisionRef.current === 0) {
        formValuesRef.current = formFromReport(dashboardReport);
      }
    }
    else if (!dashboardReport) setSavedAt(undefined);
  }, [dashboardReport?.id, dashboardReport?.status, dashboardReport?.updatedAt, isExistingDraft]);

  useEffect(() => {
    const assignedTutors = dashboardQuery.data?.assignedTutors ?? [];
    const nextTutorId = isExistingDraft && dashboardReport.tutorId
      ? dashboardReport.tutorId
      : assignedTutors.length === 1 ? assignedTutors[0].id : "";
    selectedTutorIdRef.current = nextTutorId;
    setSelectedTutorId(nextTutorId);
  }, [programmeId, dashboardQuery.data?.programme.id, dashboardQuery.data?.assignedTutors, dashboardReport?.id, dashboardReport?.tutorId, isExistingDraft]);

  const clearAutosaveTimer = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;
  }, []);

  const persistLatestDraft = useCallback(async (): Promise<string | null> => {
    if (saveRunnerRef.current) {
      const currentId = await saveRunnerRef.current;
      if (savedRevisionRef.current < revisionRef.current) return persistLatestDraft();
      return currentId;
    }
    if (savedRevisionRef.current >= revisionRef.current) return draftIdRef.current;

    const runner = (async () => {
      let reportId = draftIdRef.current;
      while (savedRevisionRef.current < revisionRef.current) {
        const revision = revisionRef.current;
        const values = formValuesRef.current;
        const payload = {
          accomplishments: accomplishmentLines(values.accomplishments),
          noProblemsToday: values.noProblems,
          blockerDescription: values.noProblems ? null : values.problems.trim() || null,
        };
        const assignedTutors = dashboardQuery.data?.assignedTutors ?? [];
        const tutorId = selectedTutorIdRef.current;
        if (!reportId && assignedTutors.length > 1 && !tutorId) {
          throw new Error("Select the tutor who should receive this report.");
        }
        setSaveStatus("saving");
        setSaveError(null);
        const report = reportId
          ? await updateDraftMutation.mutateAsync({ reportId, programmeId, payload })
          : await saveDraftMutation.mutateAsync({
              programmeId,
              ...(tutorId ? { tutorId } : {}),
              ...payload,
            });
        reportId = report.id;
        draftIdRef.current = report.id;
        savedRevisionRef.current = revision;
        setSavedAt(report.updatedAt);
      }
      setLocalDraftsByProgramme((current) => {
        if (!(programmeId in current)) return current;
        const next = { ...current };
        delete next[programmeId];
        return next;
      });
      setSaveStatus("saved");
      return reportId;
    })();
    saveRunnerRef.current = runner;
    try {
      return await runner;
    } catch (error) {
      setSaveStatus("error");
      setSaveError(errorMessage(error, "The draft could not be saved."));
      throw error;
    } finally {
      if (saveRunnerRef.current === runner) saveRunnerRef.current = null;
    }
  }, [dashboardQuery.data?.assignedTutors, programmeId, saveDraftMutation, updateDraftMutation]);

  const handleFormChange = useCallback((values: ReportFormValues) => {
    formValuesRef.current = values;
    revisionRef.current += 1;
    setSaveStatus("dirty");
    setSaveError(null);
    clearAutosaveTimer();
    if ((dashboardQuery.data?.assignedTutors.length ?? 0) > 1 && !selectedTutorIdRef.current) return;
    saveTimerRef.current = setTimeout(() => {
      void persistLatestDraft().catch(() => undefined);
    }, 700);
  }, [clearAutosaveTimer, dashboardQuery.data?.assignedTutors.length, persistLatestDraft]);

  useEffect(() => () => clearAutosaveTimer(), [clearAutosaveTimer]);

  const flatReports = useMemo(() => {
    const unique = new Map<string, StudentReport>();
    (reportsQuery.data?.pages ?? []).flatMap((page) => page.items).forEach((report) => unique.set(report.id, report));
    return [...unique.values()].sort((a, b) => b.reportDate.localeCompare(a.reportDate));
  }, [reportsQuery.data]);
  const pastReports = useMemo(() => flatReports.filter((report) =>
    report.id !== dashboardReport?.id && report.reportDate !== dashboardQuery.data?.today.reportDate,
  ), [flatReports, dashboardReport?.id, dashboardQuery.data?.today.reportDate]);
  const selectedHistoryReport = useLastDefined(historyId ? flatReports.find((report) => report.id === historyId) ?? null : null);

  const switchProgramme = (nextId: string) => {
    setProgrammeId(nextId);
    const localDraft = localDraftsByProgramme[nextId];
    formValuesRef.current = localDraft ?? EMPTY_FORM;
    revisionRef.current = localDraft ? 1 : 0;
    savedRevisionRef.current = 0;
    draftIdRef.current = null;
    setSelectedTutorId("");
    selectedTutorIdRef.current = "";
    setSaveStatus(localDraft ? "error" : "idle");
    setSaveError(localDraft ? "This draft is kept in this page session and has not synced to the server." : null);
    setSubmitError(null);
  };

  const handleProgrammeChange = (nextId: string) => {
    if (nextId === programmeId || isSubmitting || isSwitchingProgramme) return;
    clearAutosaveTimer();
    const hasUnsavedChanges = revisionRef.current > savedRevisionRef.current;
    if (!hasUnsavedChanges || !dashboardQuery.data) {
      switchProgramme(nextId);
      return;
    }

    const keepDraftLocally = () => {
      setLocalDraftsByProgramme((current) => ({ ...current, [programmeId]: formValuesRef.current }));
    };

    const reportWeekday = new Date(`${dashboardQuery.data.today.reportDate}T00:00:00.000Z`).getUTCDay();
    const canSaveForToday = dashboardQuery.data.reportingPolicy?.requiredWeekdays.includes(reportWeekday) ?? false;

    // A missing policy or a non-reporting day is a known server-side save
    // limitation. Keep the work for this page session and switch immediately.
    if (!canSaveForToday && !saveRunnerRef.current) {
      keepDraftLocally();
      switchProgramme(nextId);
      toast.info("Programme changed", { description: "This programme has no active reporting policy for today. Your unsynced report stays available while this page is open." });
      return;
    }

    setIsSwitchingProgramme(true);
    void persistLatestDraft()
      .catch((error) => {
        keepDraftLocally();
        toast.error("Draft could not be synced", { description: `${errorMessage(error, "The report service could not save this draft.")} You can still change programmes; this text will remain available during this page session.` });
      })
      .finally(() => {
        switchProgramme(nextId);
        setIsSwitchingProgramme(false);
      });
  };

  const submitToday = async (values: ReportFormValues) => {
    if (submitLockRef.current || !programmeId || !dashboardQuery.data) return;
    const previousValues = formValuesRef.current;
    const valuesChanged = previousValues.accomplishments !== values.accomplishments ||
      previousValues.problems !== values.problems || previousValues.noProblems !== values.noProblems;
    formValuesRef.current = values;
    if (valuesChanged || revisionRef.current === savedRevisionRef.current) {
      revisionRef.current += 1;
      setSaveStatus("dirty");
    }
    submitLockRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    clearAutosaveTimer();
    try {
      // Ensure the final keystrokes are persisted before submitting the saved draft.
      if (revisionRef.current > savedRevisionRef.current) await persistLatestDraft();
      const reportId = draftIdRef.current;
      if (!reportId) throw new Error("Your report draft has not been saved yet. Please try again.");
      const report = await submitDraftMutation.mutateAsync({ reportId, programmeId });
      draftIdRef.current = null;
      savedRevisionRef.current = revisionRef.current;
      setSaveStatus("idle");
      setSubmitError(null);
      toast.success("Daily report submitted", { description: `Your tutor can now review your report for ${dashboardQuery.data.programme.name}.` });
      return report;
    } catch (error) {
      const message = errorMessage(error, "Your report could not be submitted. Your saved draft is still available.");
      setSubmitError(message);
      toast.error("Report not submitted", { description: message });
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const sendFeedback = async (report: StudentReport, message: string): Promise<void> => {
    await feedbackMutation.mutateAsync({ reportId: report.id, programmeId: report.programmeId, payload: { message } });
    toast.success("Message sent", { description: "Your tutor will see your feedback." });
  };

  const content = (() => {
    if (!isInitialized) return <LoadingPanel label="Checking your account…" />;
    if (!isAuthenticated || !isStudent) return <MessagePanel title="Student access required" message="Sign in with a student account to view daily reports." />;
    if (programmesQuery.isLoading) return <LoadingPanel label="Loading your enrolled programmes…" />;
    if (programmesQuery.isError) return <MessagePanel title="Could not load programmes" message={errorMessage(programmesQuery.error, "Try again in a moment.")} action={<button type="button" onClick={() => void programmesQuery.refetch()} className={darkButtonClass}><RefreshCw size={14} /> Try again</button>} />;
    if (!enrolments.length) return <MessagePanel title="No enrolled programmes yet" message="Daily reports are available for programmes linked to your student account." />;
    if (!programmeId) return <LoadingPanel label="Preparing your report workspace…" />;
    if (dashboardQuery.isLoading) return <LoadingPanel label="Loading today's report…" />;
    if (dashboardQuery.isError || !dashboardQuery.data) return <MessagePanel title="Could not load report dashboard" message={errorMessage(dashboardQuery.error, "The reporting service could not be reached.")} action={<button type="button" onClick={() => void dashboardQuery.refetch()} className={darkButtonClass}><RefreshCw size={14} /> Try again</button>} />;

    const dashboard = dashboardQuery.data;
    const report = dashboardReport;
    const expected = dashboard.overview.thisWeek.requiredDays;
    const reported = dashboard.overview.thisWeek.reportedDays;
    const tutorLabel = dashboard.assignedTutors.length === 1
      ? dashboard.assignedTutors[0].name ?? "your tutor"
      : dashboard.assignedTutors.length > 1 ? "your tutors" : "your tutor";
    const canCompose = !report || report.status === "DRAFT";

    return (
      <div className="mx-auto max-w-[1400px] space-y-6 pb-10 sm:space-y-8">
        <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]"><Sparkles size={15} className="text-[#c59400]" aria-hidden="true" /> Student workspace</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">Daily reports</h1>
            <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">Share what you worked on, flag blockers early, and keep your tutor informed throughout your learning.</p>
          </div>
          <div className="w-full max-w-sm">
            <label className="mb-1.5 block text-xs font-semibold text-[#64718a]" htmlFor="report-programme">Programme</label>
            <AnimatedSelect id="report-programme" value={programmeId} options={programmeOptions} onChange={handleProgrammeChange} ariaLabel="Select programme for daily report" fullWidth disabled={isSubmitting || isSwitchingProgramme} />
          </div>
        </header>

        <section aria-label="Reporting overview" className={cn(cardClass, "grid grid-cols-2 divide-x divide-y divide-[#edf0f6] [&>*]:border-[#edf0f6] sm:grid-cols-4 sm:divide-y-0")}>
          <Stat label="This week" value={expected === null ? `${reported} days` : `${reported}/${expected}`} note={expected === null ? "reported days · target not configured" : "reported days"} icon={<CalendarDays size={16} className="text-[#2a3f86]" aria-hidden="true" />}>
            {expected !== null && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf0f6]" aria-hidden="true"><div className="h-full rounded-full bg-[#101d49] transition-[width] duration-700" style={{ width: `${Math.min(100, expected > 0 ? (reported / expected) * 100 : 0)}%` }} /></div>}
          </Stat>
          <Stat label="Reporting streak" value={dashboard.overview.streakDays === null ? "—" : `${dashboard.overview.streakDays} day${dashboard.overview.streakDays === 1 ? "" : "s"}`} note={dashboard.overview.streakDays === null ? "not configured" : "in a row"} icon={<Flame size={16} className="text-[#d58a00]" aria-hidden="true" />} />
          <Stat label="Open problems" value={String(dashboard.overview.openProblems)} note={dashboard.overview.openProblems ? "waiting for follow-up" : "none reported as open"} icon={<TriangleAlert size={16} className={dashboard.overview.openProblems ? "text-[#d58a00]" : "text-[#9aa6ba]"} aria-hidden="true" />} />
          <Stat label="Feedback received" value={String(dashboard.overview.feedbackReceived)} note="messages from your tutor" icon={<MessageSquareText size={16} className="text-[#2a3f86]" aria-hidden="true" />} />
        </section>

        {dashboardQuery.isFetching && !dashboardQuery.isLoading && <p className="-mt-3 text-xs text-[#8995aa]" role="status">Refreshing report data…</p>}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className={cn(cardClass, "overflow-hidden")} aria-labelledby="today-report-title">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf0f6] px-5 py-4 sm:px-7">
              <div>
                <h2 id="today-report-title" className="flex items-center gap-2 text-lg font-bold text-[#101d49]"><NotebookPen size={19} className="text-[#c59400]" aria-hidden="true" /> Today&apos;s report</h2>
                <p className="mt-0.5 text-sm text-[#64718a]">{formatDate(dashboard.today.reportDate)}</p>
              </div>
              <div className="text-right text-xs text-[#8995aa]"><p>Programme</p><p className="mt-1 font-semibold text-[#52627f]">{dashboard.programme.name}</p><p className="mt-1">Shared with {tutorLabel}</p></div>
            </div>
            <div className="px-5 py-6 sm:px-7 sm:py-7">
              {report && report.status !== "DRAFT" ? (
                <div className="space-y-5">
                  <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3.5">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
                    <div><p className="text-sm font-semibold text-emerald-900">Your report has been submitted.</p><p className="mt-1 text-sm text-emerald-800">You can review it here. A new report can be submitted when the reporting schedule allows.</p></div>
                  </div>
                  <StudentReportDetails
                    report={report}
                    onSendFeedback={(message) => sendFeedback(report, message)}
                    sendingFeedback={feedbackMutation.isPending}
                  />
                </div>
              ) : canCompose ? (
                <>
                  {submitError && <p role="alert" className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</p>}
                  {dashboard.assignedTutors.length > 1 && !isExistingDraft && (
                    <div className="mb-5 max-w-md">
                      <label htmlFor="report-tutor" className="mb-1.5 block text-sm font-semibold text-[#34415e]">Send report to <span className="text-red-600">*</span></label>
                      <AnimatedSelect id="report-tutor" value={selectedTutorId} options={dashboard.assignedTutors.map((tutor) => ({ value: tutor.id, label: tutor.name ?? "Assigned tutor" }))} onChange={(value) => {
                        setSelectedTutorId(value);
                        selectedTutorIdRef.current = value;
                        if (revisionRef.current > 0) {
                          revisionRef.current += 1;
                          setSaveStatus("dirty");
                          clearAutosaveTimer();
                          saveTimerRef.current = setTimeout(() => { void persistLatestDraft().catch(() => undefined); }, 300);
                        }
                      }} ariaLabel="Choose tutor for this report" fullWidth />
                      <p className="mt-1 text-xs text-[#8995aa]">This programme has multiple tutors. Choose the recipient before saving.</p>
                    </div>
                  )}
                  <ReportComposer
                    key={`${programmeId}:${dashboard.today.reportDate}`}
                    mode="new"
                    initial={localDraftsByProgramme[programmeId] ?? formFromReport(report)}
                    supervisor={tutorLabel}
                    onChange={handleFormChange}
                    draftSavedAt={savedAt ?? report?.updatedAt}
                    draftSaveStatus={saveStatus}
                    draftSaveError={saveError}
                    submitting={isSubmitting || saveDraftMutation.isPending || updateDraftMutation.isPending || submitDraftMutation.isPending}
                    submitDisabled={isSwitchingProgramme || (dashboard.assignedTutors.length > 1 && !selectedTutorId)}
                    onSubmit={(values) => void submitToday(values)}
                  />
                </>
              ) : null}
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <RecentReportDays days={dashboard.recentDays} />
            <StudentReportHistory
              reports={pastReports}
              onOpen={(item) => setHistoryId(item.id)}
              isLoading={reportsQuery.isLoading}
              isError={reportsQuery.isError}
              errorMessage={errorMessage(reportsQuery.error, "Try again in a moment.")}
              onRetry={() => void reportsQuery.refetch()}
              hasNextPage={Boolean(reportsQuery.hasNextPage)}
              isFetchingNextPage={reportsQuery.isFetchingNextPage}
              onLoadMore={() => { if (reportsQuery.hasNextPage && !reportsQuery.isFetchingNextPage) void reportsQuery.fetchNextPage(); }}
            />
            <section className="rounded-2xl border border-dashed border-[#dce3ef] px-5 py-4">
              <h2 className="text-sm font-bold text-[#101d49]">A useful daily report</h2>
              <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#64718a]"><li>List specific tasks or lessons you completed.</li><li>Describe a blocker and what you have tried.</li><li>Your draft saves automatically as you type.</li></ul>
            </section>
          </aside>
        </div>

        <AdminModal open={Boolean(historyId)} onClose={() => setHistoryId(null)} variant="drawer" eyebrow="Report details" title={selectedHistoryReport ? formatDate(selectedHistoryReport.reportDate) : "Previous report"} description={selectedHistoryReport?.programme?.name ?? dashboard.programme.name}>
          {selectedHistoryReport && <StudentReportDetails report={selectedHistoryReport} onSendFeedback={(message) => sendFeedback(selectedHistoryReport, message)} sendingFeedback={feedbackMutation.isPending} compact />}
        </AdminModal>
      </div>
    );
  })();

  return content;
}

function RecentReportDays({ days }: { days: StudentRecentReportDay[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]" aria-labelledby="recent-report-days-title">
      <div className="border-b border-[#edf0f6] px-5 py-4">
        <h2 id="recent-report-days-title" className="font-bold text-[#101d49]">Recent reporting days</h2>
        <p className="mt-0.5 text-xs text-[#8995aa]">A quick view of your recent report activity</p>
      </div>
      {days.length === 0 ? (
        <div className="px-5 py-7 text-center">
          <CalendarDays size={19} className="mx-auto text-[#8995aa]" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-[#34415e]">No recent days to show</p>
          <p className="mt-1 text-xs text-[#8995aa]">Recent reporting dates will appear here.</p>
        </div>
      ) : (
        <ol className="divide-y divide-[#f0f2f7]">
          {days.map(({ reportDate, report }) => (
            <li key={reportDate} className="flex items-start gap-3 px-5 py-3.5">
              <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", report ? "bg-emerald-50 text-emerald-700" : "bg-[#f3f5f9] text-[#8995aa]")}>
                {report ? <CheckCircle2 size={16} aria-hidden="true" /> : <CalendarDays size={15} aria-hidden="true" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#101d49]">{formatDate(reportDate, { weekday: "short", day: "numeric", month: "short" })}</span>
                <span className="mt-0.5 block text-xs leading-5 text-[#718099]">
                  {report ? `${statusLabelForReport(report.status)}${report.accomplishments.length ? ` · ${report.accomplishments.length} accomplishment${report.accomplishments.length === 1 ? "" : "s"}` : ""}` : "No report recorded for this day"}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function statusLabelForReport(status: string) {
  return status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Stat({ label, value, note, icon, children }: { label: string; value: string; note: string; icon?: ReactNode; children?: ReactNode }) {
  return <div className="min-w-0 px-5 py-4 transition-colors duration-200 hover:bg-[#fafbfd]"><p className="flex items-center gap-1.5 text-xs font-semibold text-[#8995aa]">{icon}{label}</p><p className="mt-1 text-2xl font-bold tabular-nums text-[#101d49]">{value}</p><p className="text-xs text-[#8995aa]">{note}</p>{children}</div>;
}

function LoadingPanel({ label }: { label: string }) {
  return <div className="mx-auto flex min-h-[360px] max-w-3xl items-center justify-center rounded-2xl border border-[#e4e9f2] bg-white px-6 text-center" role="status"><div><Loader2 size={26} className="mx-auto animate-spin text-[#101d49]" aria-hidden="true" /><p className="mt-3 text-sm font-medium text-[#64718a]">{label}</p></div></div>;
}

function MessagePanel({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return <div className="mx-auto flex min-h-[360px] max-w-3xl items-center justify-center rounded-2xl border border-[#e4e9f2] bg-white px-6 text-center"><div><span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#fff6d8] text-[#9a7000]"><AlertCircle size={22} aria-hidden="true" /></span><h1 className="mt-4 text-lg font-bold text-[#101d49]">{title}</h1><p className="mt-2 max-w-lg text-sm leading-6 text-[#64718a]">{message}</p>{action && <div className="mt-5 flex justify-center">{action}</div>}</div></div>;
}
