
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  BookOpen,
  UserRound,
  Eye,
  X,
  Download,
  MessageSquare,
  GraduationCap,
  Filter,
  ClipboardCheck,
} from "lucide-react";
import MainLayout from "@/components/layout/dashboard/MainLayout";

type ReviewStatus = "Pending Review" | "Reviewed";

interface Submission {
  id: number;
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  course: string;
  submittedAt: string;
  dueDate: string;
  fileName: string;
  fileType: string;
  reviewStatus: ReviewStatus;
  isLate: boolean;
  grade: number | null;
  feedback: string;
  description: string;
}

const initialSubmissions: Submission[] = [
  {
    id: 1,
    studentName: "Test Student",
    studentEmail: "danielokpa11@gmail.com",
    assignmentTitle: "Network Security Fundamentals",
    course: "Cybersecurity",
    submittedAt: "2026-10-21T08:30:00",
    dueDate: "2026-10-22T23:59:00",
    fileName: "network-security-assignment.pdf",
    fileType: "PDF document",
    reviewStatus: "Pending Review",
    isLate: false,
    grade: null,
    feedback: "",
    description:
      "Explain common network security threats and discuss practical methods for preventing unauthorized access.",
  },
  {
    id: 2,
    studentName: "Sarah Johnson",
    studentEmail: "sarah.johnson@example.com",
    assignmentTitle: "Build a Responsive Landing Page",
    course: "Web Development",
    submittedAt: "2026-10-20T14:15:00",
    dueDate: "2026-10-19T23:59:00",
    fileName: "responsive-landing-page.zip",
    fileType: "ZIP archive",
    reviewStatus: "Pending Review",
    isLate: true,
    grade: null,
    feedback: "",
    description:
      "Create a responsive landing page using HTML, CSS, and JavaScript. Include a navigation bar and a mobile-friendly layout.",
  },
  {
    id: 3,
    studentName: "Michael Okoro",
    studentEmail: "michael.okoro@example.com",
    assignmentTitle: "Introduction to Figma",
    course: "UI/UX Design",
    submittedAt: "2026-10-19T10:45:00",
    dueDate: "2026-10-21T23:59:00",
    fileName: "figma-design-project.pdf",
    fileType: "PDF document",
    reviewStatus: "Reviewed",
    isLate: false,
    grade: 85,
    feedback: "Good work. Your layout is clear and consistent. Improve the spacing between some components.",
    description:
      "Design a simple mobile app interface in Figma and explain your layout and typography choices.",
  },
  {
    id: 4,
    studentName: "Grace Williams",
    studentEmail: "grace.williams@example.com",
    assignmentTitle: "Data Cleaning Exercise",
    course: "Data Analysis",
    submittedAt: "2026-10-18T16:20:00",
    dueDate: "2026-10-18T12:00:00",
    fileName: "data-cleaning-exercise.xlsx",
    fileType: "Excel spreadsheet",
    reviewStatus: "Pending Review",
    isLate: true,
    grade: null,
    feedback: "",
    description:
      "Clean the supplied dataset, identify missing values, and document the steps used to prepare it for analysis.",
  },
  {
    id: 5,
    studentName: "David James",
    studentEmail: "david.james@example.com",
    assignmentTitle: "Basic Network Configuration",
    course: "Cybersecurity",
    submittedAt: "2026-10-17T11:10:00",
    dueDate: "2026-10-20T23:59:00",
    fileName: "network-configuration.pdf",
    fileType: "PDF document",
    reviewStatus: "Reviewed",
    isLate: false,
    grade: 92,
    feedback: "Excellent submission. Your explanations are clear and your configuration steps are well documented.",
    description:
      "Document the steps for configuring a basic network and explain the purpose of each configuration.",
  },
];

const courseOptions = [
  "Cybersecurity",
  "Web Development",
  "UI/UX Design",
  "Data Analysis",
];

type FilterStatus =
  | "All submissions"
  | "Pending Review"
  | "Reviewed"
  | "Late Submission";

