"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { MainLayout } from "@/components/layout/dashboard";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { useAdminAssignments } from "@/lib/hooks/assignments/use-admin-assignments";
import type { AdminAssignment, AssignmentStatus } from "@/lib/interfaces/assignments";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;
const cardClass = "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";
const inputClass = "h-11 w-full rounded-xl border border-[#e4e9f2] bg-white px-3.5 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#101d49]/40 focus:ring-4 focus:ring-[#101d49]/[0.06] disabled:cursor-not-allowed disabled:bg-[#f6f8fc]";
const secondaryButtonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e4e9f2] bg-white px-4 py-2 text-sm font-semibold text-[#34415e] transition hover:border-[#cbd4e3] hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]";
const primaryButtonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#192c65] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function formatDateTime(value: string | null | undefined): string {
  return value && dayjs(value).isValid()
    ? new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Lagos",
      }).format(new Date(value))
    : "Not set";
}

function formatScore(value: string | number): string {
  const score = Number(value);
  return Number.isFinite(score)
    ? new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 }).format(score)
    : "—";
}

/** Convert a date-only control value into a local inclusive day boundary in ISO format. */
function toLocalDayBoundary(value: string, endOfDay = false): string | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  );
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  const style = status === "PUBLISHED"
    ? "bg-[#e7f5ee] text-[#18794e]"
    : status === "ARCHIVED"
      ? "bg-[#edf0f6] text-[#59667d]"
      : "bg-[#fff5d1] text-[#765800]";
  const dot = status === "PUBLISHED" ? "bg-[#1d9a67]" : status === "ARCHIVED" ? "bg-[#7d899d]" : "bg-[#d8a900]";
  const label = status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", style)}>
      <span className={cn("size-1.5 rounded-full", dot)} aria-hidden="true" />
      {label}
    </span>
  );
}

function AssignmentCard({ assignment }: { assignment: AdminAssignment }) {
  return (
    <article className={cn(cardClass, "flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,29,73,0.08)] sm:p-6")}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
          <ClipboardList size={21} aria-hidden="true" />
        </span>
        <AssignmentStatusBadge status={assignment.status} />
      </div>

      <div className="mt-5 min-w-0 flex-1">
        <p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-[#64718a]">
          {assignment.programme?.name || "Programme details unavailable"}
        </p>
        <h2 className="mt-2 text-lg font-bold leading-6 text-[#101d49]">{assignment.title}</h2>
        <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-[#64718a]">{assignment.instructions}</p>
      </div>

      <dl className="mt-5 grid gap-4 border-t border-[#edf0f6] pt-4 sm:grid-cols-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <CalendarDays size={16} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Available</dt>
            <dd className="mt-1 text-xs leading-5 text-[#52627f]">{formatDateTime(assignment.availableAt)}</dd>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-2.5">
          <Clock3 size={16} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Due</dt>
            <dd className="mt-1 text-xs leading-5 text-[#52627f]">{formatDateTime(assignment.dueAt)}</dd>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-2.5">
          <GraduationCap size={16} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Lesson</dt>
            <dd className="mt-1 truncate text-xs leading-5 text-[#52627f]">
              {assignment.lesson?.title || (assignment.lessonId ? "Lesson details unavailable" : "Programme level")}
            </dd>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-2.5">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Maximum score</dt>
            <dd className="mt-1 text-xs leading-5 text-[#52627f]">{formatScore(assignment.maxScore)} points</dd>
          </div>
        </div>
      </dl>

      <div className="mt-5 grid gap-3 border-t border-[#edf0f6] pt-4 sm:grid-cols-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <UserRound size={15} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Tutor</p>
            <p className="mt-1 truncate text-xs font-semibold text-[#34415e]">{assignment.tutor?.name || "Tutor details unavailable"}</p>
          </div>
        </div>
        <p className="text-xs text-[#8995aa] sm:text-right">Created {formatDateTime(assignment.createdAt)}</p>
      </div>
    </article>
  );
}

function AssignmentSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" role="status" aria-label="Loading assignments">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className={cn(cardClass, "animate-pulse p-5 sm:p-6")}>
          <div className="flex justify-between"><div className="size-11 rounded-xl bg-[#edf0f6]" /><div className="h-7 w-20 rounded-full bg-[#edf0f6]" /></div>
          <div className="mt-5 h-3 w-32 rounded bg-[#edf0f6]" />
          <div className="mt-3 h-5 w-3/4 rounded bg-[#edf0f6]" />
          <div className="mt-3 h-4 w-full rounded bg-[#f2f4f8]" />
          <div className="mt-2 h-4 w-4/5 rounded bg-[#f2f4f8]" />
          <div className="mt-7 h-20 rounded bg-[#f2f4f8]" />
        </div>
      ))}
      <span className="sr-only">Loading assignments…</span>
    </div>
  );
}

