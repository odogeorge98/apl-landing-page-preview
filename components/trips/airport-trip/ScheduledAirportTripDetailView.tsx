"use client";

import Link from "next/link";
import dayjs from "dayjs";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Mail,
  MapPin,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  RefreshCw,
  User,
  Users,
  Phone,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

import {
  useScheduledTrip,
  useUpdateScheduledTripStatus,
} from "@/lib/hooks/trips/scheduled-trips";

import {
  ScheduledTripStatus,
  type ScheduledTrip,
} from "@/lib/interfaces/trip/scheduled-trip";

import { cn } from "@/lib/utils";

import { showError } from "@/lib/utils/error-handler";

// ─── Styles ──────────────────────────────────────────────────────────────────

const cardBase =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatStatus(
  status: ScheduledTripStatus,
): string {
  switch (status) {
    case ScheduledTripStatus.PENDING:
      return "Pending";

    case ScheduledTripStatus.CONFIRMED:
      return "Confirmed";

    case ScheduledTripStatus.ASSIGNED:
      return "Assigned";

    case ScheduledTripStatus.IN_PROGRESS:
      return "In progress";

    case ScheduledTripStatus.COMPLETED:
      return "Completed";

    case ScheduledTripStatus.CANCELLED:
      return "Cancelled";

    default:
      return status;
  }
}

function getStatusStyles(
  status: ScheduledTripStatus,
): string {
  switch (status) {
    case ScheduledTripStatus.PENDING:
      return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20";

    case ScheduledTripStatus.CONFIRMED:
      return "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/20";

    case ScheduledTripStatus.ASSIGNED:
      return "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/20";

    case ScheduledTripStatus.IN_PROGRESS:
      return "bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/20";

    case ScheduledTripStatus.COMPLETED:
      return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20";

    case ScheduledTripStatus.CANCELLED:
      return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20";

    default:
      return "bg-white/10 text-white/55 ring-1 ring-white/10";
  }
}

function formatPaymentStatus(
  status?: string | null,
): string {
  if (!status) return "—";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatPaymentMethod(
  method?: string | null,
): string {
  if (!method) return "—";

  return method
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getPaymentStatusStyles(
  status?: string | null,
): string {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-emerald-500/12 text-emerald-300";

    case "failed":
    case "cancelled":
    case "refunded":
      return "bg-rose-500/12 text-rose-300";

    default:
      return "bg-amber-500/12 text-amber-300";
  }
}

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "P"
  );
}

function formatDirection(
  direction?: ScheduledTrip["airportDirection"],
): string {
  if (direction === "to_airport") {
    return "To airport";
  }

  if (direction === "from_airport") {
    return "From airport";
  }

  return "Airport trip";
}

function DirectionIcon({
  direction,
}: {
  direction?: ScheduledTrip["airportDirection"];
}) {
  if (direction === "from_airport") {
    return (
      <PlaneLanding
        className="size-4"
        strokeWidth={1.75}
      />
    );
  }

  return (
    <PlaneTakeoff
      className="size-4"
      strokeWidth={1.75}
    />
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────

function StatusPill({
  status,
}: {
  status: ScheduledTripStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        getStatusStyles(status),
      )}
    >
      {status === ScheduledTripStatus.COMPLETED ? (
        <CheckCircle2 className="size-3.5" />
      ) : status === ScheduledTripStatus.IN_PROGRESS ? (
        <Plane className="size-3.5" />
      ) : status === ScheduledTripStatus.CANCELLED ? (
        <AlertCircle className="size-3.5" />
      ) : (
        <Clock3 className="size-3.5" />
      )}

      {formatStatus(status)}
    </span>
  );
}

