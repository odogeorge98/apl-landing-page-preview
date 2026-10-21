
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

import { MainLayout } from "@/components/layout/dashboard";
import { useTutorDetails } from "@/lib/hooks/users/tutors/use-tutors";
import { cn } from "@/lib/utils";

const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_4px_24px_rgba(16,29,73,0.035)]";

function formatDate(value?: string | null) {
  if (!value || !dayjs(value).isValid()) return "—";
  return dayjs(value).format("DD MMM YYYY");
}

function getInitials(name?: string) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "T"
  );
}

function formatStatus(value?: string | null) {
  if (!value) return "Unknown";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getRecordTitle(
  record: { title?: string; name?: string; description?: string },
  fallback: string,
) {
  return record.title || record.name || record.description || fallback;
}

function getRecordDate(record: {
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}) {
  return record.dueDate || record.createdAt || record.updatedAt;
}

function LoadingState() {
  return (
    <div className="mx-auto max-w-[1500px] animate-pulse space-y-6">
      <div className="h-4 w-32 rounded bg-[#e9edf5]" />
      <div className="h-36 rounded-2xl bg-[#e9edf5]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 rounded-2xl bg-[#e9edf5]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-64 rounded-2xl bg-[#e9edf5]" />
        <div className="h-64 rounded-2xl bg-[#e9edf5]" />
      </div>
    </div>
  );
}

function EmptySection({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#e4e9f2] bg-[#fafbfd] px-4 py-8 text-center">
      <p className="text-sm text-[#718099]">{message}</p>
    </div>
  );
}

function TutorDetailsContent() {
  const params = useParams<{ id: string }>();
  const tutorId = params.id;

  const {
    data: tutor,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTutorDetails(tutorId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !tutor) {
    return (
      <div className="mx-auto max-w-[1500px] space-y-6">
        <Link
          href="/dashboard/users/tutors"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#52617b] hover:text-[#101d49]"
        >
          <ArrowLeft size={16} />
          Back to tutors
        </Link>

        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <CircleAlert size={23} />
          </div>

          <h1 className="mt-4 text-lg font-bold text-[#101d49]">
            Unable to load tutor details
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#718099]">
            {error instanceof Error
              ? error.message
              : "The tutor details could not be retrieved. Please try again."}
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#101d49] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#192c65] disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={cn(isFetching && "animate-spin")}
            />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { profile, overview, courses, students } = tutor;

  const stats = [
    {
      label: "Assigned courses",
      value: overview.totalCourses,
      icon: BookOpen,
      iconClass: "bg-[#eef2ff] text-[#3730a3]",
    },
    {
      label: "Students",
      value: overview.totalStudents,
      icon: Users,
      iconClass: "bg-[#e5f7f0] text-[#087b55]",
    },
    {
      label: "Assignments",
      value: overview.totalAssignments,
      icon: FileText,
      iconClass: "bg-[#fff4d6] text-[#8a6500]",
    },
    {
      label: "Upcoming sessions",
      value: overview.upcomingSessions,
      icon: CalendarDays,
      iconClass: "bg-[#f3e8ff] text-[#7e22ce]",
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      {/* Breadcrumb and actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/users/tutors"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#52617b] transition hover:text-[#101d49]"
        >
          <ArrowLeft size={16} />
          Back to tutors
        </Link>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#e4e9f2] bg-white px-4 py-2.5 text-sm font-semibold text-[#34415e] transition hover:bg-[#f6f8fc] disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={cn(isFetching && "animate-spin")}
          />
          Refresh details
        </button>
      </div>

      {/* Tutor profile */}
      <section className={cn(cardClass, "overflow-hidden")}>
        <div className="h-2 bg-[#f5c542]" />

        <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-lg font-bold text-[#101d49] sm:size-20 sm:text-xl">
              {getInitials(profile.name)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#fff5d1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#785b00]">
                  Tutor profile
                </span>

                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                    profile.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-[#f1f3f7] text-[#718099]",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      profile.isActive
                        ? "bg-emerald-500"
                        : "bg-[#9aa5b8]",
                    )}
                  />
                  {profile.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">
                {profile.name}
              </h1>

              <div className="mt-2 flex flex-col gap-2 text-sm text-[#718099] sm:flex-row sm:flex-wrap sm:gap-x-5">
                <span className="flex min-w-0 items-center gap-2">
                  <Mail size={15} className="shrink-0" />
                  <span className="break-all">{profile.email}</span>
                </span>

                <span className="flex items-center gap-2">
                  <Phone size={15} className="shrink-0" />
                  {profile.phone || "Phone not provided"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-xl bg-[#f8f9fc] p-4 text-sm sm:grid-cols-2 lg:min-w-[270px] lg:grid-cols-1">
            <div className="flex items-center gap-2 text-[#52617b]">
              <ShieldCheck size={16} className="text-[#101d49]" />
              <span>Role:</span>
              <span className="font-semibold text-[#101d49]">
                {formatStatus(profile.role)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[#52617b]">
              <CalendarDays size={16} className="text-[#101d49]" />
              <span>Joined:</span>
              <span className="font-semibold text-[#101d49]">
                {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#101d49]">
            Tutor overview
          </h2>
          <p className="mt-1 text-sm text-[#718099]">
            A summary of this tutor&apos;s learning activities.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className={cn(cardClass, "p-5")}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#718099]">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl",
                      stat.iconClass,
                    )}
                  >
                    <Icon size={21} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Submissions",
              value: overview.totalSubmissions,
            },
            {
              label: "Pending reviews",
              value: overview.pendingReviews,
            },
            {
              label: "Completed sessions",
              value: overview.completedSessions,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#e4e9f2] bg-[#fafbfd] px-4 py-3"
            >
              <p className="text-xs font-medium text-[#718099]">
                {item.label}
              </p>
              <p className="mt-1 text-xl font-bold text-[#101d49]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses and students */}
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <section className={cn(cardClass, "p-5 sm:p-6")}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#101d49]">
                Assigned courses
              </h2>
              <p className="mt-1 text-xs text-[#8995aa]">
                Programmes assigned to this tutor.
              </p>
            </div>

            <div className="flex size-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#101d49]">
              <BookOpen size={19} />
            </div>
          </div>

          {courses.length === 0 ? (
            <EmptySection message="No courses are currently assigned to this tutor." />
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <article
                  key={course.id}
                  className="rounded-xl border border-[#e8ecf4] p-4 transition hover:border-[#d5dceb]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#101d49]">
                        {course.programme.name}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#718099]">
                        {course.programme.description || "No description provided."}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "w-fit shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        course.status.toUpperCase() === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-[#f1f3f7] text-[#718099]",
                      )}
                    >
                      {formatStatus(course.status)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#edf0f6] pt-3 text-xs text-[#718099]">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={14} />
                      {course.programme.hours} learning hours
                    </span>
                    <span>
                      Added {formatDate(course.createdAt)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={cn(cardClass, "p-5 sm:p-6")}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#101d49]">
                Students
              </h2>
              <p className="mt-1 text-xs text-[#8995aa]">
                Students associated with this tutor.
              </p>
            </div>

            <div className="flex size-10 items-center justify-center rounded-xl bg-[#e5f7f0] text-[#087b55]">
              <Users size={19} />
            </div>
          </div>

          {students.length === 0 ? (
            <EmptySection message="No students are currently associated with this tutor." />
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <article
                  key={student.id}
                  className="flex items-start gap-3 rounded-xl border border-[#e8ecf4] p-4"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e5f7f0] text-sm font-bold text-[#087b55]">
                    {getInitials(student.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words font-semibold text-[#101d49]">
                        {student.name}
                      </h3>

                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          student.user.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-[#f1f3f7] text-[#718099]",
                        )}
                      >
                        {student.user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-1 break-all text-xs text-[#718099]">
                      {student.user.email}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8995aa]">
                      <span>
                        Phone: {student.user.phoneNo || "Not provided"}
                      </span>
                      <span>
                        Joined: {formatDate(student.createdAt)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Assignments, submissions and sessions */}
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <section className={cn(cardClass, "p-5")}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#fff4d6] text-[#8a6500]">
              <FileText size={19} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#101d49]">
                Recent assignments
              </h2>
              <p className="mt-1 text-xs text-[#8995aa]">
                Latest tutor assignments.
              </p>
            </div>
          </div>

          {tutor.recentAssignments.length === 0 ? (
            <EmptySection message="No recent assignments found." />
          ) : (
            <div className="space-y-3">
              {tutor.recentAssignments.map((record, index) => (
                <div
                  key={record.id ?? `assignment-${index}`}
                  className="rounded-xl border border-[#e8ecf4] p-3.5"
                >
                  <p className="text-sm font-semibold text-[#101d49]">
                    {getRecordTitle(record, `Assignment ${index + 1}`)}
                  </p>
                  <p className="mt-1 text-xs text-[#8995aa]">
                    {formatDate(getRecordDate(record))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={cn(cardClass, "p-5")}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#f3e8ff] text-[#7e22ce]">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#101d49]">
                Pending submissions
              </h2>
              <p className="mt-1 text-xs text-[#8995aa]">
                Work awaiting review.
              </p>
            </div>
          </div>

          {tutor.pendingSubmissions.length === 0 ? (
            <EmptySection message="There are no pending submissions." />
          ) : (
            <div className="space-y-3">
              {tutor.pendingSubmissions.map((record, index) => (
                <div
                  key={record.id ?? `submission-${index}`}
                  className="rounded-xl border border-[#e8ecf4] p-3.5"
                >
                  <p className="text-sm font-semibold text-[#101d49]">
                    {getRecordTitle(record, `Submission ${index + 1}`)}
                  </p>
                  <p className="mt-1 text-xs text-[#8995aa]">
                    {formatDate(getRecordDate(record))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={cn(cardClass, "p-5")}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#e6f4ff] text-[#075985]">
              <CalendarDays size={19} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#101d49]">
                Upcoming sessions
              </h2>
              <p className="mt-1 text-xs text-[#8995aa]">
                Scheduled learning sessions.
              </p>
            </div>
          </div>

          {tutor.upcomingSessions.length === 0 ? (
            <EmptySection message="No upcoming sessions scheduled." />
          ) : (
            <div className="space-y-3">
              {tutor.upcomingSessions.map((record, index) => (
                <div
                  key={record.id ?? `session-${index}`}
                  className="rounded-xl border border-[#e8ecf4] p-3.5"
                >
                  <p className="text-sm font-semibold text-[#101d49]">
                    {getRecordTitle(record, `Session ${index + 1}`)}
                  </p>
                  <p className="mt-1 text-xs text-[#8995aa]">
                    {formatDate(getRecordDate(record))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <p className="text-center text-xs text-[#8995aa]">
        Tutor ID: {profile.id}
        {" · "}
        Last profile update: {formatDate(profile.updatedAt)}
      </p>
    </div>
  );
}

export default function TutorDetailsPage() {
  return (
    <MainLayout>
      <TutorDetailsContent />
    </MainLayout>
  );
}
