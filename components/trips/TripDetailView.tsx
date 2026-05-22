"use client";

import Link from "next/link";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {
  ArrowLeft,
  Car,
  Clock,
  CreditCard,
  MapPin,
  Navigation,
  Route,
  User,
  Users,
} from "lucide-react";
import { useTripDetail } from "@/lib/hooks/trips/use-trips";
import type { TripDetailData, TripDisplayStatus, TripPaymentStatus } from "@/lib/interfaces/trip";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Share2 } from "lucide-react";
import { shareTrip } from "@/lib/api/trips";
import { showError } from "@/lib/utils/error-handler";
import { ShareTripModal } from "./ShareTripModal";

dayjs.extend(duration);

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardBase =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Put this at the module level in both TripsList.tsx and TripDetailView.tsx

const ACTIVE_STATUSES = new Set<string>([
  "ACTIVE",
  "TRIP_BOOKED",
  "TRIP_ASSIGNED",
  "DRIVER_ACCEPTED",
  "DRIVER_ARRIVED",
  "TRIP_STARTED",
  "TRIP_RE_ASSIGN",
]);

const COMPLETED_STATUSES = new Set<string>([
  "COMPLETED",
  "TRIP_COMPLETED",
]);

const CANCELLED_STATUSES = new Set<string>([
  "CANCELLED",
  "TRIP_CANCELLED",
  "TRIP_CANCELLED_BY_USER",
  "TRIP_CANCELLED_BY_DRIVER",
  "SYSTEM_CANCELLED",
]);

function normaliseStatus(apiStatus: string): TripDisplayStatus {
  if (COMPLETED_STATUSES.has(apiStatus)) return "Completed";
  if (CANCELLED_STATUSES.has(apiStatus)) return "Cancelled";
  if (ACTIVE_STATUSES.has(apiStatus))    return "Active";
  return "Active"; // safe fallback
}