export default function AdminAssignmentsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<AssignmentStatus | "">("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);

  useEffect(() => {
    const normalizedSearch = searchValue.trim();
    if (normalizedSearch === debouncedSearch) return;
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(normalizedSearch);
      setCursorStack([null]);
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [searchValue, debouncedSearch]);

  const currentCursor = cursorStack[cursorStack.length - 1] ?? null;
  const availableAtFrom = toLocalDayBoundary(availableFrom);
  const availableAtTo = toLocalDayBoundary(availableTo, true);
  const dueAtFrom = toLocalDayBoundary(dueFrom);
  const dueAtTo = toLocalDayBoundary(dueTo, true);
  const dateRangeInvalid = Boolean(
    (availableFrom && availableTo && availableFrom > availableTo) ||
    (dueFrom && dueTo && dueFrom > dueTo),
  );

  const assignmentsQuery = useAdminAssignments({
    search: debouncedSearch || undefined,
    status: status || undefined,
    availableAtFrom,
    availableAtTo,
    dueAtFrom,
    dueAtTo,
    limit: pageSize,
    cursor: currentCursor,
  }, !dateRangeInvalid);
  const assignments = assignmentsQuery.data?.items ?? [];
  const nextCursor = assignmentsQuery.data?.nextCursor ?? null;
  const currentPage = cursorStack.length;
  const drafts = assignments.filter((assignment) => assignment.status === "DRAFT").length;
  const published = assignments.filter((assignment) => assignment.status === "PUBLISHED").length;
  const archived = assignments.filter((assignment) => assignment.status === "ARCHIVED").length;
  const initialError = assignmentsQuery.isError && !assignmentsQuery.data;
  const isSearchDebouncing = searchValue.trim() !== debouncedSearch;
  const hasFilters = Boolean(searchValue.trim() || status || availableFrom || availableTo || dueFrom || dueTo);

  const resetPagination = useCallback(() => setCursorStack([null]), []);
  const updateFilter = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    resetPagination();
  };
  const clearFilters = () => {
    setSearchValue("");
    setDebouncedSearch("");
    setStatus("");
    setAvailableFrom("");
    setAvailableTo("");
    setDueFrom("");
    setDueTo("");
    resetPagination();
  };

  const handleNextPage = () => {
    if (!nextCursor || assignmentsQuery.isFetching) return;
    setCursorStack((previous) => [...previous, nextCursor]);
  };
  const handlePreviousPage = () => {
    if (cursorStack.length <= 1 || assignmentsQuery.isFetching) return;
    setCursorStack((previous) => previous.slice(0, -1));
  };
  const handlePageSizeChange = (value: string) => {
    const size = Number(value);
    if (!Number.isInteger(size) || size < 1 || size > 50) return;
    setPageSize(size);
    resetPagination();
  };

  const summaryText = useMemo(() => {
    if (assignmentsQuery.isLoading) return "Loading the assignment register.";
    if (hasFilters) return "Counts reflect the current page and active filters.";
    return "Counts reflect the assignment records on this page.";
  }, [assignmentsQuery.isLoading, hasFilters]);

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1600px] space-y-7 pb-10 sm:space-y-9">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">Learning operations</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">Assignments</h1>
            <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">
              Review assignment schedules and status across tutors and programmes.
            </p>
          </div>
          <button type="button" onClick={() => void assignmentsQuery.refetch()} disabled={assignmentsQuery.isFetching} className={secondaryButtonClass}>
            <RefreshCw size={16} className={assignmentsQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" />
            {assignmentsQuery.isFetching ? "Refreshing…" : "Refresh assignments"}
          </button>
        </header>

        <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-9" aria-label="Assignment overview">
          <div aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-2 -top-12 size-52 rounded-full border border-white/10" />
          <div className="relative grid gap-4 lg:grid-cols-[1fr_auto_auto_auto_auto] lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
                <ClipboardList size={14} aria-hidden="true" /> Admin assessment workspace
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Assignment activity at a glance.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">{summaryText}</p>
            </div>
            <HeroMetric label="Loaded" value={assignments.length} loading={assignmentsQuery.isLoading} />
            <HeroMetric label="Drafts" value={drafts} loading={assignmentsQuery.isLoading} />
            <HeroMetric label="Published" value={published} loading={assignmentsQuery.isLoading} />
            <HeroMetric label="Archived" value={archived} loading={assignmentsQuery.isLoading} />
          </div>
        </section>

        <section className={cardClass} aria-label="Admin assignments">
          <div className="space-y-4 border-b border-[#edf0f6] p-4 sm:px-5 sm:py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-[#101d49]">Assignment register</h2>
                <p className="mt-1 text-xs text-[#8995aa]">Search and filter assignment records across the platform.</p>
              </div>
              {hasFilters && (
                <button type="button" onClick={clearFilters} className="inline-flex min-h-9 w-fit items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#52627f] transition hover:bg-[#f4f6fa] hover:text-[#101d49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]">
                  <X size={15} aria-hidden="true" /> Clear filters
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1.4fr)_minmax(10rem,0.65fr)_repeat(4,minmax(9rem,0.75fr))]">
              <label className="flex min-w-0 flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
                <span className="text-xs font-semibold text-[#64718a]">Search assignments</span>
                <span className="relative block min-w-0">
                  <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8490a6]" aria-hidden="true" />
                  <input
                    type="text"
                    role="searchbox"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value.slice(0, 100))}
                    maxLength={100}
                    placeholder="Title, programme, or tutor…"
                    className={cn(inputClass, "pl-10 pr-10")}
                    aria-label="Search assignments by title, programme, or tutor"
                  />
                  {searchValue && (
                    <button type="button" onClick={() => setSearchValue("")} aria-label="Clear assignment search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8995aa] transition hover:bg-[#f3f5f9] hover:text-[#101d49]">
                      <X size={15} aria-hidden="true" />
                    </button>
                  )}
                </span>
              </label>
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="text-xs font-semibold text-[#64718a]">Status</span>
                <AnimatedSelect
                  value={status}
                  options={STATUS_OPTIONS}
                  onChange={(value) => updateFilter(setStatus, value as AssignmentStatus | "")}
                  ariaLabel="Filter assignments by status"
                  className="w-full"
                />
              </label>
              <DateFilter label="Available from" value={availableFrom} onChange={(value) => updateFilter(setAvailableFrom, value)} />
              <DateFilter label="Available to" value={availableTo} onChange={(value) => updateFilter(setAvailableTo, value)} />
              <DateFilter label="Due from" value={dueFrom} onChange={(value) => updateFilter(setDueFrom, value)} />
              <DateFilter label="Due to" value={dueTo} onChange={(value) => updateFilter(setDueTo, value)} />
            </div>
            <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[#8995aa]">Date filters include the full selected day in your local time zone.</p>
              {isSearchDebouncing && (
                <span className="inline-flex items-center gap-2 font-medium text-[#64718a]" role="status">
                  <RefreshCw size={14} className="animate-spin" aria-hidden="true" /> Searching…
                </span>
              )}
              {dateRangeInvalid && <span className="font-medium text-red-600" role="alert">Start date must be on or before end date.</span>}
            </div>
          </div>

          {dateRangeInvalid ? (
            <div role="alert" className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-[#8a6500]"><CalendarRange size={25} aria-hidden="true" /></span>
              <h3 className="mt-5 text-lg font-semibold text-[#101d49]">Check the selected date range</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">The start date must be on or before the end date. Update the range to load matching assignments.</p>
            </div>
          ) : assignmentsQuery.isLoading ? (
            <div className="p-4 sm:p-5"><AssignmentSkeleton /></div>
          ) : initialError ? (
            <div role="alert" className="flex min-h-[340px] flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertCircle size={27} aria-hidden="true" /></span>
              <h3 className="mt-5 text-lg font-semibold text-[#101d49]">Could not load assignments</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">{getErrorMessage(assignmentsQuery.error)}</p>
              <button type="button" onClick={() => void assignmentsQuery.refetch()} disabled={assignmentsQuery.isFetching} className={cn(secondaryButtonClass, "mt-5 bg-[#101d49] text-white hover:bg-[#172a60]")}>
                <RefreshCw size={15} className={assignmentsQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" /> Try again
              </button>
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]"><BookOpen size={25} aria-hidden="true" /></span>
              <h3 className="mt-5 text-lg font-semibold text-[#101d49]">{hasFilters ? "No assignments match these filters" : "No assignments yet"}</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">{hasFilters ? "Adjust or clear the filters to find other assignment records." : "Assignments created by tutors will appear here."}</p>
              {hasFilters && <button type="button" onClick={clearFilters} className={cn(secondaryButtonClass, "mt-5")}>Clear filters</button>}
            </div>
          ) : (
            <>
              {assignmentsQuery.isError && (
                <div role="status" className="m-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                  <p>This page could not be refreshed. Previously loaded assignments remain visible.</p>
                  <button type="button" onClick={() => void assignmentsQuery.refetch()} className="inline-flex min-h-9 w-fit items-center gap-2 rounded-lg px-3 font-semibold hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"><RefreshCw size={15} aria-hidden="true" /> Retry</button>
                </div>
              )}
              <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 2xl:grid-cols-3">
                {assignments.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} />)}
              </div>
              <div className="flex flex-col gap-3 border-t border-[#edf0f6] bg-[#fafbfd] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-xs text-[#718099]">
                  Showing <span className="font-semibold text-[#34415e]">{assignments.length}</span> assignments on page <span className="font-semibold text-[#34415e]">{currentPage}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs text-[#718099]">Rows</span>
                  <AnimatedSelect
                    value={String(pageSize)}
                    options={PAGE_SIZE_OPTIONS.map((size) => ({ value: String(size), label: String(size) }))}
                    onChange={handlePageSizeChange}
                    ariaLabel="Assignments per page"
                  />
                  <button type="button" onClick={handlePreviousPage} disabled={cursorStack.length <= 1 || assignmentsQuery.isFetching} className={secondaryButtonClass} aria-label="Previous page">
                    <ArrowLeft size={15} aria-hidden="true" /><span className="hidden sm:inline">Previous</span>
                  </button>
                  <button type="button" onClick={handleNextPage} disabled={!nextCursor || assignmentsQuery.isFetching} className={primaryButtonClass} aria-label="Next page">
                    <span className="hidden sm:inline">Next</span><ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-[#e4e9f2] bg-white/70 px-4 py-4 text-sm text-[#64718a]">
          <CalendarRange size={17} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <p className="leading-6">All search, status, date, page-size, and cursor values are sent to the assignments service. Availability and due dates are shown in West Africa Time.</p>
        </div>
      </main>
    </MainLayout>
  );
}

function DateFilter({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold text-[#64718a]">{label}</span>
      <DatePicker value={value} onChange={onChange} ariaLabel={label} className="w-full" />
    </div>
  );
}

function HeroMetric({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 lg:min-w-28">
      <p className="text-xs font-medium text-white/65">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-white">{loading ? "—" : new Intl.NumberFormat("en-NG").format(value)}</p>
    </div>
  );
}
