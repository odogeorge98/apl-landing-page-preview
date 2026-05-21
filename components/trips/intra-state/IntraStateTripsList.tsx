"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import {
  Car,
  CheckCircle2,
  ChevronDown,
  Clock,
  Search,
  ShipWheel,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useTripsSummary, useTripsList } from "@/lib/hooks/trips/use-trips";
import type {
  FindTripsFilter,
  TripDisplayStatus,
  TripFilterStatus,
} from "@/lib/interfaces/trip";
import { TablePaginationBar } from "@/components/users/TablePaginationBar";
import { cn } from "@/lib/utils";
import AdminSelect from "@/components/ui/AdminSelect";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const tableCard =
  "overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

// ─── Status normalisation ─────────────────────────────────────────────────────
// Mirrors TripsList exactly — handles all compound backend status variants.

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
  return "Active";
}

function formatFare(fare: string): string {
  const num = parseFloat(fare);
  if (isNaN(num)) return fare;
  return `₦ ${num.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── KPI icon map ─────────────────────────────────────────────────────────────

const kpiIconMap: Record<string, LucideIcon> = {
  ongoing:   Car,
  completed: CheckCircle2,
  cancelled: X,
  scheduled: Clock,
  total:     ShipWheel,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TripKpiCard({
  title,
  value,
  kpiKey,
}: {
  title: string;
  value: string;
  kpiKey: string;
}) {
  const Icon = kpiIconMap[kpiKey] ?? Car;
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl text-[#a855f7]">
          <Icon className="size-4" strokeWidth={1.75} />
        </div>
        <span className="p-1 text-white/25 transition group-hover:text-[#00d7c4]/80">
          <ChevronDown className="size-3.5 -rotate-45" />
        </span>
      </div>
      <p className="text-xs font-medium leading-tight text-white/50">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white lg:text-[28px]">
        {value}
      </p>
    </div>
  );
}

function TripStatusPill({ status }: { status: TripDisplayStatus }) {
  const styles: Record<TripDisplayStatus, string> = {
    Active:    "bg-teal-500/15 text-teal-300",
    Completed: "bg-emerald-500/15 text-emerald-400",
    Cancelled: "bg-white/10 text-white/50",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        styles[status],
      )}
    >
      {status === "Active" && (
        <span className="size-1.5 rounded-full bg-teal-400" />
      )}
      {status}
    </span>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
      <div className="mb-3 h-9 w-9 rounded-xl bg-white/10" />
      <div className="h-3 w-24 rounded bg-white/10" />
      <div className="mt-2 h-7 w-16 rounded bg-white/[0.07]" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-white/[0.05]">
          <td className="px-4 py-3.5">
            <div className="h-4 w-24 rounded bg-white/10 font-mono" />
          </td>
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-white/10" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-white/10" />
                <div className="h-2.5 w-36 rounded bg-white/[0.06]" />
              </div>
            </div>
          </td>
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-white/10" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-white/10" />
                <div className="h-2.5 w-32 rounded bg-white/[0.06]" />
              </div>
            </div>
          </td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-20 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-5 w-20 rounded-full bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-20 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-20 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-28 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5 text-right">
            <div className="ml-auto h-4 w-20 rounded bg-white/10" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function IntraStateTripsList() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [tripFilter, setTripFilter] = useState("all");

  // ── Search ────────────────────────────────────────────────────────────────
  const [searchQuery,     setSearchQuery]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Cursor pagination ─────────────────────────────────────────────────────
  const [cursor,      setCursor]      = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);

  // ── Debounce — resets cursor when search settles ──────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCursor(null);
      setCursorStack([null]);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Build API filter ──────────────────────────────────────────────────────
  const apiFilter = useMemo((): FindTripsFilter => {
    const statusMap: Record<string, TripFilterStatus> = {
      active:    "ACTIVE",
      completed: "COMPLETED",
      cancelled: "CANCELLED",
    };

    return {
      cursor,
      limit:  rowsPerPage,
      search: debouncedSearch || undefined,
      ...(tripFilter !== "all" ? { status: statusMap[tripFilter] } : {}),
    };
  }, [cursor, rowsPerPage, debouncedSearch, tripFilter]);

  // ── Queries ───────────────────────────────────────────────────────────────
  const {
    data:      summaryResponse,
    isLoading: summaryLoading,
  } = useTripsSummary();

  const {
    data:      listResponse,
    isLoading: listLoading,
    isFetching,
    isError:   listError,
  } = useTripsList(apiFilter);

  // ── KPI cards ─────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const d = summaryResponse?.data;
    return [
      { key: "ongoing",   title: "Ongoing trips", value: d?.ongoingTrips.toLocaleString()   ?? "—" },
      { key: "completed", title: "Completed",      value: d?.completedTrips.toLocaleString() ?? "—" },
      { key: "cancelled", title: "Cancelled",      value: d?.cancelledTrips.toLocaleString() ?? "—" },
      { key: "scheduled", title: "Scheduled",      value: d?.scheduledTrips.toLocaleString() ?? "—" },
      { key: "total",     title: "Total trips",    value: d?.totalTrips.toLocaleString()     ?? "—" },
    ];
  }, [summaryResponse]);

  // ── Rows ──────────────────────────────────────────────────────────────────
  const rows = useMemo(() => listResponse?.data.items ?? [], [listResponse]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const nextCursor = listResponse?.data.nextCursor ?? null;
  const canGoPrev  = cursorStack.length > 1;
  const canGoNext  = Boolean(nextCursor);

  const handleNextPage = () => {
    if (!nextCursor || isFetching) return;
    setCursorStack((prev) => [...prev, nextCursor]);
    setCursor(nextCursor);
  };

  const handlePrevPage = () => {
    if (!canGoPrev || isFetching) return;
    setCursorStack((prev) => {
      const updated   = [...prev];
      updated.pop();
      const previous  = updated[updated.length - 1] ?? null;
      setCursor(previous);
      return updated;
    });
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCursor(null);
    setCursorStack([null]);
  };

  // Also reset cursor when status filter changes
  const handleTripFilterChange = (value: string) => {
    setTripFilter(value);
    setCursor(null);
    setCursorStack([null]);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summaryLoading
          ? Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((k) => (
              <TripKpiCard
                key={k.key}
                kpiKey={k.key}
                title={k.title}
                value={k.value}
              />
            ))}
      </div>

      <div className={tableCard}>
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-3 sm:gap-y-2">
          <h2 className="shrink-0 text-base font-semibold text-white">
            All Intra-State Trips
          </h2>

          <div className="flex w-full min-w-0 flex-1 flex-wrap items-center gap-2 sm:justify-end">
            {/* Search */}
            <div className="relative min-w-0 max-w-[260px] flex-1 sm:flex-initial sm:max-w-[280px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, names…"
                className="w-full rounded-lg bg-white/[0.07] py-2 pl-8 pr-2.5 text-xs text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2"
                aria-label="Search trips"
              />
            </div>

            {/* Status filter — connected to backend */}
            <div className="w-[min(100%,150px)] shrink-0 sm:w-[140px]">
              <AdminSelect
                size="md"
                options={[
                  { value: "all",       label: "All statuses" },
                  { value: "active",    label: "Active"       },
                  { value: "completed", label: "Completed"    },
                  { value: "cancelled", label: "Cancelled"    },
                ]}
                value={tripFilter}
                onValueChange={handleTripFilterChange}
                aria-label="Filter trips by status"
              />
            </div>
          </div>
        </div>

        {/* Error state */}
        {listError && (
          <div className="px-6 py-12 text-center text-sm text-red-400">
            Failed to load trips. Please try again.
          </div>
        )}

        {/* Table */}
        {!listError && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3 font-medium">Trip ID</th>
                  <th className="px-4 py-3 font-medium">Passenger</th>
                  <th className="px-4 py-3 font-medium">Driver</th>
                  <th className="px-4 py-3 font-medium">Trip Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Fare</th>
                  <th className="px-4 py-3 font-medium">Date &amp; Time</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.05]">
                {listLoading || isFetching ? (
                  <RowSkeleton />
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-12 text-center text-sm text-white/40"
                    >
                      No trips found.
                    </td>
                  </tr>
                ) : (
                  rows.map((trip) => (
                    <tr
                      key={trip.id}
                      className="text-white/85 transition hover:bg-white/[0.02]"
                    >
                      {/* Trip ID */}
                      <td className="px-4 py-3.5 font-mono text-sm tabular-nums text-white">
                        {trip.id.slice(0, 8).toUpperCase()}
                      </td>

                      {/* Passenger */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {trip.passenger.imageUrl ? (
                            <Image
                              src={trip.passenger.imageUrl}
                              alt={trip.passenger.fullName}
                              width={36}
                              height={36}
                              className="size-9 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-[#8247E5] to-[#3b82f6]" />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-white">
                              {trip.passenger.fullName}
                            </p>
                            <p className="truncate text-xs text-white/40">
                              {trip.passenger.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Driver — nullable for cancelled trips */}
                      <td className="px-4 py-3.5">
                        {trip.driver ? (
                          <div className="flex items-center gap-3">
                            {trip.driver.imageUrl ? (
                              <Image
                                src={trip.driver.imageUrl}
                                alt={trip.driver.fullName}
                                width={36}
                                height={36}
                                className="size-9 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-700" />
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-white">
                                {trip.driver.fullName}
                              </p>
                              <p className="truncate text-xs text-white/40">
                                {trip.driver.email}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="size-9 shrink-0 rounded-full bg-white/[0.06]" />
                            <span className="text-sm italic text-white/30">
                              Unassigned
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Trip type */}
                      <td className="px-4 py-3.5 text-white/75">{trip.tripType}</td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <TripStatusPill status={normaliseStatus(trip.status)} />
                      </td>

                      {/* Payment type */}
                      <td className="px-4 py-3.5 capitalize text-white/70">
                        {trip.paymentType.charAt(0) +
                          trip.paymentType.slice(1).toLowerCase()}
                      </td>

                      {/* Fare */}
                      <td className="px-4 py-3.5 tabular-nums font-medium text-white">
                        {formatFare(trip.fare)}
                      </td>

                      {/* Date & time */}
                      <td className="px-4 py-3.5 tabular-nums text-white/65">
                        {dayjs(trip.createdAt).format("D MMM YYYY, h:mm A")}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/dashboard/trips/${trip.id}`}
                          className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-[#00d7c4] underline-offset-4 transition hover:text-[#5eead4] hover:underline"
                        >
                          View details →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <TablePaginationBar
          rowsPerPage={rowsPerPage}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
          isLoading={isFetching}
          onNext={handleNextPage}
          onPrev={handlePrevPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          className="border-t border-white/[0.06]"
        />
      </div>
    </div>
  );
}