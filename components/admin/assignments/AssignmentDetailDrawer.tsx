"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  Pencil,
  Send,
  UserRound,
  Users,
} from "lucide-react";

import { AdminModal } from "@/components/admin/shared/AdminModal";
import { useLastDefined } from "@/components/admin/shared/motion";
import {
  darkButtonClass,
  formatDate,
  formatDateTime,
  getInitials,
  secondaryButtonClass,
} from "@/components/admin/shared/admin-ui";
import type {
  AdminAssignment,
  AssignmentSubmission,
  SubmissionStatus,
} from "@/lib/mock/admin-assignments";
import { cn } from "@/lib/utils";
import {
  AssignmentStatusBadge,
  LateBadge,
  SubmissionStatusBadge,
} from "./StatusBadges";

type AssignmentDetailDrawerProps = {
  assignment: AdminAssignment | null;
  submissions: AssignmentSubmission[];
  onClose: () => void;
  onEdit: (assignment: AdminAssignment) => void;
  onPublish: (assignment: AdminAssignment) => void;
  onGrade: (submission: AssignmentSubmission) => void;
  /** True while a submission's grade dialog is in its opening delay. */
  isGradePending?: (submissionId: string) => boolean;
};

type SubmissionFilter = "All" | SubmissionStatus;

/**
 * Right-hand drawer with everything about one assignment:
 * brief, settings, submission funnel and the per-learner submission list
 * (with inline "Grade" actions).
 *
 * Opening a drawer rather than navigating keeps the admin's table filters
 * and scroll position intact while they triage several assignments.
 */
