
"use client";

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

import type {
  AdminDashboardData,
  RecentDashboardUser,
} from "@/lib/interfaces/dashboard";

type AdminDashboardViewProps = {
  data?: AdminDashboardData;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isFetching: boolean;
  onRetry: () => void;
};

type MetricCardProps = {
  title: string;
  value: number;
  description: string;
  icon: typeof Users;
  tone: "navy" | "yellow" | "blue" | "green";
};

const toneStyles = {
  navy: {
    icon: "bg-[#eaf0ff] text-[#101d49]",
    accent: "bg-[#101d49]",
  },
  yellow: {
    icon: "bg-[#fff6d8] text-[#8a6500]",
    accent: "bg-[#f5c542]",
  },
  blue: {
    icon: "bg-[#e8f4ff] text-[#2857a4]",
    accent: "bg-[#4d83d5]",
  },
  green: {
    icon: "bg-[#e4f7ee] text-[#16845b]",
    accent: "bg-[#16845b]",
  },
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return initials.toUpperCase() || "U";
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: MetricCardProps) {
  const styles = toneStyles[tone];

  return (
    <article className="relative min-w-0 overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white p-5 shadow-[0_2px_10px_rgba(16,29,73,0.025)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,29,73,0.07)] sm:p-6">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${styles.accent}`}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-[#64718a]">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-[2rem]">
            {formatNumber(value)}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon size={21} strokeWidth={1.9} aria-hidden="true" />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-[#64718a]">
        {description}
      </p>
    </article>
  );
}

function LoadingSkeleton() {
  return (
    <div
      className="space-y-7"
      role="status"
      aria-label="Loading dashboard"
    >
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-[#e4e9f2]" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-[#e4e9f2]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 7 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#e4e9f2] bg-white p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="h-4 w-28 animate-pulse rounded bg-[#e4e9f2]" />
                <div className="h-9 w-20 animate-pulse rounded bg-[#e4e9f2]" />
              </div>
              <div className="h-11 w-11 animate-pulse rounded-xl bg-[#e4e9f2]" />
            </div>
            <div className="mt-5 h-3 w-32 animate-pulse rounded bg-[#e4e9f2]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#e4e9f2] bg-white p-6"
          >
            <div className="h-5 w-40 animate-pulse rounded bg-[#e4e9f2]" />
            <div className="mt-6 space-y-5">
              {Array.from({ length: 4 }, (_, row) => (
                <div key={row} className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-[#e4e9f2]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-36 animate-pulse rounded bg-[#e4e9f2]" />
                    <div className="h-3 w-48 max-w-full animate-pulse rounded bg-[#e4e9f2]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading dashboard data…</span>
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
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertCircle size={27} aria-hidden="true" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-[#101d49]">
        We couldn&apos;t load your dashboard
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
        {message ||
          "Something went wrong while retrieving the latest academy information. Please try again."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        disabled={isFetching}
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172a60] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw
          size={16}
          className={isFetching ? "animate-spin" : ""}
          aria-hidden="true"
        />
        {isFetching ? "Retrying…" : "Try again"}
      </button>
    </section>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive
          ? "bg-[#e4f7ee] text-[#16845b]"
          : "bg-[#f0f2f6] text-[#64718a]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-[#16845b]" : "bg-[#94a0b4]"
        }`}
        aria-hidden="true"
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
        <Users size={22} aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm font-semibold text-[#17233f]">
        Nothing to display yet
      </p>
      <p className="mt-1 max-w-xs text-sm leading-5 text-[#64718a]">
        {message}
      </p>
    </div>
  );
}