export default function TutorAssignmentsPage() {
  const [submissions, setSubmissions] =
    useState<Submission[]>(initialSubmissions);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All courses");
  const [statusFilter, setStatusFilter] =
    useState<FilterStatus>("All submissions");

  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [reviewError, setReviewError] = useState("");

  const pendingCount = submissions.filter(
    (item) => item.reviewStatus === "Pending Review"
  ).length;

  const reviewedCount = submissions.filter(
    (item) => item.reviewStatus === "Reviewed"
  ).length;

  const lateCount = submissions.filter((item) => item.isLate).length;

  const filteredSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return submissions.filter((item) => {
      const matchesSearch =
        item.studentName.toLowerCase().includes(query) ||
        item.studentEmail.toLowerCase().includes(query) ||
        item.assignmentTitle.toLowerCase().includes(query) ||
        item.course.toLowerCase().includes(query);

      const matchesCourse =
        courseFilter === "All courses" || item.course === courseFilter;

      const matchesStatus =
        statusFilter === "All submissions" ||
        (statusFilter === "Pending Review" &&
          item.reviewStatus === "Pending Review") ||
        (statusFilter === "Reviewed" && item.reviewStatus === "Reviewed") ||
        (statusFilter === "Late Submission" && item.isLate);

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [submissions, search, courseFilter, statusFilter]);

  function openSubmission(submission: Submission) {
    setSelectedSubmission(submission);
    setGrade(
      submission.grade === null ? "" : String(submission.grade)
    );
    setFeedback(submission.feedback);
    setReviewError("");
  }

  function closeSubmission() {
    setSelectedSubmission(null);
    setGrade("");
    setFeedback("");
    setReviewError("");
  }

  function saveReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSubmission) return;

    const numericGrade = Number(grade);

    if (grade.trim() === "" || !Number.isFinite(numericGrade) ||
        numericGrade < 0 || numericGrade > 100) {
      setReviewError("Enter a grade between 0 and 100.");
      return;
    }

    setSubmissions((previous) =>
      previous.map((item) =>
        item.id === selectedSubmission.id
          ? {
              ...item,
              grade: numericGrade,
              feedback: feedback.trim(),
              reviewStatus: "Reviewed",
            }
          : item
      )
    );

    closeSubmission();
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(date: string) {
    return new Date(date).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F7F8FC] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page heading */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="font-medium text-[#101D49]">Assignments</span>
            </div>

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-[#101D49] sm:text-3xl">
                  Student Assignments
                </h1>
                <p className="mt-2 text-sm text-gray-500 sm:text-base">
                  Review student submissions, provide feedback, and award grades.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#E4E9F2] bg-white px-4 py-3 text-sm text-gray-600">
                <ClipboardCheck size={19} className="text-[#101D49]" />
                <span>Submission overview</span>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={<FileText size={21} />}
              label="Total submissions"
              value={submissions.length}
              description="Received from students"
              iconClass="bg-blue-50 text-[#101D49]"
            />

            <SummaryCard
              icon={<Clock size={21} />}
              label="Pending review"
              value={pendingCount}
              description="Awaiting your feedback"
              iconClass="bg-amber-50 text-amber-600"
            />

            <SummaryCard
              icon={<CheckCircle2 size={21} />}
              label="Reviewed"
              value={reviewedCount}
              description="Graded submissions"
              iconClass="bg-green-50 text-green-600"
            />

            <SummaryCard
              icon={<AlertCircle size={21} />}
              label="Late submissions"
              value={lateCount}
              description="Submitted after deadline"
              iconClass="bg-red-50 text-red-600"
            />
          </div>

          {/* Reminder banner */}
          {pendingCount > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border border-[#F4DDA0] bg-[#FFFBEB] p-5 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDEFC0] text-[#956900]">
                <Clock size={22} />
              </div>

              <div className="flex-1">
                <h2 className="font-semibold text-[#755400]">
                  You have {pendingCount} submission
                  {pendingCount === 1 ? "" : "s"} to review
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#8A6A20]">
                  Open a submission to review the student's work, enter a grade,
                  and provide feedback.
                </p>
              </div>

              <button
                onClick={() => setStatusFilter("Pending Review")}
                className="shrink-0 rounded-lg bg-[#101D49] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1b2c67]"
              >
                Review submissions
              </button>
            </div>
          )}

          {/* Submission list */}
          <section className="overflow-hidden rounded-2xl border border-[#E4E9F2] bg-white">
            <div className="border-b border-[#E4E9F2] p-5">
              <h2 className="text-lg font-bold text-[#101D49]">
                All student submissions
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View submitted files and review each student's work.
              </p>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col gap-3 border-b border-[#E4E9F2] p-5 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search student or assignment..."
                  className="w-full rounded-xl border border-[#E4E9F2] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#101D49] focus:ring-2 focus:ring-[#101D49]/10"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <BookOpen
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={courseFilter}
                    onChange={(event) => setCourseFilter(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#E4E9F2] bg-white py-3 pl-9 pr-8 text-sm text-gray-700 outline-none focus:border-[#101D49] sm:w-48"
                  >
                    <option>All courses</option>
                    {courseOptions.map((course) => (
                      <option key={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Filter
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as FilterStatus)
                    }
                    className="w-full appearance-none rounded-xl border border-[#E4E9F2] bg-white py-3 pl-9 pr-8 text-sm text-gray-700 outline-none focus:border-[#101D49] sm:w-48"
                  >
                    <option>All submissions</option>
                    <option>Pending Review</option>
                    <option>Reviewed</option>
                    <option>Late Submission</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="border-b border-[#E4E9F2] bg-gray-50/70 px-5 py-3 text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-[#101D49]">
                {filteredSubmissions.length}
              </span>{" "}
              of {submissions.length} submissions
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-white">
                  <tr className="border-b border-[#E4E9F2] text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-4 font-semibold">Student</th>
                    <th className="px-5 py-4 font-semibold">Assignment</th>
                    <th className="px-5 py-4 font-semibold">Submitted</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Grade</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E4E9F2]">
                  {filteredSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <StudentAvatar name={submission.studentName} />
                          <div>
                            <p className="font-semibold text-[#101D49]">
                              {submission.studentName}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {submission.studentEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="max-w-64 px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {submission.assignmentTitle}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {submission.course}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700">
                          {formatDate(submission.submittedAt)}
                        </p>
                        {submission.isLate && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600">
                            <AlertCircle size={12} />
                            Late
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={submission.reviewStatus} />
                      </td>

                      <td className="px-5 py-4">
                        {submission.grade === null ? (
                          <span className="text-sm text-gray-400">Not graded</span>
                        ) : (
                          <span className="font-semibold text-[#101D49]">
                            {submission.grade}/100
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openSubmission(submission)}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#E4E9F2] px-3 py-2 text-sm font-semibold text-[#101D49] transition hover:border-[#101D49] hover:bg-[#F0F3FC]"
                        >
                          <Eye size={16} />
                          {submission.reviewStatus === "Reviewed"
                            ? "View"
                            : "Review"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-[#E4E9F2] md:hidden">
              {filteredSubmissions.map((submission) => (
                <div key={submission.id} className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <StudentAvatar name={submission.studentName} />

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[#101D49]">
                        {submission.studentName}
                      </h3>
                      <p className="mt-1 break-all text-xs text-gray-500">
                        {submission.studentEmail}
                      </p>
                    </div>

                    <StatusBadge status={submission.reviewStatus} />
                  </div>

                  <div>
                    <p className="font-medium text-gray-800">
                      {submission.assignmentTitle}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {submission.course}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {formatDate(submission.submittedAt)}
                    </span>

                    {submission.isLate && (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <AlertCircle size={14} />
                        Late submission
                      </span>
                    )}

                    <span>
                      Grade:{" "}
                      {submission.grade === null
                        ? "Not graded"
                        : `${submission.grade}/100`}
                    </span>
                  </div>

                  <button
                    onClick={() => openSubmission(submission)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E4E9F2] px-4 py-3 text-sm font-semibold text-[#101D49] hover:bg-[#F0F3FC]"
                  >
                    <Eye size={16} />
                    {submission.reviewStatus === "Reviewed"
                      ? "View submission"
                      : "Review submission"}
                  </button>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {filteredSubmissions.length === 0 && (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <FileText size={26} />
                </div>

                <h3 className="mt-4 font-semibold text-[#101D49]">
                  No submissions found
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Try another search term or adjust your filters to see student
                  submissions.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setCourseFilter("All courses");
                    setStatusFilter("All submissions");
                  }}
                  className="mt-4 text-sm font-semibold text-[#101D49] underline underline-offset-4"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>

          <p className="text-center text-xs text-gray-400">
            Sample submission data · Reviews and grades are stored in page state only
          </p>
        </div>

        {/* Submission review modal */}
        {selectedSubmission && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101D49]/40 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeSubmission();
            }}
          >
            <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-[#E4E9F2] px-5 py-5 sm:px-7">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#F0F3FC] px-3 py-1 text-xs font-semibold text-[#101D49]">
                      {selectedSubmission.course}
                    </span>
                    {selectedSubmission.isLate && (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                        Late submission
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-[#101D49]">
                    Submission details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Review the student's work and provide feedback.
                  </p>
                </div>

                <button
                  onClick={closeSubmission}
                  aria-label="Close submission details"
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={saveReview} className="space-y-6 p-5 sm:p-7">
                {/* Student details */}
                <div className="flex items-center gap-3">
                  <StudentAvatar name={selectedSubmission.studentName} />

                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#101D49]">
                      {selectedSubmission.studentName}
                    </h3>
                    <p className="mt-1 break-all text-sm text-gray-500">
                      {selectedSubmission.studentEmail}
                    </p>
                  </div>
                </div>

                {/* Assignment information */}
                <div className="rounded-xl border border-[#E4E9F2] p-4">
                  <h3 className="font-semibold leading-6 text-[#101D49]">
                    {selectedSubmission.assignmentTitle}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {selectedSubmission.description}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500">Submission date</p>
                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {formatDateTime(selectedSubmission.submittedAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Due date</p>
                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {formatDateTime(selectedSubmission.dueDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submitted file preview */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-[#101D49]">
                    Submitted file
                  </h3>

                  <div className="flex items-center gap-3 rounded-xl border border-[#E4E9F2] bg-gray-50 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#101D49] shadow-sm">
                      <FileText size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-all text-sm font-semibold text-gray-800">
                        {selectedSubmission.fileName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {selectedSubmission.fileType}
                      </p>
                    </div>

                    <Download size={19} className="shrink-0 text-gray-400" />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    Sample file information only. Actual file preview and download
                    will require the backend submission file URL.
                  </p>
                </div>

                {/* Grade */}
                <div>
                  <label
                    htmlFor="submission-grade"
                    className="mb-2 block text-sm font-semibold text-[#101D49]"
                  >
                    Grade (out of 100)
                  </label>

                  <input
                    id="submission-grade"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={grade}
                    onChange={(event) => {
                      setGrade(event.target.value);
                      setReviewError("");
                    }}
                    placeholder="Enter grade, e.g. 85"
                    required
                    className="w-full rounded-xl border border-[#E4E9F2] px-4 py-3 text-sm outline-none transition focus:border-[#101D49] focus:ring-2 focus:ring-[#101D49]/10"
                  />
                </div>

                {/* Feedback */}
                <div>
                  <label
                    htmlFor="submission-feedback"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#101D49]"
                  >
                    <MessageSquare size={16} />
                    Feedback for student
                  </label>

                  <textarea
                    id="submission-feedback"
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Write feedback, corrections, or suggestions..."
                    className="w-full resize-y rounded-xl border border-[#E4E9F2] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#101D49] focus:ring-2 focus:ring-[#101D49]/10"
                  />

                  <p className="mt-1 text-right text-xs text-gray-400">
                    {feedback.length}/1000 characters
                  </p>
                </div>

                {reviewError && (
                  <p role="alert" className="text-sm font-medium text-red-600">
                    {reviewError}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-[#E4E9F2] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeSubmission}
                    className="rounded-xl border border-[#E4E9F2] px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101D49] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1b2c67]"
                  >
                    <CheckCircle2 size={17} />
                    Save review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E4E9F2] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-[#101D49]">{value}</p>
          <p className="mt-2 text-xs text-gray-400">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function StudentAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0F3FC] text-sm font-bold text-[#101D49]">
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const isReviewed = status === "Reviewed";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        isReviewed
          ? "bg-green-50 text-green-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {isReviewed ? <CheckCircle2 size={13} /> : <Clock size={13} />}
      {status}
    </span>
  );
}
