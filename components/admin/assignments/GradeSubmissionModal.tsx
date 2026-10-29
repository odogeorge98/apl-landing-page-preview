"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Paperclip } from "lucide-react";

import { AdminModal } from "@/components/admin/shared/AdminModal";
import { useLastDefined } from "@/components/admin/shared/motion";
import {
  darkButtonClass,
  formatDateTime,
  getInitials,
  inputClass,
  labelClass,
  secondaryButtonClass,
} from "@/components/admin/shared/admin-ui";
import type {
  AdminAssignment,
  AssignmentSubmission,
} from "@/lib/mock/admin-assignments";
import { cn } from "@/lib/utils";
import { LateBadge, SubmissionStatusBadge } from "./StatusBadges";

/** What the parent receives when the admin saves a grade. */
export type GradeResult = {
  score: number;
  feedback: string;
  /** "Graded" = final mark; "Returned" = sent back for resubmission. */
  status: "Graded" | "Returned";
};

type GradeSubmissionModalProps = {
  open: boolean;
  submission: AssignmentSubmission | null;
  assignment: AdminAssignment | null;
  onClose: () => void;
  onSave: (submissionId: string, result: GradeResult) => void;
};

/** Quick-pick feedback snippets to speed up marking common cases. */
const FEEDBACK_SNIPPETS = [
  "Great work — all requirements met.",
  "Good attempt; review the instructions for the missing parts.",
  "Please resubmit with the requested changes.",
];

/**
 * Grade / regrade a single learner submission.
 *
 * Shows the submission context (learner, timing, attachment), a score input
 * bounded by the assignment's maximum, a live percentage + letter band, and
 * feedback. Admins can either finalise the grade or return the work for
 * resubmission.
 */
export function GradeSubmissionModal({
  open,
  submission: submissionProp,
  assignment: assignmentProp,
  onClose,
  onSave,
}: GradeSubmissionModalProps) {
  // Keep showing the last submission while the dialog animates out.
  const submission = useLastDefined(submissionProp);
  const assignment = useLastDefined(assignmentProp);
  const [score, setScore] = useState<number>(NaN);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Pre-fill with any existing grade so "Regrade" starts from the last mark.
  useEffect(() => {
    if (!open || !submissionProp) return;
    const submission = submissionProp;
    setScore(submission.score ?? NaN);
    setFeedback(submission.feedback ?? "");
    setError(null);
  }, [open, submissionProp]);

  if (!submission || !assignment) return null;

  const maxPoints = assignment.points;
  const percentage = Number.isFinite(score) ? Math.round((score / maxPoints) * 100) : null;

  const save = (status: GradeResult["status"]) => {
    if (!Number.isFinite(score) || score < 0 || score > maxPoints) {
      setError(`Enter a score between 0 and ${maxPoints}.`);
      return;
    }
    if (status === "Returned" && !feedback.trim()) {
      setError("Add feedback so the learner knows what to change before resubmitting.");
      return;
    }
    onSave(submission.id, { score, feedback: feedback.trim(), status });
  };

  // Downloadable/visitable attachments: links get a real anchor, files a stub.
  const isLink = submission.attachment.includes("/");

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      size="md"
      eyebrow={`${assignment.id} · ${assignment.course}`}
      title={submission.score !== undefined ? "Regrade submission" : "Grade submission"}
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={() => save("Returned")} className={secondaryButtonClass}>
            Return for resubmission
          </button>
          <button type="button" onClick={() => save("Graded")} className={darkButtonClass}>
            Save grade
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Learner + submission context */}
        <div className="flex items-start gap-3 rounded-xl bg-[#f8f9fc] p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#101d49] text-xs font-bold text-[#f5c542]">
            {getInitials(submission.studentName)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-[#101d49]">{submission.studentName}</p>
              <SubmissionStatusBadge status={submission.status} />
              {submission.isLate && <LateBadge />}
            </div>
            <p className="mt-0.5 truncate text-xs text-[#8995aa]">{submission.studentEmail}</p>
            <p className="mt-2 text-xs text-[#64718a]">
              Submitted {formatDateTime(submission.submittedAt)}
            </p>
          </div>
        </div>

        <div>
          <p className={labelClass}>Assignment</p>
          <p className="mt-1 text-sm font-semibold text-[#101d49]">{assignment.title}</p>
        </div>

        {/* Attachment */}
        <div>
          <p className={labelClass}>Submitted work</p>
          {isLink ? (
            <a
              href={`https://${submission.attachment}`}
              target="_blank"
              rel="noreferrer noopener"
              className="group mt-1.5 flex items-center gap-2 rounded-xl border border-[#e4e9f2] px-3.5 py-2.5 text-sm font-medium text-[#2857a4] transition-colors duration-150 hover:border-[#bcd0ef] hover:bg-[#f4f8ff]"
            >
              <ExternalLink size={15} aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
              <span className="truncate">{submission.attachment}</span>
            </a>
          ) : (
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#e4e9f2] px-3.5 py-2.5 text-sm font-medium text-[#34415e]">
              <Paperclip size={15} aria-hidden="true" />
              <span className="truncate">{submission.attachment}</span>
              {/* TODO(api): swap for a signed download URL from file storage. */}
            </div>
          )}
        </div>

        {/* Score input with live percentage */}
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <label htmlFor="grade-score" className={labelClass}>
              Score (out of {maxPoints})
            </label>
            <input
              id="grade-score"
              type="number"
              min={0}
              max={maxPoints}
              value={Number.isFinite(score) ? score : ""}
              onChange={(event) => {
                setScore(event.target.valueAsNumber);
                setError(null);
              }}
              className={cn(inputClass, "h-11 text-base font-semibold")}
              placeholder="0"
            />
          </div>
          <div className="flex h-11 min-w-28 items-center justify-center rounded-xl bg-[#eaf0ff] px-4 text-sm font-bold text-[#101d49]">
            {percentage === null ? "—" : `${percentage}% · ${gradeBand(percentage)}`}
          </div>
        </div>

        {/* Feedback */}
        <div className="space-y-1.5">
          <label htmlFor="grade-feedback" className={labelClass}>
            Feedback to learner
          </label>
          <textarea
            id="grade-feedback"
            rows={4}
            value={feedback}
            onChange={(event) => {
              setFeedback(event.target.value);
              setError(null);
            }}
            placeholder="What went well, and what should they improve?"
            className={cn(inputClass, "resize-y py-3 leading-6")}
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {FEEDBACK_SNIPPETS.map((snippet) => (
              <button
                key={snippet}
                type="button"
                onClick={() => setFeedback((previous) => (previous ? `${previous} ${snippet}` : snippet))}
                className="rounded-full border border-[#e4e9f2] bg-white px-2.5 py-1 text-xs text-[#52627f] transition-colors duration-150 hover:border-[#f5c542] hover:bg-[#fffaf0] hover:text-[#101d49]"
              >
                + {snippet}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
      </div>
    </AdminModal>
  );
}

/** Simple letter band shown next to the percentage. Adjust to your policy. */
function gradeBand(percentage: number): string {
  if (percentage >= 70) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 45) return "D";
  return "F";
}
