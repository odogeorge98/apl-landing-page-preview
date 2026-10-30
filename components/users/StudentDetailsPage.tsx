"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  GraduationCap,
  ClipboardCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  UserRound,
  Mail,
  Phone,
} from "lucide-react";
import dayjs from "dayjs";

import { cn } from "@/lib/utils";
import { useStudentDetails } from "@/lib/hooks/users/students/use-students";

const cardClass =
  "rounded-2xl border border-[#e7ebf3] bg-white p-5 shadow-[0_4px_24px_rgba(16,29,73,0.035)]";

function formatDate(date?: string | null) {
  return date && dayjs(date).isValid()
    ? dayjs(date).format("DD MMM YYYY")
    : "—";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#718099]">{title}</p>
          <p className="mt-3 text-3xl font-bold text-[#101d49]">{value}</p>
          <p className="mt-1 text-xs text-[#8995aa]">{description}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-[#eef2ff] text-[#101d49]">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function StudentDetailsPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useStudentDetails(studentId);

  const student = response?.data;
  const profile = student?.profile;
  const overview = student?.overview;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#edf0f6]" />
        <div className="h-36 animate-pulse rounded-2xl bg-[#edf0f6]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-[#edf0f6]"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-[#edf0f6]" />
      </div>
    );
  }

  if (isError || !student || !profile || !overview) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/admin/students"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#52617b] hover:text-[#101d49]"
        >
          <ArrowLeft size={17} />
          Back to students
        </Link>

        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
          <AlertCircle className="mx-auto text-red-600" size={28} />
          <h2 className="mt-3 font-bold text-red-900">
            Could not load student details
          </h2>
          <p className="mt-2 text-sm text-red-700">
            {getErrorMessage(error)}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="mt-5 rounded-xl bg-[#101d49] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <header>
        <Link
          href="/admin/students"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#64718a] transition hover:text-[#101d49]"
        >
          <ArrowLeft size={17} />
          Back to students
        </Link>

        <div className="flex flex-col gap-4 rounded-2xl border border-[#e7ebf3] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-center gap-4">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="size-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#101d49]">
                <UserRound size={30} />
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-[#101d49]">
                {profile.name}
              </h1>
              <p className="mt-1 text-sm text-[#718099]">
                Student profile
              </p>
              <span
                className={cn(
                  "mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                  profile.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                {profile.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="text-sm text-[#718099]">
            <p>Joined {formatDate(profile.createdAt)}</p>
            <p className="mt-1">Student ID: {profile.id}</p>
          </div>
        </div>
      </header>

      {/* Contact information */}
      <section className={cardClass}>
        <h2 className="font-bold text-[#101d49]">Personal information</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-[#8995aa]">Email address</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#34415e]">
              <Mail size={15} />
              {profile.email || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8995aa]">Phone number</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#34415e]">
              <Phone size={15} />
              {profile.phone || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8995aa]">Gender</p>
            <p className="mt-2 text-sm font-medium capitalize text-[#34415e]">
              {profile.gender || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8995aa]">Guardian contact</p>
            <p className="mt-2 text-sm font-medium text-[#34415e]">
              {profile.guardianPhoneOrEmail || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8995aa]">Email verification</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#34415e]">
              {profile.emailVerifiedAt ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Verified
                </>
              ) : (
                "Not verified"
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-[#101d49]">
          Learning overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Programmes"
            value={overview.totalProgrammes}
            description="Enrolled programmes"
            icon={GraduationCap}
          />
          <StatCard
            title="Programme hours"
            value={overview.totalProgrammeHours}
            description="Total learning hours"
            icon={Clock3}
          />
          <StatCard
            title="Lessons completed"
            value={overview.learning.lessonsCompleted}
            description={`${overview.learning.publishedLessons} published lessons`}
            icon={BookOpen}
          />
          <StatCard
            title="Assignments submitted"
            value={overview.assignments.submitted}
            description={`${overview.assignments.pending} pending assignments`}
            icon={ClipboardCheck}
          />
        </div>
      </section>

      {/* Learning progress */}
      <section className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-[#101d49]">Learning progress</h2>
          <span className="text-lg font-bold text-[#101d49]">
            {overview.learning.progressPercentage}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#edf0f6]">
          <div
            className="h-full rounded-full bg-[#101d49] transition-all"
            style={{
              width: `${Math.min(
                100,
                Math.max(0, overview.learning.progressPercentage),
              )}%`,
            }}
          />
        </div>

        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
          <p className="text-[#718099]">
            Total submissions:{" "}
            <strong className="text-[#101d49]">
              {overview.submissions.total}
            </strong>
          </p>
          <p className="text-[#718099]">
            Pending review:{" "}
            <strong className="text-[#101d49]">
              {overview.submissions.pendingReview}
            </strong>
          </p>
          <p className="text-[#718099]">
            Feedback received:{" "}
            <strong className="text-[#101d49]">
              {overview.reports.feedbackReceived}
            </strong>
          </p>
        </div>
      </section>

      {/* Programmes */}
      <section className={cardClass}>
        <h2 className="font-bold text-[#101d49]">Enrolled programmes</h2>

        {student.programmes.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8995aa]">
            No programmes found.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-[#edf0f6]">
            {student.programmes.map((programme) => (
              <div
                key={programme.id}
                className="py-5 first:pt-2 last:pb-0"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-[#101d49]">
                      {programme.name}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#718099]">
                      {programme.description}
                    </p>
                    <p className="mt-2 text-xs text-[#8995aa]">
                      {programme.hours} hours · Enrolled{" "}
                      {formatDate(programme.enrolledAt)}
                    </p>
                  </div>

                  <span className="text-sm font-bold text-[#101d49]">
                    {programme.progressPercentage ?? 0}%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf0f6]">
                  <div
                    className="h-full rounded-full bg-[#101d49]"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, programme.progressPercentage ?? 0),
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-[#8995aa]">
                  {programme.lessonsCompleted} of{" "}
                  {programme.publishedLessons} lessons completed
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent submissions */}
      <section className={cardClass}>
        <h2 className="font-bold text-[#101d49]">Recent submissions</h2>

        {student.recentSubmissions.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8995aa]">
            No submissions found.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-[#fafbfd] text-xs uppercase text-[#8995aa]">
                <tr>
                  <th className="px-4 py-3">Assignment</th>
                  <th className="px-4 py-3">Programme</th>
                  <th className="px-4 py-3">Tutor</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f6]">
                {student.recentSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-4 py-4 font-medium text-[#34415e]">
                      {submission.assignment.title}
                    </td>
                    <td className="px-4 py-4 text-[#64718a]">
                      {submission.programme.name}
                    </td>
                    <td className="px-4 py-4 text-[#64718a]">
                      {submission.tutor.name}
                    </td>
                    <td className="px-4 py-4 text-[#64718a]">
                      {submission.score ?? "Not graded"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-xs font-semibold text-[#3730a3]">
                        {submission.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-[#64718a]">
                      {formatDate(submission.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent reports */}
      <section className={cardClass}>
        <h2 className="font-bold text-[#101d49]">Recent reports</h2>

        {student.recentReports.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8995aa]">
            No reports found.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {student.recentReports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-[#edf0f6] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-[#101d49]">
                    {report.programme.name}
                  </h3>
                  <span className="text-xs text-[#8995aa]">
                    {formatDate(report.reportDate)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-[#64718a]">
                  {report.blockerDescription || "No problem description provided."}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-[#eef2ff] px-3 py-1 font-semibold text-[#3730a3]">
                    {report.status}
                  </span>
                  <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                    Problem: {report.problemStatus}
                  </span>
                  <span className="rounded-full bg-[#f1f3f7] px-3 py-1 text-[#64718a]">
                    Tutor: {report.tutor.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}