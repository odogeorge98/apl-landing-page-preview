
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  Clock3,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ClipboardCheck,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import MainLayout from "@/components/layout/dashboard/MainLayout";

type Assessment = {
  id: string;
  title: string;
  course: string;
  description: string;
  dueDate: string;
  duration: string;
  questions: number;
  status: "Upcoming" | "In Progress" | "Completed" | "Overdue";
  score?: number;
};

const assessments: Assessment[] = [
  {
    id: "A001",
    title: "JavaScript Fundamentals",
    course: "Frontend Development",
    description: "Test your understanding of variables, functions, arrays, and basic JavaScript concepts.",
    dueDate: "2026-10-23",
    duration: "45 minutes",
    questions: 25,
    status: "Upcoming",
  },
  {
    id: "A002",
    title: "HTML and CSS Assessment",
    course: "Web Development",
    description: "Demonstrate your knowledge of HTML structure, CSS styling, and responsive layouts.",
    dueDate: "2026-10-21",
    duration: "30 minutes",
    questions: 20,
    status: "In Progress",
  },
  {
    id: "A003",
    title: "Introduction to UI/UX",
    course: "Product Design",
    description: "Review design principles, user research, wireframes, and usability.",
    dueDate: "2026-10-15",
    duration: "40 minutes",
    questions: 20,
    status: "Completed",
    score: 86,
  },
  {
    id: "A004",
    title: "Database Fundamentals",
    course: "Backend Development",
    description: "Assess your understanding of tables, relationships, SQL queries, and database design.",
    dueDate: "2026-10-17",
    duration: "35 minutes",
    questions: 20,
    status: "Overdue",
  },
  {
    id: "A005",
    title: "React Components and Hooks",
    course: "Frontend Development",
    description: "Answer questions about components, props, state, and commonly used React hooks.",
    dueDate: "2026-10-28",
    duration: "50 minutes",
    questions: 30,
    status: "Upcoming",
  },
];

const filters = ["All", "Upcoming", "In Progress", "Completed", "Overdue"];

