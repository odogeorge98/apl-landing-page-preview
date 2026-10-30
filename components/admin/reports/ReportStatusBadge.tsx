import type { AdminVisibleReportStatus } from "@/lib/interfaces/reports";
import { cn } from "@/lib/utils";

const statusStyles: Record<AdminVisibleReportStatus, string> = {
  SUBMITTED: "bg-[#eaf0ff] text-[#2a3f86]",
  REVIEWED: "bg-emerald-50 text-emerald-700",
  RETURNED: "bg-[#fff5d6] text-[#8a6000]",
};

/** Compact lifecycle badge for an API-backed admin report. */
export function ReportStatusBadge({ status }: { status: AdminVisibleReportStatus }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold", statusStyles[status])}>{label}</span>;
}
