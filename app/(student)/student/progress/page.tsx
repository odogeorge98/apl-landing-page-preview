"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CircleHelp,
  GraduationCap,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import MainLayout from "@/components/layout/dashboard/MainLayout";
import { useStudentLearningProgress } from "@/lib/hooks/dashboard/use-student-learning-progress";
import type { StudentProgrammeLearningProgress } from "@/lib/interfaces/dashboard";
import { cn } from "@/lib/utils";

const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

function asCount(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.max(0, Math.floor(value));
}

function asPercentage(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, value));
}

function formatCount(value: number | null | undefined): string {
  const count = asCount(value);
  return count === null ? "—" : new Intl.NumberFormat("en-NG").format(count);
}

function formatPercentage(value: number | null | undefined): string {
  const percentage = asPercentage(value);
  if (percentage === null) return "Not available yet";

  return `${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 1,
  }).format(percentage)}%`;
}

function ProgressSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading learning progress">
      <div className="h-36 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-[#e4e9f2]" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      <span className="sr-only">Loading your learning progress…</span>
    </div>
  );
}

function ProgressError({
  message,
  isFetching,
  onRetry,
}: {
  message: string;
  isFetching: boolean;
  onRetry: () => void;
}) {
  return (
    <section className={`${cardClass} flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center`}>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertCircle size={27} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-[#101d49]">
        Could not load your learning progress
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
        {message || "Something went wrong while retrieving your progress. Please try again."}
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

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  emphasis = "navy",
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof BarChart3;
  emphasis?: "navy" | "gold" | "green";
}) {
  const tone = {
    navy: "bg-[#eaf0ff] text-[#101d49]",
    gold: "bg-[#fff6d8] text-[#765800]",
    green: "bg-[#e7f5ee] text-[#16845b]",
  }[emphasis];

  return (
    <article className={`${cardClass} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#64718a]">{label}</p>
          <p className="mt-2 break-words text-2xl font-bold tabular-nums tracking-tight text-[#101d49]">
            {value}
          </p>
        </div>
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone)}>
          <Icon size={19} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#8490a6]">{description}</p>
    </article>
  );
}

function ProgrammeProgressCard({
  programme,
}: {
  programme: StudentProgrammeLearningProgress;
}) {
  const completed = asCount(programme.lessonsCompleted);
  const total = asCount(programme.totalLessons);
  const percentage = asPercentage(programme.progressPercentage);
  const status =
    total === 0
      ? "No lessons available yet"
      : percentage === null
        ? "Progress not available yet"
        : `${formatPercentage(percentage)} complete`;

  return (
    <article className="rounded-2xl border border-[#e4e9f2] bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(16,29,73,0.06)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
            <GraduationCap size={21} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-[#101d49]">{programme.name}</h3>
            <p className="mt-1 text-sm text-[#64718a]">Programme learning progress</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center rounded-full bg-[#f4f6fa] px-3 py-1 text-xs font-semibold text-[#52627f]">
          {status}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#64718a]">Lessons completed</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-[#17233f]">
            {formatCount(completed)}
            <span className="mx-1.5 text-sm font-normal text-[#8490a6]">of</span>
            {formatCount(total)}
          </p>
        </div>
        <p className="text-sm font-semibold tabular-nums text-[#101d49]">
          {formatPercentage(percentage)}
        </p>
      </div>

      {percentage === null ? (
        <div
          aria-hidden="true"
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#edf0f6]"
        />
      ) : (
        <div
          role="progressbar"
          aria-label={`${programme.name} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
          aria-valuetext={`${formatPercentage(percentage)} complete`}
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#edf0f6]"
        >
          <div
            className="h-full rounded-full bg-[#f5c542] transition-[width] duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      <p className="mt-3 text-xs leading-5 text-[#8490a6]">
        {total === 0
          ? "Lesson totals will appear here when lessons are available in this programme."
          : "Your completed lesson count is based on the latest progress data."}
      </p>
    </article>
  );
}

export default function StudentProgressPage() {
  const progressQuery = useStudentLearningProgress();
  const progress = progressQuery.data;

  return (
    <MainLayout>
      <div className="mx-auto max-w-[1400px] space-y-7 pb-10 sm:space-y-9">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
              Your learning
            </p>
            <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#fff6d8] text-[#765800]">
                <BarChart3 size={22} strokeWidth={1.8} aria-hidden="true" />
              </span>
              Learning progress
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64718a] sm:text-base">
              See your completed lessons and progress across your Nugi Innovations programmes.
            </p>
          </div>
          {progress && (
            <button
              type="button"
              onClick={() => void progressQuery.refetch()}
              disabled={progressQuery.isFetching}
              className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-[#d9e1f0] bg-white px-4 py-2 text-sm font-semibold text-[#101d49] transition hover:bg-[#f9fafd] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw size={15} className={progressQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" />
              {progressQuery.isFetching ? "Refreshing…" : "Refresh progress"}
            </button>
          )}
        </header>

        {progressQuery.isLoading ? (
          <ProgressSkeleton />
        ) : progressQuery.isError && !progress ? (
          <ProgressError
            message={progressQuery.error instanceof Error ? progressQuery.error.message : ""}
            isFetching={progressQuery.isFetching}
            onRetry={() => void progressQuery.refetch()}
          />
        ) : progress ? (
          <>
            <section aria-label="Progress summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Overall progress"
                value={formatPercentage(progress.overallProgress)}
                description={
                  asPercentage(progress.overallProgress) === null
                    ? "This summary will be available when progress is recorded."
                    : "Completion across your tracked learning."
                }
                icon={BarChart3}
                emphasis="gold"
              />
              <SummaryCard
                label="Lessons completed"
                value={formatCount(progress.lessonsCompleted)}
                description="Lessons marked complete across your programmes."
                icon={BookOpenCheck}
                emphasis="green"
              />
              <SummaryCard
                label="Total lessons"
                value={formatCount(progress.totalLessons)}
                description="Lessons currently included in progress tracking."
                icon={GraduationCap}
              />
              <SummaryCard
                label="Programmes"
                value={formatCount(progress.programmes.length)}
                description="Programmes included in your progress overview."
                icon={Sparkles}
              />
            </section>

            <section className={`${cardClass} overflow-hidden`} aria-labelledby="programme-progress-heading">
              <div className="flex flex-col gap-2 border-b border-[#edf0f6] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 id="programme-progress-heading" className="font-semibold text-[#101d49]">
                    Progress by programme
                  </h2>
                  <p className="mt-1 text-sm text-[#64718a]">
                    Lesson completion for each programme in your account.
                  </p>
                </div>
                {progressQuery.isError && (
                  <p role="status" className="text-xs font-medium text-[#8a6500]">
                    Showing the last available progress data. Refresh to try again.
                  </p>
                )}
              </div>

              {progress.programmes.length > 0 ? (
                <div className="grid gap-4 p-5 sm:p-6">
                  {progress.programmes.map((programme) => (
                    <ProgrammeProgressCard key={programme.id} programme={programme} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center px-6 py-14 text-center">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
                    <GraduationCap size={23} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-semibold text-[#101d49]">No programme progress yet</h3>
                  <p className="mt-1 max-w-md text-sm leading-6 text-[#64718a]">
                    Once a programme is connected to your account, its lesson progress will appear here.
                  </p>
                  <Link
                    href="/student/dashboard"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#101d49] hover:text-[#2857a4]"
                  >
                    View your dashboard <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              )}
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className={`${cardClass} flex items-start gap-4 p-5 sm:p-6`}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff6d8] text-[#765800]">
                  <CircleHelp size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-semibold text-[#101d49]">About your progress</h2>
                  <p className="mt-1 text-sm leading-6 text-[#64718a]">
                    Progress is calculated from the lesson activity currently available to the portal. If lesson totals are zero or a percentage is unavailable, the page will show that instead of estimating a completion rate.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-4 rounded-2xl bg-[#101d49] p-5 text-white sm:flex-row sm:items-center sm:p-6">
                <div>
                  <h2 className="font-semibold">Ready to continue learning?</h2>
                  <p className="mt-1 text-sm leading-6 text-white/70">
                    Return to your dashboard to open your programmes and learning activity.
                  </p>
                </div>
                <Link
                  href="/student/dashboard"
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f5c542] px-4 py-2 text-sm font-semibold text-[#101d49] transition hover:bg-[#edb92e]"
                >
                  Go to dashboard <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}
