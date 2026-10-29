"use client";

/**
 * ADMIN · Assignments
 * Route: /dashboard/assignments  (already linked from the admin sidebar in
 * lib/config/dashboard/ui-config.ts → "Learning › Assignments")
 *
 * The admin counterpart of the student page at
 * app/(student)/student/assignments. Where students only *view and submit*,
 * administrators can:
 *   • create, edit, duplicate and delete assignments
 *   • move assignments through Draft → Published → Closed → Archived
 *   • run bulk actions on several assignments at once
 *   • review every learner submission and grade / return it
 *
 * UX notes: dialogs open after a short, deliberate delay (the triggering
 * button shows a spinner — see `useDelayedAction`), every dropdown uses the
 * custom animated <Select />, and rows/cards share one hover language
 * (gold accent bar, soft tint, border + shadow lift).
 *
 * FRONT-END ONLY: data comes from `lib/mock/admin-assignments.ts` and all
 * changes live in React state (they reset on refresh). Each handler below is
 * marked with `TODO(api)` where a real mutation should be called.
 */

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  ArrowRight,
  Copy,
  Eye,
  FileText,
  Inbox,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";

import { MainLayout } from "@/components/layout/dashboard";
import { toast } from "@/components/ui/Toaster";
import { AdminAccessGuard } from "@/components/admin/shared/AdminAccessGuard";
import { ActionMenu } from "@/components/admin/shared/ActionMenu";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { RowAccent } from "@/components/admin/shared/RowAccent";
import { Select } from "@/components/admin/shared/Select";
import { useDelayedAction, useLastDefined } from "@/components/admin/shared/motion";
import {
  cardClass,
  cardHoverClass,
  formatDate,
  formatDateTime,
  getInitials,
  iconNudgeOnHover,
  iconSpinOnHover,
  inputClass,
  primaryButtonClass,
  rowHoverClass,
  secondaryButtonClass,
  thClass,
} from "@/components/admin/shared/admin-ui";
import {
  AssignmentFormModal,
  type AssignmentFormValues,
} from "@/components/admin/assignments/AssignmentFormModal";
import { AssignmentDetailDrawer } from "@/components/admin/assignments/AssignmentDetailDrawer";
import {
  GradeSubmissionModal,
  type GradeResult,
} from "@/components/admin/assignments/GradeSubmissionModal";
import {
  AssignmentStatusBadge,
  LateBadge,
  SubmissionStatusBadge,
} from "@/components/admin/assignments/StatusBadges";
import {
  ASSIGNMENT_STATUSES,
  COURSE_OPTIONS,
  mockAdminAssignments,
  mockSubmissions,
  type AdminAssignment,
  type AdminAssignmentStatus,
  type AssignmentSubmission,
  type SubmissionStatus,
} from "@/lib/mock/admin-assignments";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

type Tab = "assignments" | "submissions";

/** Actions that require a confirmation dialog (single or bulk). */
type PendingAction = {
  kind: "delete" | "close" | "archive";
  ids: string[];
} | null;

/**
 * Human-friendly deadline text for the table, e.g. "In 7 days",
 * "Due today", "2 days overdue". Only meaningful while an assignment is
 * Published; other states show their own label.
 */
