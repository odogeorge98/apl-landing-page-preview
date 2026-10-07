"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Filter,
  MapPin,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Search,
  Users,
  XCircle,
  X,
} from "lucide-react";

import { MainLayout } from "@/components/layout/dashboard";
import AdminSelect from "@/components/ui/AdminSelect";
import { TablePaginationBar } from "@/components/users/TablePaginationBar";

import { useScheduledTrips } from "@/lib/hooks/trips/scheduled-trips";

import {
  ScheduledTripStatus,
  type FindScheduledTripsFilter,
  type ScheduledTrip,
} from "@/lib/interfaces/trip/scheduled-trip";

import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const tableCard =
  "overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | ScheduledTripStatus;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatStatus(status: ScheduledTripStatus): string {
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

function getStatusClassName(status: ScheduledTripStatus): string {
  switch (status) {
    case ScheduledTripStatus.PENDING:
      return "bg-amber-400/10 text-amber-300 ring-1 ring-inset ring-amber-400/20";

    case ScheduledTripStatus.CONFIRMED:
      return "bg-sky-400/10 text-sky-300 ring-1 ring-inset ring-sky-400/20";

    case ScheduledTripStatus.ASSIGNED:
      return "bg-violet-400/10 text-violet-300 ring-1 ring-inset ring-violet-400/20";

    case ScheduledTripStatus.IN_PROGRESS:
      return "bg-blue-400/10 text-blue-300 ring-1 ring-inset ring-blue-400/20";

    case ScheduledTripStatus.COMPLETED:
      return "bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20";

    case ScheduledTripStatus.CANCELLED:
      return "bg-rose-400/10 text-rose-300 ring-1 ring-inset ring-rose-400/20";

    default:
      return "bg-white/[0.06] text-white/60 ring-1 ring-inset ring-white/[0.08]";
  }
}

function getStatusIcon(status: ScheduledTripStatus) {
  switch (status) {
    case ScheduledTripStatus.COMPLETED:
      return CheckCircle2;

    case ScheduledTripStatus.CANCELLED:
      return XCircle;

    case ScheduledTripStatus.IN_PROGRESS:
      return Plane;

    case ScheduledTripStatus.CONFIRMED:
    case ScheduledTripStatus.ASSIGNED:
      return CheckCircle2;

    case ScheduledTripStatus.PENDING:
    default:
      return Clock3;
  }
}

