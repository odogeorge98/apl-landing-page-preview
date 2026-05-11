"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { Filter, Plus, Search } from "lucide-react";

import { useDriversSummary, useDriversList } from "@/lib/hooks/users/drivers/use-drivers";
import { UsersListKpi } from "./UsersListKpi";
import { DriverStatusBadge, KycStatusText } from "./UserStatusBadge";
import { RowActionsMenu } from "./RowActionsMenu";
import { TablePaginationBar } from "./TablePaginationBar";
import AdminSelect from "@/components/ui/AdminSelect";
import type {
  DriverVerificationStatus,
  KycCompletionStatus,
  FindDriversFilter,
} from "@/lib/interfaces/users/drivers";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const tableCard =
  "overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format kobo → naira string */
function formatNaira(minor: number): string {
  if (minor === 0) return "₦ 0.00";
  return `₦ ${(minor / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Build display string for vehicle column */
function vehicleLabel(name: string | null, plate: string | null): string {
  if (name && plate) return `${name} · ${plate}`;
  return name ?? plate ?? "—";
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
          <td className="px-4 py-3.5"><div className="h-3.5 w-28 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-5 w-20 rounded-full bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-8 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-24 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-24 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-20 rounded bg-white/10" /></td>
          <td className="px-4 py-3.5 text-right">
            <div className="ml-auto h-7 w-7 rounded-lg bg-white/10" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Filter type ──────────────────────────────────────────────────────────────

type UiFilter = "all" | "active" | "pending" | "in_progress" | "rejected" | "kyc";

// ─── Main component ───────────────────────────────────────────────────────────

export default function DriversList() {
  const dateLine = dayjs().format("dddd, MMM D, YYYY");

  // ── Filter state ──────────────────────────────────────────────────────────
  const [uiFilter, setUiFilter] = useState<UiFilter>("all");

  // ── Search — raw input + debounced value ─────────────────────────────────
  const [searchQuery, setSearchQuery]       = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Cursor pagination ─────────────────────────────────────────────────────
  const [cursor, setCursor]             = useState<string | null>(null);
  const [cursorStack, setCursorStack]   = useState<(string | null)[]>([null]);
  const [rowsPerPage, setRowsPerPage]   = useState(PAGE_SIZE);

  // ── Debounce — resets cursor when search settles ──────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCursor(null);
      setCursorStack([null]);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Build API filter from UI state ────────────────────────────────────────
  const apiFilter = useMemo((): FindDriversFilter => {
    const base: FindDriversFilter = {
      cursor,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
    };

    switch (uiFilter) {
      case "active":      return { ...base, status: "VERIFIED" };
      case "pending":     return { ...base, status: "PENDING" };
      case "in_progress": return { ...base, status: "IN_PROGRESS" };
      case "rejected":    return { ...base, status: "REJECTED" };
      // "kyc" filters drivers who haven't completed any KYC step
      case "kyc":         return { ...base, kycStatus: "NOT_COMPLETED" };
      default:            return base;
    }
  }, [cursor, rowsPerPage, debouncedSearch, uiFilter]);

  // ── Queries ───────────────────────────────────────────────────────────────
  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useDriversSummary();

  const {
    data: listData,
    isLoading: listLoading,
    isFetching,
    isError: listError,
  } = useDriversList(apiFilter);

  // ── Derived data ──────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const d = summaryData?.data;
    return [
      { title: "Total Drivers",          value: d?.totalDrivers.toLocaleString()              ?? "—" },
      { title: "Active Drivers",          value: d?.activeDrivers.toLocaleString()             ?? "—" },
      { title: "Suspended",               value: d?.suspendedDrivers.toLocaleString()          ?? "—" },
      { title: "KYC Pending",             value: d?.pendingKycApprovals.toLocaleString()       ?? "—" },
      { title: "Pending Payouts",         value: d?.driversWithPendingPayouts.toLocaleString() ?? "—" },
    ];
  }, [summaryData]);

  const rows        = listData?.data.items ?? [];
  const nextCursor  = listData?.data.nextCursor ?? null;
  const canGoPrev   = cursorStack.length > 1;
  const canGoNext   = Boolean(nextCursor);

  // ── Pagination handlers ───────────────────────────────────────────────────
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
      const previous = updated[updated.length - 1] ?? null;
      setCursor(previous);
      return updated;
    });
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCursor(null);
    setCursorStack([null]);
  };

  const handleFilterChange = (value: string) => {
    setUiFilter(value as UiFilter);
    // Reset pagination whenever the filter changes
    setCursor(null);
    setCursorStack([null]);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-white/40">{dateLine}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Drivers
          </h1>
          <p className="mt-1 text-sm text-white/45">Manage all drivers</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#8247E5]/50 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#8247E5] hover:bg-[#8247E5]/10 sm:self-auto"
        >
          <Plus className="size-4" strokeWidth={2} />
          Add New Driver
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summaryLoading ? (
          Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : summaryError ? (
          <div className="col-span-full text-sm text-red-400">
            Failed to load driver metrics.
          </div>
        ) : (
          kpis.map((k) => (
            <UsersListKpi key={k.title} title={k.title} value={k.value} />
          ))
        )}
      </div>

      {/* Table card */}
      <div className={tableCard}>
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-white/[0.06] p-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="shrink-0 text-base font-semibold text-white">All Drivers</h2>

          <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3 lg:max-w-3xl lg:flex-1 lg:justify-end">
            {/* Search */}
            <div className="relative min-w-0 w-full flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                placeholder="Search driver name, phone, email…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-white/[0.07] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2"
                aria-label="Search drivers"
              />
            </div>

            {/* Filter */}
            <div className="w-full shrink-0 sm:w-[min(100%,220px)] sm:shrink-0">
              <AdminSelect
                icon={Filter}
                size="lg"
                options={[
                  { value: "all",         label: "All drivers"       },
                  { value: "active",      label: "Active (Verified)" },
                  { value: "pending",     label: "Pending"            },
                  { value: "in_progress", label: "In Progress"        },
                  { value: "rejected",    label: "Rejected"           },
                  { value: "kyc",         label: "KYC not started"    },
                ]}
                value={uiFilter}
                onValueChange={handleFilterChange}
                aria-label="Filter drivers"
              />
            </div>
          </div>
        </div>

        {/* Error state */}
        {listError && (
          <div className="px-6 py-12 text-center text-sm text-red-400">
            Failed to load drivers. Please try again.
          </div>
        )}

        {/* Table */}
        {!listError && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1020px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3 font-medium">Driver Name</th>
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Total Trips</th>
                  <th className="px-4 py-3 font-medium">Earnings</th>
                  <th className="px-4 py-3 font-medium">Last Active</th>
                  <th className="px-4 py-3 font-medium">KYC Status</th>
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
                      No drivers found.
                    </td>
                  </tr>
                ) : (
                  rows.map((driver) => (
                    <tr
                      key={driver.id}
                      className="text-white/85 transition hover:bg-white/[0.02]"
                    >
                      {/* Name + email */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {driver.imageUrl ? (
                            <Image
                              src={driver.imageUrl}
                              alt={driver.fullName}
                              width={36}
                              height={36}
                              className="size-9 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#92400e]" />
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/users/drivers/${driver.id}`}
                              className="font-semibold text-white hover:text-[#c4b5fd]"
                            >
                              {driver.fullName}
                            </Link>
                            <p className="truncate text-xs text-white/40">
                              {driver.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="px-4 py-3.5 text-white/75">
                        {vehicleLabel(driver.vehicleName, driver.vehiclePlate)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <DriverStatusBadge status={driver.status} />
                      </td>

                      {/* Total trips */}
                      <td className="px-4 py-3.5 tabular-nums">
                        {driver.totalTrips.toLocaleString()}
                      </td>

                      {/* Earnings */}
                      <td className="px-4 py-3.5 tabular-nums font-medium text-white">
                        {formatNaira(driver.earningsMinor)}
                      </td>

                      {/* Last active */}
                      <td className="px-4 py-3.5 text-white/65">
                        {driver.lastActiveAt
                          ? dayjs(driver.lastActiveAt).format("D MMM YYYY")
                          : "—"}
                      </td>

                      {/* KYC status */}
                      <td className="px-4 py-3.5">
                        <KycStatusText status={driver.kycStatus} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <RowActionsMenu
                          profileHref={`/dashboard/users/drivers/${driver.id}`}
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

      {/* Pagination — no total count since the API doesn't return one */}
      <TablePaginationBar
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