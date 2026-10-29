import { cn } from "@/lib/utils";
import type { ReporterType } from "@/lib/mock/admin-daily-reports";

/** Small label distinguishing students from interns. */
export function ReporterBadge({ type, className }: { type: ReporterType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
        type === "Intern" ? "bg-[#fff1c7] text-[#765800]" : "bg-[#eaf0ff] text-[#2a3f86]",
        className,
      )}
    >
      {type}
    </span>
  );
}
