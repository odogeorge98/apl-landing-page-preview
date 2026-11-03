import { cn } from "@/lib/utils";
/** Small neutral label for a report author role. */
export function ReporterBadge({ type, className }: { type: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
        type.toLowerCase() === "tutor" ? "bg-[#fff1c7] text-[#765800]" : "bg-[#eaf0ff] text-[#2a3f86]",
        className,
      )}
    >
      {type}
    </span>
  );
}
