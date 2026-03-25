"use client";

import { cn } from "@/lib/utils";
import type { DriverStatus, KycStatus, RiderStatus } from "@/lib/data/users-mock";

const riderStatusStyles: Record<RiderStatus, string> = {
  Active: "bg-emerald-500/15 text-emerald-400",
  Inactive: "bg-white/10 text-white/55",
  "Pending Verification": "bg-amber-500/15 text-amber-300",
  Banned: "bg-red-500/15 text-red-400",
};

export function RiderStatusBadge({ status }: { status: RiderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        riderStatusStyles[status],
      )}
    >
      {status === "Active" ? <span className="size-1.5 rounded-full bg-emerald-400" /> : null}
      {status}
    </span>
  );
}

export function DriverStatusBadge({ status }: { status: DriverStatus }) {
  return <RiderStatusBadge status={status} />;
}

const kycStyles: Record<KycStatus, string> = {
  Approved: "text-emerald-400",
  Pending: "text-amber-400",
  Rejected: "text-red-400",
};

export function KycStatusText({ status }: { status: KycStatus }) {
  return (
    <span className={cn("text-sm font-medium", kycStyles[status])}>{status}</span>
  );
}

export function TripActivityBadge({
  status,
}: {
  status: "Active" | "Completed" | "Canceled";
}) {
  const map = {
    Active: "bg-teal-500/15 text-teal-300",
    Completed: "bg-emerald-500/15 text-emerald-400",
    Canceled: "bg-white/10 text-white/45",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        map[status],
      )}
    >
      {status === "Active" ? <span className="size-1.5 rounded-full bg-teal-400" /> : null}
      {status}
    </span>
  );
}
