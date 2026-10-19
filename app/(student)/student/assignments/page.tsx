
"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";
import MainLayout from "@/components/layout/dashboard/MainLayout";

type Assignment = {
  id: string;
  title: string;
  course: string;
  description: string;
  dueDate: string;
  points: number;
  status: "Pending" | "Submitted" | "Graded" | "Overdue";
  score?: number;
  instructions: string[];
};

const assignments: Assignment[] = [
  {
    id: "AS001",
    title: "Build a Responsive Landing Page",
    course: "Frontend Development",
    description: "Create a responsive landing page using HTML, CSS, and modern layout techniques.",
    dueDate: "2026-10-24",
    points: 100,
    status: "Pending",
    instructions: [
      "Create a page that works on mobile and desktop.",
      "Use semantic HTML and reusable CSS classes.",
      "Submit your source code and screenshots.",
    ],
  },
  {
    id: "AS002",
    title: "JavaScript To-Do Application",
    course: "JavaScript Fundamentals",
    description: "Build a simple task management app that allows users to add, complete, and remove tasks.",
    dueDate: "2026-10-22",
    points: 100,
    status: "Pending",
    instructions: [
      "Allow users to add new tasks.",
      "Allow users to mark tasks as completed.",
      "Provide a way to remove tasks.",
      "Submit your project files or repository link.",
    ],
  },
  {
    id: "AS003",
    title: "UI/UX Wireframe Project",
    course: "Product Design",
    description: "Design a wireframe for a student learning dashboard and explain your layout decisions.",
    dueDate: "2026-10-14",
    points: 100,
    status: "Submitted",
    instructions: [
      "Create a dashboard wireframe.",
      "Include navigation and a main content area.",
      "Explain the user journey in a short note.",
    ],
  },
  {
    id: "AS004",
    title: "SQL Database Exercises",
    course: "Backend Development",
    description: "Write SQL queries to retrieve, filter, and organise data from a sample database.",
    dueDate: "2026-10-16",
    points: 100,
    status: "Graded",
    score: 92,
    instructions: [
      "Write SELECT queries using WHERE and ORDER BY.",
      "Demonstrate basic JOIN operations.",
      "Submit your SQL file.",
    ],
  },
  {
    id: "AS005",
    title: "React Components Mini Project",
    course: "React Development",
    description: "Create a small React application using reusable components, props, and state.",
    dueDate: "2026-10-17",
    points: 100,
    status: "Overdue",
    instructions: [
      "Create at least three reusable components.",
      "Pass data using props.",
      "Use state for an interactive feature.",
      "Submit your project source code.",
    ],
  },
];

const filters = ["All", "Pending", "Submitted", "Graded", "Overdue"];

const statusStyles: Record<Assignment["status"], string> = {
  Pending: "bg-[#fff7dc] text-[#765800] border-[#f5e6a9]",
  Submitted: "bg-blue-50 text-blue-700 border-blue-100",
  Graded: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Overdue: "bg-red-50 text-red-700 border-red-100",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(value + "T12:00:00"));
}

function getDeadline(date: string, status: Assignment["status"]) {
  if (status === "Graded") return "Assignment graded";
  if (status === "Submitted") return "Submission received";
  if (status === "Overdue") return "Deadline passed";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date + "T00:00:00");
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (days < 0) return "Deadline passed";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days} days remaining`;
}

export default function AssignmentsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        `${assignment.title} ${assignment.course} ${assignment.description}`
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        activeFilter === "All" || assignment.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const counts = {
    total: assignments.length,
    pending: assignments.filter((item) => item.status === "Pending").length,
    submitted: assignments.filter((item) => item.status === "Submitted").length,
    graded: assignments.filter((item) => item.status === "Graded").length,
    overdue: assignments.filter((item) => item.status === "Overdue").length,
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
            { label: "Total assignments", value: counts.total, icon: ClipboardList, color: "bg-[#eaf0ff] text-[#101d49]" },
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search assignments or courses..."
                className="h-12 w-full rounded-xl border border-[#dce3ef] bg-white pl-10 pr-4 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5"
              />
            </label>
          </div>

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

          {filteredAssignments.length === 0 ? (
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
                onClick={() => {
                  setSearch("");
                  setActiveFilter("All");
                }}
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

                      <div className="mt-5 flex flex-col gap-3 rounded-xl bg-[#f8f9fc] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-2">
                          <CalendarDays size={17} className="mt-0.5 shrink-0 text-[#8490a6]" />
                          <div>
                            <p className="text-xs text-[#8490a6]">Due date</p>
                            <p className="mt-1 text-sm font-semibold text-[#101d49]">
                              {formatDate(assignment.dueDate)}
                            </p>
                            <p className={`mt-1 text-xs font-semibold ${
                              assignment.status === "Overdue"
                                ? "text-red-600"
                                : assignment.status === "Graded"
                                  ? "text-emerald-700"
                                  : "text-[#64718a]"
                            }`}>
                              {getDeadline(assignment.dueDate, assignment.status)}
                            </p>
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
        </section>

        {selectedAssignment && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#071027]/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedAssignment(null);
            }}
          >
            <section
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
                  {formatDate(selectedAssignment.dueDate)}
                </p>
                <p className="mt-1 text-xs text-[#64718a]">
                  {getDeadline(selectedAssignment.dueDate, selectedAssignment.status)}
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
                This is sample data. Actual file uploads and submissions will
                require integration with your backend.
              </p>

              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                className="mt-5 min-h-11 w-full rounded-xl bg-[#101d49] px-4 py-3 text-sm font-semibold text-white hover:bg-[#172a60]"
              >
                Close details
              </button>
            </section>
          </div>
        )}
      </main>
    </MainLayout>
  );
}