function formatPaymentStatus(value?: string | null): string {
  if (!value) return "—";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getPaymentStatusClassName(
  value?: string | null,
): string {
  const normalized = value?.toLowerCase();

  if (normalized === "paid") {
    return "text-emerald-300";
  }

  if (
    normalized === "failed" ||
    normalized === "cancelled" ||
    normalized === "refunded"
  ) {
    return "text-rose-300";
  }

  return "text-amber-300";
}

function formatAirportDirection(
  direction?: string | null,
): string {
  if (direction === "to_airport") {
    return "To airport";
  }

  if (direction === "from_airport") {
    return "From airport";
  }

  return "Airport trip";
}

function getDirectionIcon(direction?: string | null) {
  return direction === "from_airport"
    ? PlaneLanding
    : PlaneTakeoff;
}

function formatScheduledDate(value: string): string {
  return dayjs(value).format("D MMM YYYY");
}

function formatScheduledTime(value: string): string {
  return dayjs(value).format("h:mm A");
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <tr
          key={index}
          className="animate-pulse border-b border-white/[0.05]"
        >
          {/* ID */}
          <td className="px-4 py-4">
            <div className="h-4 w-20 rounded bg-white/10" />
          </td>

          {/* Passenger */}
          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="size-9 shrink-0 rounded-full bg-white/10" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-white/10" />
                <div className="h-2.5 w-36 rounded bg-white/[0.06]" />
              </div>
            </div>
          </td>

          {/* Route */}
          <td className="px-4 py-4">
            <div className="space-y-2">
              <div className="h-3.5 w-36 rounded bg-white/10" />
              <div className="h-3.5 w-32 rounded bg-white/[0.06]" />
            </div>
          </td>

          {/* Direction */}
          <td className="px-4 py-4">
            <div className="h-6 w-24 rounded-full bg-white/10" />
          </td>

          {/* Date */}
          <td className="px-4 py-4">
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 rounded bg-white/10" />
              <div className="h-2.5 w-16 rounded bg-white/[0.06]" />
            </div>
          </td>

          {/* Passengers */}
          <td className="px-4 py-4">
            <div className="h-4 w-10 rounded bg-white/10" />
          </td>

          {/* Status */}
          <td className="px-4 py-4">
            <div className="h-6 w-20 rounded-full bg-white/10" />
          </td>

          {/* Payment */}
          <td className="px-4 py-4">
            <div className="space-y-1.5">
              <div className="h-3.5 w-16 rounded bg-white/10" />
              <div className="h-2.5 w-14 rounded bg-white/[0.06]" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────

function StatusPill({
  status,
}: {
  status: ScheduledTripStatus;
}) {
  const Icon = getStatusIcon(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
        getStatusClassName(status),
      )}
    >
      <Icon className="size-3" strokeWidth={2} />
      {formatStatus(status)}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AirportTripsPage() {

  const router = useRouter();
  
  // ── Filter state ──────────────────────────────────────────────────────────

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  // ── Search ────────────────────────────────────────────────────────────────

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Cursor pagination ─────────────────────────────────────────────────────

  const [cursor, setCursor] = useState<string | null>(null);

  const [cursorStack, setCursorStack] = useState<
    (string | null)[]
  >([null]);

  const [rowsPerPage, setRowsPerPage] =
    useState(PAGE_SIZE);

  // ── Search debounce ───────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());

      // Search changes invalidate the current cursor.
      setCursor(null);
      setCursorStack([null]);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Build API filter ──────────────────────────────────────────────────────
  //
  // Only sends values that actually exist.
  // This prevents:
  //   search=
  //   status=
  //   cursor=
  //
  // from being sent to the backend.

  const apiFilter = useMemo((): FindScheduledTripsFilter => {
    return {
      ...(debouncedSearch
        ? { search: debouncedSearch }
        : {}),

      ...(statusFilter !== "all"
        ? { status: statusFilter }
        : {}),

      limit: rowsPerPage,

      ...(cursor
        ? { cursor }
        : {}),
    };
  }, [
    debouncedSearch,
    statusFilter,
    rowsPerPage,
    cursor,
  ]);

  // ── Query ─────────────────────────────────────────────────────────────────

  const {
    data: listResponse,
    isLoading: listLoading,
    isFetching,
    isError: listError,
  } = useScheduledTrips(apiFilter);

  // ── Rows ──────────────────────────────────────────────────────────────────

  const rows = useMemo<ScheduledTrip[]>(
    () => listResponse?.data.data ?? [],
    [listResponse],
  );

  // ── Pagination ────────────────────────────────────────────────────────────

  const nextCursor =
    listResponse?.data.nextCursor ?? null;

  const canGoPrev = cursorStack.length > 1;
  const canGoNext = Boolean(nextCursor);

  const handleNextPage = () => {
    if (!nextCursor || isFetching) {
      return;
    }

    setCursorStack((previous) => [
      ...previous,
      nextCursor,
    ]);

    setCursor(nextCursor);
  };

  const handlePrevPage = () => {
    if (!canGoPrev || isFetching) {
      return;
    }

    setCursorStack((previous) => {
      const updated = [...previous];

      updated.pop();

      const previousCursor =
        updated[updated.length - 1] ?? null;

      setCursor(previousCursor);

      return updated;
    });
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCursor(null);
    setCursorStack([null]);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setCursor(null);
    setCursorStack([null]);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-[1600px] space-y-8">
        {/* ── Page Header ──────────────────────────────────────────────── */}

        <div>
          <p className="text-xs text-white/40">
            Trips · Airport
          </p>

          <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#8247E5]/20 text-[#c084fc] sm:size-10">
              <Plane className="size-5" strokeWidth={1.75} />
            </span>

            Airport trips
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-white/45">
            Monitor and manage scheduled airport trips
            across the platform.
          </p>
        </div>

        {/* ── Main Table Card ──────────────────────────────────────────── */}

        <div className={tableCard}>
          {/* ── Toolbar ──────────────────────────────────────────────── */}

          <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-3 sm:gap-y-2">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="shrink-0 text-base font-semibold text-white">
                Scheduled airport trips
              </h2>

              {!listLoading && (
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/45">
                  {rows.length}
                </span>
              )}
            </div>

            <div className="flex w-full min-w-0 flex-1 flex-wrap items-center gap-2 sm:justify-end">
              {/* Search */}

              <div className="relative min-w-0 max-w-[280px] flex-1 sm:flex-initial">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35"
                  strokeWidth={1.8}
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search passenger, phone, email…"
                  className="w-full rounded-lg bg-white/[0.07] py-2 pl-8 pr-8 text-xs text-white outline-none ring-[#8247E5]/30 transition placeholder:text-white/35 focus:ring-2"
                  aria-label="Search airport trips"
                />

                {searchQuery ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-white/35 transition hover:bg-white/[0.06] hover:text-white/70"
                    aria-label="Clear search"
                  >
                    <X
                      className="size-3.5"
                      strokeWidth={2}
                    />
                  </button>
                ) : null}
              </div>

              {/* Status */}

              <div className="w-[min(100%,170px)] shrink-0 sm:w-[155px]">
                <AdminSelect
                  icon={Filter}
                  size="md"
                  options={[
                    {
                      value: "all",
                      label: "All statuses",
                    },
                    {
                      value: ScheduledTripStatus.PENDING,
                      label: "Pending",
                    },
                    {
                      value: ScheduledTripStatus.CONFIRMED,
                      label: "Confirmed",
                    },
                    {
                      value: ScheduledTripStatus.ASSIGNED,
                      label: "Assigned",
                    },
                    {
                      value: ScheduledTripStatus.IN_PROGRESS,
                      label: "In progress",
                    },
                    {
                      value: ScheduledTripStatus.COMPLETED,
                      label: "Completed",
                    },
                    {
                      value: ScheduledTripStatus.CANCELLED,
                      label: "Cancelled",
                    },
                  ]}
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                  aria-label="Filter airport trips by status"
                />
              </div>
            </div>
          </div>

          {/* ── Error State ──────────────────────────────────────────── */}

          {listError ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-rose-400/10 text-rose-300">
                <XCircle
                  className="size-5"
                  strokeWidth={1.75}
                />
              </div>

              <p className="mt-4 text-sm font-medium text-white">
                Unable to load airport trips
              </p>

              <p className="mt-1 text-xs text-white/40">
                Please try again or adjust your filters.
              </p>
            </div>
          ) : (
            <>
              {/* ── Table ───────────────────────────────────────────── */}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      <th className="px-4 py-3 font-medium">
                        Trip ID
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Passenger
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Route
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Direction
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Scheduled
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Passengers
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Status
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Payment
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.05]">
                    {listLoading || isFetching ? (
                      <RowSkeleton />
                    ) : rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-16 text-center"
                        >
                          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-white/[0.05] text-white/35">
                            <Plane
                              className="size-5"
                              strokeWidth={1.75}
                            />
                          </div>

                          <p className="mt-4 text-sm font-medium text-white/75">
                            No airport trips found
                          </p>

                          <p className="mt-1 text-xs text-white/35">
                            Try changing your search or status
                            filter.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      rows.map((trip) => {
                        const DirectionIcon =
                          getDirectionIcon(
                            trip.airportDirection,
                          );

                        return (
                          <tr
                            key={trip._id}
                            role="link"
                            tabIndex={0}
                            onClick={() =>
                                router.push(
                                `/dashboard/trips/airport-trips/${trip._id}`,
                                )
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();

                                router.push(
                                    `/dashboard/trips/airport-trips/${trip._id}`,
                                );
                                }
                            }}
                            className="cursor-pointer text-white/85 transition hover:bg-white/[0.03] focus-visible:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#8247E5]"
                          >
                            {/* Trip ID */}

                            <td className="px-4 py-4">
                              <span className="font-mono text-xs font-medium tabular-nums text-[#c4b5fd]">
                                {trip._id.slice(0, 8).toUpperCase()}
                              </span>
                            </td>

                            {/* Add to buttons if later added */}
                            {/* onClick={(event) => {
                              event.stopPropagation();
                            }} */}

                            {/* Passenger */}

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8247E5] to-[#4c1d95] text-[11px] font-semibold text-white">
                                  {getInitials(
                                    trip.fullname,
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-white">
                                    {trip.fullname}
                                  </p>

                                  <p className="truncate text-xs text-white/40">
                                    {trip.email}
                                  </p>

                                  <p className="mt-0.5 truncate text-[11px] text-white/30">
                                    {trip.phoneNo}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Route */}

                            <td className="px-4 py-4">
                              <div className="min-w-[230px]">
                                <div className="flex items-start gap-2">
                                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#a855f7]" />

                                  <div className="min-w-0">
                                    <p
                                      title={
                                        trip.pickupLocation
                                      }
                                      className="truncate text-xs font-medium text-white/85"
                                    >
                                      {trip.pickupLocation}
                                    </p>
                                  </div>
                                </div>

                                <div className="ml-[7px] h-3 border-l border-dashed border-white/15" />

                                <div className="flex items-start gap-2">
                                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#00d7c4]" />

                                  <div className="min-w-0">
                                    <p
                                      title={
                                        trip.destination
                                      }
                                      className="truncate text-xs font-medium text-white/65"
                                    >
                                      {trip.destination}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Airport Direction */}

                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-white/65 ring-1 ring-inset ring-white/[0.06]">
                                <DirectionIcon
                                  className="size-3.5 text-[#c084fc]"
                                  strokeWidth={1.8}
                                />

                                {formatAirportDirection(
                                  trip.airportDirection,
                                )}
                              </span>
                            </td>

                            {/* Scheduled Date / Time */}

                            <td className="px-4 py-4">
                              <div className="flex items-start gap-2.5">
                                <CalendarDays className="mt-0.5 size-4 shrink-0 text-white/30" />

                                <div className="min-w-0">
                                  <p className="whitespace-nowrap text-xs font-medium text-white/80">
                                    {formatScheduledDate(
                                      trip.scheduledAt,
                                    )}
                                  </p>

                                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/40">
                                    <Clock3 className="size-3" />

                                    {formatScheduledTime(
                                      trip.scheduledAt,
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Passenger Count */}

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1.5 text-white/65">
                                <Users
                                  className="size-3.5 text-white/35"
                                  strokeWidth={1.8}
                                />

                                <span className="tabular-nums text-xs">
                                  {trip.passengerCount}
                                </span>
                              </div>
                            </td>

                            {/* Status */}

                            <td className="px-4 py-4">
                              <StatusPill
                                status={trip.status}
                              />
                            </td>

                            {/* Payment */}

                            <td className="px-4 py-4">
                              <div className="flex items-start gap-2">
                                <CreditCard className="mt-0.5 size-3.5 shrink-0 text-white/30" />

                                <div>
                                  <p className="text-xs font-medium capitalize text-white/70">
                                    {formatPaymentStatus(
                                      trip.paymentMethod,
                                    )}
                                  </p>

                                  <p
                                    className={cn(
                                      "mt-0.5 text-[11px] font-medium",
                                      getPaymentStatusClassName(
                                        trip.paymentStatus,
                                      ),
                                    )}
                                  >
                                    {formatPaymentStatus(
                                      trip.paymentStatus,
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ───────────────────────────────────────── */}

              <TablePaginationBar
                rowsPerPage={rowsPerPage}
                canGoNext={canGoNext}
                canGoPrev={canGoPrev}
                isLoading={isFetching}
                onNext={handleNextPage}
                onPrev={handlePrevPage}
                onRowsPerPageChange={
                  handleRowsPerPageChange
                }
                className="border-t border-white/[0.06]"
              />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}