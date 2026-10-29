"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  AlertCircle,
  ArrowDownToLine,
  BookOpen,
  CalendarDays,
  GraduationCap,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { MainLayout } from "@/components/layout/dashboard";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";
import { useAdminStudentProgrammeEnrolments } from "@/lib/hooks/student-programmes/use-admin-enrolments";
import type { StudentProgrammeEnrolment } from "@/lib/interfaces/student-programmes";
import { cn } from "@/lib/utils";

const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";
const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e4e9f2] bg-white px-4 py-2 text-sm font-semibold text-[#34415e] transition hover:border-[#cbd4e3] hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]";
const inputClass =
  "h-10 w-full rounded-xl border border-[#e4e9f2] bg-white text-sm text-[#101d49] outline-none transition placeholder:text-[#9aa4b5] focus:border-[#f5c542] focus:ring-2 focus:ring-[#f5c542]/20";
const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 50] as const;
const DEFAULT_PAGE_SIZE = 20;

function formatDate(value: string): string {
  return dayjs(value).isValid()
    ? dayjs(value).format("DD MMM YYYY, h:mm A")
    : "Date unavailable";
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function getEnrolmentMatches(
  enrolment: StudentProgrammeEnrolment,
  searchTerm: string,
): { student: boolean; programme: boolean } {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return { student: false, programme: false };

  const studentName = enrolment.student?.name ?? "";
  const programmeName = enrolment.programme?.name ?? "";
  return {
    student:
      studentName.toLowerCase().includes(query) ||
      enrolment.studentId.toLowerCase().includes(query),
    programme:
      programmeName.toLowerCase().includes(query) ||
      enrolment.programmeId.toLowerCase().includes(query),
  };
}

function EnrolmentRow({
  enrolment,
  searchTerm,
}: {
  enrolment: StudentProgrammeEnrolment;
  searchTerm: string;
}) {
  const matches = getEnrolmentMatches(enrolment, searchTerm);

  return (
    <tr className="align-top transition-colors hover:bg-[#fafbfd]">
      <td className="px-5 py-4">
        <p className="text-xs font-semibold text-[#34415e]">Enrolment record</p>
        <p className="mt-1 max-w-56 break-all font-mono text-[11px] leading-5 text-[#8490a6]" title={enrolment.id}>
          {enrolment.id}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className={`text-sm leading-5 ${matches.student ? "font-extrabold text-[#101d49]" : "font-semibold text-[#34415e]"}`}>
          {enrolment.student?.name || "Student name unavailable"}
        </p>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8995aa]">Student ID</p>
        <p className={`mt-1 max-w-64 break-all font-mono text-xs leading-5 ${matches.student ? "font-bold text-[#101d49]" : "text-[#64718a]"}`} title={enrolment.studentId}>
          {enrolment.studentId}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className={`text-sm leading-5 ${matches.programme ? "font-extrabold text-[#101d49]" : "font-semibold text-[#34415e]"}`}>
          {enrolment.programme?.name || "Programme name unavailable"}
        </p>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8995aa]">Programme ID</p>
        <p className={`mt-1 max-w-64 break-all font-mono text-xs leading-5 ${matches.programme ? "font-bold text-[#101d49]" : "text-[#64718a]"}`} title={enrolment.programmeId}>
          {enrolment.programmeId}
        </p>
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8995aa]">Enrolled</p>
        <time dateTime={enrolment.createdAt} className="mt-1 block text-xs text-[#52627f]">
          {formatDate(enrolment.createdAt)}
        </time>
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8995aa]">Last updated</p>
        <time dateTime={enrolment.updatedAt} className="mt-1 block text-xs text-[#52627f]">
          {formatDate(enrolment.updatedAt)}
        </time>
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-x-auto" role="status" aria-label="Loading enrolments">
      <table className="w-full min-w-[1040px] text-left">
        <thead className="bg-[#fafbfd]"><tr>{["Enrolment", "Student", "Programme", "Enrolled", "Updated"].map((label) => <th key={label} className="px-5 py-3.5"><span className="sr-only">{label}</span></th>)}</tr></thead>
        <tbody>
          {Array.from({ length: 5 }, (_, index) => (
            <tr key={index} className="animate-pulse border-t border-[#edf0f6]">
              {Array.from({ length: 5 }, (_, cell) => <td key={cell} className="px-5 py-5"><div className="h-4 w-36 rounded bg-[#edf0f6]" /><div className="mt-2 h-3 w-48 rounded bg-[#f2f4f8]" /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Loading enrolment records…</span>
    </div>
  );
}

export default function AdminEnrolmentsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  const enrolmentsQuery = useAdminStudentProgrammeEnrolments({
    search: debouncedSearch || undefined,
    limit: pageSize,
  });
  const enrolments = useMemo(
    () => enrolmentsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [enrolmentsQuery.data],
  );
  const uniqueStudentCount = useMemo(
    () => new Set(enrolments.map((enrolment) => enrolment.studentId)).size,
    [enrolments],
  );
  const uniqueProgrammeCount = useMemo(
    () => new Set(enrolments.map((enrolment) => enrolment.programmeId)).size,
    [enrolments],
  );
  const initialError = enrolmentsQuery.isError && !enrolmentsQuery.data;

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1500px] space-y-7 pb-10 sm:space-y-9">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
              Learning operations
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">
              Enrolments
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">
              Review student registrations across Nugi Innovations programmes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void enrolmentsQuery.refetch()}
            disabled={enrolmentsQuery.isFetching}
            className={secondaryButtonClass}
          >
            <RefreshCw size={16} className={enrolmentsQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" />
            {enrolmentsQuery.isFetching ? "Refreshing…" : "Refresh enrolments"}
          </button>
        </header>

        <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-9" aria-label="Enrolment summary">
          <div aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-2 -top-12 size-52 rounded-full border border-white/10" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
                <GraduationCap size={15} aria-hidden="true" />
                Student programme registrations
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Enrolment activity at a glance.</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Summary figures reflect records loaded so far. Continue through the cursor pages to review the full register.
              </p>
            </div>
            <HeroMetric label="Records loaded" value={enrolments.length} loading={enrolmentsQuery.isLoading} />
            <HeroMetric label="Learners represented" value={uniqueStudentCount} loading={enrolmentsQuery.isLoading} />
            <HeroMetric label="Programmes represented" value={uniqueProgrammeCount} loading={enrolmentsQuery.isLoading} />
          </div>
        </section>

        <section className={cardClass} aria-labelledby="enrolment-register-title">
          <div className="flex flex-col gap-4 border-b border-[#edf0f6] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="enrolment-register-title" className="font-bold text-[#101d49]">Enrolment register</h2>
                <p className="mt-1 text-xs text-[#8995aa]">
                  {enrolments.length
                    ? `${new Intl.NumberFormat("en-NG").format(enrolments.length)} records loaded across ${enrolmentsQuery.data?.pages.length ?? 0} ${enrolmentsQuery.data?.pages.length === 1 ? "page" : "pages"}.`
                    : debouncedSearch
                      ? `Showing enrolments matching “${debouncedSearch}”.`
                      : "Student and programme identifiers are shown as returned by the enrolment service."}
                </p>
              </div>
              {enrolmentsQuery.hasNextPage && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#fff6d8] px-3 py-1.5 text-xs font-semibold text-[#765800]">
                  <ArrowDownToLine size={14} aria-hidden="true" /> More records available
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="relative block min-w-0 flex-1">
                <span className="sr-only">Search enrolments</span>
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8995aa]" aria-hidden="true" />
                <input
                  type="text"
                  role="searchbox"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search enrolments…"
                  className={`${inputClass} pl-10 pr-10`}
                  aria-describedby="enrolment-search-help"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => setSearchValue("")}
                    className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#8995aa] transition hover:bg-[#f2f4f8] hover:text-[#34415e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
                    aria-label="Clear search"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                )}
              </label>
              <p id="enrolment-search-help" className="sr-only">Search is sent to the enrolment service.</p>

              <div className="flex shrink-0 items-center gap-2 text-sm text-[#64718a]">
                <span className="whitespace-nowrap">Rows per page</span>
                <AnimatedSelect
                  value={String(pageSize)}
                  options={PAGE_SIZE_OPTIONS.map((size) => ({ value: String(size), label: String(size) }))}
                  onChange={(value) => setPageSize(Number(value))}
                  ariaLabel="Rows per page"
                />
              </div>
              {searchValue.trim() !== debouncedSearch && (
                <span className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-[#64718a]" role="status">
                  <RefreshCw size={14} className="animate-spin" aria-hidden="true" /> Searching…
                </span>
              )}
            </div>
          </div>

          {enrolmentsQuery.isLoading ? (
            <TableSkeleton />
          ) : initialError ? (
            <div role="alert" className="flex min-h-[340px] flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle size={27} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-[#101d49]">Could not load enrolments</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">{getErrorMessage(enrolmentsQuery.error)}</p>
              <button type="button" onClick={() => void enrolmentsQuery.refetch()} disabled={enrolmentsQuery.isFetching} className={cn(secondaryButtonClass, "mt-5 bg-[#101d49] text-white hover:bg-[#172a60]")}>
                <RefreshCw size={15} className={enrolmentsQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" />
                Try again
              </button>
            </div>
          ) : enrolments.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
                <BookOpen size={25} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-[#101d49]">
                {debouncedSearch ? "No enrolments match this search" : "No enrolments yet"}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
                {debouncedSearch
                  ? "Try another search term to find matching student programme registrations."
                  : "Student programme registrations will appear here when students enrol."}
              </p>
              {debouncedSearch && (
                <button type="button" onClick={() => setSearchValue("")} className={cn(secondaryButtonClass, "mt-5")}>
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              {enrolmentsQuery.isError && (
                <div role="status" className="m-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                  <p>Some enrolment pages could not be refreshed. Previously loaded records are still shown.</p>
                  <button type="button" onClick={() => void enrolmentsQuery.refetch()} className="inline-flex min-h-9 w-fit items-center gap-2 rounded-lg px-3 font-semibold hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
                    <RefreshCw size={15} aria-hidden="true" /> Retry
                  </button>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] text-left text-sm">
                  <thead className="bg-[#fafbfd] text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">
                    <tr>
                      <th scope="col" className="px-5 py-3.5">Record</th>
                      <th scope="col" className="px-5 py-3.5">Student</th>
                      <th scope="col" className="px-5 py-3.5">Programme</th>
                      <th scope="col" className="px-5 py-3.5">Enrolled</th>
                      <th scope="col" className="px-5 py-3.5">Last updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0f6]">
                    {enrolments.map((enrolment) => (
                      <EnrolmentRow
                        key={enrolment.id}
                        enrolment={enrolment}
                        searchTerm={debouncedSearch}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {enrolmentsQuery.hasNextPage && (
                <div className="flex justify-center border-t border-[#edf0f6] bg-[#fafbfd] px-4 py-5">
                  <button
                    type="button"
                    onClick={() => void enrolmentsQuery.fetchNextPage()}
                    disabled={enrolmentsQuery.isFetchingNextPage}
                    className={secondaryButtonClass}
                  >
                    {enrolmentsQuery.isFetchingNextPage ? <RefreshCw size={15} className="animate-spin" aria-hidden="true" /> : <ArrowDownToLine size={15} aria-hidden="true" />}
                    {enrolmentsQuery.isFetchingNextPage ? "Loading enrolments…" : enrolmentsQuery.isFetchNextPageError ? "Retry loading enrolments" : "Load more enrolments"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-[#e4e9f2] bg-white/70 px-4 py-4 text-sm text-[#64718a]">
          <CalendarDays size={17} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <p className="leading-6">
            Search matches student and programme names or IDs. When a result matches a student or programme, its name and reference are emphasized in the register.
          </p>
        </div>
      </main>
    </MainLayout>
  );
}

function HeroMetric({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 lg:min-w-40">
      <p className="text-xs font-medium text-white/65">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-white">
        {loading ? "—" : new Intl.NumberFormat("en-NG").format(value)}
      </p>
    </div>
  );
}
