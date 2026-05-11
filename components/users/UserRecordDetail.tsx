"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Activity,
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ImageIcon,
  Pencil,
  Scale,
  User,
  Wallet,
  X,
} from "lucide-react";
import { type TripBadgeStatus, TripActivityBadge } from "./UserStatusBadge";
import { UpdateProfileConfirmModal, ProfileUpdatedSuccessModal } from "./UserProfileModals";
import {
  useUserDetail,
  useUserActivitySummary,
  useUserRideHistory,
} from "@/lib/hooks/users/riders/use-riders";
import {
  useDriverDetail,
  useDriverActivitySummary,
  useDriverRideHistory,
} from "@/lib/hooks/users/drivers/use-drivers";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "account" | "activity" | "disputes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  className: string;
  dotClassName: string;
}

function resolveStatusConfig(status: string): StatusConfig {
  const map: Record<string, StatusConfig> = {
    ACTIVE:   { label: "Active",                className: "bg-emerald-500/15 text-emerald-400", dotClassName: "bg-emerald-400" },
    VERIFIED: { label: "Verified",              className: "bg-emerald-500/15 text-emerald-400", dotClassName: "bg-emerald-400" },
    INACTIVE: { label: "Inactive",              className: "bg-white/[0.08] text-white/45",       dotClassName: "bg-white/30"    },
    PENDING_VERIFICATION: { label: "Pending Verification", className: "bg-amber-500/15 text-amber-300",  dotClassName: "bg-amber-400"   },
    BANNED:   { label: "Banned",               className: "bg-red-500/15 text-red-400",          dotClassName: "bg-red-400"     },
  };
  return map[status] ?? { label: status, className: "bg-white/[0.08] text-white/45", dotClassName: "bg-white/30" };
}

/**
 * API returns uppercase enum values. TripActivityBadge expects title-case strings.
 * Extend this map as new statuses are added.
 */
function normaliseRideStatus(status: string): TripBadgeStatus {
  const map: Record<string, TripBadgeStatus> = {
    COMPLETED:   "Completed",
    CANCELLED:   "Cancelled",
    ACCEPTED:    "Active",
    ASSIGNED:    "Active",
    PENDING:     "Active",
    IN_PROGRESS: "Active",
  };
  return map[status] ?? status;
}

/**
 * totalSpend is returned in kobo (smallest unit). Divide by 100 for naira.
 * TODO: Confirm unit with backend team if values look off.
 */
