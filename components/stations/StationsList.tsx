"use client";

import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import {
  ArrowUpRight,
  Filter,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react";

import {
  type StationSegment,
  SEGMENT_TO_SOURCE,
} from "@/lib/data/stations-mock";

import {
  useStationsList,
  useStationsSummary,
} from "@/lib/hooks/stations/useStations";

import { TablePaginationBar } from "@/components/users/TablePaginationBar";
import AdminSelect from "@/components/ui/AdminSelect";

import { cn } from "@/lib/utils";

import type { StationListItem } from "@/lib/interfaces/stations";

// ────────────────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────────────────

const tableCard =
  "overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

const kpiCard =
  "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

// ────────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────────

function StationTypeText({ label }: { label: string }) {
  const isEv = label === "EV Station";

  return (
    <span
      className={cn(
        "text-sm font-semibold",
        isEv ? "text-[#7dd3fc]" : "text-[#5eead4]",
      )}
    >
      {label}
    </span>
  );
}

function StatusPill({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        isActive
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-white/[0.08] text-white/45",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// KPI Skeleton
// ────────────────────────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={cn(kpiCard, "animate-pulse")}>
          <div className="mb-6 h-3 w-24 rounded bg-white/10" />
          <div className="h-7 w-16 rounded bg-white/10" />
        </div>
      ))}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Row Skeleton
// ────────────────────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-white/[0.05]">
          <td className="px-4 py-4">
            <div className="h-3.5 w-36 rounded bg-white/10" />
            <div className="mt-2 h-2.5 w-52 rounded bg-white/[0.06]" />
          </td>

          <td className="px-4 py-4">
            <div className="h-3.5 w-20 rounded bg-white/10" />
          </td>

          <td className="px-4 py-4">
            <div className="h-3.5 w-28 rounded bg-white/10" />
          </td>

          <td className="px-4 py-4">
            <div className="h-5 w-16 rounded-full bg-white/10" />
          </td>

          <td className="px-4 py-4">
            <div className="h-3.5 w-20 rounded bg-white/10" />
          </td>

          <td className="px-4 py-4 text-right">
            <div className="ml-auto h-7 w-7 rounded-lg bg-white/10" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────────────────

