
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import MainLayout from "@/components/layout/dashboard/MainLayout";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";
import { http } from "@/lib/utils/http";

type SubmissionStatus =
  | "SUBMITTED"
  | "REVIEWED"
  | "LATE"
  | "PENDING"
  | string;

interface SubmissionStudent {
  id: string;
  name: string;
}

interface SubmissionAssignment {
  id: string;
  title: string;
  availableAt?: string | null;
  dueAt?: string | null;
  maxScore?: number | null;
  status?: string;
  lessonId?: string | null;
}

interface SubmissionProgramme {
  id: string;
  name: string;
}

interface Submission {
  id: string;
  assignmentId: string;
  tutorId?: string;
  programmeId?: string;
  studentId: string;
  attemptNumber?: number;
  status: SubmissionStatus;
  answerText?: string | null;
  fileUrl?: string | null;
  submittedAt?: string | null;
  score?: number | null;
  feedback?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  student?: SubmissionStudent;
  assignment?: SubmissionAssignment;
  programme?: SubmissionProgramme;
  tutor?: {
    id: string;
    name: string;
  };
}

interface SubmissionsData {
  items: Submission[];
  nextCursor: string | null;
}

interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
}

const PAGE_SIZE = 20;

const ASSIGNMENT_STATUS_OPTIONS = [
  { value: "", label: "All assignment statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "CLOSED", label: "Closed" },
] as const;

const EMPTY_PROGRAMMES = [
  { value: "", label: "All programmes" },
];

const EMPTY_LESSONS = [
  { value: "", label: "All lessons" },
];

const inputClassName =
  "w-full rounded-xl border border-[#e4e9f2] bg-white px-4 py-3 text-sm text-[#101d49] outline-none transition placeholder:text-gray-400 focus:border-[#f5c542] focus:ring-2 focus:ring-[#f5c542]/20";

const hiddenScrollbar =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStudentInitials(name?: string) {
  if (!name?.trim()) return "ST";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getSubmissionStatus(status?: string) {
  switch (status?.toUpperCase()) {
    case "REVIEWED":
      return {
        label: "Reviewed",
        className: "bg-green-50 text-green-700",
      };

    case "LATE":
      return {
        label: "Late submission",
        className: "bg-red-50 text-red-700",
      };

    case "PENDING":
      return {
        label: "Pending",
        className: "bg-amber-50 text-amber-700",
      };

    case "SUBMITTED":
      return {
        label: "Submitted",
        className: "bg-blue-50 text-blue-700",
      };

    default:
      return {
        label: status
          ? status.replace(/_/g, " ").toLowerCase()
          : "Submitted",
        className: "bg-blue-50 text-blue-700",
      };
  }
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof FileText;
}) {
  return (
    <div className="rounded-2xl border border-[#e4e9f2] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-[#101d49]">
            {value}
          </h3>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>

        <div className="rounded-xl bg-[#fff8df] p-3">
          <Icon className="h-5 w-5 text-[#101d49]" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 rounded-2xl bg-[#f3f5fa] p-4">
        <FileText className="h-8 w-8 text-[#101d49]" />
      </div>

      <h3 className="text-lg font-semibold text-[#101d49]">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

export default function TutorSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [lessonId, setLessonId] = useState("");

  const [cursor, setCursor] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let active = true;

    async function fetchSubmissions() {
      setLoading(true);
      setError("");

      try {
        const params: Record<string, string | number> = {
          limit: PAGE_SIZE,
        };

        if (debouncedSearch) params.search = debouncedSearch;
        if (assignmentStatus) params.status = assignmentStatus;
        if (programmeId) params.programmeId = programmeId;
        if (lessonId) params.lessonId = lessonId;
        if (cursor) params.cursor = cursor;

        const response = await http.get<ApiResponse<SubmissionsData>>(
          "/assignments/tutor/submissions",
          { params }
        );

        if (!active) return;

        const result = response.data?.data;

        setSubmissions(
          Array.isArray(result?.items) ? result.items : []
        );
        setNextCursor(result?.nextCursor ?? null);
      } catch {
        if (!active) return;

        setSubmissions([]);
        setNextCursor(null);
        setError(
          "We couldn't load the assignment submissions. Please try again."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchSubmissions();

    return () => {
      active = false;
    };
  }, [
    debouncedSearch,
    assignmentStatus,
    programmeId,
    lessonId,
    cursor,
  ]);

  const programmeOptions = useMemo(() => {
    const programmes = new Map<string, string>();

    submissions.forEach((submission) => {
      if (submission.programme?.id && submission.programme.name) {
        programmes.set(
          submission.programme.id,
          submission.programme.name
        );
      }
    });

    return [
      ...EMPTY_PROGRAMMES,
      ...Array.from(programmes, ([value, label]) => ({
        value,
        label,
      })),
    ];
  }, [submissions]);

  const lessonOptions = useMemo(() => {
    const lessons = new Map<string, string>();

    submissions.forEach((submission) => {
      const id = submission.assignment?.lessonId;

      if (id) {
        lessons.set(id, `Lesson ${id.slice(0, 8)}`);
      }
    });

    return [
      ...EMPTY_LESSONS,
      ...Array.from(lessons, ([value, label]) => ({
        value,
        label,
      })),
    ];
  }, [submissions]);

  const reviewedCount = submissions.filter(
    (submission) =>
      submission.status?.toUpperCase() === "REVIEWED" ||
      submission.reviewedAt != null
  ).length;

  const pendingCount = submissions.filter(
    (submission) =>
      submission.status?.toUpperCase() !== "REVIEWED" &&
      submission.reviewedAt == null
  ).length;

  const lateCount = submissions.filter(
    (submission) =>
      submission.status?.toUpperCase() === "LATE"
  ).length;

  function resetPagination() {
    setCursor("");
    setCursorHistory([]);
  }

  function resetFilters() {
    setSearch("");
    setDebouncedSearch("");
    setAssignmentStatus("");
    setProgrammeId("");
    setLessonId("");
    resetPagination();
  }

  function goToNextPage() {
    if (!nextCursor) return;

    setCursorHistory((history) => [...history, cursor]);
    setCursor(nextCursor);
  }

  function goToPreviousPage() {
    if (cursorHistory.length === 0) return;

    const previousCursor = cursorHistory[cursorHistory.length - 1];

    setCursorHistory((history) => history.slice(0, -1));
    setCursor(previousCursor);
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f7f8fc] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page heading */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                <span>Tutor</span>
                <span>/</span>
                <span className="text-[#101d49]">Submissions</span>
              </div>

              <h1 className="text-2xl font-bold text-[#101d49] sm:text-3xl">
                Assignment Submissions
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                View your students&apos; submitted assignments and their
                submission details.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetPagination();
                setDebouncedSearch(search.trim());
              }}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#e4e9f2] bg-white px-4 py-3 text-sm font-medium text-[#101d49] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-center"
            >
              <RotateCcw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Submissions"
              value={submissions.length}
              description="On this page"
              icon={FileText}
            />

            <SummaryCard
              title="Awaiting review"
              value={pendingCount}
              description="Not yet reviewed"
              icon={Clock3}
            />

            <SummaryCard
              title="Reviewed"
              value={reviewedCount}
              description="Reviewed submissions"
              icon={CheckCircle2}
            />

            <SummaryCard
              title="Late submissions"
              value={lateCount}
              description="Marked as late"
              icon={CalendarDays}
            />
          </div>

          {/* Search and filters */}
          <section className="rounded-2xl border border-[#e4e9f2] bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-[#fff8df] p-2">
                <Search className="h-4 w-4 text-[#101d49]" />
              </div>

              <div>
                <h2 className="font-semibold text-[#101d49]">
                  Find submissions
                </h2>
                <p className="text-xs text-gray-500">
                  Search and filter the submitted assignments.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    resetPagination();
                  }}
                  placeholder="Search assignments..."
                  aria-label="Search submissions"
                  className={`${inputClassName} pl-10`}
                />
              </div>

              <AnimatedSelect
                value={assignmentStatus}
                options={ASSIGNMENT_STATUS_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onChange={(value) => {
                  setAssignmentStatus(value);
                  resetPagination();
                }}
                ariaLabel="Filter by assignment status"
                className="w-full"
              />

              <AnimatedSelect
                value={programmeId}
                options={programmeOptions}
                onChange={(value) => {
                  setProgrammeId(value);
                  resetPagination();
                }}
                ariaLabel="Filter by programme"
                className="w-full"
              />

              <AnimatedSelect
                value={lessonId}
                options={lessonOptions}
                onChange={(value) => {
                  setLessonId(value);
                  resetPagination();
                }}
                ariaLabel="Filter by lesson"
                className="w-full"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                {loading
                  ? "Loading submissions..."
                  : `${submissions.length} submission${submissions.length === 1 ? "" : "s"} on this page`}
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#101d49] transition hover:text-[#b08b00]"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            </div>
          </section>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />

              <p className="flex-1">{error}</p>

              <button
                type="button"
                onClick={() => {
                  resetPagination();
                  setDebouncedSearch(search.trim());
                }}
                className="font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Desktop table */}
          <section className="hidden overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white lg:block">
            <div className="flex items-center justify-between border-b border-[#e4e9f2] px-5 py-4">
              <div>
                <h2 className="font-semibold text-[#101d49]">
                  Student submissions
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Select a submission to view its details.
                </p>
              </div>

              <div className="rounded-lg bg-[#f3f5fa] p-2">
                <GraduationCap className="h-5 w-5 text-[#101d49]" />
              </div>
            </div>

            {loading ? (
              <div className="space-y-4 p-6">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-14 animate-pulse rounded-lg bg-gray-100"
                  />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <EmptyState
                title={error ? "Unable to load submissions" : "No submissions found"}
                description={
                  error
                    ? "Please try loading the submissions again."
                    : "There are no submissions matching your current search or filters."
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-[#f8f9fc]">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-4">Student</th>
                      <th className="px-5 py-4">Assignment</th>
                      <th className="px-5 py-4">Programme</th>
                      <th className="px-5 py-4">Submitted</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Score</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e4e9f2]">
                    {submissions.map((submission) => {
                      const status = getSubmissionStatus(submission.status);

                      return (
                        <tr
                          key={submission.id}
                          className="transition hover:bg-[#fcfcfe]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1c2] text-sm font-bold text-[#101d49]">
                                {getStudentInitials(submission.student?.name)}
                              </div>

                              <div>
                                <p className="font-medium text-[#101d49]">
                                  {submission.student?.name || "Unknown student"}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  Attempt {submission.attemptNumber ?? 1}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-[220px] truncate text-sm font-medium text-[#101d49]">
                              {submission.assignment?.title || "Untitled assignment"}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Due {formatDate(submission.assignment?.dueAt)}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {submission.programme?.name || "—"}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {formatDate(submission.submittedAt)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-[#101d49]">
                            {submission.score == null
                              ? "Not graded"
                              : `${submission.score}${submission.assignment?.maxScore != null ? ` / ${submission.assignment.maxScore}` : ""}`}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedSubmission(submission)}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#101d49] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1b2c65]"
                            >
                              <FileText className="h-4 w-4" />
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Mobile and tablet cards */}
          <section className="space-y-4 lg:hidden">
            <div>
              <h2 className="font-semibold text-[#101d49]">
                Student submissions
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Select a submission to view its details.
              </p>
            </div>

            {loading ? (
              [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-48 animate-pulse rounded-2xl bg-gray-100"
                />
              ))
            ) : submissions.length === 0 ? (
              <div className="rounded-2xl border border-[#e4e9f2] bg-white">
                <EmptyState
                  title={error ? "Unable to load submissions" : "No submissions found"}
                  description={
                    error
                      ? "Please try loading the submissions again."
                      : "Try changing your search or filters."
                  }
                />
              </div>
            ) : (
              submissions.map((submission) => {
                const status = getSubmissionStatus(submission.status);

                return (
                  <article
                    key={submission.id}
                    className="rounded-2xl border border-[#e4e9f2] bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1c2] text-sm font-bold text-[#101d49]">
                        {getStudentInitials(submission.student?.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-[#101d49]">
                          {submission.student?.name || "Unknown student"}
                        </h3>

                        <p className="mt-1 truncate text-sm text-gray-500">
                          {submission.assignment?.title || "Untitled assignment"}
                        </p>

                        <span
                          className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="my-4 grid grid-cols-2 gap-4 border-y border-[#e4e9f2] py-4">
                      <div>
                        <p className="text-xs text-gray-500">Programme</p>
                        <p className="mt-1 text-sm font-medium text-[#101d49]">
                          {submission.programme?.name || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Submitted</p>
                        <p className="mt-1 text-sm font-medium text-[#101d49]">
                          {formatDate(submission.submittedAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Score</p>
                        <p className="mt-1 text-sm font-medium text-[#101d49]">
                          {submission.score == null
                            ? "Not graded"
                            : `${submission.score}${submission.assignment?.maxScore != null ? ` / ${submission.assignment.maxScore}` : ""}`}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Due date</p>
                        <p className="mt-1 text-sm font-medium text-[#101d49]">
                          {formatDate(submission.assignment?.dueAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(submission)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#101d49] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1b2c65]"
                    >
                      <FileText className="h-4 w-4" />
                      Review submission
                    </button>
                  </article>
                );
              })
            )}
          </section>

          {/* Cursor pagination */}
          <div className="flex flex-col gap-3 rounded-2xl border border-[#e4e9f2] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              {cursorHistory.length > 0
                ? `Page ${cursorHistory.length + 1}`
                : "Page 1"}
              <span className="mx-2">·</span>
              Showing up to {PAGE_SIZE} submissions per page
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={loading || cursorHistory.length === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-[#e4e9f2] px-4 py-2.5 text-sm font-medium text-[#101d49] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={loading || !nextCursor}
                className="inline-flex items-center gap-2 rounded-xl bg-[#101d49] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2c65] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101d49]/50 p-3 backdrop-blur-[2px] sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedSubmission(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="submission-review-title"
            className={`relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${hiddenScrollbar}`}
          >
            {/* Modal header */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e4e9f2] px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-[#fff1c2] p-3">
                  <FileText className="h-5 w-5 text-[#101d49]" />
                </div>

                <div>
                  <h2
                    id="submission-review-title"
                    className="text-lg font-bold text-[#101d49] sm:text-xl"
                  >
                    Review submission
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    View the student&apos;s answer and submission details.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                aria-label="Close review"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#101d49]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable review content: scrollbar hidden */}
            <div
              className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 ${hiddenScrollbar}`}
            >
              <div className="space-y-6">
                {/* Student and assignment information */}
                <div className="rounded-xl border border-[#e4e9f2] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff1c2] font-bold text-[#101d49]">
                      {getStudentInitials(selectedSubmission.student?.name)}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#101d49]">
                        {selectedSubmission.student?.name || "Unknown student"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Student submission
                      </p>
                    </div>

                    <span
                      className={`ml-auto shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                        getSubmissionStatus(selectedSubmission.status).className
                      }`}
                    >
                      {getSubmissionStatus(selectedSubmission.status).label}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-[#e4e9f2] pt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Assignment
                    </p>

                    <h3 className="mt-2 font-semibold text-[#101d49]">
                      {selectedSubmission.assignment?.title ||
                        "Untitled assignment"}
                    </h3>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Programme</p>
                          <p className="mt-1 text-sm font-medium text-[#101d49]">
                            {selectedSubmission.programme?.name || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Submitted on</p>
                          <p className="mt-1 text-sm font-medium text-[#101d49]">
                            {formatDateTime(selectedSubmission.submittedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Due date</p>
                          <p className="mt-1 text-sm font-medium text-[#101d49]">
                            {formatDateTime(
                              selectedSubmission.assignment?.dueAt
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Attempt</p>
                          <p className="mt-1 text-sm font-medium text-[#101d49]">
                            {selectedSubmission.attemptNumber ?? 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student answer */}
                <div>
                  <h3 className="mb-3 font-semibold text-[#101d49]">
                    Student&apos;s answer
                  </h3>

                  <div
                    className={`max-h-96 overflow-y-auto overscroll-contain rounded-xl border border-[#e4e9f2] bg-[#fafbfe] p-4 text-sm leading-7 text-gray-700 ${hiddenScrollbar}`}
                  >
                    {selectedSubmission.answerText?.trim() ? (
                      <p className="whitespace-pre-wrap break-words">
                        {selectedSubmission.answerText}
                      </p>
                    ) : (
                      <p className="italic text-gray-400">
                        No written answer was provided.
                      </p>
                    )}
                  </div>
                </div>

                {/* Attached file */}
                <div>
                  <h3 className="mb-3 font-semibold text-[#101d49]">
                    Attachment
                  </h3>

                  {selectedSubmission.fileUrl ? (
                    <a
                      href={selectedSubmission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#e4e9f2] p-4 transition hover:border-[#f5c542] hover:bg-[#fffdf5]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-[#fff1c2] p-2">
                          <FileText className="h-5 w-5 text-[#101d49]" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#101d49]">
                            View submitted file
                          </p>
                          <p className="mt-1 truncate text-xs text-gray-500">
                            Open the student&apos;s attachment in a new tab
                          </p>
                        </div>
                      </div>

                      <ExternalLink className="h-4 w-4 shrink-0 text-gray-500" />
                    </a>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#e4e9f2] p-4 text-sm text-gray-500">
                      No file attachment was submitted.
                    </div>
                  )}
                </div>

                {/* Score and feedback */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#e4e9f2] p-4">
                    <p className="text-sm text-gray-500">Score</p>

                    <p className="mt-2 text-2xl font-bold text-[#101d49]">
                      {selectedSubmission.score == null
                        ? "Not graded"
                        : `${selectedSubmission.score}${
                            selectedSubmission.assignment?.maxScore != null
                              ? ` / ${selectedSubmission.assignment.maxScore}`
                              : ""
                          }`}
                    </p>

                    {selectedSubmission.assignment?.maxScore != null && (
                      <p className="mt-1 text-xs text-gray-500">
                        Maximum score:{" "}
                        {selectedSubmission.assignment.maxScore}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-[#e4e9f2] p-4">
                    <p className="text-sm text-gray-500">Review date</p>

                    <p className="mt-2 text-sm font-semibold text-[#101d49]">
                      {formatDateTime(selectedSubmission.reviewedAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-[#101d49]">
                    Tutor feedback
                  </h3>

                  <div className="rounded-xl border border-[#e4e9f2] bg-[#fafbfe] p-4 text-sm leading-6 text-gray-700">
                    {selectedSubmission.feedback?.trim() ||
                      "No feedback has been added to this submission yet."}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                  <p className="text-sm leading-6 text-amber-800">
                    This view is read-only. Grading and feedback updates
                    require the appropriate backend endpoint.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex shrink-0 justify-end border-t border-[#e4e9f2] bg-white px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="rounded-xl bg-[#101d49] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1b2c65]"
              >
                Close review
              </button>
            </div>
          </section>
        </div>
      )}
    </MainLayout>
  );
}