// ─── Loading ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] animate-pulse space-y-6 pb-10">
      <div className="h-5 w-32 rounded bg-white/10" />

      <div className="h-9 w-80 rounded-xl bg-white/10" />

      <div className="h-4 w-72 rounded bg-white/[0.07]" />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="h-64 rounded-2xl bg-white/[0.06]" />
          <div className="h-64 rounded-2xl bg-white/[0.06]" />
        </div>

        <div className="space-y-5 lg:col-span-5">
          <div className="h-56 rounded-2xl bg-white/[0.06]" />
          <div className="h-56 rounded-2xl bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScheduledAirportTripDetailView({
  tripId,
}: {
  tripId: string;
}) {
  const {
    data: detailResponse,
    isLoading,
    isError,
    refetch,
  } = useScheduledTrip(tripId);

  const updateStatusMutation =
    useUpdateScheduledTripStatus();

  const [selectedStatus, setSelectedStatus] =
    useState<ScheduledTripStatus | null>(null);

  const trip = detailResponse?.data ?? null;

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6">
        <Link
          href="/dashboard/trips/airport-trips"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#00d7c4] transition hover:text-[#5eead4]"
        >
          <ArrowLeft className="size-4" />
          Back to airport trips
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
          href="/dashboard/trips/airport-trips"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#00d7c4] transition hover:text-[#5eead4]"
        >
          <ArrowLeft className="size-4" />
          Back to airport trips
        </Link>

        <div
          className={cn(
            cardBase,
            "flex flex-col items-center gap-4 p-10 text-center",
          )}
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-rose-500/10 text-rose-300">
            <AlertCircle className="size-5" />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              {isError
                ? "Failed to load scheduled trip."
                : "Scheduled trip not found."}
            </p>

            <p className="mt-1 text-xs text-white/40">
              The trip may have been removed or the
              request could not be completed.
            </p>
          </div>

          {isError && (
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/[0.05]"
            >
              <RefreshCw className="size-4" />
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  const shortId = trip._id
    .slice(0, 8)
    .toUpperCase();

  const currentStatus =
    selectedStatus ?? trip.status;

  const statusChanged =
    selectedStatus !== null &&
    selectedStatus !== trip.status;

  const isUpdating =
    updateStatusMutation.isPending;

  // ── Status update ─────────────────────────────────────────────────────────

  const handleStatusUpdate = () => {
    if (
      !selectedStatus ||
      selectedStatus === trip.status ||
      isUpdating
    ) {
      return;
    }

    updateStatusMutation.mutate(
      {
        id: trip._id,
        payload: {
          status: selectedStatus,
        },
      },
      {
        onSuccess: () => {
          setSelectedStatus(null);
        },

        onError: (error) => {
          showError(
            error instanceof Error
              ? error.message
              : "Failed to update scheduled trip status.",
          );
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
      {/* ── Header ─────────────────────────────────────────────────────── */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Link
            href="/dashboard/trips/airport-trips"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00d7c4] transition hover:text-[#5eead4]"
          >
            <ArrowLeft className="size-4" />
            Back to airport trips
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Airport trip{" "}
              <span className="font-mono text-[#c4b5fd]">
                #{shortId}
              </span>
            </h1>

            <StatusPill status={currentStatus} />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-white/45">
            <span>
              Scheduled{" "}
              {dayjs(trip.scheduledAt).format(
                "D MMM YYYY, h:mm A",
              )}
            </span>

            <span className="text-white/20">·</span>

            <span>
              Created{" "}
              {dayjs(trip.createdAt).format(
                "D MMM YYYY, h:mm A",
              )}
            </span>
          </div>
        </div>

        {/* ── Status Controls ───────────────────────────────────────── */}

        <div
          className={cn(
            cardBase,
            "w-full p-4 sm:w-auto sm:min-w-[300px]",
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Update trip status
          </p>

          <div className="mt-3 flex flex-col gap-2">
            <select
              value={currentStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value as ScheduledTripStatus,
                )
              }
              disabled={isUpdating}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-[#8247E5]/60 focus:ring-2 focus:ring-[#8247E5]/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option
                value={ScheduledTripStatus.PENDING}
                className="bg-[#1c182b]"
              >
                Pending
              </option>

              <option
                value={ScheduledTripStatus.CONFIRMED}
                className="bg-[#1c182b]"
              >
                Confirmed
              </option>

              <option
                value={ScheduledTripStatus.ASSIGNED}
                className="bg-[#1c182b]"
              >
                Assigned
              </option>

              <option
                value={ScheduledTripStatus.IN_PROGRESS}
                className="bg-[#1c182b]"
              >
                In progress
              </option>

              <option
                value={ScheduledTripStatus.COMPLETED}
                className="bg-[#1c182b]"
              >
                Completed
              </option>

              <option
                value={ScheduledTripStatus.CANCELLED}
                className="bg-[#1c182b]"
              >
                Cancelled
              </option>
            </select>

            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={
                !statusChanged || isUpdating
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#8247E5] px-4 text-sm font-semibold text-white transition hover:bg-[#7338d0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isUpdating ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Updating…
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Update status
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
        {/* ── Left ────────────────────────────────────────────────────── */}

        <div className="space-y-5 lg:col-span-7">
          {/* Route */}

          <section
            className={cn(
              cardBase,
              "overflow-hidden",
            )}
          >
            <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Plane
                  className="size-4 text-[#a855f7]"
                  strokeWidth={1.75}
                />
                Airport route
              </h2>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {/* Pickup */}

              <div className="flex gap-4 px-5 py-5 sm:px-6">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <MapPin
                    className="size-4"
                    strokeWidth={1.75}
                  />
                </span>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                    Pickup
                  </p>

                  <p className="mt-1 text-sm font-semibold leading-relaxed text-white">
                    {trip.pickupLocation}
                  </p>
                </div>
              </div>

              {/* Destination */}

              <div className="flex gap-4 px-5 py-5 sm:px-6">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
                  <MapPin
                    className="size-4"
                    strokeWidth={1.75}
                  />
                </span>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                    Destination
                  </p>

                  <p className="mt-1 text-sm font-semibold leading-relaxed text-white">
                    {trip.destination}
                  </p>
                </div>
              </div>

              {/* Direction */}

              <div className="flex gap-4 px-5 py-5 sm:px-6">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                  <DirectionIcon
                    direction={trip.airportDirection}
                  />
                </span>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                    Airport direction
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {formatDirection(
                      trip.airportDirection,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Scheduled Details */}

          <section
            className={cn(
              cardBase,
              "p-5 sm:p-6",
            )}
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <CalendarDays
                className="size-4 text-[#a855f7]"
                strokeWidth={1.75}
              />
              Schedule details
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/[0.03] px-4 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                  Date
                </p>

                <p className="mt-2 text-sm font-semibold text-white">
                  {dayjs(trip.scheduledAt).format(
                    "dddd, D MMMM YYYY",
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] px-4 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                  Time
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <Clock3 className="size-4 text-white/40" />
                  {dayjs(trip.scheduledAt).format(
                    "h:mm A",
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] px-4 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                  Passengers
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <Users className="size-4 text-white/40" />
                  {trip.passengerCount}
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] px-4 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                  Trip type
                </p>

                <p className="mt-2 text-sm font-semibold text-white">
                  Airport trip
                </p>
              </div>
            </div>
          </section>

          {/* Special instructions */}

          <section
            className={cn(
              cardBase,
              "p-5 sm:p-6",
            )}
          >
            <h2 className="text-sm font-semibold text-white">
              Special instructions
            </h2>

            {trip.specialInstructions ? (
              <p className="mt-4 rounded-xl bg-white/[0.03] p-4 text-sm leading-7 text-white/65">
                {trip.specialInstructions}
              </p>
            ) : (
              <p className="mt-4 text-sm text-white/35">
                No special instructions were provided.
              </p>
            )}
          </section>
        </div>

        {/* ── Right ───────────────────────────────────────────────────── */}

        <div className="space-y-5 lg:col-span-5">
          {/* Passenger */}

          <section
            className={cn(
              cardBase,
              "overflow-hidden",
            )}
          >
            <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Users
                  className="size-4 text-[#a855f7]"
                  strokeWidth={1.75}
                />
                Passenger
              </h2>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8247E5] to-[#4c1d95] text-sm font-semibold text-white">
                  {getInitials(trip.fullname)}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    {trip.fullname}
                  </p>

                  <p className="mt-0.5 text-xs text-white/40">
                    Passenger
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <a
                  href={`mailto:${trip.email}`}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3.5 py-3 transition hover:bg-white/[0.06]"
                >
                  <Mail className="size-4 text-white/35" />

                  <span className="min-w-0 truncate text-sm text-white/70">
                    {trip.email}
                  </span>
                </a>

                <a
                  href={`tel:${trip.phoneNo}`}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3.5 py-3 transition hover:bg-white/[0.06]"
                >
                  <Phone className="size-4 text-white/35" />

                  <span className="text-sm text-white/70">
                    {trip.phoneNo}
                  </span>
                </a>
              </div>
            </div>
          </section>

          {/* Payment */}

          <section
            className={cn(
              cardBase,
              "p-5 sm:p-6",
            )}
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <CreditCard
                className="size-4 text-[#a855f7]"
                strokeWidth={1.75}
              />
              Payment
            </h2>

            <div className="mt-5 divide-y divide-white/[0.06]">
              <div className="flex items-center justify-between pb-4">
                <span className="text-xs text-white/40">
                  Method
                </span>

                <span className="text-sm font-semibold text-white">
                  {formatPaymentMethod(
                    trip.paymentMethod,
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-xs text-white/40">
                  Status
                </span>

                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    getPaymentStatusStyles(
                      trip.paymentStatus,
                    ),
                  )}
                >
                  {formatPaymentStatus(
                    trip.paymentStatus,
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-xs text-white/40">
                  Last updated
                </span>

                <span className="text-xs text-white/55">
                  {dayjs(trip.updatedAt).format(
                    "D MMM YYYY, h:mm A",
                  )}
                </span>
              </div>
            </div>
          </section>

          {/* Current status */}

          <section
            className={cn(
              cardBase,
              "p-5 sm:p-6",
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Current status
            </p>

            <div className="mt-3">
              <StatusPill status={trip.status} />
            </div>

            {statusChanged && (
              <p className="mt-3 text-xs leading-relaxed text-amber-300/70">
                You have selected{" "}
                <span className="font-semibold">
                  {formatStatus(selectedStatus!)}
                </span>
                . Click “Update status” to save the
                change.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}