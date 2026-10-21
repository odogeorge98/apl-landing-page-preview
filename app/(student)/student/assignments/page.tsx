
"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Search,
  CalendarDays,
  Clock3,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  RotateCcw,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import MainLayout from "@/components/layout/dashboard/MainLayout";
import { useStudentAssignments } from "@/lib/hooks/assignments/use-student-assignments";
import type { StudentAssignment } from "@/lib/interfaces/assignments";
import { cn } from "@/lib/utils";

type StudentAssignmentStatus = "Pending" | "Submitted" | "Graded" | "Overdue" | "Upcoming";
type AssignmentFilter = "All" | StudentAssignmentStatus;

type AssignmentView = {
  id: string;
  title: string;
  course: string;
  description: string;
  dueDate: string;
  availableAt: string;
  points: number;
  status: StudentAssignmentStatus;
  score?: number;
  instructions: string[];
};

const filters: AssignmentFilter[] = ["All", "Upcoming", "Pending", "Submitted", "Graded", "Overdue"];
const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;
const cardClass = "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";
const primaryButtonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#192c65] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]";
const secondaryButtonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e4e9f2] bg-white px-4 py-2 text-sm font-semibold text-[#34415e] transition hover:border-[#cbd4e3] hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]";

const statusStyles: Record<StudentAssignmentStatus, string> = {
  Pending: "bg-[#fff7dc] text-[#765800] border-[#f5e6a9]",
  Upcoming: "bg-blue-50 text-blue-700 border-blue-100",
  Submitted: "bg-blue-50 text-blue-700 border-blue-100",
  Graded: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Overdue: "bg-red-50 text-red-700 border-red-100",
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }).format(date);
}

function getAssignmentStatus(assignment: StudentAssignment, now = Date.now()): StudentAssignmentStatus {
  if (assignment.submission?.status === "GRADED") return "Graded";
  if (assignment.submission?.status === "SUBMITTED") return "Submitted";
  const dueAt = Date.parse(assignment.dueAt);
  if (Number.isFinite(dueAt) && dueAt < now) return "Overdue";
  const availableAt = Date.parse(assignment.availableAt);
  if (Number.isFinite(availableAt) && availableAt > now) return "Upcoming";
  return "Pending";
}

function toAssignmentView(assignment: StudentAssignment): AssignmentView {
  const numericScore = assignment.submission?.score == null ? undefined : Number(assignment.submission.score);
  const instructions = assignment.instructions
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);

  return {
    id: assignment.id,
    title: assignment.title,
    course: assignment.programme?.name || "Programme details unavailable",
    description: assignment.instructions,
    dueDate: assignment.dueAt,
    availableAt: assignment.availableAt,
    points: Number(assignment.maxScore),
    status: getAssignmentStatus(assignment),
    ...(numericScore !== undefined && Number.isFinite(numericScore) ? { score: numericScore } : {}),
    instructions,
  };
}