export function AssignmentDetailDrawer({
  assignment: assignmentProp,
  submissions,
  onClose,
  onEdit,
  onPublish,
  onGrade,
  isGradePending = () => false,
}: AssignmentDetailDrawerProps) {
  // Keep rendering the last assignment while the drawer slides out.
  const assignment = useLastDefined(assignmentProp);
  const [filter, setFilter] = useState<SubmissionFilter>("All");

  // Start every newly opened assignment on the "All" filter.
  const openId = assignmentProp?.id;
  useEffect(() => {
    if (openId) setFilter("All");
  }, [openId]);

  // Submissions belonging to this assignment only.
  const own = useMemo(
    () => submissions.filter((item) => item.assignmentId === assignment?.id),
    [submissions, assignment?.id],
  );

  const visible = filter === "All" ? own : own.filter((item) => item.status === filter);

  if (!assignment) return null;

  const graded = own.filter((item) => item.score !== undefined);
  const averageScore = graded.length
    ? Math.round(graded.reduce((sum, item) => sum + (item.score ?? 0), 0) / graded.length)
    : null;
  const submissionRate = Math.round((own.length / Math.max(assignment.enrolledCount, 1)) * 100);

  return (
    <AdminModal
      open={Boolean(assignmentProp)}
      variant="drawer"
      onClose={onClose}
      eyebrow={`${assignment.id} · Assignment details`}
      title={assignment.title}
      description={assignment.course}
      footer={
        <>
          <button type="button" onClick={() => onEdit(assignment)} className={secondaryButtonClass}>
            <Pencil size={15} aria-hidden="true" className="transition-transform duration-200 group-hover:-rotate-12 motion-reduce:transition-none" /> Edit assignment
          </button>
          {assignment.status === "Draft" && (
            <button type="button" onClick={() => onPublish(assignment)} className={darkButtonClass}>
              <Send size={15} aria-hidden="true" /> Publish now
            </button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <AssignmentStatusBadge status={assignment.status} />
          <span className="rounded-full bg-[#f6f8fc] px-2.5 py-1 text-xs font-medium text-[#52627f]">
            {assignment.submissionType}
          </span>
          <span className="rounded-full bg-[#f6f8fc] px-2.5 py-1 text-xs font-medium text-[#52627f]">
            {assignment.allowLateSubmissions ? "Late submissions accepted" : "No late submissions"}
          </span>
        </div>

        {/* Key facts */}
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fact icon={CalendarDays} label="Due date" value={formatDate(assignment.dueDate)} />
          <Fact icon={ClipboardList} label="Max score" value={`${assignment.points} pts`} />
          <Fact icon={Users} label="Submitted" value={`${own.length}/${assignment.enrolledCount}`} />
          <Fact icon={CheckCircle2} label="Average" value={averageScore === null ? "—" : `${averageScore}%`} />
        </dl>

        {/* Submission progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#34415e]">Submission rate</span>
            <span className="text-[#8995aa]">{submissionRate}% of enrolled learners</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf0f6]">
            <div className="h-full rounded-full bg-[#101d49]" style={{ width: `${Math.min(submissionRate, 100)}%` }} />
          </div>
        </div>

        {/* Brief */}
        <section>
          <h3 className="text-sm font-bold text-[#101d49]">Brief</h3>
          <p className="mt-2 text-sm leading-6 text-[#64718a]">{assignment.description}</p>
          <ol className="mt-3 space-y-2">
            {assignment.instructions.map((instruction, index) => (
              <li key={`${index}-${instruction}`} className="flex items-start gap-2.5 text-sm leading-6 text-[#64718a]">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-xs font-semibold text-[#101d49]">
                  {index + 1}
                </span>
                {instruction}
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-center gap-2 text-xs text-[#8995aa]">
            <UserRound size={14} aria-hidden="true" /> Marked by {assignment.tutor}
            <span aria-hidden="true">·</span>
            <Clock3 size={14} aria-hidden="true" /> Updated {formatDateTime(assignment.updatedAt)}
          </p>
        </section>

        {/* Submissions list */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[#101d49]">Submissions</h3>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter submissions">
              {(["All", "Awaiting review", "Graded", "Returned"] as SubmissionFilter[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={filter === option}
                  onClick={() => setFilter(option)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors duration-150",
                    filter === option ? "bg-[#101d49] text-white" : "bg-[#f6f8fc] text-[#64718a] hover:bg-[#e8ecf4] hover:text-[#101d49]",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-[#dce3ef] px-4 py-8 text-center text-sm text-[#8995aa]">
              {own.length === 0
                ? assignment.status === "Draft"
                  ? "Publish this assignment to start receiving submissions."
                  : "No learner has submitted yet."
                : "No submissions match this filter."}
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-[#edf0f6] rounded-xl border border-[#e4e9f2]">
              {visible.map((submission) => (
                <li key={submission.id} className="group/sub flex items-center gap-3 px-4 py-3 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl hover:bg-[#f8faff]">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-xs font-bold text-[#101d49]">
                    {getInitials(submission.studentName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-[#101d49]">{submission.studentName}</p>
                      {submission.isLate && <LateBadge />}
                    </div>
                    <p className="text-xs text-[#8995aa]">{formatDateTime(submission.submittedAt)}</p>
                  </div>
                  <div className="hidden sm:block">
                    <SubmissionStatusBadge status={submission.status} />
                  </div>
                  <span className="w-14 text-right text-sm font-bold text-[#101d49]">
                    {submission.score !== undefined ? `${submission.score}` : "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onGrade(submission)}
                    aria-busy={isGradePending(submission.id)}
                    className="min-w-[4.5rem] rounded-lg border border-[#e4e9f2] bg-white px-3 py-1.5 text-xs font-semibold text-[#101d49] transition-[background-color,border-color,color,transform] duration-150 group-hover/sub:border-[#c3cddf] hover:!border-[#101d49] hover:bg-[#101d49] hover:text-white active:scale-[0.97] motion-reduce:transition-colors"
                  >
                    {isGradePending(submission.id) ? (
                      <Loader2 size={14} aria-hidden="true" className="mx-auto animate-spin" />
                    ) : submission.score !== undefined ? (
                      "Regrade"
                    ) : (
                      "Grade"
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminModal>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8f9fc] p-3">
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8995aa]">
        <Icon size={13} aria-hidden="true" /> {label}
      </dt>
      <dd className="mt-1.5 text-sm font-bold text-[#101d49]">{value}</dd>
    </div>
  );
}
