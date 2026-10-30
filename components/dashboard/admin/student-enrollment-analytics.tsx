"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { AlertCircle, CalendarRange, RefreshCw, Users } from "lucide-react";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { useStudentEnrollmentAnalytics } from "@/lib/hooks/dashboard/use-student-enrollment-analytics";
import type { GetStudentEnrollmentAnalyticsParams } from "@/lib/interfaces/dashboard";

const StudentEnrollmentLineChart = dynamic(
  () => import("./student-enrollment-line-chart"),
  {
    ssr: false,
    loading: () => <ChartLoadingState />,
  },
);

type FilterMode = "year" | "range";

function dateOnlyIsValid(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function formatPeriod(fromDate: string, toDate: string) {
  const format = (value: string) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  };
  return `${format(fromDate)} – ${format(toDate)}`;
}

function ChartLoadingState() {
  return (
    <div aria-label="Loading enrollment chart" className="flex h-[260px] flex-col justify-end gap-3 px-3 pb-4 pt-8">
      <div className="flex flex-1 items-end gap-3 border-b border-l border-[#e4e9f2] px-4">
        {[32, 48, 40, 58, 65, 73, 70, 88, 94, 100, 100, 100].map((height, index) => (
          <div key={index} style={{ height: `${height}%` }} className="flex-1 animate-pulse rounded-t-md bg-[#edf0f6]" />
        ))}
      </div>
      <div className="h-3 w-2/3 animate-pulse rounded bg-[#edf0f6]" />
    </div>
  );
}

