"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Inbox,
  Loader2,
  MessageSquareText,
  RotateCw,
  Search,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";

import { MainLayout } from "@/components/layout/dashboard";
import { AdminAccessGuard } from "@/components/admin/shared/AdminAccessGuard";
import { Select, type SelectOption } from "@/components/admin/shared/Select";
import {
  cardClass,
  getInitials,
  inputClass,
  secondaryButtonClass,
} from "@/components/admin/shared/admin-ui";
import { ReportReader } from "@/components/admin/reports/ReportReader";
import { ReportStatusBadge } from "@/components/admin/reports/ReportStatusBadge";
import { DatePicker } from "@/components/ui/DatePicker";
import { toast } from "@/components/ui/Toaster";
import { useAdminReportSummary } from "@/lib/hooks/reports/use-admin-report-summary";
import { useAdminReports } from "@/lib/hooks/reports/use-admin-reports";
import { useMarkAdminReportReviewed } from "@/lib/hooks/reports/use-mark-admin-report-reviewed";
import { useSendAdminReportFeedback } from "@/lib/hooks/reports/use-admin-report-feedback";
import { useProgrammes } from "@/lib/hooks/programmes/use-programmes";
import type {
  AdminReport,
  AdminVisibleReportStatus,
  DailyReportProblemStatus,
} from "@/lib/interfaces/reports";
import { cn } from "@/lib/utils";

type DatePreset = "today" | "last7" | "month" | "custom";
type ReportStatusFilter = "" | AdminVisibleReportStatus;
type ProblemStatusFilter = "" | DailyReportProblemStatus;

const REPORT_STATUS_OPTIONS: readonly SelectOption<ReportStatusFilter>[] = [
  { value: "", label: "All report statuses" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "RETURNED", label: "Returned" },
];

const PROBLEM_STATUS_OPTIONS: readonly SelectOption<ProblemStatusFilter>[] = [
  { value: "", label: "All blocker states" },
  { value: "OPEN", label: "Open blockers" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
];

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom range" },
];

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getPresetRange(preset: Exclude<DatePreset, "custom">, now = new Date()) {
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const from = new Date(to);
  if (preset === "last7") from.setDate(from.getDate() - 6);
  if (preset === "month") from.setDate(1);
  return { fromDate: dateKey(from), toDate: dateKey(to) };
}

