"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CircleHelp,
  Clock3,
  GraduationCap,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { DailyReportPrompt } from "@/components/dashboard/student/DailyReportPrompt";
import { useCurrentUser } from "@/lib/hooks/auth/use-current-user";
import { useDashboardUIConfig } from "@/lib/hooks/ui-config/use-dashboard-ui-config";
import type {
  StudentDashboardData,
  StudentLearningProgressData,
} from "@/lib/interfaces/dashboard";
import { UserType } from "@/lib/types/users";
import { cn } from "@/lib/utils";

type StudentDashboardViewProps = {
  data?: StudentDashboardData;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isFetching: boolean;
  onRetry: () => void;
  progress?: StudentLearningProgressData;
  progressIsLoading: boolean;
  progressIsError: boolean;
  progressError?: Error | null;
  progressIsFetching: boolean;
  onProgressRetry: () => void;
};

const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

function getFirstName(email?: string): string {
  const localPart = email?.split("@")[0]?.trim();
  if (!localPart) return "there";

  const firstPart = localPart.split(/[._-\s]/)[0];
  return firstPart
    ? firstPart.charAt(0).toUpperCase() + firstPart.slice(1)
    : "there";
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value);
}

function formatNullableNumber(value: number | null): string {
  return typeof value === "number" && Number.isFinite(value)
    ? formatNumber(value)
    : "—";
}

function getValidPercentage(value: number | null): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, value));
}

function formatPercentage(value: number | null): string {
  const percentage = getValidPercentage(value);
  return percentage === null
    ? "—"
    : `${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 1 }).format(percentage)}%`;
}

function DashboardLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading student dashboard">
      <div className="h-36 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-[#e4e9f2]" />
        ))}
      </div>
      <div className="h-56 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      <span className="sr-only">Loading your learning dashboard…</span>
    </div>
  );
}

function ErrorState({
  message,
  isFetching,
  onRetry,
}: {
  message: string;
  isFetching: boolean;
  onRetry: () => void;
}) {
  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-[#e4e9f2] bg-white px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertCircle size={27} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-[#101d49]">
        Could not load your student dashboard
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
        {message || "Something went wrong while retrieving your learning data. Please try again."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isFetching}
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172a60] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} aria-hidden="true" />
        {isFetching ? "Retrying…" : "Try again"}
      </button>
    </section>
  );
}

