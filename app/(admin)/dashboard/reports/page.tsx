"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, FileText, Inbox, Loader2,
  MessageSquare, Plus, RotateCcw, Search, Sparkles, Users, X,
} from "lucide-react";
import { MainLayout } from "@/components/layout/dashboard";
import { AdminAccessGuard } from "@/components/admin/shared/AdminAccessGuard";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { toast } from "@/components/ui/Toaster";
import { ReportReader } from "@/components/admin/reports/ReportReader";
import { ReporterBadge } from "@/components/admin/reports/ReporterBadge";
import { clockTime, dayLabel, longDate, preview } from "@/components/admin/reports/report-utils";
import { cardClass, getInitials, inputClass, secondaryButtonClass } from "@/components/admin/shared/admin-ui";
import { useAdminReport, useAdminReportFeedback, useAdminReports, useAdminReportSummary } from "@/lib/hooks/reports/use-admin-reports";
import { useMarkAdminReportFeedbackRead, useMarkAdminReportReviewed, useSendAdminReportFeedback } from "@/lib/hooks/reports/use-admin-report-mutations";
import { useCreateReportPolicies } from "@/lib/hooks/reports/use-create-report-policies";
import { useReportPolicyProgrammes } from "@/lib/hooks/reports/use-report-policy-programmes";
import { useProgrammes } from "@/lib/hooks/programmes/use-programmes";
import type { AdminDailyReport, AdminReportListItem, DailyReportProblemStatus, DailyReportStatus } from "@/lib/interfaces/reports";
import type { CreateReportPoliciesDto } from "@/lib/interfaces/report-policies";
import useAuthStore from "@/lib/store/auth";
import { cn } from "@/lib/utils";

