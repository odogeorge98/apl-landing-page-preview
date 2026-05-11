"use client";

import { cn } from "@/lib/utils";

// ─── Rider status ─────────────────────────────────────────────────────────────
// Receives the normalised display string from RidersList (which maps API enums).

export type RiderStatus = "Active" | "Inactive" | "Pending Verification" | "Banned";

const riderStatusStyles: Record<RiderStatus, string> = {
  Active:               "bg-emerald-500/15 text-emerald-400",
  Inactive:             "bg-white/10 text-white/55",
  "Pending Verification": "bg-amber-500/15 text-amber-300",
  Banned:               "bg-red-500/15 text-red-400",
};

export function RiderStatusBadge({ status }: { status: RiderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        riderStatusStyles[status],
      )}
    >
      {status === "Active" && (
        <span className="size-1.5 rounded-full bg-emerald-400" />
      )}
      {status}
    </span>
  );
}

// ─── Driver status ────────────────────────────────────────────────────────────
// Accepts DRIVER_VERIFICATION_STATUS values directly from the API.

interface PillConfig {
  label: string;
  pill: string;
  dot?: string;
}

const driverStatusConfig: Record<string, PillConfig> = {
  VERIFIED:    { label: "Active",       pill: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400" },
  IN_PROGRESS: { label: "In Progress",  pill: "bg-blue-500/15 text-blue-400",       dot: "bg-blue-400"    },
  PENDING:     { label: "Pending",      pill: "bg-amber-500/15 text-amber-300"                            },
  REJECTED:    { label: "Rejected",     pill: "bg-red-500/15 text-red-400"                                },
};

export function DriverStatusBadge({ status }: { status: string }) {
  const cfg = driverStatusConfig[status] ?? {
    label: status,
    pill:  "bg-white/10 text-white/55",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        cfg.pill,
      )}
    >
      {cfg.dot && <span className={cn("size-1.5 rounded-full", cfg.dot)} />}
      {cfg.label}
    </span>
  );
}

// ─── KYC status ───────────────────────────────────────────────────────────────
// Accepts KYC_COMPLETED enum values directly from the API.

const kycStatusConfig: Record<string, { label: string; color: string }> = {
  ALL_COMPLETED:           { label: "Approved",     color: "text-emerald-400" },
  NOT_COMPLETED:           { label: "Not Started",  color: "text-white/40"    },
  PERSONAL_INFORMATION:    { label: "In Progress",  color: "text-amber-400"   },
  IDENTITY_INFORMATION:    { label: "In Progress",  color: "text-amber-400"   },
  RESIDENTIAL_INFORMATION: { label: "In Progress",  color: "text-amber-400"   },
};

export function KycStatusText({ status }: { status: string }) {
  const cfg = kycStatusConfig[status] ?? { label: status, color: "text-white/45" };
  return (
    <span className={cn("text-sm font-medium", cfg.color)}>{cfg.label}</span>
  );
}

// ─── Trip activity ────────────────────────────────────────────────────────────

export type TripBadgeStatus = "Active" | "Completed" | "Cancelled" | "Accepted" | "Assigned" | "Pending" | "In Progress";

const tripBadgeConfig: Record<string, { pill: string; dot?: string }> = {
  Active:      { pill: "bg-teal-500/15 text-teal-300",    dot: "bg-teal-400"    },
  Accepted:    { pill: "bg-teal-500/15 text-teal-300",    dot: "bg-teal-400"    },
  Assigned:    { pill: "bg-blue-500/15 text-blue-400",    dot: "bg-blue-400"    },
  "In Progress":{ pill: "bg-blue-500/15 text-blue-400",   dot: "bg-blue-400"    },
  Completed:   { pill: "bg-emerald-500/15 text-emerald-400"                      },
  Cancelled:   { pill: "bg-white/10 text-white/45"                               },
  Pending:     { pill: "bg-amber-500/15 text-amber-300"                          },
};

export function TripActivityBadge({ status }: { status: string }) {
  const cfg = tripBadgeConfig[status] ?? { pill: "bg-white/10 text-white/45" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        cfg.pill,
      )}
    >
      {cfg.dot && <span className={cn("size-1.5 rounded-full", cfg.dot)} />}
      {status}
    </span>
  );
}