function AssignmentSummary({
  assignments,
}: {
  assignments: StudentDashboardData["overview"]["assignments"];
}) {
  const items = [
    { label: "Total assignments", value: assignments.total, tone: "text-[#101d49]" },
    { label: "Submitted", value: assignments.submitted, tone: "text-[#16845b]" },
    { label: "Pending", value: assignments.pending, tone: "text-[#8a6500]" },
  ];

  return (
    <section className={cn(cardClass, "overflow-hidden")} aria-labelledby="assignments-summary-title">
      <div className="flex items-center gap-3 border-b border-[#edf0f6] px-5 py-5 sm:px-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#fff6d8] text-[#765800]">
          <GraduationCap size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 id="assignments-summary-title" className="font-semibold text-[#101d49]">Assignment overview</h2>
          <p className="mt-0.5 text-xs text-[#64718a]">Your current assignment activity</p>
        </div>
      </div>
      <dl className="grid divide-y divide-[#edf0f6] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map(({ label, value, tone }) => (
          <div key={label} className="px-5 py-5 sm:px-6">
            <dt className="text-sm text-[#64718a]">{label}</dt>
            <dd className={cn("mt-2 text-2xl font-bold tabular-nums", tone)}>{formatNumber(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ProgrammeList({
  programmes,
}: {
  programmes: StudentDashboardData["programmes"];
}) {
  return (
    <section className={cn(cardClass, "overflow-hidden")} aria-labelledby="student-programmes-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f6] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
            <BookOpen size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 id="student-programmes-title" className="font-semibold text-[#101d49]">My programmes</h2>
            <p className="mt-0.5 text-xs text-[#64718a]">Programmes currently linked to your account</p>
          </div>
        </div>
        <span className="rounded-full bg-[#eaf0ff] px-3 py-1 text-xs font-semibold text-[#101d49]">
          {programmes.length} {programmes.length === 1 ? "programme" : "programmes"}
        </span>
      </div>

      {programmes.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-semibold text-[#17233f]">No programmes yet</p>
          <p className="mt-1 text-sm text-[#64718a]">Your enrolled programmes will appear here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#edf0f6]">
          {programmes.map((programme) => (
            <li key={programme.id} className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
              <div className="min-w-0">
                <h3 className="break-words font-semibold text-[#17233f]">{programme.name}</h3>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[#64718a]">
                  {programme.description || "No programme description is available."}
                </p>
              </div>
              <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-[#f6f8fc] px-3 py-1.5 text-xs font-semibold text-[#64718a]">
                <Clock3 size={14} aria-hidden="true" />
                {formatNumber(programme.hours)} hours
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function LearningProgressPanel({
  progress,
  isLoading,
  isError,
  error,
  isFetching,
  onRetry,
}: {
  progress?: StudentLearningProgressData;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isFetching: boolean;
  onRetry: () => void;
}) {
  return (
    <section className={cn(cardClass, "overflow-hidden")} aria-labelledby="learning-progress-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f6] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
            <GraduationCap size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 id="learning-progress-title" className="font-semibold text-[#101d49]">Learning progress</h2>
            <p className="mt-0.5 text-xs text-[#64718a]">Lesson completion across your programmes</p>
          </div>
        </div>
        {isFetching && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[#64718a]">
            <RefreshCw size={13} className="animate-spin" aria-hidden="true" />Updating
          </span>
        )}
      </div>

      {isError && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900 sm:px-6">
          <p>{progress ? "Could not refresh progress data." : (error?.message || "Could not load learning progress.")}</p>
          <button
            type="button"
            onClick={onRetry}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 font-semibold underline-offset-2 hover:underline disabled:opacity-60"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {isLoading && !progress ? (
        <div className="space-y-4 p-5 sm:p-6" role="status" aria-label="Loading learning progress">
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-xl bg-[#f1f3f8]" />
            ))}
          </div>
          <div className="h-16 animate-pulse rounded-xl bg-[#f1f3f8]" />
          <span className="sr-only">Loading your learning progress…</span>
        </div>
      ) : progress ? (
        <div className="space-y-5 p-5 sm:p-6">
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[#f9fafd] p-4">
              <dt className="text-xs font-medium text-[#64718a]">Overall progress</dt>
              <dd className="mt-2 text-2xl font-bold text-[#101d49]">{formatPercentage(progress.overallProgress)}</dd>
            </div>
            <div className="rounded-xl bg-[#f9fafd] p-4">
              <dt className="text-xs font-medium text-[#64718a]">Lessons completed</dt>
              <dd className="mt-2 text-2xl font-bold text-[#101d49]">{formatNullableNumber(progress.lessonsCompleted)}</dd>
            </div>
            <div className="rounded-xl bg-[#f9fafd] p-4">
              <dt className="text-xs font-medium text-[#64718a]">Total lessons</dt>
              <dd className="mt-2 text-2xl font-bold text-[#101d49]">{formatNullableNumber(progress.totalLessons)}</dd>
            </div>
          </dl>

          {progress.programmes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#d9dfeb] px-4 py-5 text-center text-sm text-[#64718a]">
              Programme progress will appear here when lesson data is available.
            </p>
          ) : (
            <ul className="space-y-4">
              {progress.programmes.map((programme) => {
                const percentage = getValidPercentage(programme.progressPercentage);
                return (
                  <li key={programme.id} className="rounded-xl border border-[#edf0f6] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-semibold text-[#17233f]">{programme.name}</h3>
                        <p className="mt-1 text-xs text-[#64718a]">
                          {formatNullableNumber(programme.lessonsCompleted)} of {formatNullableNumber(programme.totalLessons)} lessons completed
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-[#101d49]">{formatPercentage(programme.progressPercentage)}</span>
                    </div>
                    <div
                      className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#edf0f6]"
                      role={percentage === null ? undefined : "progressbar"}
                      aria-label={percentage === null ? undefined : `${programme.name} progress`}
                      aria-valuemin={percentage === null ? undefined : 0}
                      aria-valuemax={percentage === null ? undefined : 100}
                      aria-valuenow={percentage === null ? undefined : Math.round(percentage)}
                    >
                      {percentage !== null && (
                        <div className="h-full rounded-full bg-[#f5c542] transition-[width] duration-500" style={{ width: `${percentage}%` }} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-[#64718a]">Learning progress is not available yet.</p>
      )}
    </section>
  );
}

export default function StudentDashboardView({
  data,
  isLoading,
  isError,
  error,
  isFetching,
  onRetry,
  progress,
  progressIsLoading,
  progressIsError,
  progressError,
  progressIsFetching,
  onProgressRetry,
}: StudentDashboardViewProps) {
  const { user } = useCurrentUser();
  const { uiConfig, role, isReady } = useDashboardUIConfig();

  if (!isReady || role !== UserType.STUDENT || !uiConfig || (isLoading && !data)) {
    return <DashboardLoading />;
  }

  if (isError && !data) {
    return <ErrorState message={error?.message ?? ""} isFetching={isFetching} onRetry={onRetry} />;
  }

  if (!data) {
    return <ErrorState message="The dashboard response did not contain any data." isFetching={isFetching} onRetry={onRetry} />;
  }

  const firstName = getFirstName(user?.email);
  const { overview, programmes } = data;

  return (
    <div className="mx-auto max-w-[1600px] space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#64718a]">{uiConfig.title}</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">Welcome back, {firstName}</h1>
          <p className="max-w-2xl text-sm leading-6 text-[#718099]">{uiConfig.description}</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          disabled={isFetching}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#e4e9f2] bg-white px-4 py-2 text-sm font-semibold text-[#101d49] transition hover:border-[#cbd4e5] hover:bg-[#f9fafd] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} aria-hidden="true" />
          {isFetching ? "Updating…" : "Refresh data"}
        </button>
      </header>

      {isError && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Could not refresh the latest data</p>
            <p className="mt-1 leading-5">Showing the most recently loaded dashboard data.{error?.message ? ` ${error.message}` : ""}</p>
          </div>
        </div>
      )}

      {/* Daily report nudge, links to /student/reports. */}
      <DailyReportPrompt />

      <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_36px_rgba(16,29,73,0.14)] sm:px-8 sm:py-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-24 size-72 rounded-full border border-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-16 size-56 rounded-full border border-white/10" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/30 bg-[#f5c542]/10 px-3 py-1.5 text-xs font-semibold text-[#f8d978]">
              <Sparkles size={14} aria-hidden="true" />Your learning journey
            </span>
            <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">Build momentum, one lesson at a time.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
              You are enrolled in {formatNumber(overview.totalProgrammes)} {overview.totalProgrammes === 1 ? "programme" : "programmes"}, with {formatNumber(overview.totalProgrammeHours)} learning hours in your programme plan.
            </p>
          </div>
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#f5c542] text-[#101d49] shadow-lg shadow-black/10">
            <GraduationCap size={30} aria-hidden="true" />
          </div>
        </div>
      </section>

      <section aria-labelledby="learning-overview-title" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="learning-overview-title" className="text-lg font-bold text-[#101d49]">Learning overview</h2>
            <p className="mt-1 text-sm text-[#718099]">Your live programme totals and learning activity.</p>
          </div>
          {isFetching && <span className="inline-flex items-center gap-1.5 text-xs text-[#64718a]"><RefreshCw size={13} className="animate-spin" aria-hidden="true" />Updating</span>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {uiConfig.stats.map(({ key, label, description, icon: Icon }) => {
            let value: number | null = null;
            if (key === "enrolledCourses") value = overview.totalProgrammes;
            if (key === "completedLessons") {
              value = progress?.lessonsCompleted ?? overview.lessonsCompleted;
            }
            if (key === "pendingAssignments") value = overview.assignments.pending;
            if (key === "learningProgress") value = progress?.overallProgress ?? null;

            return (
              <article key={key} className={cn(cardClass, "p-5 sm:p-6")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-[#64718a]">{label}</h3>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]" aria-label={`${label}: ${value === null ? "not yet available" : key === "learningProgress" ? formatPercentage(value) : formatNumber(value)}`}>
                      {value === null ? "—" : key === "learningProgress" ? formatPercentage(value) : formatNumber(value)}
                    </p>
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]"><Icon size={21} aria-hidden="true" /></span>
                </div>
                <p className="mt-4 text-xs leading-5 text-[#718099]">{value === null ? `${description} (data not available yet)` : description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <LearningProgressPanel
        progress={progress}
        isLoading={progressIsLoading}
        isError={progressIsError}
        error={progressError}
        isFetching={progressIsFetching}
        onRetry={onProgressRetry}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <ProgrammeList programmes={programmes} />
        <AssignmentSummary assignments={overview.assignments} />
      </div>

      <section aria-labelledby="student-actions-title" className="space-y-4">
        <div>
          <h2 id="student-actions-title" className="text-lg font-bold text-[#101d49]">Your learning workspace</h2>
          <p className="mt-1 text-sm text-[#718099]">Open a learning area from the navigation when its page is available.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {uiConfig.quickActions.map(({ key, title, description, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className={cn(cardClass, "group flex min-h-40 flex-col p-5 transition hover:-translate-y-0.5 hover:border-[#101d49]/20 hover:shadow-[0_8px_24px_rgba(16,29,73,0.08)] focus:outline-none focus:ring-4 focus:ring-[#101d49]/10")}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff6d8] text-[#765800]"><Icon size={19} aria-hidden="true" /></span>
                <ArrowUpRight size={17} className="text-[#9aa5b8] transition group-hover:text-[#101d49]" aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-semibold text-[#101d49]">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-[#718099]">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <aside className="flex items-start gap-3 rounded-2xl border border-[#e4e9f2] bg-white px-5 py-4 text-sm text-[#64718a]">
        <CircleHelp size={18} className="mt-0.5 shrink-0 text-[#101d49]" aria-hidden="true" />
        <p>Need help getting started? Use the Help &amp; Support option in the student navigation.</p>
      </aside>

      <footer className="flex items-start gap-2 border-t border-[#e4e9f2] pt-4 text-xs leading-5 text-[#64718a]">
        <Clock3 size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>Programme and assignment totals come from the student dashboard API. Lesson completion and progress come from the learning progress API; values the backend has not calculated yet are shown as unavailable.</p>
      </footer>
    </div>
  );
}