type Range = "today" | "yesterday" | "week" | "all";
const RANGE_OPTIONS = [
  { value: "today", label: "Today" }, { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "Last 7 days" }, { value: "all", label: "All dates" },
] as const;
const STATUS_OPTIONS = [
  { value: "", label: "All statuses" }, { value: "SUBMITTED", label: "Submitted" },
  { value: "REVIEWED", label: "Reviewed" }, { value: "RETURNED", label: "Returned" },
];
const PROBLEM_OPTIONS = [
  { value: "", label: "All blockers" }, { value: "OPEN", label: "Open problems" },
  { value: "IN_PROGRESS", label: "In progress" }, { value: "RESOLVED", label: "Resolved" },
];
const WEEKDAYS = [
  { value: 1, label: "Monday" }, { value: 2, label: "Tuesday" }, { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" }, { value: 5, label: "Friday" }, { value: 6, label: "Saturday" }, { value: 0, label: "Sunday" },
];

function dateKey(date: Date): string {
  const year = date.getFullYear();
  return `${year}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function dateRange(range: Range): { fromDate?: string; toDate?: string } {
  if (range === "all") return {};
  const end = new Date();
  const start = new Date(end);
  if (range === "yesterday") { start.setDate(start.getDate() - 1); end.setDate(end.getDate() - 1); }
  else if (range === "week") start.setDate(start.getDate() - 6);
  return { fromDate: dateKey(start), toDate: dateKey(end) };
}
function yearToDate(): { fromDate: string; toDate: string } {
  const now = new Date();
  return { fromDate: `${now.getFullYear()}-01-01`, toDate: dateKey(now) };
}
function rangeLabel(range: Range, fromDate?: string, toDate?: string): string {
  if (range === "all") return "Year to date";
  if (!fromDate || !toDate) return "Selected period";
  return fromDate === toDate ? longDate(fromDate) : `${longDate(fromDate)} – ${longDate(toDate)}`;
}
function reportCopy(report: AdminDailyReport): string {
  return [
    `Daily report — ${report.student.name} · ${report.programme.name}`,
    `${longDate(report.reportDate)} · submitted ${clockTime(report.submittedAt)}`,
    "", "ACCOMPLISHED TODAY", ...(report.accomplishments.length ? report.accomplishments : ["None provided."]),
    "", "PROBLEMS & BLOCKERS", report.blockerDescription || "None reported.",
  ].join("\n");
}

export default function AdminDailyReportsPage() {
  return <MainLayout><AdminAccessGuard permission="manageUsers" areaLabel="Daily reports"><ReportsWorkspace /></AdminAccessGuard></MainLayout>;
}

function ReportsWorkspace() {
  const currentUserId = useAuthStore((state) => state.authUser?.id);
  const [range, setRange] = useState<Range>("today");
  const [status, setStatus] = useState("");
  const [problemStatus, setProblemStatus] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileReading, setMobileReading] = useState(false);
  const markRead = useMarkAdminReportFeedbackRead();
  const markedIdsRef = useRef<Set<string>>(new Set());
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const dates = useMemo(() => dateRange(range), [range]);
  const listParams = useMemo(() => ({
    ...(programmeId ? { programmeId } : {}),
    ...(status ? { status: status as Exclude<DailyReportStatus, "DRAFT"> } : {}),
    ...(problemStatus ? { problemStatus: problemStatus as DailyReportProblemStatus } : {}),
    ...(dates.fromDate && dates.toDate ? dates : {}),
    ...(search ? { search } : {}), limit: 20,
  }), [programmeId, status, problemStatus, dates, search]);
  const reportsQuery = useAdminReports(listParams);
  const reports = useMemo(() => reportsQuery.data?.pages.flatMap((page) => page.items) ?? [], [reportsQuery.data]);
  const reportGroups = useMemo(() => {
    const grouped = new Map<string, AdminReportListItem[]>();
    reports.forEach((report) => grouped.set(report.reportDate, [...(grouped.get(report.reportDate) ?? []), report]));
    return [...grouped.entries()];
  }, [reports]);
  const activeSummaryDates = useMemo(() => dates.fromDate && dates.toDate ? dates : yearToDate(), [dates]);
  const summaryQuery = useAdminReportSummary({ fromDate: activeSummaryDates.fromDate!, toDate: activeSummaryDates.toDate! });

  const programmeQuery = useProgrammes();
  const catalogueProgrammes = useMemo(() => programmeQuery.data?.pages.flatMap((page) => page.items) ?? [], [programmeQuery.data]);
  const filterProgrammeOptions = useMemo(() => [
    { value: "", label: "All programmes" },
    ...catalogueProgrammes.map((programme) => ({ value: programme.id, label: programme.name })),
  ], [catalogueProgrammes]);

  const selected = reports.find((report) => report.id === selectedId) ?? reports[0] ?? null;
  const selectedIndex = selected ? reports.findIndex((report) => report.id === selected.id) : -1;
  useEffect(() => {
    if (!selectedId && reports.length) setSelectedId(reports[0].id);
    else if (selectedId && reports.length && !reports.some((report) => report.id === selectedId)) setSelectedId(reports[0].id);
  }, [reports, selectedId]);
  useEffect(() => { markedIdsRef.current.clear(); }, [selected?.id]);

  const detailQuery = useAdminReport(selected?.id);
  const feedbackQuery = useAdminReportFeedback(selected?.id);
  const messages = useMemo(() => (feedbackQuery.data?.pages.flatMap((page) => page.items) ?? [])
    .slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [feedbackQuery.data]);
  const sendFeedback = useSendAdminReportFeedback();
  const reviewReport = useMarkAdminReportReviewed();

  useEffect(() => {
    if (!selected || !currentUserId || !mobileReading && typeof window !== "undefined" && !window.matchMedia("(min-width: 1024px)").matches) return;
    if (!feedbackQuery.isSuccess) return;
    const unreadIncoming = messages.filter((message) => message.recipientUserId === currentUserId && !message.readAt && !markedIdsRef.current.has(message.id));
    unreadIncoming.forEach((message) => {
      markedIdsRef.current.add(message.id);
      markRead.mutate({ reportId: selected.id, feedbackId: message.id }, {
        onError: () => { markedIdsRef.current.delete(message.id); },
      });
    });
  }, [selected?.id, currentUserId, messages, feedbackQuery.isSuccess, mobileReading]);

  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyProgrammes, setPolicyProgrammes] = useState<string[]>([]);
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [effectiveFrom, setEffectiveFrom] = useState(() => dateKey(new Date()));
  const [effectiveTo, setEffectiveTo] = useState("");
  const [policyError, setPolicyError] = useState<string | null>(null);
  const createPolicies = useCreateReportPolicies();
  const policyProgrammeQuery = useReportPolicyProgrammes();
  const policyProgrammePages = useMemo(() => policyProgrammeQuery.data?.pages.flatMap((page) => page.items) ?? [], [policyProgrammeQuery.data]);
  const eligiblePolicies = useMemo(() => policyProgrammePages.filter((item) => !item.hasActiveReportingPolicy), [policyProgrammePages]);

  const submitPolicies = async () => {
    if (!policyProgrammes.length || !weekdays.length || !effectiveFrom || (effectiveTo && effectiveTo < effectiveFrom)) {
      setPolicyError("Choose at least one programme, one reporting day, and a valid effective date range."); return;
    }
    const payload: CreateReportPoliciesDto = { policies: policyProgrammes.map((id) => ({ programmeId: id, timezone, requiredWeekdays: [...weekdays].sort((a, b) => a - b), effectiveFrom, effectiveTo: effectiveTo || null })) };
    setPolicyError(null);
    try {
      await createPolicies.mutateAsync(payload);
      toast.success("Reporting policies created", { description: `${payload.policies.length} programme${payload.policies.length === 1 ? "" : "s"} configured.` });
      setPolicyOpen(false);
      void policyProgrammeQuery.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create reporting policies.";
      setPolicyError(message); toast.error("Could not create reporting policies", { description: message });
    }
  };

  const resetFilters = () => { setRange("all"); setProgrammeId(""); setStatus(""); setProblemStatus(""); setSearchInput(""); };
  const hasFilters = Boolean(programmeId || status || problemStatus || searchInput || range !== "all");
  const selectReport = (report: AdminReportListItem) => { setSelectedId(report.id); setMobileReading(true); };
  const move = async (step: number) => {
    const nextIndex = selectedIndex + step;
    if (nextIndex >= 0 && nextIndex < reports.length) { setSelectedId(reports[nextIndex].id); return; }
    if (step > 0 && reportsQuery.hasNextPage && !reportsQuery.isFetchingNextPage) {
      const result = await reportsQuery.fetchNextPage();
      const expanded = result.data?.pages.flatMap((page) => page.items) ?? [];
      if (expanded[reports.length]) setSelectedId(expanded[reports.length].id);
    }
  };
  const onReply = async (body: string) => {
    if (!selected) return;
    await sendFeedback.mutateAsync({ reportId: selected.id, payload: { message: body } });
    toast.success("Feedback sent", { description: `Your message was added to ${selected.student.name.split(" ")[0]}'s report conversation.` });
  };
  const onReview = async () => {
    if (!selected) return;
    try { await reviewReport.mutateAsync(selected.id); toast.success("Report marked as reviewed"); }
    catch (error) { toast.error("Could not mark report as reviewed", { description: error instanceof Error ? error.message : "Please try again." }); }
  };
  const copySelected = async () => {
    const report = detailQuery.data;
    if (!report) return;
    try { await navigator.clipboard.writeText(reportCopy(report)); toast.success("Report copied as text"); }
    catch { toast.error("Couldn't copy the report"); }
  };

  const summary = summaryQuery.data?.summary;
  const rangeSummaryLabel = rangeLabel(range, activeSummaryDates.fromDate, activeSummaryDates.toDate);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]"><Sparkles size={15} className="text-[#c59400]" aria-hidden="true" /> Insights · Administration</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">Daily reports</h1>
          <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">Review student updates, follow up on blockers, and keep reporting on track.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button type="button" onClick={() => { setPolicyProgrammes([]); setPolicyError(null); setPolicyOpen(true); }} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#192c65] focus:outline-none focus:ring-4 focus:ring-[#101d49]/15"><Plus size={16} aria-hidden="true" />Create policy</button>
          <div role="radiogroup" aria-label="Quick date range" className="inline-flex rounded-xl border border-[#e4e9f2] bg-white p-1">
            {RANGE_OPTIONS.map((option) => <button key={option.value} type="button" role="radio" aria-checked={range === option.value} onClick={() => setRange(option.value)} className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors", range === option.value ? "bg-[#101d49] text-white shadow-sm" : "text-[#64718a] hover:bg-[#f1f4fa] hover:text-[#101d49]")}>{option.label}</button>)}
          </div>
        </div>
      </header>

      <section aria-label="Report summary" className={cn(cardClass, "grid divide-y divide-[#edf0f6] sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4 xl:divide-x")}>
        <SummaryMetric label="Submitted reports" value={summary?.submittedReports} suffix={summary ? ` / ${summary.expectedReports} expected` : undefined} hint={rangeSummaryLabel} icon={FileText} loading={summaryQuery.isLoading} error={summaryQuery.isError} onRetry={() => void summaryQuery.refetch()} />
        <SummaryMetric label="Open problems" value={summary?.openProblems} hint="Need follow-up" icon={AlertTriangle} tone="amber" loading={summaryQuery.isLoading} error={summaryQuery.isError} onRetry={() => void summaryQuery.refetch()} onClick={() => setProblemStatus("OPEN")} />
        <SummaryMetric label="Awaiting review" value={summary?.awaitingReview} hint="Submitted and not reviewed" icon={Inbox} loading={summaryQuery.isLoading} error={summaryQuery.isError} onRetry={() => void summaryQuery.refetch()} onClick={() => setStatus("SUBMITTED")} />
        <SummaryMetric label="Not submitted" value={summary?.notSubmittedReports} hint={`Expected in ${rangeSummaryLabel.toLowerCase()}`} icon={Users} tone="red" loading={summaryQuery.isLoading} error={summaryQuery.isError} onRetry={() => void summaryQuery.refetch()} />
      </section>

      <section className={cn(cardClass, "grid overflow-hidden lg:h-[calc(100dvh-250px)] lg:min-h-[640px] lg:grid-cols-[minmax(340px,400px)_1fr]")}>
        <div className={cn("min-h-0 flex-col border-[#edf0f6] lg:flex lg:border-r", mobileReading ? "hidden" : "flex")}>
          <div className="space-y-3 border-b border-[#edf0f6] p-4">
            <label className="relative block">
              <span className="sr-only">Search reports</span><Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8995aa]" aria-hidden="true" />
              <input type="search" maxLength={100} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search students, programmes or report text…" className={cn(inputClass, "h-10 pl-10 hover:border-[#b9c5da]")} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <AnimatedSelect ariaLabel="Filter by report status" value={status} onChange={setStatus} options={STATUS_OPTIONS} fullWidth className="w-full" />
              <AnimatedSelect ariaLabel="Filter by programme" value={programmeId} onChange={setProgrammeId} options={filterProgrammeOptions} fullWidth className="w-full" menuMinWidth={220} />
            </div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
              <AnimatedSelect ariaLabel="Filter by blocker status" value={problemStatus} onChange={setProblemStatus} options={PROBLEM_OPTIONS} fullWidth className="w-full" />
              {programmeQuery.hasNextPage && <button type="button" onClick={() => void programmeQuery.fetchNextPage()} disabled={programmeQuery.isFetchingNextPage} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#34415e] hover:bg-[#f4f6fa] disabled:opacity-50">{programmeQuery.isFetchingNextPage ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}More programmes</button>}
            </div>
            <p className="text-xs text-[#718099]">{range === "all" ? "All report dates" : `${dates.fromDate ? longDate(dates.fromDate) : ""}${dates.toDate && dates.toDate !== dates.fromDate ? ` – ${longDate(dates.toDate)}` : ""}`} · filters are applied by the reports service</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto" aria-label="Reports" role="region">
            {reportsQuery.isLoading ? <ReportListLoading /> : reportsQuery.isError ? <InlineError title="Could not load reports" message={reportsQuery.error instanceof Error ? reportsQuery.error.message : "Please try again."} onRetry={() => void reportsQuery.refetch()} /> : reports.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-16 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]"><FileText size={22} aria-hidden="true" /></span><p className="mt-4 font-semibold text-[#101d49]">No reports found</p><p className="mt-1 max-w-xs text-sm leading-6 text-[#64718a]">Try another date range or clear the active filters.</p>{hasFilters && <button type="button" onClick={resetFilters} className={cn(secondaryButtonClass, "mt-4")}><RotateCcw size={15} aria-hidden="true" />Clear filters</button>}</div>
            ) : <>
              {reportGroups.map(([day, dayReports]) => <div key={day}>
                <h2 className="sticky top-0 z-10 flex items-center justify-between border-b border-[#edf0f6] bg-[#fafbfd]/95 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8995aa] backdrop-blur">{dayLabel(day)}<span className="font-semibold normal-case tracking-normal">{dayReports.length} report{dayReports.length === 1 ? "" : "s"}</span></h2>
                {dayReports.map((report) => <ReportRow key={report.id} report={report} active={selected?.id === report.id} onClick={() => selectReport(report)} />)}
              </div>)}
              {reportsQuery.hasNextPage && <div className="border-t border-[#edf0f6] p-3"><button type="button" onClick={() => void reportsQuery.fetchNextPage()} disabled={reportsQuery.isFetchingNextPage} className={cn(secondaryButtonClass, "w-full justify-center disabled:opacity-60")}>{reportsQuery.isFetchingNextPage && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}{reportsQuery.isFetchingNextPage ? "Loading more reports…" : "Load more reports"}<ArrowRight size={14} aria-hidden="true" /></button></div>}
              {!reportsQuery.hasNextPage && <p className="px-4 py-3 text-center text-xs text-[#718099]">All matching reports are loaded.</p>}
            </>}
          </div>
        </div>

        <div className={cn("min-h-[70vh] flex-col lg:flex lg:min-h-0", mobileReading ? "flex" : "hidden")}>
          {!selected ? <div className="flex flex-1 flex-col items-center justify-center p-10 text-center text-sm text-[#718099]"><Inbox size={28} className="text-[#c3cad8]" aria-hidden="true" /><p className="mt-3">Select a report to read it.</p></div> : detailQuery.isLoading ? <div className="flex flex-1 items-center justify-center gap-2 text-sm text-[#64718a]"><Loader2 size={17} className="animate-spin" />Loading report…</div> : detailQuery.isError ? <InlineError title="Could not load report details" message={detailQuery.error instanceof Error ? detailQuery.error.message : "Please try again."} onRetry={() => void detailQuery.refetch()} /> : detailQuery.data && (
            <ReportReader
              report={detailQuery.data}
              messages={messages}
              currentUserId={currentUserId}
              position={selectedIndex + 1}
              total={reports.length}
              hasOlderMessages={Boolean(feedbackQuery.hasNextPage)}
              loadingMessages={feedbackQuery.isLoading}
              loadingOlderMessages={feedbackQuery.isFetchingNextPage}
              sending={sendFeedback.isPending}
              reviewing={reviewReport.isPending}
              onLoadOlderMessages={() => { if (feedbackQuery.hasNextPage && !feedbackQuery.isFetchingNextPage) void feedbackQuery.fetchNextPage(); }}
              onPrevious={() => void move(-1)}
              onNext={() => void move(1)}
              onBack={() => setMobileReading(false)}
              onMarkReviewed={() => void onReview()}
              onReply={onReply}
              onCopy={() => void copySelected()}
            />
          )}
          {selected && feedbackQuery.isError && <div role="alert" className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">Could not load the conversation. <button type="button" onClick={() => void feedbackQuery.refetch()} className="font-semibold underline">Try again</button></div>}
        </div>
      </section>

      <p className="text-xs text-[#718099]">Summary period: {rangeSummaryLabel}. The report feed and summary are loaded from the reporting service.</p>

      <AnimatePresence>
        {policyOpen && <motion.div key="report-policy-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22 }} className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#071027]/55 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !createPolicies.isPending) setPolicyOpen(false); }}>
          <motion.section initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.975 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.99 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }} role="dialog" aria-modal="true" aria-labelledby="policy-title" className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_24px_80px_rgba(7,16,39,0.25)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#edf0f6] px-5 py-5 sm:px-6"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8995aa]">Daily reporting setup</p><h2 id="policy-title" className="mt-1 text-lg font-bold text-[#101d49]">Create report policies</h2><p className="mt-1 text-sm text-[#64718a]">Apply one reporting schedule to one or more programmes.</p></div><button type="button" onClick={() => setPolicyOpen(false)} disabled={createPolicies.isPending} aria-label="Close policy dialog" className="rounded-lg p-2 text-[#718099] hover:bg-[#f3f5f9] disabled:opacity-50"><X size={18} /></button></div>
            <div className="max-h-[calc(100dvh-12rem)] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              {policyError && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{policyError}</div>}
              <div><label className="text-sm font-semibold text-[#34415e]">Programmes</label><p className="mt-0.5 text-xs text-[#718099]">Select every programme to receive this policy.</p>
                {policyProgrammeQuery.isLoading ? <p className="mt-2 text-sm text-[#64718a]">Loading programmes…</p> : policyProgrammeQuery.isError ? <InlineError title="Programme options unavailable" message="Retry loading programme options." onRetry={() => void policyProgrammeQuery.refetch()} /> : <div className="mt-2 max-h-44 space-y-1 overflow-y-auto rounded-xl border border-[#e4e9f2] p-2">{eligiblePolicies.map((item) => <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#34415e] hover:bg-[#f6f8fc]"><input type="checkbox" checked={policyProgrammes.includes(item.id)} onChange={(event) => setPolicyProgrammes((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} className="size-4 accent-[#101d49]" />{item.name}</label>)}{policyProgrammeQuery.hasNextPage && <button type="button" onClick={() => void policyProgrammeQuery.fetchNextPage()} disabled={policyProgrammeQuery.isFetchingNextPage} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#34415e] hover:bg-[#f6f8fc]">{policyProgrammeQuery.isFetchingNextPage ? "Loading…" : "Load more programmes"}</button>}{!eligiblePolicies.length && !policyProgrammeQuery.hasNextPage && <p className="px-3 py-2 text-sm text-[#64718a]">Every programme has an active reporting policy.</p>}</div>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Timezone"><AnimatedSelect ariaLabel="Reporting timezone" value={timezone} onChange={setTimezone} options={["Africa/Lagos", "UTC", "America/New_York", "Europe/London"].map((value) => ({ value, label: value }))} menuMinWidth={250} /></Field><Field label="Effective from"><DatePicker ariaLabel="Effective from" value={effectiveFrom} onChange={setEffectiveFrom} /></Field><Field label="Effective to" hint="Optional"><DatePicker ariaLabel="Effective to" value={effectiveTo} onChange={setEffectiveTo} minDate={effectiveFrom || undefined} /></Field></div>
              <div><p className="text-sm font-semibold text-[#34415e]">Required weekdays</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{WEEKDAYS.map((day) => { const active = weekdays.includes(day.value); return <button key={day.value} type="button" aria-pressed={active} onClick={() => setWeekdays((current) => active ? current.filter((value) => value !== day.value) : [...current, day.value])} className={cn("rounded-xl border px-3 py-2 text-xs font-semibold transition-colors", active ? "border-[#101d49] bg-[#101d49] text-white" : "border-[#e4e9f2] text-[#64718a] hover:bg-[#f6f8fc]")}>{day.label}</button>; })}</div></div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-[#edf0f6] bg-[#fbfcfe] px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" onClick={() => setPolicyOpen(false)} disabled={createPolicies.isPending} className={secondaryButtonClass}>Cancel</button><button type="button" onClick={() => void submitPolicies()} disabled={createPolicies.isPending || !policyProgrammes.length} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#192c65] disabled:cursor-not-allowed disabled:opacity-50">{createPolicies.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}{createPolicies.isPending ? "Saving…" : `Save ${policyProgrammes.length || ""} polic${policyProgrammes.length === 1 ? "y" : "ies"}`}</button></div>
          </motion.section>
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}

function ReportRow({ report, active, onClick }: { report: AdminReportListItem; active: boolean; onClick: () => void }) {
  const hasBlocker = Boolean(report.blockerDescription?.trim());
  const resolved = report.problemStatus === "RESOLVED" || Boolean(report.resolvedAt);
  return <button type="button" onClick={onClick} aria-current={active ? "true" : undefined} className={cn("group relative flex w-full gap-3 border-b border-[#f0f2f7] px-4 py-3.5 text-left outline-none transition-colors focus-visible:bg-[#f4f7ff]", active ? "bg-[#f4f7ff]" : "hover:bg-[#f8faff]")}>
    <span className={cn("absolute inset-y-0 left-0 w-[3px] rounded-r-full", active ? "bg-[#101d49]" : "bg-transparent group-hover:bg-[#f5c542]")} aria-hidden="true" />
    <span className="relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-xs font-bold text-[#101d49]">{getInitials(report.student.name)}{report.status === "SUBMITTED" && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-[#f5c542]"><span className="sr-only">Awaiting review</span></span>}</span>
    <span className="min-w-0 flex-1"><span className="flex items-baseline gap-2"><span className="truncate text-sm font-semibold text-[#101d49]">{report.student.name}</span><ReporterBadge type="Student" className="shrink-0"/><time dateTime={report.submittedAt ?? report.reportDate} className="ml-auto shrink-0 text-xs tabular-nums text-[#718099]">{clockTime(report.submittedAt)}</time></span><span className="mt-0.5 block truncate text-xs font-semibold text-[#64718a]">{report.programme.name}</span><span className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-[#34415e]">{preview(report.accomplishments.join(" · ")) || "No accomplishments provided."}</span><span className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold">{hasBlocker && <span className={cn("inline-flex items-center gap-1", resolved ? "text-emerald-700" : "text-[#9a6700]")}>{resolved ? <CheckCircle2 size={12}/> : <AlertTriangle size={12}/>} {resolved ? "Problem resolved" : "Problem raised"}</span>}{report.feedbackCount > 0 && <span className="inline-flex items-center gap-1 text-[#64718a]"><MessageSquare size={12}/>{report.feedbackCount}</span>}{report.status === "REVIEWED" && <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 size={12}/>Reviewed</span>}</span></span>
  </button>;
}

function SummaryMetric({ label, value, suffix, hint, icon: Icon, tone = "navy", loading, error, onRetry, onClick }: { label: string; value?: number; suffix?: string; hint: string; icon: typeof FileText; tone?: "navy" | "amber" | "red"; loading: boolean; error: boolean; onRetry: () => void; onClick?: () => void }) {
  const toneClass = tone === "amber" ? "bg-[#fff1c7] text-[#9a6700]" : tone === "red" ? "bg-red-50 text-[#bd3434]" : "bg-[#eaf0ff] text-[#101d49]";
  const contents = <><span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", toneClass)}><Icon size={19} aria-hidden="true"/></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[#8995aa]">{label}</span><span className="mt-1 block text-2xl font-bold text-[#101d49]">{loading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-[#edf0f6]"/> : error ? "—" : <>{value ?? 0}{suffix && <span className="ml-1 text-sm font-semibold text-[#8995aa]">{suffix}</span>}</>}</span><span className="mt-1 block truncate text-xs text-[#64718a]">{hint}</span></span></>;
  return <div className={cn("flex items-center gap-4 px-5 py-4", onClick && "cursor-pointer hover:bg-[#f8faff]")} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={onClick ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onClick(); } } : undefined}>{contents}{error && <button type="button" onClick={(event) => { event.stopPropagation(); onRetry(); }} aria-label={`Retry ${label}`} className="rounded-lg p-2 text-[#64718a] hover:bg-[#f1f4fa]"><RotateCcw size={15}/></button>}</div>;
}

function ReportListLoading() { return <div className="space-y-5 p-5" aria-label="Loading reports">{Array.from({ length: 5 }, (_, index) => <div key={index} className="flex gap-3"><span className="size-9 animate-pulse rounded-full bg-[#edf0f6]"/><span className="flex-1 space-y-2"><span className="block h-3 w-1/2 animate-pulse rounded bg-[#edf0f6]"/><span className="block h-3 w-2/3 animate-pulse rounded bg-[#edf0f6]"/><span className="block h-8 w-full animate-pulse rounded bg-[#f3f5f9]"/></span></div>)}</div>; }
function InlineError({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) { return <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertTriangle size={22}/></span><p className="mt-3 font-semibold text-[#101d49]">{title}</p><p className="mt-1 max-w-sm text-sm text-[#64718a]">{message}</p><button type="button" onClick={onRetry} className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#101d49] px-3.5 text-sm font-semibold text-white hover:bg-[#192c65]"><RotateCcw size={14}/>Try again</button></div>; }
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) { return <div className="min-w-0 space-y-1.5"><div><p className="text-sm font-semibold text-[#34415e]">{label}</p>{hint && <p className="mt-0.5 text-xs text-[#718099]">{hint}</p>}</div>{children}</div>; }