function formatFare(fee: string | undefined | null): string {
  if (!fee) return "—";
  const num = parseFloat(fee);
  if (isNaN(num)) return fee;
  return `₦ ${num.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPaymentType(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

/**
 * Maps entity payment status to the three display variants the PaymentPill
 * component knows about. Defaults to "Pending" for UNPAID.
 */
function resolvePaymentDisplay(
  status?: TripPaymentStatus | null,
): {
  label: "Paid" | "Pending" | "Refunded" | "Unpaid";
  pill: string;
} {
  switch (status) {
    case "PAID":
      return {
        label: "Paid",
        pill: "bg-emerald-500/12 text-emerald-300",
      };

    case "UNPAID":
      return {
        label: "Unpaid",
        pill: "bg-rose-500/12 text-rose-300",
      };

    case "REFUNDED":
      return {
        label: "Refunded",
        pill: "bg-sky-500/12 text-sky-200",
      };

    default:
      return {
        label: "Pending",
        pill: "bg-amber-500/15 text-amber-200",
      };
  }
}

/**
 * Derives trip duration in minutes from start/end timestamps.
 * Returns null when either timestamp is missing.
 */
function deriveDuration(
  start?: string | null,
  end?: string | null,
): number | null {
  console.log("start: ", start, "\nEnd: ", end);

  if (!start || !end) return null;

  const mins = Math.ceil(
    (new Date(end).getTime() - new Date(start).getTime()) / 60_000,
  );

  console.log("Mins: ", mins);

  return mins > 0 ? mins : null;
}

/**
 * Constructs a chronological timeline from the available trip timestamps.
 */
// In buildTimeline, pass displayStatus as a param instead of relying on raw status
function buildTimeline(trip: TripDetailData, displayStatus: TripDisplayStatus) {
  const fmt = (iso: string) => dayjs(iso).format("ddd, D MMM YYYY · h:mm A");

  const events = [
    {
      id: "booked",
      title: "Trip booked",
      at: fmt(trip.createdAt),
      done: true,
      description: null,
    },
    trip.arrivalTime ? {
      id: "arrived",
      title: "Driver arrived at pickup",
      at: fmt(trip.arrivalTime),
      done: true,
      description: null,
    } : null,
    trip.startTime ? {
      id: "started",
      title: "Trip started",
      at: fmt(trip.startTime),
      done: true,
      description: null,
    } : null,
    {
      id: "ended",
      title:
        displayStatus === "Cancelled" ? "Trip cancelled" :
        displayStatus === "Completed" ? "Trip completed" :
        "In progress…",
      at:
        trip.endTime      ? fmt(trip.endTime) :
        trip.cancelledAt  ? fmt(trip.cancelledAt) :
        "—",
      done: Boolean(trip.endTime ?? trip.cancelledAt),
      description: null,
    },
  ].filter(Boolean) as { id: string; title: string; at: string; done: boolean; description: string | null }[];

  return events;
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusHeaderPill({ status }: { status: TripDisplayStatus }) {
  const styles: Record<TripDisplayStatus, string> = {
    Active:    "bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/20",
    Cancelled: "bg-white/10 text-white/55 ring-1 ring-white/10",
    Completed: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20",
  };
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", styles[status])}>
      {status}
    </span>
  );
}

function PaymentPill({ label, pill }: { label: string; pill: string }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", pill)}>
      {label}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] animate-pulse space-y-6 pb-10">
      <div className="h-5 w-28 rounded bg-white/10" />
      <div className="h-9 w-72 rounded-xl bg-white/10" />
      <div className="h-4 w-64 rounded bg-white/[0.07]" />
      <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
        <div className="space-y-5 lg:col-span-7">
          <div className="h-48 rounded-2xl bg-white/[0.06]" />
          <div className="h-72 rounded-2xl bg-white/[0.06]" />
        </div>
        <div className="space-y-5 lg:col-span-5">
          <div className="h-44 rounded-2xl bg-white/[0.06]" />
          <div className="h-40 rounded-2xl bg-white/[0.06]" />
          <div className="h-36 rounded-2xl bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TripDetailView({ tripRowId }: { tripRowId: string }) {
  const {
    data:      detailResponse,
    isLoading,
    isError,
    refetch,
  } = useTripDetail(tripRowId);
  
  const [shareModal, setShareModal] = useState({ open: false, url: "" });

  const shareMutation = useMutation({
    mutationFn: (tripId: string) => shareTrip(tripId),
    onSuccess:  (data)  => setShareModal({ open: true, url: data.data.url }),
    onError:    (error: Error) =>
      showError(error.message || "Failed to generate share link."),
  });

  const trip = detailResponse?.data ?? null;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
        <Link
          href="/dashboard/trips"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#00d7c4] hover:text-[#5eead4]"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Back to trips
        </Link>
        <DetailSkeleton />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError || !trip) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6">
        <Link
          href="/dashboard/trips"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#00d7c4] hover:text-[#5eead4]"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Back to trips
        </Link>
        <div className={cn(cardBase, "flex flex-col items-center gap-4 p-10 text-center")}>
          <p className="text-white/55">
            {isError ? "Failed to load trip details." : "Trip not found."}
          </p>
          {isError && (
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-xl border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const displayStatus    = normaliseStatus(trip.status);
  const timeline         = buildTimeline(trip, displayStatus);
  const durationMins     = deriveDuration(trip.startTime, trip.endTime);
  const shortId          = trip.id.slice(0, 8).toUpperCase();
  const paymentDisplay   = resolvePaymentDisplay(trip.paymentStatus);
  const distanceCovered  = trip.distanceCovered ? `${parseFloat(trip.distanceCovered).toFixed(2)} km` : "N/A";
  console.log('Distance covered: ', distanceCovered);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Link
            href="/dashboard/trips"
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#00d7c4] transition hover:text-[#5eead4]"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            Back to trips
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Trip{" "}
              <span className="font-mono text-[#c4b5fd] tabular-nums">#{shortId}</span>
            </h1>
            <StatusHeaderPill status={displayStatus} />
          </div>
          <p className="text-sm text-white/45">
            {trip.tripType && (
              <>
                <span className="text-white/65">{trip.tripType}</span>
                <span className="text-white/25"> · </span>
              </>
            )}
            {dayjs(trip.createdAt).format("D MMM YYYY, h:mm A")}
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          {/* Share button */}
          <button
            type="button"
            onClick={() => shareMutation.mutate(trip.id)}
            disabled={shareMutation.isPending}
            className="inline-flex items-center justify-center gap-2 self-end rounded-xl border border-[#8247E5]/40 bg-[#8247E5]/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#8247E5]/70 hover:bg-[#8247E5]/20 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {shareMutation.isPending ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                Generating…
              </>
            ) : (
              <>
                <Share2 className="size-4" strokeWidth={1.75} />
                Share trip
              </>
            )}
          </button>

          {/* Fare (existing content — unchanged) */}
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <p className="text-xs font-medium uppercase tracking-wider text-white/40">
              {trip.finalFee ? "Final fare" : "Estimated fare"}
            </p>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-white">
              {formatFare(trip.finalFee ?? trip.estimatedFee)}
            </p>
            <div className="flex items-center gap-2">
              <PaymentPill label={paymentDisplay.label} pill={paymentDisplay.pill} />
              <span className="text-xs text-white/45">
                {formatPaymentType(trip.paymentType)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div className="space-y-5 lg:col-span-7">
          {/* Route */}
          <section className={cn(cardBase, "overflow-hidden")}>
            <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Navigation className="size-4 text-[#a855f7]" strokeWidth={1.75} />
                Route
              </h2>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {/* Pickup */}
              <div className="flex gap-4 px-5 py-4 sm:px-6">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <MapPin className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Pickup</p>
                  {/* Only show location label when it's meaningfully different from the address */}
                  {trip.pickupLocation && trip.pickupLocation !== trip.pickupAddress && (
                    <p className="mt-0.5 text-sm font-semibold text-white">{trip.pickupLocation}</p>
                  )}
                  <p className="mt-1 text-sm leading-relaxed text-white/75">
                    {trip.pickupAddress ?? "—"}
                  </p>
                </div>
              </div>

              {/* Drop-off */}
              <div className="flex gap-4 px-5 py-4 sm:px-6">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
                  <MapPin className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Drop-off</p>
                  {trip.dropoffLocation && trip.dropoffLocation !== trip.dropoffAddress && (
                    <p className="mt-0.5 text-sm font-semibold text-white">{trip.dropoffLocation}</p>
                  )}
                  <p className="mt-1 text-sm leading-relaxed text-white/75">
                    {trip.dropoffAddress ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section className={cn(cardBase, "p-5 sm:p-6")}>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Clock className="size-4 text-[#a855f7]" strokeWidth={1.75} />
              Trip timeline
            </h2>
            <ol className="mt-6 space-y-6">
              {timeline.map((ev, idx) => {
                const last = idx === timeline.length - 1;
                return (
                  <li key={ev.id} className="flex gap-4">
                    <div className="flex w-4 shrink-0 flex-col items-center pt-1">
                      <span
                        className={cn(
                          "size-3 rounded-full ring-2 ring-[#14101f]",
                          ev.done ? "bg-emerald-400" : "bg-white/30",
                        )}
                      />
                      {!last && (
                        <span className="mt-2 min-h-[2.5rem] w-px flex-1 bg-gradient-to-b from-white/15 to-transparent" />
                      )}
                    </div>
                    <div className="min-w-0 pb-1">
                      <p className="text-sm font-semibold text-white">{ev.title}</p>
                      <p className="mt-0.5 text-xs tabular-nums text-white/45">{ev.at}</p>
                      {ev.description && (
                        <p className="mt-2 text-xs leading-relaxed text-white/50">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        {/* ── Right column ────────────────────────────────────────────────── */}
        <div className="space-y-5 lg:col-span-5">
          {/* Summary */}
          <section className={cn(cardBase, "p-5 sm:p-6")}>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Route className="size-4 text-[#a855f7]" strokeWidth={1.75} />
              Summary
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/[0.03] px-4 py-3">
                <dt className="text-[11px] font-medium text-white/40">Distance</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-white">
                  {distanceCovered}
                </dd>
              </div>
              <div className="rounded-xl bg-white/[0.03] px-4 py-3">
                <dt className="text-[11px] font-medium text-white/40">Duration</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-white">
                  {durationMins !== null ? `${durationMins} min` : "—"}
                </dd>
              </div>
              <div className="rounded-xl bg-white/[0.03] px-4 py-3">
                <dt className="text-[11px] font-medium text-white/40">Trip type</dt>
                <dd className="mt-1 text-sm font-medium text-white">
                  {trip.tripType ?? "—"}
                </dd>
              </div>
              <div className="rounded-xl bg-white/[0.03] px-4 py-3">
                <dt className="text-[11px] font-medium text-white/40">Estimated fee</dt>
                <dd className="mt-1 text-sm font-medium text-white">
                  {formatFare(trip.estimatedFee)}
                </dd>
              </div>
              {trip.tax != null && (
                <div className="rounded-xl bg-white/[0.03] px-4 py-3">
                  <dt className="text-[11px] font-medium text-white/40">Tax</dt>
                  <dd className="mt-1 text-sm font-medium text-white">
                    {formatFare(String(trip.tax))}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* People */}
          <section className={cn(cardBase, "overflow-hidden")}>
            <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Users className="size-4 text-[#a855f7]" strokeWidth={1.75} />
                People
              </h2>
            </div>
            <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2">
              <div className="bg-[#1a1628]/90 p-5 sm:p-6">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  <User className="size-3.5" strokeWidth={1.75} />
                  Passenger
                </p>
                <p className="mt-3 font-semibold text-white">{trip.passenger.fullName}</p>
                <p className="mt-1 break-all text-xs text-white/50">{trip.passenger.email}</p>
                <p className="mt-1 text-xs tabular-nums text-white/40">{trip.passenger.phoneNo}</p>
              </div>
              <div className="bg-[#1a1628]/90 p-5 sm:p-6">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  <User className="size-3.5" strokeWidth={1.75} />
                  Driver
                </p>
                {trip.driver ? (
                  <>
                    <p className="mt-3 font-semibold text-white">{trip.driver.fullName}</p>
                    <p className="mt-1 break-all text-xs text-white/50">{trip.driver.email}</p>
                    <p className="mt-1 text-xs tabular-nums text-white/40">{trip.driver.phoneNo}</p>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-white/40">Not yet assigned</p>
                )}
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className={cn(cardBase, "p-5 sm:p-6")}>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Car className="size-4 text-[#a855f7]" strokeWidth={1.75} />
              Payment details
            </h2>
            <div className="mt-4 divide-y divide-white/[0.06]">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs text-white/40">Method</span>
                <div className="flex items-center gap-2">
                  <CreditCard className="size-3.5 text-white/40" strokeWidth={1.75} />
                  <span className="text-sm font-medium text-white">
                    {formatPaymentType(trip.paymentType)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-white/40">Status</span>
                <PaymentPill label={paymentDisplay.label} pill={paymentDisplay.pill} />
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-white/40">Amount charged</span>
                <span className="text-sm font-semibold text-white">
                  {formatFare(trip.finalFee ?? trip.estimatedFee)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
      {shareModal.open && (
        <ShareTripModal
          url={shareModal.url}
          onClose={() => setShareModal({ open: false, url: "" })}
        />
      )}
    </div>
  );
}