export default function StationsList({
  segment,
}: {
  segment: StationSegment;
}) {
  const dateLine = dayjs().format("dddd, MMM D, YYYY");

  const [statusFilter, setStatusFilter] = useState("all");
  // `searchQuery`    → bound to the input (updates on every keystroke)
  // `debouncedSearch` → what actually goes to the API (fires 400ms after typing stops)

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim();

      // Only reset cursor + fire query when the debounced value actually changes
      setDebouncedSearch(trimmed);
      setCursor(null);
      setCursorStack([null]);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ────────────────────────────────────────────────────────────────────────────
  // Cursor Pagination State
  // ────────────────────────────────────────────────────────────────────────────

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [cursor, setCursor] = useState<string | null>(null);

  /**
   * Keeps track of visited cursors for backward navigation.
   *
   * Example:
   * [null, "cursor_1", "cursor_2"]
   */
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([
    null,
  ]);

  // ────────────────────────────────────────────────────────────────────────────
  // Queries
  // ────────────────────────────────────────────────────────────────────────────

  const stationType = SEGMENT_TO_SOURCE[segment];
  const {
    data: summaryData,
    isLoading: summaryLoading,
  } = useStationsSummary();

  const {
    data: listData,
    isLoading: listLoading,
    isFetching,
    isError: listError,
  } = useStationsList({
    cursor,
    limit: rowsPerPage,
    stationType,
    search: debouncedSearch || undefined,
    status:
      statusFilter === "all"
        ? undefined
        : statusFilter === "active",
  });
  // ────────────────────────────────────────────────────────────────────────────
  // KPI Data
  // ────────────────────────────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const d = summaryData?.data;

    return [
      {
        title: "Total Stations",
        value: d?.totalStations.toLocaleString() ?? "—",
      },
      {
        title: "Active Stations",
        value: d?.activeStations.toLocaleString() ?? "—",
      },
      {
        title: "Inactive Stations",
        value: d?.inactiveStations.toLocaleString() ?? "—",
      },
      {
        title: "CNG Stations",
        value: d?.cngStations.toLocaleString() ?? "—",
      },
      {
        title: "EV Charging Stations",
        value: d?.evChargingStations.toLocaleString() ?? "—",
      },
    ];
  }, [summaryData]);

  // ────────────────────────────────────────────────────────────────────────────
  // Filtered Rows
  // ────────────────────────────────────────────────────────────────────────────

  const rows = useMemo<StationListItem[]>(() => {
    return listData?.data.items ?? [];
  }, [listData]);

  // ────────────────────────────────────────────────────────────────────────────
  // Pagination Values
  // ────────────────────────────────────────────────────────────────────────────

  const nextCursor = listData?.data.nextCursor ?? null;

  const total = listData?.data.total ?? 0;

  const currentPage = cursorStack.length;

  const pageStart =
    total === 0
      ? 0
      : (currentPage - 1) * rowsPerPage + 1;

  const pageEnd =
    total === 0
      ? 0
      : Math.min(
          pageStart + rows.length - 1,
          total,
        );

  const canGoPrev = cursorStack.length > 1;

  const canGoNext = Boolean(nextCursor);

  // ────────────────────────────────────────────────────────────────────────────
  // Pagination Actions
  // ────────────────────────────────────────────────────────────────────────────

  const handleNextPage = () => {
    if (!nextCursor || isFetching) return;

    setCursorStack((prev) => [...prev, nextCursor]);

    setCursor(nextCursor);
  };

  const handlePrevPage = () => {
    if (!canGoPrev || isFetching) return;

    setCursorStack((prev) => {
      const updated = [...prev];

      updated.pop();

      const previousCursor =
        updated[updated.length - 1] ?? null;

      setCursor(previousCursor);

      return updated;
    });
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);

    // reset pagination
    setCursor(null);

    setCursorStack([null]);
  };
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);

    // reset pagination
    setCursor(null);
    setCursorStack([null]);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-white/40">{dateLine}</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Stations
          </h1>

          <p className="mt-1 text-sm text-white/45">
            Manage old and new stations
          </p>
        </div>

        <Link
          href="/dashboard/stations/new"
          className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-white/[0.12] bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.04] sm:self-auto"
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.04]">
            <Plus className="size-4" strokeWidth={2} />
          </span>

          Add New Station
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summaryLoading ? (
          <KpiSkeleton />
        ) : (
          kpis.map((k) => (
            <div key={k.title} className={kpiCard}>
              <div className="mb-6 flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-white/50">
                  {k.title}
                </span>

                <ArrowUpRight
                  className="size-3.5 text-white/25"
                  strokeWidth={1.75}
                />
              </div>

              <p className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">
                {k.value}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className={tableCard}>
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-white/[0.06] p-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="shrink-0 text-base font-semibold text-white">
              All Stations
            </h2>

            <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3 lg:max-w-3xl lg:flex-1 lg:justify-end">
              <div className="relative min-w-0 w-full flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />

                <input
                  type="search"
                  placeholder="Search station name, address…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.07] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2"
                  aria-label="Search stations"
                />
              </div>

              <div className="w-full shrink-0 sm:w-[min(100%,200px)]">
                <AdminSelect
                  icon={Filter}
                  size="lg"
                  options={[
                    { value: "all", label: "All" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                  aria-label="Filter by status"
                />
              </div>
            </div>
          </div>

          {/* Error State */}
          {listError && (
            <div className="px-6 py-12 text-center text-sm text-red-400">
              Failed to load stations. Please try again.
            </div>
          )}

          {/* Table */}
          {!listError && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                    <th className="px-4 py-3 font-medium">
                      Station Name
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Station Type
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Location
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Last Updated
                    </th>

                    <th className="px-4 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.05]">
                  {listLoading || isFetching ? (
                    <RowSkeleton />
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-sm text-white/40"
                      >
                        No stations found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={row.id}
                        className="text-white/85 transition hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-4">
                          <p className="font-semibold text-white">
                            {row.name}
                          </p>

                          <p className="mt-1 max-w-[280px] truncate text-xs leading-relaxed text-white/40">
                            {row.address !== "Address not provided"
                              ? row.address
                              : row.location}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <StationTypeText
                            label={row.stationType}
                          />
                        </td>

                        <td className="px-4 py-4 text-white/75">
                          {row.location}
                        </td>

                        <td className="px-4 py-4">
                          <StatusPill
                            isActive={row.isActive}
                          />
                        </td>

                        <td className="px-4 py-4 tabular-nums text-white/65">
                          {dayjs(row.updatedAt).format(
                            "MM-DD-YY",
                          )}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            className="inline-flex rounded-lg p-2 text-white/45 hover:bg-white/[0.08] hover:text-white"
                            aria-label="Row actions"
                          >
                            <MoreVertical className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <TablePaginationBar
          pageStart={pageStart}
          pageEnd={pageEnd}
          total={total}
          rowsPerPage={rowsPerPage}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
          isLoading={isFetching}
          onNext={handleNextPage}
          onPrev={handlePrevPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
        />
      </div>
    </div>
  );
}