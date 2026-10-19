"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCheck,
  CircleHelp,
  Clock3,
  GraduationCap,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";

import { useCurrentUser } from "@/lib/hooks/auth/use-current-user";
import { useDashboardUIConfig } from "@/lib/hooks/ui-config/use-dashboard-ui-config";
import type {
  TutorDashboardCourse,
  TutorDashboardData,
  TutorDashboardPendingSubmission,
  TutorDashboardStudent,
  TutorDashboardUpcomingSession,
} from "@/lib/interfaces/dashboard";
import { UserType } from "@/lib/types/users";
import { cn } from "@/lib/utils";

type TutorDashboardViewProps = {
  data?: TutorDashboardData;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isFetching: boolean;
  onRetry: () => void;
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

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function DashboardLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading tutor dashboard">
      <div className="h-36 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-[#e4e9f2]" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="h-56 animate-pulse rounded-2xl bg-[#e4e9f2]" />
        ))}
      </div>
      <span className="sr-only">Loading your teaching dashboard…</span>
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
        Could not load your teaching dashboard
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
        {message || "Something went wrong while retrieving your teaching data. Please try again."}
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
        <BookOpen size={20} aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm font-semibold text-[#17233f]">Nothing to display yet</p>
      <p className="mt-1 max-w-sm text-sm leading-5 text-[#64718a]">{message}</p>
    </div>
  );
}

function SectionHeading({
  title,
  description,
  count,
  icon: Icon,
}: {
  title: string;
  description: string;
  count: number;
  icon: typeof BookOpen;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f6] px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
          <Icon size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-semibold text-[#101d49]">{title}</h2>
          <p className="mt-0.5 text-xs text-[#64718a]">{description}</p>
        </div>
      </div>
      <span className="rounded-full bg-[#f6f8fc] px-3 py-1 text-xs font-semibold text-[#64718a]">
        {count} {count === 1 ? "record" : "records"}
      </span>
    </div>
  );
}