const statusStyles: Record<Assessment["status"], string> = {
  Upcoming: "bg-blue-50 text-blue-700 border-blue-100",
  "In Progress": "bg-[#fff7dc] text-[#765800] border-[#f5e6a9]",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
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

function getDeadline(date: string, status: Assessment["status"]) {
  if (status === "Completed") return "Assessment completed";
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

export default function AssessmentsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        `${assessment.title} ${assessment.course} ${assessment.description}`
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        activeFilter === "All" || assessment.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const counts = {
    total: assessments.length,
    pending: assessments.filter(
      (item) => item.status === "Upcoming" || item.status === "In Progress",
    ).length,
    completed: assessments.filter((item) => item.status === "Completed").length,
    overdue: assessments.filter((item) => item.status === "Overdue").length,
  };

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1400px] space-y-7 pb-10 sm:space-y-9">
        <header>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
            <Sparkles size={15} className="text-[#c59400]" />
            Test your knowledge
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">
            Assessments
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64718a] sm:text-base">
            Track your tests, prepare for upcoming assessments, and review your
            completed results.
          </p>
        </header>

        <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-8 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-10">
          <div aria-hidden="true" className="absolute -right-12 -top-20 size-64 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-2 -top-10 size-44 rounded-full border border-white/10" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
                <ClipboardCheck size={15} />
                Assessment centre
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Every assessment is a step forward.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
                Keep an eye on deadlines, complete your tests, and build
                confidence in your skills.
              </p>
            </div>
            <div className="flex size-24 shrink-0 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/[0.06] sm:size-32 sm:self-auto">
              <GraduationCap size={58} strokeWidth={1.3} className="text-[#f5c542]" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total assessments", value: counts.total, icon: ClipboardCheck, color: "bg-[#eaf0ff] text-[#101d49]" },
            { label: "Pending", value: counts.pending, icon: Clock3, color: "bg-[#fff7dc] text-[#765800]" },
            { label: "Completed", value: counts.completed, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
            { label: "Overdue", value: counts.overdue, icon: AlertCircle, color: "bg-red-50 text-red-600" },
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

        <section>
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#101d49]">Your assessments</h2>
              <p className="mt-1 text-sm text-[#64718a]">
                Search and filter your available assessments.
              </p>
            </div>
            <label className="relative block w-full lg:max-w-sm">
              <span className="sr-only">Search assessments</span>
              <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8490a6]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search assessments or courses..."
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

          {filteredAssessments.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-[#e4e9f2] bg-white px-6 py-12 text-center">
              <Search size={28} className="text-[#8490a6]" />
              <h3 className="mt-4 text-lg font-semibold text-[#101d49]">No assessments found</h3>
              <p className="mt-2 text-sm text-[#64718a]">Try another search term or filter.</p>
              <button
                type="button"
                onClick={() => { setSearch(""); setActiveFilter("All"); }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#101d49] hover:bg-[#f4f6fa]"
              >
                <RotateCcw size={15} /> Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredAssessments.map((assessment) => (
                <article key={assessment.id} className="rounded-2xl border border-[#e4e9f2] bg-white p-5 shadow-[0_2px_10px_rgba(16,29,73,0.025)] transition hover:shadow-[0_8px_24px_rgba(16,29,73,0.06)] sm:p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
                      <ClipboardCheck size={23} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[assessment.status]}`}>
                          {assessment.status}
                        </span>
                        <span className="text-xs text-[#8490a6]">{assessment.id}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-[#101d49]">{assessment.title}</h3>
                      <p className="mt-1 text-sm font-medium text-[#64718a]">{assessment.course}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#64718a]">{assessment.description}</p>

                  <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#f8f9fc] p-4">
                    <div className="flex items-start gap-2">
                      <CalendarDays size={17} className="mt-0.5 shrink-0 text-[#8490a6]" />
                      <div>
                        <p className="text-xs text-[#8490a6]">Due date</p>
                        <p className="mt-1 text-sm font-semibold text-[#101d49]">{formatDate(assessment.dueDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock3 size={17} className="mt-0.5 shrink-0 text-[#8490a6]" />
                      <div>
                        <p className="text-xs text-[#8490a6]">Duration</p>
                        <p className="mt-1 text-sm font-semibold text-[#101d49]">{assessment.duration}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className={`text-xs font-semibold ${assessment.status === "Overdue" ? "text-red-600" : assessment.status === "Completed" ? "text-emerald-700" : "text-[#64718a]"}`}>
                        {getDeadline(assessment.dueDate, assessment.status)}
                      </p>
                      {assessment.score !== undefined && (
                        <p className="mt-1 text-sm font-semibold text-emerald-700">Score: {assessment.score}%</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAssessment(assessment)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#f5c542] px-4 py-2 text-sm font-semibold text-[#101d49] transition hover:bg-[#f8d35f]"
                    >
                      {assessment.status === "Completed" ? "View result" : "View details"}
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedAssessment && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#071027]/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedAssessment(null);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="assessment-dialog-title" className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8490a6]">Assessment details</p>
                <h2 id="assessment-dialog-title" className="mt-2 text-xl font-bold text-[#101d49]">{selectedAssessment.title}</h2>
              </div>
              <button type="button" onClick={() => setSelectedAssessment(null)} aria-label="Close details" className="rounded-lg px-3 py-2 text-[#64718a] hover:bg-[#f3f5f9]">✕</button>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#64718a]">{selectedAssessment.description}</p>
            <div className="mt-5 space-y-3 rounded-xl bg-[#f8f9fc] p-4 text-sm">
              <p><span className="text-[#8490a6]">Course:</span> <strong className="text-[#101d49]">{selectedAssessment.course}</strong></p>
              <p><span className="text-[#8490a6]">Questions:</span> <strong className="text-[#101d49]">{selectedAssessment.questions}</strong></p>
              <p><span className="text-[#8490a6]">Duration:</span> <strong className="text-[#101d49]">{selectedAssessment.duration}</strong></p>
              <p><span className="text-[#8490a6]">Due date:</span> <strong className="text-[#101d49]">{formatDate(selectedAssessment.dueDate)}</strong></p>
              <p><span className="text-[#8490a6]">Status:</span> <strong className="text-[#101d49]">{selectedAssessment.status}</strong></p>
              {selectedAssessment.score !== undefined && (
                <p><span className="text-[#8490a6]">Final score:</span> <strong className="text-emerald-700">{selectedAssessment.score}%</strong></p>
              )}
            </div>
            <p className="mt-4 text-xs leading-5 text-[#8490a6]">
              This is a sample assessment catalogue. Starting a real test will be connected when your assessment API is available.
            </p>
            <button type="button" onClick={() => setSelectedAssessment(null)} className="mt-5 min-h-11 w-full rounded-xl bg-[#101d49] px-4 py-3 text-sm font-semibold text-white hover:bg-[#172a60]">
              Close details
            </button>
          </section>
        </div>
      )}
    </MainLayout>
  );
}
