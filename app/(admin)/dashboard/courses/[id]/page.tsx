"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  GraduationCap,
  RefreshCw,
  Users,
} from "lucide-react";

import { MainLayout } from "@/components/layout/dashboard";
import { useProgrammeDetails } from "@/lib/hooks/programmes/use-programmes";
import type { ProgrammeMetrics } from "@/lib/interfaces/programmes";

const surfaceClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function DetailsSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading programme details">
      <div className="h-56 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-[#e4e9f2]" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-[#e4e9f2]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      </div>
      <span className="sr-only">Loading programme details…</span>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  tone: "navy" | "gold" | "green" | "blue";
}) {
  const iconTone = {
    navy: "bg-[#eaf0ff] text-[#101d49]",
    gold: "bg-[#fff6d8] text-[#765800]",
    green: "bg-[#e7f5ee] text-[#16845b]",
    blue: "bg-[#e9f4ff] text-[#24679a]",
  }[tone];

  return (
    <article className={`${surfaceClass} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#64718a]">{label}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-[#101d49]">
            {value}
          </p>
        </div>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconTone}`}>
          <Icon size={19} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#8490a6]">{detail}</p>
    </article>
  );
}

function DataRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#edf0f6] py-3 last:border-0 last:pb-0">
      <span className="text-sm text-[#64718a]">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-[#17233f]">{formatCount(value)}</span>
    </div>
  );
}

function DetailSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof BookOpen;
  children: ReactNode;
}) {
  return (
    <section className={`${surfaceClass} p-5 sm:p-6`}>
      <div className="flex items-start gap-3 border-b border-[#edf0f6] pb-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f6fa] text-[#101d49]">
          <Icon size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-[#101d49]">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-[#8490a6]">{description}</p>
        </div>
      </div>
      <div className="pt-1">{children}</div>
    </section>
  );
}

function ProgrammeError({
  message,
  isFetching,
  onRetry,
}: {
  message: string;
  isFetching: boolean;
  onRetry: () => void;
}) {
  return (
    <section className={`${surfaceClass} flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center`}>
      <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertCircle size={27} aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-[#101d49]">Could not load programme details</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
        {message || "Something went wrong while retrieving this programme. Please try again."}
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

function ProgrammeOverview({
  programme,
  metrics,
}: {
  programme: { id: string; name: string; description: string; hours: number; createdAt: string; updatedAt: string };
  metrics: ProgrammeMetrics;
}) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-9">
        <div aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -right-2 -top-12 size-52 rounded-full border border-white/10" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
              <GraduationCap size={14} aria-hidden="true" />
              Programme overview
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{programme.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
              {programme.description || "No programme description has been provided."}
            </p>
          </div>
          <div className="w-fit rounded-xl border border-white/10 bg-white/[0.06] px-5 py-4">
            <p className="text-xs font-medium text-white/65">Programme duration</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-white">
              {formatCount(programme.hours)} <span className="text-sm font-medium text-white/75">hours</span>
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Programme summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Students"
          value={formatCount(metrics.totalStudents)}
          detail={`${formatCount(metrics.activeStudents)} currently active`}
          icon={Users}
          tone="navy"
        />
        <SummaryCard
          label="Active tutors"
          value={formatCount(metrics.activeTutors)}
          detail="Tutors active in this programme"
          icon={GraduationCap}
          tone="blue"
        />
        <SummaryCard
          label="Published lessons"
          value={formatCount(metrics.publishedLessons)}
          detail={`${formatCount(metrics.totalLessons)} lessons in total`}
          icon={BookOpen}
          tone="gold"
        />
        <SummaryCard
          label="Pending reviews"
          value={formatCount(metrics.pendingReviews)}
          detail={`${formatCount(metrics.totalSubmissions)} submissions received`}
          icon={ClipboardCheck}
          tone="green"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2" aria-label="Programme activity details">
        <DetailSection
          title="Learning content"
          description="Lesson availability and learner completion activity."
          icon={BookOpen}
        >
          <DataRow label="Total lessons" value={metrics.totalLessons} />
          <DataRow label="Published lessons" value={metrics.publishedLessons} />
          <DataRow label="Lesson completions" value={metrics.lessonCompletions} />
        </DetailSection>

        <DetailSection
          title="Assignments and reviews"
          description="Assignment publishing and submission workload."
          icon={ClipboardCheck}
        >
          <DataRow label="Total assignments" value={metrics.totalAssignments} />
          <DataRow label="Published assignments" value={metrics.publishedAssignments} />
          <DataRow label="Total submissions" value={metrics.totalSubmissions} />
          <DataRow label="Pending reviews" value={metrics.pendingReviews} />
        </DetailSection>

        <DetailSection
          title="Learner community"
          description="Student and tutor activity for this programme."
          icon={Users}
        >
          <DataRow label="Total students" value={metrics.totalStudents} />
          <DataRow label="Active students" value={metrics.activeStudents} />
          <DataRow label="Active tutors" value={metrics.activeTutors} />
        </DetailSection>

        <DetailSection
          title="Upcoming delivery"
          description="Scheduled programme activity."
          icon={CalendarClock}
        >
          <div className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#64718a]">Upcoming sessions</p>
              <p className="mt-1 text-xs text-[#8490a6]">Sessions scheduled for this programme</p>
            </div>
            <p className="text-3xl font-bold tabular-nums tracking-tight text-[#101d49]">
              {formatCount(metrics.upcomingSessions)}
            </p>
          </div>
        </DetailSection>
      </section>

      <section className={`${surfaceClass} p-5 sm:p-6`} aria-label="Programme record details">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#8490a6]">Programme ID</p>
            <p className="mt-2 break-all font-mono text-xs leading-5 text-[#52627f]">{programme.id}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#8490a6]">Created</p>
            <p className="mt-2 text-sm font-medium text-[#17233f]">{formatDate(programme.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#8490a6]">Last updated</p>
            <p className="mt-2 text-sm font-medium text-[#17233f]">{formatDate(programme.updatedAt)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AdminProgrammeDetailsPage() {
  const params = useParams<{ id: string }>();
  const programmeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const query = useProgrammeDetails(programmeId ?? "");

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1400px] space-y-6 pb-10 sm:space-y-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <Link
            href="/dashboard/courses"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-[#52627f] transition hover:bg-white hover:text-[#101d49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Courses
          </Link>
          <span aria-hidden="true" className="text-[#b3bdcc]">/</span>
          <span className="font-medium text-[#101d49]">Programme details</span>
        </nav>

        {query.isPending ? (
          <DetailsSkeleton />
        ) : query.isError || !query.data ? (
          <ProgrammeError
            message={query.error instanceof Error ? query.error.message : "This programme could not be found."}
            isFetching={query.isFetching}
            onRetry={() => void query.refetch()}
          />
        ) : (
          <ProgrammeOverview programme={query.data.programme} metrics={query.data.metrics} />
        )}

      </main>
    </MainLayout>
  );
}
