"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Inbox,
  Loader2,
  MessageSquare,
  RotateCcw,
  Search,
  Sparkles,
  UserX,
} from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { MainLayout } from "@/components/layout/dashboard";
import { toast } from "@/components/ui/Toaster";
import { AdminAccessGuard } from "@/components/admin/shared/AdminAccessGuard";
import { Select } from "@/components/admin/shared/Select";
import { useDelayedAction } from "@/components/admin/shared/motion";
import {
  cardClass,
  getInitials,
  iconNudgeOnHover,
  inputClass,
  secondaryButtonClass,
} from "@/components/admin/shared/admin-ui";
import { MissingReportsDrawer } from "@/components/admin/reports/MissingReportsDrawer";
import { ReportReader } from "@/components/admin/reports/ReportReader";
import { ReporterBadge } from "@/components/admin/reports/ReporterBadge";
import { clockTime, dayLabel, longDate, preview } from "@/components/admin/reports/report-utils";
import {
  isoDay,
  mockRoster,
  type DailyReport,
  type ReporterType,
  type RosterMember,
} from "@/lib/mock/admin-daily-reports";
import { useDailyReportsStore } from "@/lib/store/daily-reports";
import { programmesApi } from "@/lib/api/programmes";
import type { GetProgrammesParams } from "@/lib/interfaces/programmes";
import { cn } from "@/lib/utils";

export const programmesQueryKeys = {
  all: ["programmes"] as const,
  details: (id: string) => [...programmesQueryKeys.all, "detail", id] as const,
  catalogue: (search: string) =>
    [...programmesQueryKeys.all, "catalogue", { search }] as const,
};

