import { cn } from "@/lib/utils";
import type {
  AdminAssignmentStatus,
  SubmissionStatus,
} from "@/lib/mock/admin-assignments";

/**
 * Colour mapping for assignment lifecycle states.
 * Each state pairs a tinted background with a dot so the status is still
 * distinguishable for colour-blind users (shape + label, not colour alone).
 */
const assignmentStyles: Record<AdminAssignmentStatus, { chip: string; dot: string }> = {
  Draft: { chip: "border-[#e4e9f2] bg-[#f6f8fc] text-[#52627f]", dot: "bg-[#8995aa]" },
  Published: { chip: "border-emerald-100 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  Closed: { chip: "border-[#f5e6a9] bg-[#fff7dc] text-[#765800]", dot: "bg-[#c59400]" },
  Archived: { chip: "border-slate-200 bg-slate-100 text-slate-500", dot: "bg-slate-400" },
};

const submissionStyles: Record<SubmissionStatus, { chip: string; dot: string }> = {
  "Awaiting review": { chip: "border-blue-100 bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  Graded: { chip: "border-emerald-100 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  Returned: { chip: "border-orange-100 bg-orange-50 text-orange-700", dot: "bg-orange-500" },
};

function Badge({ label, chip, dot }: { label: string; chip: string; dot: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold",
        chip,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}

export function AssignmentStatusBadge({ status }: { status: AdminAssignmentStatus }) {
  return <Badge label={status} {...assignmentStyles[status]} />;
}

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  return <Badge label={status} {...submissionStyles[status]} />;
}

/** Small red "Late" pill shown next to late submissions. */
export function LateBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-600">
      Late
    </span>
  );
}