function CourseList({ courses }: { courses: TutorDashboardCourse[] }) {
  return (
    <section className={cn(cardClass, "min-w-0 overflow-hidden")}>
      <SectionHeading title="My courses" description="Courses assigned to you" count={courses.length} icon={BookOpen} />
      {courses.length === 0 ? (
        <EmptyState message="Your assigned courses will appear here when they are available." />
      ) : (
        <ul className="divide-y divide-[#edf0f6]">
          {courses.map((course, index) => {
            const title =
              course.programme?.name?.trim() ||
              course.name?.trim() ||
              course.title?.trim() ||
              `Course ${index + 1}`;
            const studentCount = course.studentCount ?? course.totalStudents;
            const description =
              course.programme?.description?.trim() ||
              course.description?.trim() ||
              course.programmeName?.trim();
            const courseDetails = [
              typeof course.programme?.hours === "number"
                ? `${formatNumber(course.programme.hours)} ${course.programme.hours === 1 ? "hour" : "hours"}`
                : null,
              course.status?.trim()
                ? course.status.trim().toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
                : null,
            ].filter(Boolean);
            return (
              <li key={course.id} className="px-5 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-semibold text-[#17233f]">{title}</h3>
                    {description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#64718a]">
                        {description}
                      </p>
                    )}
                    {courseDetails.length > 0 && (
                      <p className="mt-2 text-xs font-medium text-[#8490a6]">
                        {courseDetails.join(" · ")}
                      </p>
                    )}
                  </div>
                  {typeof studentCount === "number" && (
                    <span className="shrink-0 text-xs font-medium text-[#64718a]">
                      {formatNumber(studentCount)} {studentCount === 1 ? "student" : "students"}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function StudentList({ students }: { students: TutorDashboardStudent[] }) {
  return (
    <section className={cn(cardClass, "min-w-0 overflow-hidden")}>
      <SectionHeading title="My students" description="Learners in your courses" count={students.length} icon={Users} />
      {students.length === 0 ? (
        <EmptyState message="Students in your assigned courses will appear here." />
      ) : (
        <ul className="divide-y divide-[#edf0f6]">
          {students.map((student, index) => {
            const name = student.name?.trim() || student.fullName?.trim() || `Student ${index + 1}`;
            const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
            return (
              <li key={student.id} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                {student.photoUrl ? (
                  // Remote image hosts may vary by tenant; use a plain img to avoid requiring a Next image-host change.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={student.photoUrl} alt="" className="size-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff6d8] text-xs font-bold text-[#101d49]">
                    {initials || "S"}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#17233f]">{name}</p>
                  <p className="mt-0.5 truncate text-xs text-[#64718a]">
                    {student.email || student.courseName || student.programmeName || "Enrolled student"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function PendingSubmissionList({
  submissions,
}: {
  submissions: TutorDashboardPendingSubmission[];
}) {
  return (
    <section className={cn(cardClass, "min-w-0 overflow-hidden")}>
      <SectionHeading title="Pending reviews" description="Submissions awaiting your feedback" count={submissions.length} icon={CheckCheck} />
      {submissions.length === 0 ? (
        <EmptyState message="There are no submissions waiting for review right now." />
      ) : (
        <ul className="divide-y divide-[#edf0f6]">
          {submissions.map((submission, index) => {
            const assignment = submission.assignmentTitle?.trim() || submission.title?.trim() || `Submission ${index + 1}`;
            const date = formatDate(submission.submittedAt);
            return (
              <li key={submission.id} className="flex flex-col gap-1 px-5 py-4 sm:px-6">
                <p className="break-words text-sm font-semibold text-[#17233f]">{assignment}</p>
                <p className="text-xs text-[#64718a]">
                  {[submission.studentName || submission.learnerName, submission.courseName, date].filter(Boolean).join(" · ") || "Awaiting review"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function UpcomingSessionList({
  sessions,
}: {
  sessions: TutorDashboardUpcomingSession[];
}) {
  return (
    <section className={cn(cardClass, "min-w-0 overflow-hidden")}>
      <SectionHeading title="Upcoming sessions" description="Your next scheduled teaching sessions" count={sessions.length} icon={CalendarDays} />
      {sessions.length === 0 ? (
        <EmptyState message="Scheduled teaching sessions will appear here." />
      ) : (
        <ul className="divide-y divide-[#edf0f6]">
          {sessions.map((session, index) => {
            const title = session.title?.trim() || session.topic?.trim() || `Session ${index + 1}`;
            const date = formatDate(session.startsAt || session.scheduledAt || session.startTime || session.date);
            return (
              <li key={session.id} className="flex items-start gap-3 px-5 py-4 sm:px-6">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#fff6d8] text-[#765800]">
                  <CalendarDays size={17} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-[#17233f]">{title}</p>
                  <p className="mt-0.5 text-xs text-[#64718a]">
                    {[session.courseName, date].filter(Boolean).join(" · ") || "Scheduled session"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function TutorDashboardView({
  data,
  isLoading,
  isError,
  error,
  isFetching,
  onRetry,
}: TutorDashboardViewProps) {
  const { user } = useCurrentUser();
  const { uiConfig, role, isReady } = useDashboardUIConfig();

  if (!isReady || role !== UserType.TUTOR || !uiConfig || (isLoading && !data)) {
    return <DashboardLoading />;
  }

  if (isError && !data) {
    return <ErrorState message={error?.message ?? ""} isFetching={isFetching} onRetry={onRetry} />;
  }

  if (!data) {
    return <ErrorState message="The dashboard response did not contain any data." isFetching={isFetching} onRetry={onRetry} />;
  }

  const firstName = getFirstName(user?.email);
  const { overview } = data;
  const overviewValues: Record<string, number> = {
    courses: overview.totalCourses,
    students: overview.totalStudents,
    pendingSubmissions: overview.pendingReviews,
    upcomingSessions: overview.upcomingSessions,
  };

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

      <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_36px_rgba(16,29,73,0.14)] sm:px-8 sm:py-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-24 size-72 rounded-full border border-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-16 size-56 rounded-full border border-white/10" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/30 bg-[#f5c542]/10 px-3 py-1.5 text-xs font-semibold text-[#f8d978]">
              <Sparkles size={14} aria-hidden="true" />Teaching workspace
            </span>
            <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">Help every learner make progress.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
              You are supporting {formatNumber(overview.totalStudents)} {overview.totalStudents === 1 ? "student" : "students"} across {formatNumber(overview.totalCourses)} {overview.totalCourses === 1 ? "course" : "courses"}. You have {formatNumber(overview.pendingReviews)} pending {overview.pendingReviews === 1 ? "review" : "reviews"}.
            </p>
          </div>
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#f5c542] text-[#101d49] shadow-lg shadow-black/10">
            <GraduationCap size={30} aria-hidden="true" />
          </div>
        </div>
      </section>

      <section aria-labelledby="teaching-overview-title" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="teaching-overview-title" className="text-lg font-bold text-[#101d49]">Teaching overview</h2>
            <p className="mt-1 text-sm text-[#718099]">Your live course, student, review, and session totals.</p>
          </div>
          {isFetching && <span className="inline-flex items-center gap-1.5 text-xs text-[#64718a]"><RefreshCw size={13} className="animate-spin" aria-hidden="true" />Updating</span>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {uiConfig.stats.map(({ key, label, description, icon: Icon }) => (
            <article key={key} className={cn(cardClass, "p-5 sm:p-6")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-[#64718a]">{label}</h3>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]">{formatNumber(overviewValues[key] ?? 0)}</p>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]"><Icon size={21} aria-hidden="true" /></span>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#718099]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Tutor dashboard details" className="grid gap-5 xl:grid-cols-2">
        <CourseList courses={data.courses} />
        <StudentList students={data.students} />
        <PendingSubmissionList submissions={data.pendingSubmissions} />
        <UpcomingSessionList sessions={data.upcomingSessions} />
      </section>

      <section aria-labelledby="tutor-actions-title" className="space-y-4">
        <div>
          <h2 id="tutor-actions-title" className="text-lg font-bold text-[#101d49]">Teaching workspace</h2>
          <p className="mt-1 text-sm text-[#718099]">Open a teaching area from the tutor navigation when its page is available.</p>
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
        <p>Need help? Use the Help &amp; Support option from the portal navigation.</p>
      </aside>
    </div>
  );
}