export default function StudentEnrollmentAnalytics() {
  const currentYear = new Date().getUTCFullYear();
  const [filterMode, setFilterMode] = useState<FilterMode>("year");
  const [yearInput, setYearInput] = useState(String(currentYear));
  const [fromDate, setFromDate] = useState(`${currentYear}-01-01`);
  const [toDate, setToDate] = useState(`${currentYear}-12-31`);

  const parsedYear = Number(yearInput);
  const yearIsValid = /^\d{4}$/.test(yearInput) && Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100;
  const dateRangeIsValid = dateOnlyIsValid(fromDate) && dateOnlyIsValid(toDate) && fromDate <= toDate;
  const enabled = filterMode === "year" ? yearIsValid : dateRangeIsValid;

  const params = useMemo<GetStudentEnrollmentAnalyticsParams>(() => {
    if (filterMode === "year") return { year: yearIsValid ? parsedYear : currentYear };
    return { fromDate, toDate };
  }, [currentYear, filterMode, fromDate, parsedYear, toDate, yearIsValid]);

  const analyticsQuery = useStudentEnrollmentAnalytics(params, { enabled });
  // Do not keep rendering a cached series while the current filter is invalid.
  const analytics = enabled ? analyticsQuery.data : undefined;

  function handleFromDateChange(value: string) {
    setFromDate(value);
    if (value && toDate && value > toDate) setToDate("");
  }

  return (
    <section aria-labelledby="enrollment-analytics-heading" className="min-w-0 overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)] xl:flex xl:flex-col">
      <div className="border-b border-[#edf0f6] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]"><CalendarRange size={18} /></span>
              <div>
                <h3 id="enrollment-analytics-heading" className="text-sm font-bold text-[#101d49]">Student enrolments</h3>
                <p className="mt-0.5 text-xs text-[#8490a6]">Monthly registrations and cumulative growth</p>
              </div>
            </div>
          </div>
          {analytics && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f6fa] px-2.5 py-1.5 text-xs font-semibold text-[#34415e]">
              <Users size={13} />
              {new Intl.NumberFormat("en-NG").format(analytics.summary.totalStudents)} students
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-[150px]">
            <label className="mb-1 block text-[11px] font-semibold text-[#64718a]" htmlFor="enrollment-period-mode">Reporting period</label>
            <AnimatedSelect
              id="enrollment-period-mode"
              value={filterMode}
              ariaLabel="Analytics reporting period"
              options={[
                { value: "year", label: "Calendar year" },
                { value: "range", label: "Date range" },
              ]}
              onChange={(value) => setFilterMode(value as FilterMode)}
              className="min-h-10 w-full rounded-xl px-3 text-xs"
            />
          </div>

          {filterMode === "year" ? (
            <div className="w-full sm:w-[126px]">
              <label className="mb-1 block text-[11px] font-semibold text-[#64718a]" htmlFor="enrollment-year">Year (2000–2100)</label>
              <input
                id="enrollment-year"
                type="number"
                inputMode="numeric"
                min={2000}
                max={2100}
                step={1}
                value={yearInput}
                onChange={(event) => setYearInput(event.target.value)}
                aria-invalid={!yearIsValid}
                className="min-h-10 w-full rounded-xl border border-[#e4e9f2] bg-white px-3 text-sm font-semibold text-[#101d49] outline-none transition focus:border-[#c59400] focus:ring-2 focus:ring-[#f5c542]/25 aria-[invalid=true]:border-red-300"
              />
            </div>
          ) : (
            <div className="grid w-full flex-1 grid-cols-1 gap-3 sm:min-w-[340px] sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#64718a]">From date</label>
                <DatePicker value={fromDate} onChange={handleFromDateChange} ariaLabel="Analytics start date" className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#64718a]">To date</label>
                <DatePicker value={toDate} onChange={setToDate} minDate={fromDate || undefined} ariaLabel="Analytics end date" className="w-full" />
              </div>
            </div>
          )}
        </div>

        {filterMode === "year" && !yearIsValid && (
          <p role="alert" className="mt-2 text-xs text-red-700">Enter a whole year between 2000 and 2100.</p>
        )}
        {filterMode === "range" && (!fromDate || !toDate || !dateRangeIsValid) && (
          <p role="alert" className="mt-2 text-xs text-red-700">
            {!fromDate || !toDate ? "Choose both dates to load the analytics." : "The start date must be on or before the end date."}
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 py-4 sm:px-5">
        {analyticsQuery.isError && !analytics && (
          <div role="alert" className="flex min-h-[260px] flex-col items-center justify-center rounded-xl bg-red-50 px-5 text-center">
            <AlertCircle size={22} className="text-red-600" />
            <p className="mt-3 text-sm font-semibold text-[#101d49]">Analytics could not be loaded</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-red-800">{analyticsQuery.error instanceof Error ? analyticsQuery.error.message : "Try again in a moment."}</p>
            <button type="button" onClick={() => void analyticsQuery.refetch()} disabled={!enabled || analyticsQuery.isFetching} className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#101d49] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
              <RefreshCw size={13} className={analyticsQuery.isFetching ? "animate-spin" : ""} /> Try again
            </button>
          </div>
        )}

        {!analytics && !analyticsQuery.isError && analyticsQuery.isFetching && <ChartLoadingState />}

        {analytics && (
          <>
            {analyticsQuery.isError && (
              <div role="status" className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">Showing the last successfully loaded analytics. Refresh failed.</div>
            )}
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium text-[#8490a6]">{formatPeriod(analytics.period.fromDate, analytics.period.toDate)}</p>
              {analyticsQuery.isFetching && <span className="inline-flex items-center gap-1.5 text-[11px] text-[#8490a6]"><RefreshCw size={11} className="animate-spin" />Updating</span>}
            </div>
            {analytics.series.length > 0 ? (
              <div className="h-[250px] min-w-0 xl:min-h-[250px] xl:flex-1" aria-busy={analyticsQuery.isFetching}>
                <StudentEnrollmentLineChart series={analytics.series} />
              </div>
            ) : (
              <div className="flex h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-[#e4e9f2] text-center xl:min-h-[250px] xl:flex-1">
                <CalendarRange size={24} className="text-[#8490a6]" />
                <p className="mt-3 text-sm font-semibold text-[#101d49]">No monthly data for this period</p>
                <p className="mt-1 text-xs text-[#8490a6]">Try another year or date range.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