function formatNaira(kobo: number): string {
  return `₦ ${(kobo / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function AccountSkeleton() {
  const rowBase =
    "flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] animate-pulse";
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/98 to-[#12101c]/98 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
      {[120, 80, 100, 72, 80, 90].map((w, i) => (
        <div key={i} className={rowBase}>
          <div className="h-3.5 w-24 rounded bg-white/10" />
          <div style={{ width: w }} className="h-3.5 rounded bg-white/[0.07]" />
        </div>
      ))}
    </div>
  );
}

function ActivityStatSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
      <div className="mb-4 h-3.5 w-24 rounded bg-white/10" />
      <div className="h-8 w-20 rounded bg-white/[0.07]" />
    </div>
  );
}

function RideRowSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-white/[0.05]">
          <td className="px-4 py-3.5">
            <div className="h-3.5 w-28 rounded bg-white/10" />
            <div className="mt-1.5 h-2.5 w-40 rounded bg-white/[0.06]" />
          </td>
          <td className="px-4 py-3.5">
            <div className="h-3.5 w-28 rounded bg-white/10" />
            <div className="mt-1.5 h-2.5 w-40 rounded bg-white/[0.06]" />
          </td>
          <td className="px-4 py-3.5"><div className="h-5 w-20 rounded-full bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-24 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5 text-right"><div className="ml-auto h-3.5 w-20 rounded bg-white/10" /></td>
        </tr>
      ))}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function UserRecordDetail({
  kind,
  userId,
}: {
  kind: "rider" | "driver";
  userId: string;
}) {
  const [tab, setTab]                 = useState<TabId>("account");
  const [editing, setEditing]         = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [showCoins, setShowCoins]     = useState(true);

  // ── Activity pagination ───────────────────────────────────────────────────
  const [ridesCursor, setRidesCursor]           = useState<string | null>(null);
  const [ridesCursorStack, setRidesCursorStack] = useState<(string | null)[]>([null]);

  // ── Queries ───────────────────────────────────────────────────────────────
  const isDriver = kind === "driver";

  // ─── Rider queries ──────────────────────────────────────────────────────────

  const riderDetailQuery = useUserDetail(
    userId,
    !isDriver,
  );

  const riderSummaryQuery = useUserActivitySummary(
    userId,
    !isDriver,
  );

  const riderRidesQuery = useUserRideHistory({
    userId,
    cursor: ridesCursor,
    enabled: !isDriver,
  });

  // ─── Driver queries ─────────────────────────────────────────────────────────

  const driverDetailQuery = useDriverDetail(
    userId,
    isDriver,
  );

  const driverSummaryQuery = useDriverActivitySummary(
    userId,
    isDriver,
  );

  const driverRidesQuery = useDriverRideHistory({
    driverId: userId,
    cursor: ridesCursor,
    enabled: isDriver,
  });

  // ─── Active source selection ───────────────────────────────────────────────

  const detailQuery =
    kind === "driver"
      ? driverDetailQuery
      : riderDetailQuery;

  const summaryQuery =
    kind === "driver"
      ? driverSummaryQuery
      : riderSummaryQuery;

  const ridesQuery =
    kind === "driver"
      ? driverRidesQuery
      : riderRidesQuery;

  // ─── Extract values ────────────────────────────────────────────────────────

  const {
    data: userResponse,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = detailQuery;

  const {
    data: activitySummaryResponse,
    isLoading: summaryLoading,
    isError: summaryError,
  } = summaryQuery;

  const {
    data: ridesResponse,
    isLoading: ridesLoading,
    isFetching: ridesFetching,
    isError: ridesError,
  } = ridesQuery;

  const rawProfile = userResponse?.data;

  const profile = rawProfile
    ? {
        ...rawProfile,

        fullName:
          "fullName" in rawProfile
            ? rawProfile.fullName
            : "Driver",

        phoneNumber:
          "phoneNumber" in rawProfile
            ? rawProfile.phoneNumber
            : rawProfile.phoneNo,

        shortDescription:
          rawProfile.shortDescription ?? null,
      }
    : null;

  const activitySummary  = activitySummaryResponse?.data;
  const rides            = ridesResponse?.data.items ?? [];
  const ridesNextCursor  = ridesResponse?.data.nextCursor ?? null;
  const canGoPrevRides   = ridesCursorStack.length > 1;
  const canGoNextRides   = Boolean(ridesNextCursor);

  // ── Ride pagination handlers ──────────────────────────────────────────────
  const handleRidesNext = () => {
    if (!ridesNextCursor || ridesFetching) return;
    setRidesCursorStack((prev) => [...prev, ridesNextCursor]);
    setRidesCursor(ridesNextCursor);
  };

  const handleRidesPrev = () => {
    if (!canGoPrevRides || ridesFetching) return;
    setRidesCursorStack((prev) => {
      const updated = [...prev];
      updated.pop();
      const previous = updated[updated.length - 1] ?? null;
      setRidesCursor(previous);
      return updated;
    });
  };

  // ── Labels ────────────────────────────────────────────────────────────────
  const title       = kind === "rider" ? "Passenger Management" : "Driver Management";
  const recordLabel = kind === "rider" ? "Passenger Record" : "Driver Record";
  const backHref    = kind === "rider" ? "/dashboard/users/riders" : "/dashboard/users/drivers";
  const subjectNoun = kind === "rider" ? "Passenger" : "Driver";

  const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: "account",  label: "Account",  icon: User     },
    { id: "activity", label: "Activity", icon: Activity  },
    { id: "disputes", label: "Disputes", icon: Scale     },
  ];

  const divider = "border-b border-white/[0.06]";
  const row     = "flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8";

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Back header */}
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="flex size-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {title}
          </h1>
          {profile && (
            <span className="hidden truncate text-sm text-white/40 sm:block">
              — {profile.fullName}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Sidebar nav */}
        <aside className="w-full shrink-0 lg:w-56">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
            {recordLabel}
          </p>
          <nav className="flex flex-col gap-1 border-r border-white/[0.06] pr-4">
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                    active
                      ? "bg-[#8247E5]/25 text-white shadow-[inset_3px_0_0_0_#a855f7]"
                      : "text-white/50 hover:bg-white/[0.06] hover:text-white/85",
                  )}
                >
                  <Icon className="size-4 shrink-0 opacity-90" strokeWidth={1.75} />
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content area */}
        <div className="min-w-0 flex-1 space-y-6">

          {/* ── Account tab ─────────────────────────────────────────────── */}
          {tab === "account" && (
            <>
              {profileLoading && <AccountSkeleton />}

              {profileError && (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-red-500/30 bg-red-500/5 px-6 py-16 text-center">
                  <p className="text-sm text-red-400">
                    Failed to load {subjectNoun.toLowerCase()} details.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchProfile()}
                    className="rounded-xl border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                  >
                    Try again
                  </button>
                </div>
              )}

              {profile && (
                <div className={cn(
                  "overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/98 to-[#12101c]/98",
                  "shadow-[0_8px_40px_rgba(0,0,0,0.35),0_0_80px_-20px_rgba(130,71,229,0.25)]",
                )}>
                  <div className={divider}>
                    <div className={row}>
                      <span className="text-sm text-white/45">Full Name</span>
                      {editing ? (
                        <input defaultValue={profile.fullName} className="w-full max-w-md rounded-xl bg-white/[0.08] px-3 py-2 text-right text-sm text-white outline-none ring-[#8247E5]/30 focus:ring-2 sm:text-left" />
                      ) : (
                        <span className="text-sm font-medium text-white">{profile.fullName}</span>
                      )}
                    </div>
                  </div>
                  <div className={divider}>
                    <div className={row}>
                      <span className="text-sm text-white/45">Email</span>
                      <span className="text-sm font-medium text-white">{profile.email ?? "—"}</span>
                    </div>
                  </div>
                  <div className={divider}>
                    <div className={row}>
                      <span className="text-sm text-white/45">Phone Number</span>
                      {editing ? (
                        <input defaultValue={profile.phoneNumber ?? "—"} className="w-full max-w-md rounded-xl bg-white/[0.08] px-3 py-2 text-right text-sm text-white outline-none ring-[#8247E5]/30 focus:ring-2 sm:text-left" />
                      ) : (
                        <span className="text-sm font-medium tabular-nums text-white">{profile.phoneNumber ?? "—"}</span>
                      )}
                    </div>
                  </div>
                  {kind === "driver" && (
                    <div className={divider}>
                      <div className={row}>
                        <span className="text-sm text-white/45">Vehicle</span>

                        <span className="text-sm font-medium text-white">
                          {("vehicleName" in profile && profile.vehicleName) ||
                            ("vehiclePlate" in profile && profile.vehiclePlate)
                              ? [
                                  "vehicleName" in profile ? profile.vehicleName : null,
                                  "vehiclePlate" in profile ? profile.vehiclePlate : null,
                                ]
                                  .filter(Boolean)
                                  .join(" • ")
                              : "No vehicle assigned"}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className={divider}>
                    <div className={cn(row, "!items-start")}>
                      <span className="text-sm text-white/45">Photo</span>
                      <div className="flex w-full max-w-lg flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex flex-col items-center gap-2">
                          {profile.imageUrl ? (
                            <Image src={profile.imageUrl} alt={profile.fullName} width={80} height={80} className="size-20 rounded-full object-cover" />
                          ) : (
                            <div className="size-20 overflow-hidden rounded-full bg-gradient-to-br from-[#8247E5] to-blue-500" />
                          )}
                          <button type="button" className="text-xs font-semibold text-red-400 hover:text-red-300">Delete</button>
                        </div>
                        <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#00d7c4]/40 bg-white/[0.03] px-4 py-8 text-center transition hover:border-[#00d7c4]/65 hover:bg-white/[0.05]">
                          <ImageIcon className="size-8 text-[#00d7c4]/80" strokeWidth={1.25} />
                          <p className="mt-2 text-xs text-white/55">Click to upload or drag and drop. SVG, PNG, JPG or GIF (max. 800 × 400px)</p>
                          <input type="file" className="hidden" accept="image/*" />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className={divider}>
                    <div className={row}>
                      <span className="text-sm text-white/45">Join date</span>
                      <span className="text-sm text-white">{dayjs(profile.joinDate).format("D MMM YYYY")}</span>
                    </div>
                  </div>
                  <div className={divider}>
                    <div className={row}>
                      <span className="text-sm text-white/45">Status</span>
                      {(() => {
                        const cfg = resolveStatusConfig(profile.status);
                        return (
                          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", cfg.className)}>
                            <span className={cn("size-1.5 rounded-full", cfg.dotClassName)} />
                            {cfg.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className={cn(row, "!items-start")}>
                      <span className="text-sm text-white/45">Short description</span>
                      {editing ? (
                        <textarea defaultValue={profile.shortDescription ?? ""} rows={4} className="w-full max-w-xl rounded-xl bg-white/[0.08] px-3 py-2 text-sm text-white outline-none ring-[#8247E5]/30 focus:ring-2" />
                      ) : (
                        <p className="max-w-xl text-right text-sm leading-relaxed text-white/80 sm:text-left">
                          {profile.shortDescription ?? <span className="italic text-white/30">No description provided</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {profile && (
                editing ? (
                  <div className="flex flex-wrap justify-end gap-3">
                    <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-[#8247E5]/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8247E5]/10">Discard</button>
                    <button type="button" onClick={() => setConfirmOpen(true)} className="rounded-xl bg-gradient-to-r from-[#8247E5] to-[#a855f7] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-95">Save Changes</button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#2a2438] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#352d48]">
                      <Pencil className="size-4" /> Edit
                    </button>
                    <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-red-400/50 bg-transparent px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10">
                      <X className="size-4" /> Suspend
                    </button>
                  </div>
                )
              )}
            </>
          )}

          {/* ── Activity tab ─────────────────────────────────────────────── */}
          {tab === "activity" && (
            <div className="space-y-5">
              {/* ── Summary cards ── */}
              <div className="grid gap-4 md:grid-cols-3">
                {summaryLoading ? (
                  <>
                    <ActivityStatSkeleton />
                    <ActivityStatSkeleton />
                    <ActivityStatSkeleton />
                  </>
                ) : summaryError || !activitySummary ? (
                  <div className="col-span-3 rounded-2xl border border-dashed border-red-500/30 bg-red-500/5 px-6 py-10 text-center text-sm text-red-400">
                    Failed to load activity summary.
                  </div>
                ) : (
                  <>
                    {/* Rides card */}
                    <div className="rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                      <div className="mb-4 flex items-center gap-2">
                        <Car className="size-5 text-[#a855f7]" strokeWidth={1.75} />
                        <span className="text-sm font-semibold text-white/80">Total Rides</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-emerald-400/90">Completed</p>
                          <p className="mt-1 text-2xl font-bold text-white">
                            {activitySummary.completedRides.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-red-400/90">Cancelled</p>
                          <p className="mt-1 text-2xl font-bold text-white">
                            {activitySummary.cancelledRides.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Total spend card */}
                    <div className="rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                      <div className="mb-4 flex items-center gap-2">
                        <Wallet className="size-5 text-[#a855f7]" strokeWidth={1.75} />
                        <span className="text-sm font-semibold text-white/80">Total Spend</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatNaira(activitySummary.totalSpend)}
                      </p>
                    </div>

                    {/* Coins card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full border border-[#8247E5]/15" aria-hidden />
                      <div className="pointer-events-none absolute -right-4 top-12 size-28 rounded-full border border-[#8247E5]/10" aria-hidden />
                      <div className="relative mb-2 flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-white/80">Total Pepp Coins</span>
                        <Image src="/peppcoin.svg" alt="" width={48} height={50} className="drop-shadow-lg" />
                      </div>
                      <div className="relative mt-3 flex items-center gap-2">
                        <span className={cn(
                          "text-2xl font-bold tabular-nums",
                          activitySummary.totalCoins < 0 ? "text-red-400" : "text-white",
                        )}>
                          {showCoins
                            ? activitySummary.totalCoins.toLocaleString()
                            : "••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCoins((s) => !s)}
                          className="rounded-lg p-1.5 text-white/40 hover:bg-white/[0.08] hover:text-white/70"
                          aria-label={showCoins ? "Hide balance" : "Show balance"}
                        >
                          {showCoins ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ── Ride history table ── */}
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                        <th className="px-4 py-3">Pickup</th>
                        <th className="px-4 py-3">Drop Off</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {ridesLoading || ridesFetching ? (
                        <RideRowSkeleton />
                      ) : ridesError ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-sm text-red-400">
                            Failed to load ride history.
                          </td>
                        </tr>
                      ) : rides.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-sm text-white/40">
                            No ride history found.
                          </td>
                        </tr>
                      ) : (
                        rides.map((ride) => (
                          <tr key={ride.id} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-3.5">
                              <p className="font-semibold text-white">{ride.pickupLabel}</p>
                              <p className="mt-0.5 max-w-[220px] text-xs text-white/45">
                                {ride.pickupAddress}
                              </p>
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="font-semibold text-white">{ride.dropoffLabel}</p>
                              <p className="mt-0.5 max-w-[220px] text-xs text-white/45">
                                {ride.dropoffAddress}
                              </p>
                            </td>
                            <td className="px-4 py-3.5">
                              <TripActivityBadge status={normaliseRideStatus(ride.status)} />
                            </td>
                            <td className="px-4 py-3.5 tabular-nums text-white/65">
                              {dayjs(ride.createdAt).format("D MMM YYYY, h:mm A")}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                type="button"
                                className="text-sm font-semibold text-[#00d7c4] hover:text-[#5eead4]"
                              >
                                View details &gt;
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── Simple prev / next — no totals ── */}
                {(canGoPrevRides || canGoNextRides) && (
                  <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-4 py-3">
                    <button
                      type="button"
                      onClick={handleRidesPrev}
                      disabled={!canGoPrevRides || ridesFetching}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                        canGoPrevRides && !ridesFetching
                          ? "text-white/70 hover:bg-white/[0.07] hover:text-white"
                          : "cursor-not-allowed text-white/20",
                      )}
                    >
                      <ChevronLeft className="size-4" />
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={handleRidesNext}
                      disabled={!canGoNextRides || ridesFetching}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                        canGoNextRides && !ridesFetching
                          ? "text-white/70 hover:bg-white/[0.07] hover:text-white"
                          : "cursor-not-allowed text-white/20",
                      )}
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Disputes tab ─────────────────────────────────────────────── */}
          {tab === "disputes" && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center">
              <Scale className="mx-auto size-10 text-white/25" strokeWidth={1.25} />
              <p className="mt-3 text-sm text-white/45">
                No open disputes for this {subjectNoun.toLowerCase()}.
              </p>
            </div>
          )}
        </div>
      </div>

      <UpdateProfileConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => { setEditing(false); setSuccessOpen(true); }}
        subjectLabel={subjectNoun + " Information"}
      />
      <ProfileUpdatedSuccessModal open={successOpen} onOpenChange={setSuccessOpen} />
    </div>
  );
}