function describeDeadline(assignment: AdminAssignment): { text: string; tone: "muted" | "warn" | "danger" } {
  if (assignment.status === "Draft") return { text: "Not published", tone: "muted" };
  if (assignment.status === "Closed") return { text: "Submissions closed", tone: "muted" };
  if (assignment.status === "Archived") return { text: "Archived", tone: "muted" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${assignment.dueDate}T00:00:00`);
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (days < 0) return { text: `${Math.abs(days)} day${days === -1 ? "" : "s"} overdue`, tone: "danger" };
  if (days === 0) return { text: "Due today", tone: "warn" };
  if (days <= 3) return { text: `In ${days} day${days === 1 ? "" : "s"}`, tone: "warn" };
  return { text: `In ${days} days`, tone: "muted" };
}

/** Next sequential ID, e.g. AS007 → AS008. Server will own IDs later. */
function nextAssignmentId(existing: AdminAssignment[]): string {
  const max = existing.reduce((highest, item) => Math.max(highest, Number(item.id.replace(/\D/g, "")) || 0), 0);
  return `AS${String(max + 1).padStart(3, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AdminAssignmentsPage() {
  return (
    <MainLayout>
      {/* Only users with the `manageAllCourses` permission (admins) get in. */}
      <AdminAccessGuard permission="manageAllCourses" areaLabel="Assignment management">
        <AssignmentsWorkspace />
      </AdminAccessGuard>
    </MainLayout>
  );
}

function AssignmentsWorkspace() {
  // ---- Data (local state stands in for server state) ----------------------
  // TODO(api): replace with `useAdminAssignments()` / `useAdminSubmissions()`.
  const [assignments, setAssignments] = useState<AdminAssignment[]>(mockAdminAssignments);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(mockSubmissions);

  // ---- View state --------------------------------------------------------
  const [tab, setTab] = useState<Tab>("assignments");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("All courses");
  const [statusFilter, setStatusFilter] = useState<"All" | AdminAssignmentStatus>("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Submissions tab has its own independent filters.
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<"All" | SubmissionStatus>("Awaiting review");

  // ---- Dialog state ------------------------------------------------------
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAssignment | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [grading, setGrading] = useState<AssignmentSubmission | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  // Last confirmation shown, so its text stays put while the dialog fades out.
  const shownAction = useLastDefined(pendingAction);

  // Adds the short "opening…" pause before dialogs appear.
  const opener = useDelayedAction();
  const openCreate = () =>
    opener.run("create", () => {
      setEditing(null);
      setFormOpen(true);
    });
  const openEdit = (assignment: AdminAssignment) =>
    opener.run(`row-${assignment.id}`, () => {
      setEditing(assignment);
      setFormOpen(true);
    });
  const openDetail = (id: string) => opener.run(`row-${id}`, () => setDetailId(id));
  const openGrade = (submission: AssignmentSubmission) =>
    opener.run(`grade-${submission.id}`, () => setGrading(submission));

  const assignmentById = useMemo(
    () => new Map(assignments.map((item) => [item.id, item])),
    [assignments],
  );

  /* ---------------------------- Derived data ----------------------------- */

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assignments
      .filter((item) => {
        const matchesQuery =
          !query ||
          `${item.id} ${item.title} ${item.course} ${item.cohort ?? ""} ${item.tutor}`.toLowerCase().includes(query);
        const matchesCourse = courseFilter === "All courses" || item.course === courseFilter;
        const matchesStatus = statusFilter === "All" || item.status === statusFilter;
        return matchesQuery && matchesCourse && matchesStatus;
      })
      // Soonest deadline first — the order admins usually triage in.
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [assignments, search, courseFilter, statusFilter]);

  const filteredSubmissions = useMemo(() => {
    const query = submissionSearch.trim().toLowerCase();
    return submissions
      .filter((item) => {
        const parent = assignmentById.get(item.assignmentId);
        const matchesQuery =
          !query ||
          `${item.studentName} ${item.studentEmail} ${parent?.title ?? ""} ${parent?.course ?? ""}`
            .toLowerCase()
            .includes(query);
        const matchesStatus = submissionStatus === "All" || item.status === submissionStatus;
        return matchesQuery && matchesStatus;
      })
      // Oldest first, so nobody's work waits longest for a mark.
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  }, [submissions, submissionSearch, submissionStatus, assignmentById]);

  /** Headline numbers for the hero and stat tiles. */
  const metrics = useMemo(() => {
    const graded = submissions.filter((item) => item.score !== undefined);
    const avgPercent = graded.length
      ? Math.round(
          graded.reduce((sum, item) => {
            const max = assignmentById.get(item.assignmentId)?.points ?? 100;
            return sum + ((item.score ?? 0) / max) * 100;
          }, 0) / graded.length,
        )
      : 0;
    const onTime = submissions.length
      ? Math.round((submissions.filter((item) => !item.isLate).length / submissions.length) * 100)
      : 0;

    return {
      total: assignments.length,
      published: assignments.filter((item) => item.status === "Published").length,
      drafts: assignments.filter((item) => item.status === "Draft").length,
      awaitingReview: submissions.filter((item) => item.status === "Awaiting review").length,
      avgPercent,
      onTime,
    };
  }, [assignments, submissions, assignmentById]);

  /** Count of submissions per assignment, for the table's progress column. */
  const submissionCount = useMemo(() => {
    const counts = new Map<string, { total: number; pending: number }>();
    submissions.forEach((item) => {
      const entry = counts.get(item.assignmentId) ?? { total: 0, pending: 0 };
      entry.total += 1;
      if (item.status === "Awaiting review") entry.pending += 1;
      counts.set(item.assignmentId, entry);
    });
    return counts;
  }, [submissions]);

  const hasActiveFilters = Boolean(search) || courseFilter !== "All courses" || statusFilter !== "All";
  const allVisibleSelected =
    filteredAssignments.length > 0 && filteredAssignments.every((item) => selectedIds.has(item.id));

  /* ------------------------------ Mutations ------------------------------ */
  // Each handler updates local state optimistically and shows a toast.
  // TODO(api): call the matching mutation and roll back on error.

  const touch = () => new Date().toISOString();

  const setStatus = (ids: string[], status: AdminAssignmentStatus) => {
    setAssignments((previous) =>
      previous.map((item) => (ids.includes(item.id) ? { ...item, status, updatedAt: touch() } : item)),
    );
  };

  const handleFormSubmit = (values: AssignmentFormValues, publish: boolean) => {
    if (editing) {
      setAssignments((previous) =>
        previous.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                ...values,
                // "Save changes" keeps the current state; "publish" forces Published.
                status: publish ? "Published" : item.status,
                updatedAt: touch(),
              }
            : item,
        ),
      );
      toast.success("Assignment updated", { description: values.title });
    } else {
      const created: AdminAssignment = {
        ...values,
        id: nextAssignmentId(assignments),
        status: publish ? "Published" : "Draft",
        enrolledCount: 0, // TODO(api): the server knows the cohort size.
        updatedAt: touch(),
      };
      setAssignments((previous) => [created, ...previous]);
      toast.success(publish ? "Assignment published" : "Draft saved", {
        description: publish
          ? `${created.title} is now visible to ${created.course} learners.`
          : `${created.title} is saved as a draft.`,
      });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const publish = (ids: string[]) => {
    setStatus(ids, "Published");
    toast.success(ids.length > 1 ? `${ids.length} assignments published` : "Assignment published");
  };

  const duplicate = (assignment: AdminAssignment) => {
    const copy: AdminAssignment = {
      ...assignment,
      id: nextAssignmentId(assignments),
      title: `${assignment.title} (copy)`,
      status: "Draft",
      updatedAt: touch(),
    };
    setAssignments((previous) => [copy, ...previous]);
    toast.success("Assignment duplicated", { description: `${copy.id} created as a draft.` });
  };

  const restore = (assignment: AdminAssignment) => {
    setStatus([assignment.id], "Draft");
    toast.success("Assignment restored to drafts");
  };

  /** Runs after the admin confirms a close / archive / delete. */
  const confirmPendingAction = () => {
    if (!pendingAction) return;
    const { kind, ids } = pendingAction;
    const label = ids.length > 1 ? `${ids.length} assignments` : "Assignment";

    if (kind === "delete") {
      setAssignments((previous) => previous.filter((item) => !ids.includes(item.id)));
      // Deleting an assignment also removes its submissions.
      setSubmissions((previous) => previous.filter((item) => !ids.includes(item.assignmentId)));
      toast.success(`${label} deleted`);
    } else if (kind === "close") {
      setStatus(ids, "Closed");
      toast.success(`${label} closed`, { description: "Learners can no longer submit." });
    } else {
      setStatus(ids, "Archived");
      toast.success(`${label} archived`);
    }

    setSelectedIds((previous) => {
      const next = new Set(previous);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    if (kind === "delete" && detailId && ids.includes(detailId)) setDetailId(null);
    setPendingAction(null);
  };

  const saveGrade = (submissionId: string, result: GradeResult) => {
    setSubmissions((previous) =>
      previous.map((item) => (item.id === submissionId ? { ...item, ...result } : item)),
    );
    setGrading(null);
    toast.success(result.status === "Graded" ? "Grade saved" : "Returned to learner", {
      description:
        result.status === "Graded"
          ? "The learner will see their score and feedback."
          : "The learner has been asked to resubmit.",
    });
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (allVisibleSelected) filteredAssignments.forEach((item) => next.delete(item.id));
      else filteredAssignments.forEach((item) => next.add(item.id));
      return next;
    });
  };

  const resetFilters = () => {
    setSearch("");
    setCourseFilter("All courses");
    setStatusFilter("All");
  };

  const selectedList = [...selectedIds];
  const detailAssignment = detailId ? assignmentById.get(detailId) ?? null : null;
  const gradingAssignment = grading ? assignmentById.get(grading.assignmentId) ?? null : null;

  /* -------------------------------- Render ------------------------------- */

  // Wrapper is a <div>, not <main>: MainLayout already renders the page's
  // <main> landmark, and landmarks should not be nested.
  return (
    <div className="mx-auto max-w-[1500px] space-y-7 pb-10 sm:space-y-9">
      {/* ---- Page heading + primary actions ------------------------------- */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
            Learning · Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">
            Assignments
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">
            Create coursework, control what learners can see, and keep marking on schedule across every programme.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          aria-busy={opener.isPending("create")}
          className={cn(primaryButtonClass, "self-start lg:self-auto")}
        >
          {opener.isPending("create") ? (
            <Loader2 size={16} aria-hidden="true" className="animate-spin" />
          ) : (
            <Plus size={16} aria-hidden="true" className={iconSpinOnHover} />
          )}
          {opener.isPending("create") ? "Opening…" : "New assignment"}
        </button>
      </header>

      {/* ---- Hero summary (matches the navy hero used on student pages) ---- */}
      <section
        aria-label="Assignment summary"
        className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-9"
      >
        <div aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -right-2 -top-12 size-52 rounded-full border border-white/10" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
              <ClipboardList size={15} aria-hidden="true" /> Assignment control centre
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              {metrics.awaitingReview > 0
                ? `${metrics.awaitingReview} submission${metrics.awaitingReview === 1 ? "" : "s"} waiting for a mark.`
                : "Marking is fully up to date."}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Learners get the most from feedback within 72 hours of submitting.
            </p>
          </div>
          <HeroMetric label="Published" value={metrics.published} />
          <HeroMetric label="Average score" value={`${metrics.avgPercent}%`} />
          <HeroMetric label="On-time rate" value={`${metrics.onTime}%`} />
        </div>
      </section>

      {/* ---- Stat tiles -------------------------------------------------- */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={ClipboardList} tint="bg-[#eaf0ff] text-[#101d49]" label="Total assignments" value={metrics.total} note="All states" />
        <StatTile icon={Send} tint="bg-emerald-50 text-emerald-700" label="Live for learners" value={metrics.published} note="Published" />
        <StatTile icon={FileText} tint="bg-[#f6f8fc] text-[#52627f]" label="Drafts" value={metrics.drafts} note="Not yet visible" />
        <StatTile
          icon={Inbox}
          tint="bg-blue-50 text-blue-700"
          label="Awaiting review"
          value={metrics.awaitingReview}
          note="Submissions"
          onClick={() => {
            setTab("submissions");
            setSubmissionStatus("Awaiting review");
          }}
        />
      </section>

      {/* ---- Tabs -------------------------------------------------------- */}
      <div role="tablist" aria-label="Assignment views" className="flex gap-1 overflow-x-auto border-b border-[#e4e9f2]">
        <TabButton active={tab === "assignments"} onClick={() => setTab("assignments")} icon={ClipboardList} label="All assignments" count={assignments.length} />
        <TabButton active={tab === "submissions"} onClick={() => setTab("submissions")} icon={ClipboardCheck} label="Review queue" count={metrics.awaitingReview} highlight />
      </div>

      {tab === "assignments" ? (
        /* ================= ASSIGNMENTS TABLE ================= */
        <section className={cn(cardClass, "overflow-hidden")} aria-labelledby="assignment-table-title">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-[#edf0f6] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 id="assignment-table-title" className="font-bold text-[#101d49]">Assignment register</h2>
              <p className="text-xs text-[#8995aa]">
                Showing {filteredAssignments.length} of {assignments.length} · sorted by due date
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="relative block min-w-0 flex-1">
                <span className="sr-only">Search assignments</span>
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8995aa]" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, ID, course, cohort or tutor…"
                  className={cn(inputClass, "h-10 pl-10")}
                />
              </label>
              <div className="md:w-60">
                <Select
                  ariaLabel="Filter by course"
                  value={courseFilter}
                  onChange={setCourseFilter}
                  options={["All courses", ...COURSE_OPTIONS]}
                />
              </div>
              {hasActiveFilters && (
                <button type="button" onClick={resetFilters} className={cn(secondaryButtonClass, "shrink-0")}>
                  <RotateCcw size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:-rotate-180 motion-reduce:transition-none" /> Reset
                </button>
              )}
            </div>

            {/* Status chips double as a quick filter */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
              {(["All", ...ASSIGNMENT_STATUSES] as const).map((status) => {
                const count = status === "All" ? assignments.length : assignments.filter((item) => item.status === status).length;
                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={statusFilter === status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors duration-150 active:scale-[0.98]",
                      statusFilter === status
                        ? "border-[#101d49] bg-[#101d49] text-white"
                        : "border-[#dce3ef] bg-white text-[#64718a] hover:border-[#b9c5da] hover:text-[#101d49]",
                    )}
                  >
                    {status}
                    <span className={cn("rounded-md px-1.5 text-xs", statusFilter === status ? "bg-white/15" : "bg-[#f1f4f9]")}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bulk-action bar (only while rows are selected) */}
          {selectedList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-[#f5e6a9] bg-[#fffaf0] px-4 py-3 sm:px-5" role="region" aria-label="Bulk actions">
              <span className="mr-2 text-sm font-semibold text-[#101d49]">{selectedList.length} selected</span>
              <BulkButton icon={Send} label="Publish" onClick={() => { publish(selectedList); setSelectedIds(new Set()); }} />
              <BulkButton icon={Lock} label="Close" onClick={() => setPendingAction({ kind: "close", ids: selectedList })} />
              <BulkButton icon={Archive} label="Archive" onClick={() => setPendingAction({ kind: "archive", ids: selectedList })} />
              <BulkButton icon={Trash2} label="Delete" destructive onClick={() => setPendingAction({ kind: "delete", ids: selectedList })} />
              <button type="button" onClick={() => setSelectedIds(new Set())} className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#64718a] hover:bg-white">
                <X size={14} aria-hidden="true" /> Clear selection
              </button>
            </div>
          )}

          {filteredAssignments.length === 0 ? (
            <EmptyState
              title="No assignments match your filters"
              message="Try a different search term, course or status."
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          ) : (
            <div className="relative overflow-x-auto">
              {/* `relative` keeps absolutely-positioned sr-only labels inside this
                  scroll area, preventing page-wide horizontal scroll on mobile. */}
              <table className="w-full min-w-[1080px]">
                <thead className="bg-[#fafbfd]">
                  <tr>
                    <th className="w-12 px-5 py-3.5">
                      <input
                        type="checkbox"
                        aria-label="Select all visible assignments"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        className="size-4 cursor-pointer rounded border-[#cbd4e3] accent-[#101d49]"
                      />
                    </th>
                    <th className={thClass}>Assignment</th>
                    <th className={thClass}>Cohort & tutor</th>
                    <th className={thClass}>Due</th>
                    <th className={thClass}>Submissions</th>
                    <th className={thClass}>Status</th>
                    <th className={cn(thClass, "text-right")}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f6]">
                  {filteredAssignments.map((assignment) => {
                    const counts = submissionCount.get(assignment.id) ?? { total: 0, pending: 0 };
                    const rate = assignment.enrolledCount ? Math.round((counts.total / assignment.enrolledCount) * 100) : 0;
                    const deadline = describeDeadline(assignment);
                    const selected = selectedIds.has(assignment.id);

                    return (
                      <tr
                        key={assignment.id}
                        aria-busy={opener.isPending(`row-${assignment.id}`) || undefined}
                        className={cn(rowHoverClass, selected && "bg-[#fffaf0] hover:bg-[#fff6e3]")}
                      >
                        <td className="relative px-5 py-4">
                          <RowAccent />
                          <input
                            type="checkbox"
                            aria-label={`Select ${assignment.title}`}
                            checked={selected}
                            onChange={() => toggleSelected(assignment.id)}
                            className="size-4 cursor-pointer rounded border-[#cbd4e3] accent-[#101d49]"
                          />
                        </td>
                        <td className="max-w-[340px] px-5 py-4">
                          <button type="button" onClick={() => openDetail(assignment.id)} className="group flex items-start gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]">
                            {/* Icon tile turns navy on row hover; shows a spinner while its dialog opens. */}
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49] transition-colors duration-200 group-hover/row:bg-[#101d49] group-hover/row:text-[#f5c542]">
                              {opener.isPending(`row-${assignment.id}`) ? (
                                <Loader2 size={18} aria-hidden="true" className="animate-spin" />
                              ) : (
                                <FileText size={19} aria-hidden="true" />
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-[#101d49] decoration-[#f5c542] decoration-2 underline-offset-4 group-hover:underline">{assignment.title}</span>
                              <span className="mt-0.5 block text-xs text-[#8995aa]">
                                {assignment.id} · {assignment.course} · {assignment.points} pts
                              </span>
                            </span>
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <p className="whitespace-nowrap text-sm font-medium text-[#34415e]">{assignment.cohort ?? "All cohorts"}</p>
                          <p className="mt-0.5 text-xs text-[#8995aa]">{assignment.tutor}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="text-sm font-medium text-[#34415e]">{formatDate(assignment.dueDate)}</p>
                          <p
                            className={cn(
                              "mt-0.5 text-xs font-semibold",
                              deadline.tone === "danger" && "text-red-600",
                              deadline.tone === "warn" && "text-[#b7791f]",
                              deadline.tone === "muted" && "text-[#8995aa]",
                            )}
                          >
                            {deadline.text}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#edf0f6]" aria-hidden="true">
                              <div className="h-full rounded-full bg-[#101d49]" style={{ width: `${Math.min(rate, 100)}%` }} />
                            </div>
                            <span className="whitespace-nowrap text-sm font-semibold text-[#101d49]">
                              {counts.total}
                              <span className="font-normal text-[#8995aa]">/{assignment.enrolledCount}</span>
                            </span>
                          </div>
                          {counts.pending > 0 && (
                            <p className="mt-1 text-xs font-semibold text-blue-700">{counts.pending} to review</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <AssignmentStatusBadge status={assignment.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          {/* Menu items adapt to the assignment's current state. */}
                          <ActionMenu
                            label={`Actions for ${assignment.title}`}
                            items={[
                              { label: "View details", icon: Eye, onSelect: () => openDetail(assignment.id) },
                              { label: "Edit", icon: Pencil, onSelect: () => openEdit(assignment) },
                              { label: "Duplicate", icon: Copy, onSelect: () => duplicate(assignment) },
                              { label: "Publish", icon: Send, hidden: !["Draft", "Closed"].includes(assignment.status), onSelect: () => publish([assignment.id]), separated: true },
                              { label: "Close submissions", icon: Lock, hidden: assignment.status !== "Published", onSelect: () => setPendingAction({ kind: "close", ids: [assignment.id] }), separated: true },
                              { label: "Archive", icon: Archive, hidden: assignment.status === "Archived", onSelect: () => setPendingAction({ kind: "archive", ids: [assignment.id] }) },
                              { label: "Restore to drafts", icon: ArchiveRestore, hidden: assignment.status !== "Archived", onSelect: () => restore(assignment), separated: true },
                              { label: "Delete", icon: Trash2, destructive: true, separated: true, onSelect: () => setPendingAction({ kind: "delete", ids: [assignment.id] }) },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        /* ================= SUBMISSIONS REVIEW QUEUE ================= */
        <section className={cn(cardClass, "overflow-hidden")} aria-labelledby="queue-title">
          <div className="flex flex-col gap-4 border-b border-[#edf0f6] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 id="queue-title" className="font-bold text-[#101d49]">Submission review queue</h2>
              <p className="text-xs text-[#8995aa]">Oldest first, so no learner waits too long for feedback.</p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="relative block min-w-0 flex-1">
                <span className="sr-only">Search submissions</span>
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8995aa]" aria-hidden="true" />
                <input
                  type="search"
                  value={submissionSearch}
                  onChange={(event) => setSubmissionSearch(event.target.value)}
                  placeholder="Search by learner, email or assignment…"
                  className={cn(inputClass, "h-10 pl-10")}
                />
              </label>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by review status">
                {(["Awaiting review", "Graded", "Returned", "All"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={submissionStatus === status}
                    onClick={() => setSubmissionStatus(status)}
                    className={cn(
                      "rounded-xl px-3.5 py-2 text-sm font-semibold transition",
                      submissionStatus === status ? "bg-[#101d49] text-white" : "border border-[#dce3ef] bg-white text-[#64718a] hover:bg-[#f8f9fc]",
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={submissionStatus === "Awaiting review" && !submissionSearch ? "All caught up" : "No submissions found"}
              message={
                submissionStatus === "Awaiting review" && !submissionSearch
                  ? "Every submission has been reviewed. New work will appear here."
                  : "Try another search term or status."
              }
            />
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="bg-[#fafbfd]">
                  <tr>
                    <th className={thClass}>Learner</th>
                    <th className={thClass}>Assignment</th>
                    <th className={thClass}>Submitted</th>
                    <th className={thClass}>Status</th>
                    <th className={cn(thClass, "text-right")}>Score</th>
                    <th className={cn(thClass, "text-right")}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f6]">
                  {filteredSubmissions.map((submission) => {
                    const parent = assignmentById.get(submission.assignmentId);
                    return (
                      <tr key={submission.id} className={rowHoverClass}>
                        <td className="relative px-5 py-4">
                          <RowAccent />
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#101d49] text-xs font-bold text-[#f5c542]">
                              {getInitials(submission.studentName)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#101d49]">{submission.studentName}</p>
                              <p className="truncate text-xs text-[#8995aa]">{submission.studentEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[300px] px-5 py-4">
                          <button type="button" onClick={() => parent && openDetail(parent.id)} className="block max-w-full truncate rounded text-left text-sm font-medium text-[#34415e] decoration-[#f5c542] decoration-2 underline-offset-4 transition-colors hover:text-[#101d49] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]">
                            {parent?.title ?? "Deleted assignment"}
                          </button>
                          <p className="mt-0.5 text-xs text-[#8995aa]">{parent?.course}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#34415e]">{formatDateTime(submission.submittedAt)}</span>
                            {submission.isLate && <LateBadge />}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <SubmissionStatusBadge status={submission.status} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-bold text-[#101d49]">
                          {submission.score !== undefined ? (
                            <>
                              {submission.score}
                              <span className="font-normal text-[#8995aa]">/{parent?.points ?? 100}</span>
                            </>
                          ) : (
                            <span className="text-[#c3cad8]">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openGrade(submission)}
                            aria-busy={opener.isPending(`grade-${submission.id}`)}
                            className={cn(
                              submission.status === "Awaiting review" ? primaryButtonClass : secondaryButtonClass,
                              "min-h-9 min-w-24 px-3.5",
                            )}
                          >
                            {opener.isPending(`grade-${submission.id}`) ? (
                              <Loader2 size={15} aria-hidden="true" className="animate-spin" />
                            ) : (
                              <>
                                {submission.status === "Awaiting review" ? "Grade" : "Regrade"}
                                <ArrowRight size={14} aria-hidden="true" className={iconNudgeOnHover} />
                              </>
                            )}
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
      )}

      {/* ---- Overdue marking reminder ------------------------------------- */}
      {metrics.awaitingReview > 0 && tab === "assignments" && (
        <aside className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-blue-700" aria-hidden="true" />
          <div className="flex-1">
            <h2 className="text-sm font-bold text-blue-900">Marking backlog</h2>
            <p className="mt-1 text-sm leading-6 text-blue-800">
              {metrics.awaitingReview} submission{metrics.awaitingReview === 1 ? " is" : "s are"} awaiting review. Open the review queue to grade them or nudge the assigned tutors.
            </p>
          </div>
          <button type="button" onClick={() => setTab("submissions")} className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-blue-800 transition-colors duration-150 hover:bg-blue-100">
            Open queue <ArrowRight size={14} aria-hidden="true" className={iconNudgeOnHover} />
          </button>
        </aside>
      )}

      {/* ================= Dialogs ================= */}
      <AssignmentFormModal
        open={formOpen}
        assignment={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <AssignmentDetailDrawer
        assignment={detailAssignment}
        submissions={submissions}
        onClose={() => setDetailId(null)}
        onEdit={(assignment) => {
          setDetailId(null);
          openEdit(assignment);
        }}
        onPublish={(assignment) => publish([assignment.id])}
        onGrade={openGrade}
        isGradePending={(id) => opener.isPending(`grade-${id}`)}
      />

      <GradeSubmissionModal
        open={Boolean(grading)}
        submission={grading}
        assignment={gradingAssignment}
        onClose={() => setGrading(null)}
        onSave={saveGrade}
      />

      <ConfirmDialog
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
        destructive={shownAction?.kind === "delete"}
        title={
          shownAction?.kind === "delete"
            ? "Delete assignment?"
            : shownAction?.kind === "close"
              ? "Close submissions?"
              : "Archive assignment?"
        }
        confirmLabel={
          shownAction?.kind === "delete" ? "Delete permanently" : shownAction?.kind === "close" ? "Close submissions" : "Archive"
        }
        message={<PendingActionMessage action={shownAction} assignmentById={assignmentById} />}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small presentational pieces                                                */
/* -------------------------------------------------------------------------- */

/** Explains the consequence of the pending action, naming the affected items. */
function PendingActionMessage({
  action,
  assignmentById,
}: {
  action: PendingAction;
  assignmentById: Map<string, AdminAssignment>;
}) {
  if (!action) return null;
  const subject =
    action.ids.length === 1
      ? <strong className="text-[#101d49]">{assignmentById.get(action.ids[0])?.title}</strong>
      : <strong className="text-[#101d49]">{action.ids.length} assignments</strong>;

  if (action.kind === "delete") {
    return <p>{subject} and all of its submissions and grades will be permanently removed. This cannot be undone.</p>;
  }
  if (action.kind === "close") {
    return <p>Learners will no longer be able to submit to {subject}. Existing submissions can still be graded.</p>;
  }
  return <p>{subject} will be hidden from learners and moved to the archive. You can restore it later.</p>;
}

function HeroMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-32 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 transition-colors duration-200 hover:border-[#f5c542]/40 hover:bg-white/[0.1]">
      <p className="text-xs font-medium text-white/60">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tracking-tight text-white">{value}</p>
    </div>
  );
}

function StatTile({
  icon: Icon,
  tint,
  label,
  value,
  note,
  onClick,
}: {
  icon: typeof ClipboardList;
  tint: string;
  label: string;
  value: number | string;
  note: string;
  /** When provided the tile becomes a shortcut button. */
  onClick?: () => void;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className={cn("flex size-11 items-center justify-center rounded-xl", tint)}>
          <Icon size={22} aria-hidden="true" />
        </span>
        {onClick ? (
          // Shortcut tiles reveal where they lead on hover.
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8490a6] transition-colors duration-200 group-hover:text-[#101d49]">
            Open queue <ArrowRight size={13} aria-hidden="true" className={iconNudgeOnHover} />
          </span>
        ) : (
          <span className="text-xs font-medium text-[#8490a6]">{note}</span>
        )}
      </div>
      <p className="mt-5 text-3xl font-bold text-[#101d49]">{value}</p>
      <p className="mt-1 text-sm text-[#64718a]">{label}</p>
    </>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        cardClass,
        cardHoverClass,
        "group p-5 text-left hover:border-[#f5c542]/70 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] motion-reduce:active:scale-100",
      )}
    >
      {body}
    </button>
  ) : (
    <div className={cn(cardClass, cardHoverClass, "p-5")}>{body}</div>
  );
}

/**
 * Tab with an underline that grows from the left: half-width preview on
 * hover, full width when active.
 */
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
  highlight = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof ClipboardList;
  label: string;
  count: number;
  /** Gold count bubble to draw attention (e.g. pending reviews). */
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative -mb-px inline-flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors duration-200",
        "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:rounded-full after:bg-[#101d49] after:transition-transform after:duration-300 after:ease-out motion-reduce:after:transition-none",
        active
          ? "text-[#101d49] after:scale-x-100"
          : "text-[#64718a] after:scale-x-0 hover:text-[#101d49] hover:after:scale-x-50 hover:after:bg-[#c3cddf]",
      )}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-bold transition-colors",
          highlight && count > 0 ? "bg-[#f5c542] text-[#101d49]" : "bg-[#eef1f6] text-[#64718a]",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function BulkButton({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: typeof ClipboardList;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] motion-reduce:active:scale-100",
        destructive
          ? "border-red-200 text-[#c93636] hover:border-[#c93636] hover:bg-[#c93636] hover:text-white"
          : "border-[#e4e9f2] text-[#34415e] hover:border-[#101d49] hover:bg-[#101d49] hover:text-white",
      )}
    >
      <Icon size={14} aria-hidden="true" /> {label}
    </button>
  );
}

function EmptyState({
  icon: Icon = Search,
  title,
  message,
  action,
}: {
  icon?: typeof Search;
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
        <Icon size={25} aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-[#101d49]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">{message}</p>
      {action && (
        <button type="button" onClick={action.onClick} className={cn(secondaryButtonClass, "mt-5")}>
          <RotateCcw size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:-rotate-180 motion-reduce:transition-none" />
          {action.label}
        </button>
      )}
    </div>
  );
}
