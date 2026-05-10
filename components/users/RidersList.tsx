"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { Filter, Plus, Search } from "lucide-react";

import { useRidersKpi, useRidersList } from "@/lib/hooks/users/riders/use-riders";
import { mapRidersKpi } from "@/lib/utils/dashboard/riders/mapKpi";
import { UsersListKpi } from "./UsersListKpi";
import { RiderStatusBadge } from "./UserStatusBadge";
import { RowActionsMenu } from "./RowActionsMenu";
import { TablePaginationBar } from "./TablePaginationBar";
import AdminSelect from "@/components/ui/AdminSelect";
import type { RiderStatusFilter } from "@/lib/interfaces/users/riders";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const tableCard =
  "overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalises the API status enum to the display string RiderStatusBadge expects.
 * Also handles the current API's boolean-derived format while the backend is
 * being updated.
 */
function normaliseStatus(
  status: string | undefined,
): "Active" | "Inactive" | "Pending Verification" | "Banned" {
  const map: Record<string, "Active" | "Inactive" | "Pending Verification" | "Banned"> = {
    ACTIVE:               "Active",
    INACTIVE:             "Inactive",
    PENDING_VERIFICATION: "Pending Verification",
    BANNED:               "Banned",
  };
  return map[status ?? ""] ?? "Inactive";
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return <div className="h-[120px] animate-pulse rounded-2xl bg-white/5" />;
}

function RowSkeleton() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-white/[0.05]">
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="size-9 shrink-0 rounded-full bg-white/10" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 rounded bg-white/10" />
                <div className="h-2.5 w-44 rounded bg-white/[0.06]" />
              </div>
            </div>
          </td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-32 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-5 w-16 rounded-full bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-10 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-24 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-24 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-8 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5 text-right"><div className="ml-auto h-7 w-7 rounded-lg bg-white/10" /></td>
        </tr>
      ))}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RidersList() {
  const dateLine = dayjs().format("dddd, MMM D, YYYY");

  // ── Filter state ─────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<"all" | RiderStatusFilter>("all");

  // ── Search — raw input bound to the field, debounced value sent to API ──
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Cursor pagination ────────────────────────────────────────────────────
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);

  // ── Debounce — resets cursor when search settles ─────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCursor(null);
      setCursorStack([null]);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: summaryData, isLoading: summaryLoading, isError: summaryError } =
    useRidersKpi();

  const {
    data: listData,
    isLoading: listLoading,
    isFetching,
    isError: listError,
  } = useRidersList({
    cursor,
    limit: rowsPerPage,
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  // ── KPI cards ────────────────────────────────────────────────────────────
  const ridersKpis = useMemo(
    () => (summaryData ? mapRidersKpi(summaryData.data) : []),
    [summaryData],
  );

  // ── Table rows ───────────────────────────────────────────────────────────
  const rows = useMemo(
    () => listData?.data.items ?? [],
    [listData],
  );

  // ── Pagination values ────────────────────────────────────────────────────
  const nextCursor   = listData?.data.nextCursor ?? null;
  const total        = listData?.data.total ?? 0;
  const currentPage  = cursorStack.length;
  const pageStart    = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const pageEnd      = total === 0 ? 0 : Math.min(pageStart + rows.length - 1, total);
  const canGoPrev    = cursorStack.length > 1;
  const canGoNext    = Boolean(nextCursor);

  // ── Pagination handlers ──────────────────────────────────────────────────
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
      const previousCursor = updated[updated.length - 1] ?? null;
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
    setStatusFilter(value as "all" | RiderStatusFilter);
    setCursor(null);
    setCursorStack([null]);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-white/40">{dateLine}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Riders
          </h1>
          <p className="mt-1 text-sm text-white/45">View and manage every rider</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#8247E5]/50 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#8247E5] hover:bg-[#8247E5]/10 sm:self-auto"
        >
          <Plus className="size-4" strokeWidth={2} />
          Add New User
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summaryLoading ? (
          Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : summaryError ? (
          <div className="col-span-full text-sm text-red-400">
            Failed to load rider metrics.
          </div>
        ) : (
          ridersKpis.map((card) => (
            <UsersListKpi key={card.title} title={card.title} value={card.value} />
          ))
        )}
      </div>

      {/* Table card */}
      <div className={tableCard}>
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-white/[0.06] p-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="shrink-0 text-base font-semibold text-white">All Users</h2>

          <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3 lg:max-w-3xl lg:flex-1 lg:justify-end">
            <div className="relative min-w-0 w-full flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                placeholder="Search rider name, phone, email…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-white/[0.07] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2"
                aria-label="Search riders"
              />
            </div>

            <div className="w-full shrink-0 sm:w-[min(100%,200px)] sm:shrink-0">
              <AdminSelect
                icon={Filter}
                size="lg"
                options={[
                  { value: "all",      label: "All statuses" },
                  { value: "active",   label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "pending",  label: "Pending Verification" },
                  { value: "banned",   label: "Banned" },
                ]}
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
                aria-label="Filter riders"
              />
            </div>
          </div>
        </div>

        {/* Error state */}
        {listError && (
          <div className="px-6 py-12 text-center text-sm text-red-400">
            Failed to load riders. Please try again.
          </div>
        )}

        {/* Table */}
        {!listError && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3 font-medium">Rider Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Total Rides</th>
                  <th className="px-4 py-3 font-medium">Last Ride</th>
                  <th className="px-4 py-3 font-medium">Join Date</th>
                  <th className="px-4 py-3 font-medium">Complaints</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.05]">
                {listLoading || isFetching ? (
                  <RowSkeleton />
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-sm text-white/40"
                    >
                      No riders found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="text-white/85 transition hover:bg-white/[0.02]"
                    >
                      {/* Name + email */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {row.imageUrl ? (
                            <Image
                              src={row.imageUrl}
                              alt={row.fullName}
                              width={36}
                              height={36}
                              className="size-9 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-[#8247E5] to-[#3b82f6]" />
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/users/riders/${row.id}`}
                              className="font-semibold text-white hover:text-[#c4b5fd]"
                            >
                              {row.fullName}
                            </Link>
                            <p className="truncate text-xs text-white/40">
                              {row.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 tabular-nums text-white/70">
                        {row.phoneNo}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <RiderStatusBadge status={normaliseStatus(row.status)} />
                      </td>

                      {/* Total rides — shows 0 until backend returns this field */}
                      <td className="px-4 py-3.5 tabular-nums">
                        {row.totalRides ?? 0}
                      </td>

                      {/* Last ride — shows "—" until backend returns this field */}
                      <td className="px-4 py-3.5 text-white/65">
                        {row.lastRide
                          ? dayjs(row.lastRide).format("DD MMM YYYY")
                          : "—"}
                      </td>

                      {/* Join date — falls back to createdAt */}
                      <td className="px-4 py-3.5 text-white/65">
                        {dayjs(row.joinDate ?? row.createdAt).format("DD MMM YYYY")}
                      </td>

                      {/* Complaints — shows 0 until backend returns this field */}
                      <td className="px-4 py-3.5 tabular-nums text-white/70">
                        {row.complaints ?? 0}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <RowActionsMenu
                          profileHref={`/dashboard/users/riders/${row.id}`}
                        />
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
  );
}