function formatDateOnly(value: string, options: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-NG", options).format(new Date(year, month - 1, day, 12));
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

function statusLabel(status: AdminVisibleReportStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function reportAsText(report: AdminReport) {
  return [
    `Daily report — ${report.student.name}`,
    `Programme: ${report.programme.name}`,
    `Tutor: ${report.tutor.name}`,
    `${formatDateOnly(report.reportDate)} · submitted ${formatTimestamp(report.submittedAt)}`,
    `Status: ${statusLabel(report.status)}`,
    "",
    "ACCOMPLISHMENTS",
    report.accomplishments.length ? report.accomplishments.map((item) => `• ${item}`).join("\n") : "None provided.",
    "",
    "BLOCKER",
    report.noProblemsToday ? "No problems reported." : report.blockerDescription?.trim() || "No blocker details provided.",
  ].join("\n");
}

function reportPreview(report: AdminReport) {
  const text = report.accomplishments.filter(Boolean).join(" · ").replace(/\s+/g, " ");
  if (!text) return report.noProblemsToday ? "No accomplishments listed" : report.blockerDescription || "Daily report";
  return text.length > 145 ? `${text.slice(0, 142).trimEnd()}…` : text;
}

export default function AdminDailyReportsPage() {
  return (
    <MainLayout>
      <AdminAccessGuard permission="manageUsers" areaLabel="Daily reports">
        <ReportsWorkspace />
      </AdminAccessGuard>
    </MainLayout>
  );
}

function ReportsWorkspace() {
  const [datePreset, setDatePreset] = useState<DatePreset>("last7");
  const [dateRange, setDateRange] = useState(() => getPresetRange("last7"));
  const [programmeId, setProgrammeId] = useState("");
  const [status, setStatus] = useState<ReportStatusFilter>("");
  const [problemStatus, setProblemStatus] = useState<ProblemStatusFilter>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selection, setSelection] = useState<{ id: string; filterKey: string } | null>(null);
  const [mobileReading, setMobileReading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const programmesQuery = useProgrammes();
  useEffect(() => {
    if (programmesQuery.hasNextPage && !programmesQuery.isFetchingNextPage) {
      void programmesQuery.fetchNextPage();
    }
  }, [programmesQuery.hasNextPage, programmesQuery.isFetchingNextPage, programmesQuery.fetchNextPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const programmeOptions = useMemo(() => {
    const items = programmesQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const unique = new Map(items.map((programme) => [programme.id, programme]));
    return [
      { value: "", label: "All programmes" },
      ...[...unique.values()].map((programme) => ({ value: programme.id, label: programme.name })),
    ] satisfies SelectOption<string>[];
  }, [programmesQuery.data]);

  const listFilters = useMemo(() => ({
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    programmeId: programmeId || undefined,
    status: status || undefined,
    problemStatus: problemStatus || undefined,
    search: debouncedSearch || undefined,
    limit: 20,
  }), [dateRange.fromDate, dateRange.toDate, programmeId, status, problemStatus, debouncedSearch]);
  const filterKey = JSON.stringify(listFilters);

  const summaryQuery = useAdminReportSummary(dateRange);
  const reportsQuery = useAdminReports(listFilters);
  const markReviewed = useMarkAdminReportReviewed();
  const sendFeedback = useSendAdminReportFeedback();

  const reports = useMemo(() => {
    const pages = reportsQuery.data?.pages ?? [];
    const unique = new Map<string, AdminReport>();
    pages.forEach((page) => page.items.forEach((report) => unique.set(report.id, report)));
    return [...unique.values()];
  }, [reportsQuery.data]);

  const groups = useMemo(() => {
    const byDate = new Map<string, AdminReport[]>();
    reports.forEach((report) => {
      const dayReports = byDate.get(report.reportDate) ?? [];
      dayReports.push(report);
      byDate.set(report.reportDate, dayReports);
    });
    return [...byDate.entries()];
  }, [reports]);

  const activeSelectionId = selection?.filterKey === filterKey ? selection.id : null;
  const selected = reports.find((report) => report.id === activeSelectionId) ?? reports[0] ?? null;
  const selectedIndex = selected ? reports.findIndex((report) => report.id === selected.id) : -1;

  useEffect(() => {
    if (selection && selection.filterKey !== filterKey) {
      setSelection(null);
      setMobileReading(false);
    }
  }, [filterKey, selection]);

  const selectReport = (id: string, focus = false) => {
    setSelection({ id, filterKey });
    setMobileReading(true);
    if (focus) listRef.current?.querySelector<HTMLButtonElement>(`[data-report-id="${id}"]`)?.focus();
  };

  const moveSelection = (step: number) => {
    const next = reports[selectedIndex + step];
    if (next) selectReport(next.id, true);
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (["ArrowDown", "j"].includes(event.key)) {
      event.preventDefault();
      moveSelection(1);
    } else if (["ArrowUp", "k"].includes(event.key)) {
      event.preventDefault();
      moveSelection(-1);
    }
  };

  const choosePreset = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== "custom") setDateRange(getPresetRange(preset));
  };

  const changeFromDate = (fromDate: string) => {
    setDatePreset("custom");
    setDateRange((current) => ({
      fromDate,
      toDate: current.toDate && current.toDate >= fromDate ? current.toDate : fromDate,
    }));
  };

  const changeToDate = (toDate: string) => {
    setDatePreset("custom");
    setDateRange((current) => ({ ...current, toDate }));
  };

  const refresh = async () => {
    const outcomes = await Promise.all([reportsQuery.refetch(), summaryQuery.refetch()]);
    if (outcomes.some((outcome) => outcome.isError)) {
      toast.error("Some report data could not be refreshed.");
    }
  };

  const handleMarkReviewed = async (report: AdminReport) => {
    try {
      await markReviewed.mutateAsync({ reportId: report.id });
      toast.success("Report marked as reviewed", { description: `${report.student.name} · ${formatDateOnly(report.reportDate, { day: "numeric", month: "short" })}.` });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not mark this report as reviewed.");
    }
  };

  const handleSendFeedback = async (report: AdminReport, message: string) => {
    try {
      await sendFeedback.mutateAsync({ reportId: report.id, payload: { message } });
      toast.success("Feedback sent", { description: `Your message was sent for ${report.student.name}'s report.` });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send feedback.");
      throw error;
    }
  };

  const copyReport = async (report: AdminReport) => {
    try {
      await navigator.clipboard.writeText(reportAsText(report));
      toast.success("Report copied");
    } catch {
      toast.error("Could not copy this report.");
    }
  };

  const clearFilters = () => {
    setProgrammeId("");
    setStatus("");
    setProblemStatus("");
    setSearch("");
    setDebouncedSearch("");
    setDatePreset("last7");
    setDateRange(getPresetRange("last7"));
  };

  const hasActiveFilters = Boolean(programmeId || status || problemStatus || search);
  const summary = summaryQuery.data?.summary;
  const isRefreshing = reportsQuery.isFetching || summaryQuery.isFetching;
  const fetchNextReportsPage = () => reportsQuery.fetchNextPage();

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
            <Sparkles size={15} className="text-[#c59400]" aria-hidden="true" /> Insights · Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">Daily reports</h1>
          <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">
            Review student updates, follow blockers, and keep feedback moving.
          </p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={isRefreshing} className={cn(secondaryButtonClass, "min-h-10 self-start lg:self-auto")}>
          <RotateCw size={15} aria-hidden="true" className={isRefreshing ? "animate-spin" : undefined} />
          {isRefreshing ? "Refreshing…" : "Refresh reports"}
        </button>
      </header>

      <section aria-labelledby="summary-heading" className="space-y-3">
        <div>
          <h2 id="summary-heading" className="text-base font-bold text-[#101d49]">Reports for the selected period</h2>
          <p className="mt-1 text-sm text-[#64718a]">Server summary · {formatDateOnly(dateRange.fromDate, { day: "numeric", month: "short", year: "numeric" })} – {formatDateOnly(dateRange.toDate, { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
        {summaryQuery.isError ? (
          <div className={cn(cardClass, "flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between")}>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><AlertTriangle size={18} aria-hidden="true" /></span>
              <div><p className="font-semibold text-[#101d49]">Could not load the report summary</p><p className="mt-1 text-sm text-[#64718a]">{summaryQuery.error instanceof Error ? summaryQuery.error.message : "Please try again."}</p></div>
            </div>
            <button type="button" onClick={() => void summaryQuery.refetch()} className={cn(secondaryButtonClass, "min-h-9")}>Try again</button>
          </div>
        ) : (
          <div className={cn(cardClass, "grid divide-y divide-[#edf0f6] sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4 xl:divide-x")}>
            <SummaryMetric
              label="Submitted reports"
              value={summary?.submittedReports}
              detail={summary ? `of ${summary.expectedReports} expected` : "Reports received in this period"}
              icon={FileText}
              loading={summaryQuery.isPending}
              progress={summary ? summary.expectedReports > 0 ? Math.min(100, summary.submittedReports / summary.expectedReports * 100) : 0 : undefined}
            />
            <SummaryMetric label="Not submitted" value={summary?.notSubmittedReports} detail="Expected reports not received" icon={UsersRound} tone="red" loading={summaryQuery.isPending} />
            <SummaryMetric label="Open blockers" value={summary?.openProblems} detail="Reports needing follow-up" icon={AlertTriangle} tone="amber" loading={summaryQuery.isPending} />
            <SummaryMetric label="Awaiting review" value={summary?.awaitingReview} detail="Submitted reports to review" icon={Inbox} loading={summaryQuery.isPending} />
          </div>
        )}
      </section>

      <section className={cn(cardClass, "overflow-hidden")} aria-label="Admin report inbox">
        <div className="flex flex-col gap-4 border-b border-[#edf0f6] p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="font-bold text-[#101d49]">Report inbox</h2>
              <p className="mt-1 text-sm text-[#64718a]">Search and filter server reports. Draft reports are not included in this inbox.</p>
            </div>
            <div className="flex flex-wrap gap-1 rounded-xl border border-[#e4e9f2] bg-[#f8f9fc] p-1" role="group" aria-label="Summary date presets">
              {DATE_PRESETS.map((preset) => (
                <button key={preset.value} type="button" aria-pressed={datePreset === preset.value} onClick={() => choosePreset(preset.value)} className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors", datePreset === preset.value ? "bg-[#101d49] text-white shadow-sm" : "text-[#64718a] hover:bg-white hover:text-[#101d49]")}>{preset.label}</button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(170px,1fr)_minmax(170px,1fr)_minmax(170px,1fr)]">
            <label className="relative block min-w-0">
              <span className="sr-only">Search reports</span>
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8995aa]" aria-hidden="true" />
              <input type="text" value={search} maxLength={100} onChange={(event) => setSearch(event.target.value)} placeholder="Search student, tutor, programme, report…" className={cn(inputClass, "h-10 pr-10 pl-10 hover:border-[#b9c5da]")} />
              {search && <button type="button" aria-label="Clear report search" onClick={() => setSearch("")} className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[#8995aa] hover:bg-[#f1f4fa] hover:text-[#101d49]"><X size={15} aria-hidden="true" /></button>}
            </label>
            <Select ariaLabel="Filter reports by programme" value={programmeId} onChange={setProgrammeId} options={programmeOptions} />
            <Select<ReportStatusFilter> ariaLabel="Filter reports by status" value={status} onChange={setStatus} options={REPORT_STATUS_OPTIONS} />
            <Select<ProblemStatusFilter> ariaLabel="Filter reports by blocker status" value={problemStatus} onChange={setProblemStatus} options={PROBLEM_STATUS_OPTIONS} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-[#64718a]">Report date from</label>
              <DatePicker value={dateRange.fromDate} onChange={changeFromDate} ariaLabel="Report date from" className="w-full" clearable={false} />
            </div>
            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-[#64718a]">Report date to</label>
              <DatePicker value={dateRange.toDate} onChange={changeToDate} minDate={dateRange.fromDate} ariaLabel="Report date to" className="w-full" clearable={false} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#8995aa]">
            <p>Dates are inclusive and follow the report calendar returned by the service.</p>
            {hasActiveFilters && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 font-semibold text-[#34415e] hover:text-[#101d49]"><RotateCw size={13} aria-hidden="true" /> Clear search and filters</button>}
          </div>
        </div>

        <div className="grid min-h-[560px] lg:h-[calc(100dvh-355px)] lg:min-h-[620px] lg:grid-cols-[minmax(320px,390px)_minmax(0,1fr)]">
          <div className={cn("min-h-0 flex-col border-[#edf0f6] lg:flex lg:border-r", mobileReading ? "hidden" : "flex")}>
            <div className="flex items-center justify-between border-b border-[#edf0f6] px-4 py-3 text-xs text-[#8995aa]">
              <span>{reports.length} report{reports.length === 1 ? "" : "s"} loaded</span>
              {reportsQuery.isFetching && !reportsQuery.isFetchingNextPage && <span className="inline-flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" aria-hidden="true" /> Updating</span>}
            </div>
            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto" onKeyDown={handleListKeyDown} aria-label="Reports" role="region" tabIndex={0}>
              {reportsQuery.isPending ? (
                <ReportListSkeleton />
              ) : reportsQuery.isError ? (
                <InlineError title="Could not load reports" message={reportsQuery.error instanceof Error ? reportsQuery.error.message : "Please try again."} onRetry={() => void reportsQuery.refetch()} />
              ) : groups.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-16 text-center">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]"><FileText size={22} aria-hidden="true" /></span>
                  <p className="mt-4 font-semibold text-[#101d49]">No reports found</p>
                  <p className="mt-1 max-w-xs text-sm leading-6 text-[#64718a]">Try a different search or adjust the selected filters.</p>
                  {hasActiveFilters && <button type="button" onClick={clearFilters} className={cn(secondaryButtonClass, "mt-4 min-h-9")}>Clear filters</button>}
                </div>
              ) : (
                <>
                  {groups.map(([day, items]) => (
                    <div key={day}>
                      <h3 className="sticky top-0 z-10 flex items-center justify-between border-b border-[#edf0f6] bg-[#fafbfd]/95 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8995aa] backdrop-blur">
                        {formatDateOnly(day, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        <span className="font-semibold normal-case tracking-normal">{items.length} report{items.length === 1 ? "" : "s"}</span>
                      </h3>
                      <ul>{items.map((report) => <li key={report.id} className="border-b border-[#f0f2f7]"><ReportListItem report={report} active={selected?.id === report.id} onSelect={() => selectReport(report.id)} /></li>)}</ul>
                    </div>
                  ))}
                  {reportsQuery.hasNextPage && <div className="border-t border-[#edf0f6] p-3"><button type="button" disabled={reportsQuery.isFetchingNextPage} onClick={() => void fetchNextReportsPage()} className={cn(secondaryButtonClass, "min-h-9 w-full justify-center")}>{reportsQuery.isFetchingNextPage ? <><Loader2 size={14} className="animate-spin" aria-hidden="true" /> Loading more…</> : "Load more reports"}</button></div>}
                  {reportsQuery.isFetchNextPageError && <div className="px-4 pb-4 text-center"><p className="mb-2 text-xs text-red-600">Could not load the next page.</p><button type="button" onClick={() => void fetchNextReportsPage()} className="text-xs font-semibold text-[#101d49] underline">Try again</button></div>}
                </>
              )}
            </div>
          </div>

          <div className={cn("min-h-[60vh] flex-col lg:flex lg:min-h-0", mobileReading ? "flex" : "hidden")}>
            {selected ? (
              <ReportReader
                key={selected.id}
                report={selected}
                position={selectedIndex + 1}
                total={reports.length}
                onPrevious={() => moveSelection(-1)}
                onNext={() => moveSelection(1)}
                onBack={() => setMobileReading(false)}
                onMarkReviewed={() => void handleMarkReviewed(selected)}
                isMarkingReviewed={markReviewed.isPending}
                onSendFeedback={(message) => handleSendFeedback(selected, message)}
                isSendingFeedback={sendFeedback.isPending}
                onCopy={() => void copyReport(selected)}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]"><Inbox size={23} aria-hidden="true" /></span>
                <p className="mt-4 font-semibold text-[#101d49]">Select a report to review</p>
                <p className="mt-1 max-w-xs text-sm leading-6 text-[#64718a]">Choose an item from the inbox to read its details and send feedback.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  detail,
  icon: Icon,
  tone = "navy",
  loading,
  progress,
}: {
  label: string;
  value?: number;
  detail: string;
  icon: typeof Inbox;
  tone?: "navy" | "amber" | "red";
  loading: boolean;
  progress?: number;
}) {
  const tones = {
    navy: { border: "border-t-[#101d49]", icon: "bg-[#eaf0ff] text-[#101d49]" },
    amber: { border: "border-t-[#f5c542]", icon: "bg-[#fff5d6] text-[#9a6700]" },
    red: { border: "border-t-[#dc6464]", icon: "bg-red-50 text-red-600" },
  } as const;
  return (
    <div className={cn("border-t-[3px] px-5 py-4", tones[tone].border)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#64718a]">{label}</p>
          {loading ? <div className="mt-2 h-8 w-12 animate-pulse rounded-md bg-[#f1f3f8]" /> : <p className="mt-1 text-2xl font-bold tabular-nums text-[#101d49]">{value ?? "—"}</p>}
        </div>
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tones[tone].icon)}><Icon size={19} aria-hidden="true" /></span>
      </div>
      <p className="mt-2 text-xs text-[#8995aa]">{detail}</p>
      {progress !== undefined && !loading && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#edf0f6]" aria-label={`${Math.round(progress)} percent of expected reports submitted`}><div className="h-full rounded-full bg-[#101d49] transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>}
    </div>
  );
}

function ReportListItem({ report, active, onSelect }: { report: AdminReport; active: boolean; onSelect: () => void }) {
  const hasBlocker = !report.noProblemsToday && (Boolean(report.blockerDescription?.trim()) || Boolean(report.problemStatus));
  const isResolved = report.problemStatus === "RESOLVED" || Boolean(report.resolvedAt);
  return (
    <button type="button" data-report-id={report.id} onClick={onSelect} aria-current={active ? "true" : undefined} className={cn("group/item relative flex w-full gap-3 px-4 py-3.5 text-left outline-none transition-colors duration-150 focus-visible:bg-[#f4f7ff]", active ? "bg-[#f4f7ff]" : "hover:bg-[#f8faff]")}>
      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-[3px] origin-center rounded-r-full transition-transform duration-200 motion-reduce:transition-none", active ? "scale-y-100 bg-[#101d49]" : "scale-y-0 bg-[#f5c542] group-hover/item:scale-y-100")} />
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-xs font-bold text-[#101d49]">{getInitials(report.student.name)}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-sm font-bold text-[#101d49]">{report.student.name}</span>
          <span className="ml-auto shrink-0 text-[11px] tabular-nums text-[#8995aa]">{formatDateOnly(report.reportDate, { day: "numeric", month: "short" })}</span>
        </span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-[#52627f]">{report.programme.name}</span>
        <span className="mt-1.5 block line-clamp-2 text-[13px] leading-5 text-[#64718a]">{reportPreview(report)}</span>
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold">
          <ReportStatusBadge status={report.status} />
          {hasBlocker && <span className={cn("inline-flex items-center gap-1", isResolved ? "text-emerald-700" : "text-[#9a6700]")}>{isResolved ? <CheckCircle2 size={12} aria-hidden="true" /> : <AlertTriangle size={12} aria-hidden="true" />}{isResolved ? "Resolved" : report.problemStatus === "IN_PROGRESS" ? "In progress" : "Open blocker"}</span>}
          <span className="ml-auto inline-flex items-center gap-1 text-[#8995aa]"><MessageSquareText size={12} aria-hidden="true" />{report.feedbackCount}</span>
        </span>
      </span>
    </button>
  );
}

function ReportListSkeleton() {
  return <div className="space-y-0" aria-label="Loading reports">{Array.from({ length: 6 }, (_, index) => <div key={index} className="flex gap-3 border-b border-[#f0f2f7] px-4 py-4"><span className="size-9 animate-pulse rounded-full bg-[#f1f3f8]" /><div className="flex-1 space-y-2"><div className="h-3 w-2/3 animate-pulse rounded bg-[#f1f3f8]" /><div className="h-3 w-1/2 animate-pulse rounded bg-[#f1f3f8]" /><div className="h-3 w-full animate-pulse rounded bg-[#f1f3f8]" /></div></div>)}</div>;
}

function InlineError({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) {
  return <div className="flex flex-col items-center px-6 py-16 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertTriangle size={22} aria-hidden="true" /></span><p className="mt-4 font-semibold text-[#101d49]">{title}</p><p className="mt-1 max-w-xs text-sm text-[#64718a]">{message}</p><button type="button" onClick={onRetry} className={cn(secondaryButtonClass, "mt-4 min-h-9")}>Try again</button></div>;
}
