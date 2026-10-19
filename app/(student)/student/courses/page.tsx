"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CircleHelp,
  Clock3,
  GraduationCap,
  RefreshCw,
} from "lucide-react";

import MainLayout from "@/components/layout/dashboard/MainLayout";
import { useStudentDashboard } from "@/lib/hooks/dashboard/use-student-dashboard";
import { useMyProgrammes } from "@/lib/hooks/student-programmes/use-my-programmes";
import type { StudentProgrammeEnrolment } from "@/lib/interfaces/student-programmes";
import { cn } from "@/lib/utils";

const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function CoursesLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading your courses">
      <div className="h-36 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-60 animate-pulse rounded-2xl bg-[#e4e9f2]" />
        ))}
      </div>
      <span className="sr-only">Loading your enrolled programmes…</span>
    </div>
  );
}

function CoursesError({
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
      <h2 className="mt-5 text-lg font-semibold text-[#101d49]">Could not load your courses</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
        {message || "Something went wrong while retrieving your enrolments. Please try again."}
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

function EnrolmentCard({
  enrolment,
  programme,
}: {
  enrolment: StudentProgrammeEnrolment;
  programme?: {
    name: string;
    description: string;
    hours: number;
  };
}) {
  return (
    <article className={cn(cardClass, "flex h-full flex-col overflow-hidden transition-shadow hover:shadow-[0_8px_24px_rgba(16,29,73,0.07)]")}>
      <div className="h-1.5 bg-[#f5c542]" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
            <GraduationCap size={23} aria-hidden="true" />
          </span>
          <span className="inline-flex items-center rounded-full bg-[#e7f5ee] px-3 py-1 text-xs font-semibold text-[#16845b]">
            Enrolled
          </span>
        </div>

        <div className="mt-5 min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8490a6]">
            Programme
          </p>
          <h2 className="mt-1 break-words text-lg font-bold tracking-tight text-[#101d49]">
            {programme?.name ?? "Programme details pending"}
          </h2>
          <p className="mt-2 min-h-[3rem] text-sm leading-6 text-[#64718a]">
            {programme?.description ||
              "This programme is linked to your account. Detailed course information is not available yet."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#edf0f6] pt-4 text-xs text-[#64718a]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} aria-hidden="true" />
            Enrolled {formatDate(enrolment.createdAt)}
          </span>
          {programme && Number.isFinite(programme.hours) && (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} aria-hidden="true" />
              {new Intl.NumberFormat("en-NG").format(Math.max(0, programme.hours))} hours
            </span>
          )}
        </div>

        {!programme && (
          <p className="mt-3 break-all font-mono text-[11px] text-[#8490a6]" title={enrolment.programmeId}>
            Programme ID: {enrolment.programmeId}
          </p>
        )}

        <Link
          href="/student/progress"
          className="mt-5 inline-flex min-h-10 items-center justify-between gap-2 rounded-xl bg-[#f4f6fa] px-4 py-2.5 text-sm font-semibold text-[#101d49] transition hover:bg-[#eaf0ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101d49]"
        >
          View learning progress
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function StudentCoursesPage() {
  const programmesQuery = useMyProgrammes();
  const dashboardQuery = useStudentDashboard();

  const enrolments =
    programmesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const programmeDetails = new Map(
    (dashboardQuery.data?.programmes ?? []).map((programme) => [programme.id, programme]),
  );
  const programmesWithDetails = enrolments.filter((enrolment) =>
    programmeDetails.has(enrolment.programmeId),
  ).length;

  const refresh = () => {
    void programmesQuery.refetch();
    void dashboardQuery.refetch();
  };
  const isRefreshing = programmesQuery.isFetching || dashboardQuery.isFetching;

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
                <BookOpen size={22} strokeWidth={1.8} aria-hidden="true" />
              </span>
              My courses
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64718a] sm:text-base">
              View the programmes connected to your account and continue tracking your learning.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={isRefreshing}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-[#d9e1f0] bg-white px-4 py-2 text-sm font-semibold text-[#101d49] transition hover:bg-[#f9fafd] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} aria-hidden="true" />
            {isRefreshing ? "Refreshing…" : "Refresh courses"}
          </button>
        </header>

        {programmesQuery.isLoading ? (
          <CoursesLoading />
        ) : programmesQuery.isError && !programmesQuery.data ? (
          <CoursesError
            message={programmesQuery.error instanceof Error ? programmesQuery.error.message : ""}
            isFetching={programmesQuery.isFetching}
            onRetry={() => void programmesQuery.refetch()}
          />
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2">
              <article className={`${cardClass} flex items-center gap-4 p-5 sm:p-6`}>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
                  <BookOpen size={21} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium text-[#64718a]">Enrolments retrieved</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-[#101d49]">
                    {new Intl.NumberFormat("en-NG").format(enrolments.length)}
                  </p>
                  <p className="mt-1 text-xs text-[#8490a6]">
                    {programmesQuery.hasNextPage
                      ? "More enrolments are available."
                      : "All available enrolments are loaded."}
                  </p>
                </div>
              </article>
              <article className={`${cardClass} flex items-center gap-4 p-5 sm:p-6`}>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff6d8] text-[#765800]">
                  <GraduationCap size={21} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium text-[#64718a]">Programme details available</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-[#101d49]">
                    {new Intl.NumberFormat("en-NG").format(programmesWithDetails)}
                  </p>
                  <p className="mt-1 text-xs text-[#8490a6]">
                    Programme names and descriptions from your dashboard.
                  </p>
                </div>
              </article>
            </section>

            {programmesQuery.isError && (
              <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Could not refresh your enrolments. Showing the last loaded results.
              </div>
            )}

            {dashboardQuery.isError && enrolments.length > 0 && (
              <div role="status" className="rounded-xl border border-[#d9e1f0] bg-[#f4f6fa] px-4 py-3 text-sm text-[#52627f]">
                Programme details could not be loaded. Your enrolments are still available below.
              </div>
            )}

            {enrolments.length > 0 ? (
              <section aria-labelledby="enrolments-heading">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 id="enrolments-heading" className="text-lg font-semibold text-[#101d49]">
                      Your enrolled programmes
                    </h2>
                    <p className="mt-1 text-sm text-[#64718a]">
                      Programme information is shown when it is available in your dashboard data.
                    </p>
                  </div>
                  <Link
                    href="/student/progress"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#101d49] hover:text-[#2857a4]"
                  >
                    Progress overview <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {enrolments.map((enrolment) => (
                    <EnrolmentCard
                      key={enrolment.id}
                      enrolment={enrolment}
                      programme={programmeDetails.get(enrolment.programmeId)}
                    />
                  ))}
                </div>

                {programmesQuery.hasNextPage && (
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => void programmesQuery.fetchNextPage()}
                      disabled={programmesQuery.isFetchingNextPage}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172a60] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {programmesQuery.isFetchingNextPage && (
                        <RefreshCw size={15} className="animate-spin" aria-hidden="true" />
                      )}
                      {programmesQuery.isFetchingNextPage ? "Loading more…" : "Load more programmes"}
                    </button>
                  </div>
                )}
              </section>
            ) : (
              <section className={`${cardClass} flex flex-col items-center px-6 py-14 text-center`}>
                <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
                  <GraduationCap size={26} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-[#101d49]">No courses yet</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
                  Programmes assigned to your account will appear here. If you expected to see a programme, contact your programme administrator.
                </p>
                <Link
                  href="/student/dashboard"
                  className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#f5c542] px-4 py-2 text-sm font-semibold text-[#101d49] transition hover:bg-[#edb92e]"
                >
                  Back to dashboard <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </section>
            )}

            <aside className="flex items-start gap-3 rounded-2xl border border-[#e4e9f2] bg-[#f9fafd] p-4 sm:p-5">
              <CircleHelp size={19} className="mt-0.5 shrink-0 text-[#64718a]" aria-hidden="true" />
              <p className="text-sm leading-6 text-[#64718a]">
                This page lists your programme enrolments. Lesson schedules and course materials will appear here when those details are provided by the learning platform.
              </p>
            </aside>
          </>
        )}
      </div>
    </MainLayout>
  );
}