function RecentUsersTable({
  title,
  description,
  users,
  emptyMessage,
  icon: Icon,
}: {
  title: string;
  description: string;
  users: RecentDashboardUser[];
  emptyMessage: string;
  icon: typeof Users;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f6] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
            <Icon size={20} aria-hidden="true" />
          </div>

          <div>
            <h2 className="font-semibold text-[#101d49]">{title}</h2>
            <p className="mt-0.5 text-xs text-[#64718a]">{description}</p>
          </div>
        </div>

        <span className="rounded-full bg-[#f6f8fc] px-3 py-1 text-xs font-semibold text-[#64718a]">
          {users.length} {users.length === 1 ? "record" : "records"}
        </span>
      </div>

      {users.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left">
            <thead>
              <tr className="bg-[#f9fafd] text-xs font-semibold uppercase tracking-wide text-[#64718a]">
                <th scope="col" className="px-6 py-3.5">
                  User
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Joined
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#edf0f6]">
              {users.map((user) => {
                const displayName = user.name?.trim() || user.email;

                return (
                  <tr
                    key={user.id}
                    className="transition hover:bg-[#fbfcff]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff6d8] text-xs font-bold text-[#101d49]">
                          {getInitials(displayName)}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate text-sm font-semibold text-[#17233f]">
                            {displayName}
                          </p>
                          <p className="mt-0.5 max-w-[220px] truncate text-xs text-[#64718a]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge isActive={user.isActive} />
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#64718a]">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ProgrammeSummary({
  programmes,
}: {
  programmes: AdminDashboardData["programmeOverview"];
}) {
  const maxStudents = Math.max(
    0,
    ...programmes.map((programme) => programme.studentCount),
  );

  const totalStudentsAcrossProgrammes = programmes.reduce(
    (total, programme) => total + programme.studentCount,
    0,
  );

  return (
    <section className="min-w-0 rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f6] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff6d8] text-[#8a6500]">
            <BookOpen size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold text-[#101d49]">
              Programme overview
            </h2>
            <p className="mt-0.5 text-xs text-[#64718a]">
              Student counts by programme
            </p>
          </div>
        </div>

        <span className="rounded-full bg-[#fff6d8] px-3 py-1 text-xs font-semibold text-[#765800]">
          {programmes.length}{" "}
          {programmes.length === 1 ? "programme" : "programmes"}
        </span>
      </div>

      {programmes.length === 0 ? (
        <EmptyState message="Programme summaries will appear here when programme data is available." />
      ) : (
        <div className="p-5 sm:p-6">
          <div className="mb-6 rounded-xl bg-[#f9fafd] p-4">
            <p className="text-sm text-[#64718a]">
              Combined programme student count
            </p>
            <p className="mt-1 text-2xl font-bold text-[#101d49]">
              {formatNumber(totalStudentsAcrossProgrammes)}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#64718a]">
              Sum of the student counts returned for the programmes below.
            </p>
          </div>

          <div className="space-y-6">
            {programmes.map((programme) => {
              const percentage =
                maxStudents > 0
                  ? (programme.studentCount / maxStudents) * 100
                  : 0;

              return (
                <div key={programme.id}>
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <p className="min-w-0 break-words text-sm font-semibold text-[#17233f]">
                      {programme.name}
                    </p>
                    <p className="shrink-0 text-sm font-bold tabular-nums text-[#101d49]">
                      {formatNumber(programme.studentCount)}
                    </p>
                  </div>

                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-[#edf0f6]"
                    role="progressbar"
                    aria-label={`${programme.name} student count relative to the programme with the highest count`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(percentage)}
                  >
                    <div
                      className="h-full rounded-full bg-[#f5c542] transition-[width] duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default function AdminDashboardView({
  data,
  isLoading,
  isError,
  error,
  isFetching,
  onRetry,
}: AdminDashboardViewProps) {
  if (isLoading && !data) {
    return <LoadingSkeleton />;
  }

  if (isError && !data) {
    return (
      <ErrorState
        message={error?.message ?? ""}
        isFetching={isFetching}
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return (
      <ErrorState
        message="The dashboard response did not contain any data."
        isFetching={isFetching}
        onRetry={onRetry}
      />
    );
  }

  const { overview, recentStudents, recentTutors, programmeOverview } = data;

  const metrics: MetricCardProps[] = [
    {
      title: "Total students",
      value: overview.totalStudents,
      description: "All registered students",
      icon: GraduationCap,
      tone: "navy",
    },
    {
      title: "Active students",
      value: overview.activeStudents,
      description: "Students currently marked active",
      icon: CheckCircle2,
      tone: "green",
    },
    {
      title: "Total tutors",
      value: overview.totalTutors,
      description: "All registered tutors",
      icon: Users,
      tone: "blue",
    },
    {
      title: "Active tutors",
      value: overview.activeTutors,
      description: "Tutors currently marked active",
      icon: CheckCircle2,
      tone: "green",
    },
    {
      title: "Total administrators",
      value: overview.totalAdmins,
      description: "Registered administrator accounts",
      icon: ShieldCheck,
      tone: "navy",
    },
    {
      title: "Active administrators",
      value: overview.activeAdmins,
      description: "Administrators currently marked active",
      icon: CheckCircle2,
      tone: "green",
    },
    {
      title: "Total programmes",
      value: overview.totalProgrammes,
      description: "Programmes registered on the platform",
      icon: BookOpen,
      tone: "yellow",
    },
  ];

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#fff6d8] px-3 py-1.5 text-xs font-semibold text-[#765800]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f5c542]" />
            Nugi Innovations
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">
            Dashboard overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64718a]">
            Monitor your academy&apos;s administrators, students, tutors,
            and programmes from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={onRetry}
          disabled={isFetching}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#e4e9f2] bg-white px-4 py-2 text-sm font-semibold text-[#101d49] transition hover:border-[#cbd4e5] hover:bg-[#f9fafd] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw
            size={15}
            className={isFetching ? "animate-spin" : ""}
            aria-hidden="true"
          />
          Refresh data
        </button>
      </header>

      {isError && data && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold">
              Could not refresh the latest data
            </p>
            <p className="mt-1 leading-5">
              The dashboard is showing the most recently available data.
              {error?.message ? ` ${error.message}` : ""}
            </p>
          </div>
        </div>
      )}

      <section aria-labelledby="metrics-heading">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2
              id="metrics-heading"
              className="text-base font-semibold text-[#101d49]"
            >
              Academy at a glance
            </h2>
            <p className="mt-1 text-sm text-[#64718a]">
              Key account and programme totals.
            </p>
          </div>

          {isFetching && (
            <span className="inline-flex items-center gap-1.5 text-xs text-[#64718a]">
              <RefreshCw size={13} className="animate-spin" />
              Updating
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentUsersTable
          title="Recent students"
          description="Latest student registrations"
          users={recentStudents}
          emptyMessage="New student registrations will appear here."
          icon={GraduationCap}
        />

        <RecentUsersTable
          title="Recent tutors"
          description="Latest tutor registrations"
          users={recentTutors}
          emptyMessage="New tutor registrations will appear here."
          icon={Users}
        />
      </section>

      <section>
        <ProgrammeSummary programmes={programmeOverview} />
      </section>

      <footer className="flex items-start gap-2 border-t border-[#e4e9f2] pt-4 text-xs leading-5 text-[#64718a]">
        <Clock3 size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>
          Dashboard figures reflect the data returned by the admin
          dashboard API. Active status is based on each account&apos;s
          reported status.
        </p>
      </footer>
    </div>
  );
}