function getDeadline(assignment: AssignmentView) {
  if (assignment.status === "Graded") return "Assignment graded";
  if (assignment.status === "Submitted") return "Submission received";
  if (assignment.status === "Overdue") return "Deadline passed";
  if (assignment.status === "Upcoming") return `Available ${formatDateTime(assignment.availableAt)}`;

  const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" });
  const todayKey = dateFormatter.format(new Date());
  const dueKey = dateFormatter.format(new Date(assignment.dueDate));
  const days = Math.round((Date.parse(`${dueKey}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / 86400000);

  if (days < 0) return "Deadline passed";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days} days remaining`;
}

export default function AssignmentsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<AssignmentFilter>("All");
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentView | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const currentCursor = cursorStack[cursorStack.length - 1] ?? null;

  useEffect(() => {
    const normalizedSearch = search.trim();
    if (normalizedSearch === debouncedSearch) return;
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(normalizedSearch);
      setCursorStack([null]);
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [search, debouncedSearch]);

  const assignmentsQuery = useStudentAssignments({
    search: debouncedSearch || undefined,
    limit: pageSize,
    cursor: currentCursor,
  });

  const assignments = useMemo(
    () => assignmentsQuery.data?.items.map(toAssignmentView) ?? [],
    [assignmentsQuery.data],
  );
  const nextCursor = assignmentsQuery.data?.nextCursor ?? null;
  const currentPage = cursorStack.length;
  const filteredAssignments = useMemo(
    () => activeFilter === "All"
      ? assignments
      : assignments.filter((assignment) => assignment.status === activeFilter),
    [assignments, activeFilter],
  );
  const resetPagination = useCallback(() => setCursorStack([null]), []);

  const handleNextPage = () => {
    if (!nextCursor || assignmentsQuery.isFetching) return;
    setCursorStack((previous) => [...previous, nextCursor]);
  };

  const handlePreviousPage = () => {
    if (cursorStack.length <= 1 || assignmentsQuery.isFetching) return;
    setCursorStack((previous) => previous.slice(0, -1));
  };

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    if (!Number.isInteger(value) || value < 1 || value > 50) return;
    setPageSize(value);
    resetPagination();
  };

  const counts: Record<"total" | "pending" | "submitted" | "graded" | "overdue", number> = {
    total: assignments.length,
    pending: assignments.filter((item) => item.status === "Pending" || item.status === "Upcoming").length,
    submitted: assignments.filter((item) => item.status === "Submitted").length,
    graded: assignments.filter((item) => item.status === "Graded").length,
    overdue: assignments.filter((item) => item.status === "Overdue").length,
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setActiveFilter("All");
    resetPagination();
  };

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1400px] space-y-7 pb-10 sm:space-y-9">
        <header>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
            <Sparkles size={15} className="text-[#c59400]" />
            Learn by doing
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">
            Assignments
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64718a] sm:text-base">
            Manage your coursework, keep track of deadlines, submit your work,
            and review your results.
          </p>
        </header>

        <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-8 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-10">
          <div aria-hidden="true" className="absolute -right-12 -top-20 size-64 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-2 -top-10 size-44 rounded-full border border-white/10" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
                <ClipboardList size={15} />
                Assignment centre
              </span>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Turn what you learn into real skills.
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
                Stay organised, complete your projects, and keep your learning
                journey moving forward.
              </p>
            </div>

            <div className="flex size-24 shrink-0 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/[0.06] sm:size-32 sm:self-auto">
              <FileText size={55} strokeWidth={1.3} className="text-[#f5c542]" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Assignments on this page", value: counts.total, icon: ClipboardList, color: "bg-[#eaf0ff] text-[#101d49]" },
            { label: "Pending work", value: counts.pending, icon: Clock3, color: "bg-[#fff7dc] text-[#765800]" },
            { label: "Submitted", value: counts.submitted, icon: Upload, color: "bg-blue-50 text-blue-700" },
            { label: "Graded", value: counts.graded, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-2xl border border-[#e4e9f2] bg-white p-5 shadow-[0_2px_10px_rgba(16,29,73,0.025)]">
                <div className="flex items-center justify-between">
                  <span className={`flex size-11 items-center justify-center rounded-xl ${item.color}`}>
                    <Icon size={22} />
                  </span>
                  <span className="text-xs font-medium text-[#8490a6]">Overview</span>
                </div>

                <p className="mt-5 text-3xl font-bold text-[#101d49]">{item.value}</p>
                <p className="mt-1 text-sm text-[#64718a]">{item.label}</p>
              </div>
            );
          })}
        </section>

        {counts.overdue > 0 && (
          <aside className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
            <AlertCircle size={21} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <h2 className="text-sm font-bold text-red-800">Check your deadlines</h2>
              <p className="mt-1 text-sm leading-6 text-red-700">
                You have {counts.overdue} overdue assignment
                {counts.overdue === 1 ? "" : "s"}. Review the instructions and
                contact your instructor if you need assistance.
              </p>
            </div>
          </aside>
        )}

        <section>
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#101d49]">Your assignments</h2>
              <p className="mt-1 text-sm text-[#64718a]">
                Find coursework and check submission deadlines.
              </p>
            </div>

            <label className="relative block w-full lg:max-w-sm">
              <span className="sr-only">Search assignments</span>
              <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8490a6]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value.slice(0, 100))}
                maxLength={100}
                placeholder="Search assignments or courses..."
                className="h-12 w-full rounded-xl border border-[#dce3ef] bg-white pl-10 pr-4 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5"
              />
            </label>
          </div>

          {(search.trim() !== debouncedSearch || assignmentsQuery.isFetching) && (
            <p className="mb-4 flex items-center gap-2 text-xs text-[#718099]" aria-live="polite">
              <RefreshCw size={13} className="animate-spin" aria-hidden="true" />
              {search.trim() !== debouncedSearch ? "Updating search…" : "Loading assignments…"}
            </p>
          )}

          <div className="mb-6 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                aria-pressed={activeFilter === filter}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  activeFilter === filter
                    ? "bg-[#101d49] text-white"
                    : "border border-[#dce3ef] bg-white text-[#64718a] hover:bg-[#f8f9fc]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {assignmentsQuery.isLoading ? (
            <div className="grid gap-4" role="status" aria-label="Loading assignments">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className={cn(cardClass, "animate-pulse p-5 sm:p-6")}>
                  <div className="h-4 w-28 rounded bg-[#edf0f6]" />
                  <div className="mt-4 h-6 w-2/3 rounded bg-[#edf0f6]" />
                  <div className="mt-3 h-4 w-full rounded bg-[#f2f4f8]" />
                  <div className="mt-6 h-20 rounded-xl bg-[#f2f4f8]" />
                </div>
              ))}
              <span className="sr-only">Loading your published assignments…</span>
            </div>
          ) : assignmentsQuery.isError && !assignmentsQuery.data ? (
            <div role="alert" className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-6 py-12 text-center">
              <AlertCircle size={28} className="text-red-600" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-[#101d49]">Could not load assignments</h3>
              <p className="mt-2 max-w-md text-sm text-[#64718a]">{assignmentsQuery.error instanceof Error ? assignmentsQuery.error.message : "Please try again in a moment."}</p>
              <button type="button" onClick={() => void assignmentsQuery.refetch()} disabled={assignmentsQuery.isFetching} className={cn(primaryButtonClass, "mt-5")}>
                <RefreshCw size={15} className={assignmentsQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" /> Try again
              </button>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-[#e4e9f2] bg-white px-6 py-12 text-center">
              <Search size={28} className="text-[#8490a6]" />
              <h3 className="mt-4 text-lg font-semibold text-[#101d49]">
                No assignments found
              </h3>
              <p className="mt-2 text-sm text-[#64718a]">
                Try another search term or select a different status.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#101d49] hover:bg-[#f4f6fa]"
              >
                <RotateCcw size={15} />
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <article key={assignment.id} className="rounded-2xl border border-[#e4e9f2] bg-white p-5 shadow-[0_2px_10px_rgba(16,29,73,0.025)] transition hover:shadow-[0_8px_24px_rgba(16,29,73,0.06)] sm:p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
                      <FileText size={23} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[assignment.status]}`}>
                          {assignment.status}
                        </span>
                        <span className="text-xs text-[#8490a6]">{assignment.id}</span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-[#101d49]">
                        {assignment.title}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-[#64718a]">
                        {assignment.course}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#64718a]">
                        {assignment.description}
                      </p>

                      <div className="mt-5 flex flex-col gap-4 rounded-xl bg-[#f8f9fc] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-2">
                          <CalendarDays size={17} className="mt-0.5 shrink-0 text-[#8490a6]" />
                          <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-6">
                            <div>
                              <p className="text-xs text-[#8490a6]">Available from</p>
                              <p className="mt-1 text-sm font-semibold text-[#101d49]">{formatDateTime(assignment.availableAt)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#8490a6]">Due date</p>
                              <p className="mt-1 text-sm font-semibold text-[#101d49]">{formatDateTime(assignment.dueDate)}</p>
                              <p className={`mt-1 text-xs font-semibold ${
                                assignment.status === "Overdue"
                                  ? "text-red-600"
                                  : assignment.status === "Graded"
                                    ? "text-emerald-700"
                                    : "text-[#64718a]"
                              }`}>
                                {getDeadline(assignment)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#64718a]">
                          <ClipboardList size={17} className="text-[#8490a6]" />
                          <span>Maximum score: <strong className="text-[#101d49]">{assignment.points}</strong></span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          {assignment.score !== undefined ? (
                            <p className="text-sm font-semibold text-emerald-700">
                              Score: {assignment.score}/{assignment.points}
                            </p>
                          ) : (
                            <p className="text-xs text-[#8490a6]">
                              {assignment.status === "Submitted"
                                ? "Awaiting review"
                                : assignment.status === "Overdue"
                                  ? "Submission deadline has passed"
                                  : "Remember to submit before the deadline"}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedAssignment(assignment)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#f5c542] px-4 py-2 text-sm font-semibold text-[#101d49] transition hover:bg-[#f8d35f]"
                        >
                          View assignment
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!assignmentsQuery.isLoading && !(assignmentsQuery.isError && !assignmentsQuery.data) && (
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[#e4e9f2] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-[#8995aa]" aria-live="polite">
                Showing <span className="font-semibold text-[#34415e]">{filteredAssignments.length}</span> {filteredAssignments.length === 1 ? "assignment" : "assignments"} on page <span className="font-semibold text-[#34415e]">{currentPage}</span>
                {debouncedSearch && <> matching <span className="font-semibold text-[#34415e]">“{debouncedSearch}”</span></>}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-[#718099]">
                  Rows
                  <select aria-label="Assignments per page" value={pageSize} onChange={handlePageSizeChange} className="rounded-lg border border-[#e4e9f2] bg-white px-2.5 py-2 text-xs font-semibold text-[#34415e] outline-none focus:border-[#101d49]/40">
                    {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
                  </select>
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={handlePreviousPage} disabled={currentPage <= 1 || assignmentsQuery.isFetching} className={secondaryButtonClass} aria-label="Previous page"><span aria-hidden="true">←</span><span className="hidden sm:inline">Previous</span></button>
                  <button type="button" onClick={handleNextPage} disabled={!nextCursor || assignmentsQuery.isFetching} className={primaryButtonClass} aria-label="Next page"><span className="hidden sm:inline">Next</span><span aria-hidden="true">→</span></button>
                </div>
              </div>
            </div>
          )}
        </section>

        <AnimatePresence>
          {selectedAssignment && (
            <motion.div
              key="student-assignment-details-overlay"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
              className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#071027]/60 p-4 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setSelectedAssignment(null);
              }}
            >
              <motion.section
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.985 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="assignment-dialog-title"
              className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8490a6]">
                    Assignment details
                  </p>
                  <h2 id="assignment-dialog-title" className="mt-2 text-xl font-bold text-[#101d49]">
                    {selectedAssignment.title}
                  </h2>
                  <p className="mt-1 text-sm text-[#64718a]">{selectedAssignment.course}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  aria-label="Close assignment details"
                  className="rounded-lg px-3 py-2 text-[#64718a] hover:bg-[#f3f5f9]"
                >
                  ✕
                </button>
              </div>

              <p className="mt-5 text-sm leading-6 text-[#64718a]">
                {selectedAssignment.description}
              </p>

              <div className="mt-5 rounded-xl border border-[#e4e9f2] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-[#101d49]">Instructions</h3>
                  <span className="text-xs text-[#8490a6]">
                    {selectedAssignment.points} points
                  </span>
                </div>

                <ul className="mt-3 space-y-3">
                  {selectedAssignment.instructions.map((instruction, index) => (
                    <li key={instruction} className="flex items-start gap-2.5 text-sm leading-6 text-[#64718a]">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-xs font-semibold text-[#101d49]">
                        {index + 1}
                      </span>
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-xl bg-[#f8f9fc] p-4">
                <p className="text-xs text-[#8490a6]">Submission deadline</p>
                <p className="mt-1 text-sm font-semibold text-[#101d49]">
                  {formatDateTime(selectedAssignment.dueDate)}
                </p>
                <p className="mt-1 text-xs text-[#64718a]">
                  {getDeadline(selectedAssignment)}
                </p>
              </div>

              {selectedAssignment.score !== undefined && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
                  <CheckCircle2 size={21} className="text-emerald-700" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Assignment graded</p>
                    <p className="mt-1 text-sm text-emerald-700">
                      Your score is {selectedAssignment.score}/{selectedAssignment.points}.
                    </p>
                  </div>
                </div>
              )}

              <p className="mt-4 text-xs leading-5 text-[#8490a6]">
              Assignment availability and deadlines are shown in West Africa Time. Submission and grading details appear here when available.
              </p>

              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                className="mt-5 min-h-11 w-full rounded-xl bg-[#101d49] px-4 py-3 text-sm font-semibold text-white hover:bg-[#172a60]"
              >
                Close details
              </button>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MainLayout>
  );
}