export function useProgrammeDetails(id: string) {
  const programmeId = id.trim();

  return useQuery({
    queryKey: programmesQueryKeys.details(programmeId),
    queryFn: () => programmesApi.getById(programmeId),
    enabled: Boolean(programmeId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      const status = (error as Error & { status?: number }).status;
      if (typeof status === "number" && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useProgrammes(params: Pick<GetProgrammesParams, "search"> = {}) {
  const search = params.search?.trim() ?? "";

  return useInfiniteQuery({
    queryKey: programmesQueryKeys.catalogue(search),
    queryFn: ({ pageParam }) => programmesApi.list({ search, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      const status = (error as Error & { status?: number }).status;
      if (typeof status === "number" && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

type Range = "today" | "yesterday" | "week" | "all";
type View = "all" | "unread" | "problems" | "toReview";

const RANGES: { value: Range; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "Last 7 days" },
  { value: "all", label: "All" },
];

const VIEWS: { value: View; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "problems", label: "Open problems" },
  { value: "toReview", label: "To review" },
];

const WEEKDAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

const inRange = (report: DailyReport, range: Range) => {
  if (range === "today") return report.reportDate === isoDay(0);
  if (range === "yesterday") return report.reportDate === isoDay(1);
  if (range === "week") return report.reportDate >= isoDay(6);
  return true;
};

const hasOpenProblem = (report: DailyReport) => Boolean(report.problems.trim()) && report.problemStatus !== "Resolved";

const matchesView = (report: DailyReport, view: View) => {
  if (view === "unread") return report.status === "Unread";
  if (view === "problems") return hasOpenProblem(report);
  if (view === "toReview") return report.status !== "Reviewed";
  return true;
};

function reportAsText(report: DailyReport): string {
  return [
    `Daily report — ${report.authorName} (${report.reporterType}, ${report.team})`,
    `${longDate(report.reportDate)} · submitted ${clockTime(report.submittedAt)}`,
    "",
    "ACCOMPLISHED TODAY",
    report.accomplishments,
    "",
    "PROBLEMS & BLOCKERS",
    report.problems.trim() || "None reported.",
  ].join("\n");
}

const CURRENT_ADMIN = "Admin · You";

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
  const reports = useDailyReportsStore((state) => state.reports);
  const setReports = useDailyReportsStore((state) => state.setReports);
  const roster = mockRoster;

  const [range, setRange] = useState<Range>("today");
  const [view, setView] = useState<View>("all");
  const [type, setType] = useState<"All" | ReporterType>("All");
  const [team, setTeam] = useState("All teams");
  const [search, setSearch] = useState("");

  const filterKey = `${range}|${view}|${type}|${team}|${search}`;
  const [pin, setPin] = useState<{ id: string; key: string } | null>(null);
  const pinnedId = pin?.key === filterKey ? pin.id : null;
  const setSelectedId = (id: string) => setPin({ id, key: filterKey });
  const [mobileReading, setMobileReading] = useState(false);
  const [missingOpen, setMissingOpen] = useState(false);
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());
  const opener = useDelayedAction();
  const listRef = useRef<HTMLDivElement>(null);

  const [policiesModalOpen, setPoliciesModalOpen] = useState(false);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState("");
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [requiredWeekdays, setRequiredWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [effectiveFrom, setEffectiveFrom] = useState("2026-10-30");
  const [effectiveTo, setEffectiveTo] = useState("");

  const { data: programmesData, isLoading: loadingProgrammes } = useProgrammes();

  const programmes = useMemo(() => {
    if (!programmesData?.pages) return [];
    return programmesData.pages.flatMap((page: any) => {
      if (Array.isArray(page)) return page;
      return page.items || page.data || page.programmes || [];
    });
  }, [programmesData]);

  useEffect(() => {
    if (programmes.length > 0 && !selectedProgrammeId) {
      const first = programmes[0];
      setSelectedProgrammeId(first.id ?? first.programmeId ?? "");
    }
  }, [programmes, selectedProgrammeId]);

  const handleOpenPoliciesModal = () => {
    setPoliciesModalOpen(true);
  };

  const teams = useMemo(() => ["All teams", ...new Set(roster.map((member) => member.team))], [roster]);

  const baseFiltered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reports
      .filter((report) => inRange(report, range))
      .filter((report) => type === "All" || report.reporterType === type)
      .filter((report) => team === "All teams" || report.team === team)
      .filter(
        (report) =>
          !query ||
          `${report.authorName} ${report.team} ${report.accomplishments} ${report.problems}`.toLowerCase().includes(query),
      )
      .sort((a, b) => b.reportDate.localeCompare(a.reportDate) || b.submittedAt.localeCompare(a.submittedAt));
  }, [reports, range, type, team, search]);

  const visible = useMemo(
    () => baseFiltered.filter((report) => matchesView(report, view) || report.id === pinnedId),
    [baseFiltered, view, pinnedId],
  );

  const groups = useMemo(() => {
    const byDay = new Map<string, DailyReport[]>();
    visible.forEach((report) => byDay.set(report.reportDate, [...(byDay.get(report.reportDate) ?? []), report]));
    return [...byDay.entries()];
  }, [visible]);

  const selected = visible.find((report) => report.id === pinnedId) ?? visible[0] ?? null;
  const selectedIndex = selected ? visible.indexOf(selected) : -1;

  useEffect(() => {
    if (selected && selected.id !== pinnedId) setPin({ id: selected.id, key: filterKey });
  }, [selected, pinnedId, filterKey]);

  const today = useMemo(() => {
    const todays = reports.filter((report) => report.reportDate === isoDay(0));
    const submittedIds = new Set(todays.map((report) => report.authorId));
    return {
      submitted: submittedIds.size,
      expected: roster.length,
      openProblems: reports.filter(hasOpenProblem).length,
      toReview: reports.filter((report) => report.status !== "Reviewed").length,
      missing: roster.filter((member) => !submittedIds.has(member.id)),
    };
  }, [reports, roster]);

  useEffect(() => {
    if (!selected || selected.status !== "Unread") return;
    const onScreen = mobileReading || window.matchMedia("(min-width: 1024px)").matches;
    if (!onScreen) return;
    setReports((previous) => previous.map((report) => (report.id === selected.id ? { ...report, status: "Read" } : report)));
  }, [selected, mobileReading]);

  const patch = (id: string, changes: Partial<DailyReport>) =>
    setReports((previous) => previous.map((report) => (report.id === id ? { ...report, ...changes } : report)));

  const select = (id: string, focus = false) => {
    setSelectedId(id);
    setMobileReading(true);
    if (focus) listRef.current?.querySelector<HTMLButtonElement>(`[data-report-id="${id}"]`)?.focus();
  };

  const move = (step: number) => {
    const next = visible[selectedIndex + step];
    if (next) select(next.id, true);
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (["ArrowDown", "j"].includes(event.key)) {
      event.preventDefault();
      move(1);
    } else if (["ArrowUp", "k"].includes(event.key)) {
      event.preventDefault();
      move(-1);
    }
  };

  const markReviewed = (report: DailyReport) => {
    patch(report.id, { status: "Reviewed", reviewedAt: new Date().toISOString() });
    toast.success("Marked as reviewed", { description: `${report.authorName}'s report for ${dayLabel(report.reportDate).toLowerCase()}.` });
    const next = visible.slice(selectedIndex + 1).find((item) => item.status !== "Reviewed");
    if (next) setSelectedId(next.id);
  };

  const markUnread = (report: DailyReport) => {
    patch(report.id, { status: "Unread", reviewedAt: undefined });
    toast.success("Marked as unread");
  };

  const toggleProblem = (report: DailyReport) => {
    const next = report.problemStatus === "Resolved" ? "Open" : "Resolved";
    patch(report.id, { problemStatus: next });
    toast.success(next === "Resolved" ? "Problem marked resolved" : "Problem reopened");
  };

  const reply = (report: DailyReport, body: string) => {
    const now = new Date().toISOString();
    patch(report.id, {
      replies: [...report.replies, { id: `${Date.now()}`, author: CURRENT_ADMIN, body, createdAt: now }],
      status: "Reviewed",
      reviewedAt: report.reviewedAt ?? now,
    });
    toast.success("Reply sent", { description: `${report.authorName.split(" ")[0]} will get it by email and on their portal.` });
  };

  const copyReport = async (report: DailyReport) => {
    try {
      await navigator.clipboard.writeText(reportAsText(report));
      toast.success("Report copied as text");
    } catch {
      toast.error("Couldn't copy the report");
    }
  };

  const remind = (member: RosterMember) =>
    opener.run(`remind-${member.id}`, () => {
      setRemindedIds((previous) => new Set(previous).add(member.id));
      toast.success(`Reminder sent to ${member.name}`);
    });

  const remindAll = () =>
    opener.run("remind-all", () => {
      const targets = today.missing.filter((member) => !remindedIds.has(member.id));
      setRemindedIds((previous) => new Set([...previous, ...targets.map((member) => member.id)]));
      toast.success(`${targets.length} reminder${targets.length === 1 ? "" : "s"} sent`);
    });

  const resetFilters = () => {
    setView("all");
    setType("All");
    setTeam("All teams");
    setSearch("");
  };

  const hasFilters = view !== "all" || type !== "All" || team !== "All teams" || Boolean(search);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
            <Sparkles size={15} className="text-[#c59400]" aria-hidden="true" /> Insights · Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">Daily reports</h1>
          <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">
            End-of-day updates from students and interns: what they got done, and where they got stuck.
          </p>
        </div>

        <div className="flex flex-col items-end gap-[5px] lg:self-auto">
          <button
            type="button"
            onClick={handleOpenPoliciesModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#101d49] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1a2d6d]"
          >
            Create Policy
          </button>

          <div role="radiogroup" aria-label="Date range" className="inline-flex rounded-xl border border-[#e4e9f2] bg-white p-1">
            {RANGES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={range === option.value}
                onClick={() => setRange(option.value)}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200",
                  range === option.value
                    ? "bg-[#101d49] text-white shadow-[0_4px_12px_-6px_rgba(16,29,73,0.7)]"
                    : "text-[#64718a] hover:bg-[#f1f4fa] hover:text-[#101d49]",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section aria-label="Today at a glance" className={cn(cardClass, "grid divide-y divide-[#edf0f6] sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4 xl:divide-x")}>
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-[#8995aa]">Submitted today</p>
          <p className="mt-1 text-2xl font-bold text-[#101d49]">
            {today.submitted}
            <span className="text-base font-semibold text-[#8995aa]"> / {today.expected}</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf0f6]" aria-hidden="true">
            <div className="h-full rounded-full bg-[#101d49] transition-[width] duration-500" style={{ width: `${(today.submitted / Math.max(today.expected, 1)) * 100}%` }} />
          </div>
        </div>
        <StripButton
          label="Open problems"
          value={today.openProblems}
          hint="Show them"
          tone="amber"
          icon={AlertTriangle}
          onClick={() => {
            setView("problems");
            setRange("all");
          }}
        />
        <StripButton
          label="Waiting for review"
          value={today.toReview}
          hint="Review now"
          icon={Inbox}
          onClick={() => {
            setView("toReview");
            setRange("all");
          }}
        />
        <StripButton
          label="Not submitted yet"
          value={today.missing.length}
          hint={opener.isPending("missing") ? "Opening…" : "Send reminders"}
          icon={opener.isPending("missing") ? Loader2 : UserX}
          spinning={opener.isPending("missing")}
          tone="red"
          onClick={() => opener.run("missing", () => setMissingOpen(true))}
        />
      </section>

      <section className={cn(cardClass, "grid overflow-hidden lg:h-[calc(100dvh-180px)] lg:min-h-[640px] lg:grid-cols-[minmax(340px,400px)_1fr]")}>
        <div className={cn("min-h-0 flex-col border-[#edf0f6] lg:flex lg:border-r", mobileReading ? "hidden" : "flex")}>
          <div className="space-y-3 border-b border-[#edf0f6] p-4">
            <label className="relative block">
              <span className="sr-only">Search reports</span>
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8995aa]" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search names, teams or report text…"
                className={cn(inputClass, "h-10 pl-10 hover:border-[#b9c5da]")}
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Select<"All" | ReporterType>
                ariaLabel="Filter by reporter type"
                value={type}
                onChange={setType}
                options={[
                  { value: "All", label: "Students & interns" },
                  { value: "Student", label: "Students" },
                  { value: "Intern", label: "Interns" },
                ]}
              />
              <Select ariaLabel="Filter by team" value={team} onChange={setTeam} options={teams} />
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
              {VIEWS.map((option) => {
                const count = baseFiltered.filter((report) => matchesView(report, option.value)).length;
                const active = view === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setView(option.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors duration-150",
                      active ? "border-[#101d49] bg-[#101d49] text-white" : "border-[#e4e9f2] bg-white text-[#64718a] hover:border-[#b9c5da] hover:text-[#101d49]",
                    )}
                  >
                    {option.label}
                    <span className={cn("rounded px-1 tabular-nums", active ? "bg-white/15" : "bg-[#f1f4f9]")}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            ref={listRef}
            className="min-h-0 flex-1 overflow-y-auto"
            onKeyDown={handleListKeyDown}
            aria-label="Reports"
            role="region"
          >
            {groups.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
                  <FileText size={22} aria-hidden="true" />
                </span>
                <p className="mt-4 font-semibold text-[#101d49]">No reports here</p>
                <p className="mt-1 max-w-xs text-sm leading-6 text-[#64718a]">
                  {range === "today" && !hasFilters ? "Nobody has submitted today's report yet." : "Try another date range or clear the filters."}
                </p>
                {hasFilters && (
                  <button type="button" onClick={resetFilters} className={cn(secondaryButtonClass, "mt-4")}>
                    <RotateCcw size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:-rotate-180 motion-reduce:transition-none" />
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              groups.map(([day, items]) => (
                <div key={day}>
                  <h2 className="sticky top-0 z-10 flex items-center justify-between border-b border-[#edf0f6] bg-[#fafbfd]/95 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8995aa] backdrop-blur">
                    {dayLabel(day)}
                    <span className="font-semibold normal-case tracking-normal">{items.length} report{items.length === 1 ? "" : "s"}</span>
                  </h2>
                  <ul>
                    {items.map((report) => (
                      <li key={report.id} className="border-b border-[#f0f2f7]">
                        <ReportListItem report={report} active={selected?.id === report.id} onSelect={() => select(report.id)} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={cn("min-h-[70vh] flex-col lg:flex lg:min-h-0", mobileReading ? "flex" : "hidden")}>
          {selected ? (
            <ReportReader
              report={selected}
              position={selectedIndex + 1}
              total={visible.length}
              onPrevious={() => move(-1)}
              onNext={() => move(1)}
              onBack={() => setMobileReading(false)}
              onMarkReviewed={() => markReviewed(selected)}
              onMarkUnread={() => markUnread(selected)}
              onToggleProblem={() => toggleProblem(selected)}
              onReply={(body) => reply(selected, body)}
              onCopy={() => void copyReport(selected)}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center text-sm text-[#8995aa]">
              <Inbox size={28} className="text-[#c3cad8]" aria-hidden="true" />
              <p className="mt-3">Select a report to read it.</p>
            </div>
          )}
        </div>
      </section>

      {policiesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all duration-300 animate-fadeIn">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 transform scale-95 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-[#101d49]">Create Report Policies</h3>
              <button
                type="button"
                onClick={() => setPoliciesModalOpen(false)}
                className="text-sm font-semibold text-gray-500 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#64718a] mb-1.5">
                  Programme
                </label>
                {loadingProgrammes ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-neutral-400">
                    <Loader2 className="animate-spin" size={16} /> Loading programmes...
                  </div>
                ) : (
                  <Select
                    ariaLabel="Select programme ID"
                    value={selectedProgrammeId}
                    onChange={setSelectedProgrammeId}
                    options={
                      programmes.length > 0
                        ? programmes.map((p: any) => ({
                            value: p.id ?? p.programmeId,
                            label: p.name ?? p.title ?? p.programmeId ?? "Programme",
                          }))
                        : [{ value: "", label: "No programmes available" }]
                    }
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64718a] mb-1.5">
                  Timezone
                </label>
                <Select
                  ariaLabel="Select timezone"
                  value={timezone}
                  onChange={setTimezone}
                  options={[
                    { value: "Africa/Lagos", label: "Africa/Lagos" },
                    { value: "UTC", label: "UTC" },
                    { value: "America/New_York", label: "America/New_York" },
                    { value: "Europe/London", label: "Europe/London" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64718a] mb-1.5">
                  Required Weekdays
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {WEEKDAYS.map((day) => {
                    const active = requiredWeekdays.includes(Number(day.value));
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          const val = Number(day.value);
                          setRequiredWeekdays((prev) =>
                            prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]
                          );
                        }}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-xs font-semibold transition-colors duration-150 text-center",
                          active
                            ? "border-[#101d49] bg-[#101d49] text-white"
                            : "border-[#e4e9f2] bg-white text-[#64718a] hover:border-[#b9c5da] hover:text-[#101d49]"
                        )}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#64718a] mb-1.5">
                    Effective From
                  </label>
                  <input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className={cn(inputClass, "h-10")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64718a] mb-1.5">
                    Effective To (Optional)
                  </label>
                  <input
                    type="date"
                    value={effectiveTo}
                    onChange={(e) => setEffectiveTo(e.target.value)}
                    className={cn(inputClass, "h-10")}
                    placeholder="No end date"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setPoliciesModalOpen(false)}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Policy created successfully!");
                    setPoliciesModalOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#101d49] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1a2d6d]"
                >
                  Save Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MissingReportsDrawer
        open={missingOpen}
        onClose={() => setMissingOpen(false)}
        missing={today.missing}
        remindedIds={remindedIds}
        isPending={opener.isPending}
        onRemind={remind}
        onRemindAll={remindAll}
      />
    </div>
  );
}

function ReportListItem({ report, active, onSelect }: { report: DailyReport; active: boolean; onSelect: () => void }) {
  const unread = report.status === "Unread";
  const problem = report.problems.trim() ? (report.problemStatus === "Resolved" ? "resolved" : "open") : null;

  return (
    <button
      type="button"
      data-report-id={report.id}
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group/item relative flex w-full gap-3 px-4 py-3.5 text-left outline-none transition-colors duration-150 focus-visible:bg-[#f4f7ff]",
        active ? "bg-[#f4f7ff]" : "hover:bg-[#f8faff]",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] origin-center rounded-r-full transition-transform duration-200 motion-reduce:transition-none",
          active ? "scale-y-100 bg-[#101d49]" : "scale-y-0 bg-[#f5c542] group-hover/item:scale-y-100",
        )}
      />
      <span className="relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-xs font-bold text-[#101d49] transition-colors duration-200 group-hover/item:bg-[#101d49] group-hover/item:text-[#f5c542]">
        {getInitials(report.authorName)}
        {unread && (
          <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-[#f5c542]">
            <span className="sr-only">Unread</span>
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className={cn("truncate text-sm text-[#101d49]", unread ? "font-bold" : "font-semibold")}>{report.authorName}</span>
          <ReporterBadge type={report.reporterType} className="shrink-0" />
          <span className="ml-auto shrink-0 text-xs tabular-nums text-[#8995aa]">{clockTime(report.submittedAt)}</span>
        </span>
        <span className="mt-0.5 block truncate text-xs text-[#8995aa]">{report.team}</span>
        <span className={cn("mt-1.5 line-clamp-2 text-[13px] leading-5", unread ? "text-[#34415e] font-medium" : "text-[#64718a]")}>
          {preview(report.accomplishments)}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold">
          {problem === "open" && (
            <span className="inline-flex items-center gap-1 text-[#9a6700]">
              <AlertTriangle size={12} aria-hidden="true" /> Problem raised
            </span>
          )}
          {problem === "resolved" && (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <CheckCircle2 size={12} aria-hidden="true" /> Problem resolved
            </span>
          )}
          {report.replies.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[#64718a]">
              <MessageSquare size={12} aria-hidden="true" /> {report.replies.length}
            </span>
          )}
          {report.status === "Reviewed" && (
            <span className="inline-flex items-center gap-1 text-[#64718a]">
              <CheckCircle2 size={12} aria-hidden="true" /> Reviewed
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

function StripButton({
  label,
  value,
  hint,
  icon: Icon,
  tone = "navy",
  spinning = false,
  onClick,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Inbox;
  tone?: "navy" | "amber" | "red";
  spinning?: boolean;
  onClick: () => void;
}) {
  const tones = {
    navy: "bg-[#eaf0ff] text-[#101d49]",
    amber: "bg-[#fff1c7] text-[#9a6700]",
    red: "bg-red-50 text-[#c93636]",
  } as const;
  return (
    <button
      type="button"
      onClick={hookClickGuard(onClick)}
      className="group flex items-center gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-[#f8faff] focus-visible:bg-[#f8faff] focus-visible:outline-none"
    >
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200", tones[tone])}>
        <Icon size={19} aria-hidden="true" className={spinning ? "animate-spin" : undefined} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-[#8995aa]">{label}</span>
        <span className="mt-0.5 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-[#101d49]">{value}</span>
          <span className="inline-flex items-center gap-1 truncate text-xs font-semibold text-[#8995aa] transition-colors duration-200 group-hover:text-[#101d49]">
            {hint} <ArrowRight size={13} aria-hidden="true" className={iconNudgeOnHover} />
          </span>
        </span>
      </span>
    </button>
  );
}

function hookClickGuard(cb: () => void) {
  return cb;
}