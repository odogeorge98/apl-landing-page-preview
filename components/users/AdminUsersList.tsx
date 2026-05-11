"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Filter, Plus, Search, Shield } from "lucide-react";

import {
  ADMIN_ROLE_OPTIONS,
  roleLabel,
  type AdminRole,
  type AdminUserStatus,
  type FindAdminFilter,
} from "@/lib/interfaces/admin/admin";

import type { AdminUser } from "@/lib/data/admin-users-mock";

import {
  useAdminSummary,
  useAdminList,
} from "@/lib/hooks/admin/use-admin";

import { UsersListKpi } from "./UsersListKpi";
import { TablePaginationBar } from "./TablePaginationBar";

import AdminSelect from "@/components/ui/AdminSelect";
import { Modal } from "@/components/ui/Modal";

import { cn } from "@/lib/utils";
import { showSuccess } from "@/lib/utils/error-handler";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const tableCard =
  "overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

const inputDark =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:ring-2 focus:ring-[#8247E5]/35";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AdminUserStatus }) {
  const styles: Record<AdminUserStatus, string> = {
    active: "bg-emerald-500/15 text-emerald-300",
    pending: "bg-amber-500/15 text-amber-200",
    expired: "bg-white/[0.08] text-white/45",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return <div className="h-[100px] animate-pulse rounded-2xl bg-white/5" />;
}

function RowSkeleton() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <tr key={`skeleton-${i}`} className="animate-pulse border-b border-white/[0.05]">
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="size-9 shrink-0 rounded-full bg-white/10" />
              <div className="h-3.5 w-28 rounded bg-white/10" />
            </div>
          </td>

          <td className="px-4 py-3.5">
            <div className="h-3 w-44 rounded bg-white/[0.07]" />
          </td>

          <td className="px-4 py-3.5">
            <div className="h-3 w-32 rounded bg-white/[0.07]" />
          </td>

          <td className="px-4 py-3.5">
            <div className="h-3.5 w-24 rounded bg-white/10" />
            <div className="mt-1.5 h-2.5 w-20 rounded bg-white/[0.06]" />
          </td>

          <td className="px-4 py-3.5">
            <div className="h-5 w-16 rounded-full bg-white/10" />
          </td>

          <td className="px-4 py-3.5">
            <div className="h-3 w-32 rounded bg-white/[0.07]" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Invite defaults ──────────────────────────────────────────────────────────

const emptyInvite = {
  name: "",
  email: "",
  phone: "",
  role: "user_admin" as AdminRole,
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminUsersList() {
  const dateLine = dayjs().format("dddd, MMM D, YYYY");

  // ── Filters ───────────────────────────────────────────────────────────────

  const [query, setQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ── Pagination ────────────────────────────────────────────────────────────

  const [cursor, setCursor] = useState<string | null>(null);

  const [cursorStack, setCursorStack] = useState<(string | null)[]>([
    null,
  ]);

  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);

  // ── Invite modal ──────────────────────────────────────────────────────────

  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState(emptyInvite);

  // ── Optimistic rows ───────────────────────────────────────────────────────

  const [optimisticInvites, setOptimisticInvites] = useState<
    AdminUser[]
  >([]);

  // ── Debounce search ───────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(query.trim());

      // reset pagination whenever search changes
      setCursor(null);
      setCursorStack([null]);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // ── API filter ────────────────────────────────────────────────────────────

  const apiFilter = useMemo<FindAdminFilter>(() => {
    return {
      cursor: cursor ?? undefined,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      role: roleFilter !== "all" ? roleFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    };
  }, [
    cursor,
    rowsPerPage,
    debouncedSearch,
    roleFilter,
    statusFilter,
  ]);

  // ── Queries ───────────────────────────────────────────────────────────────

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useAdminSummary();

  const {
    data: listData,
    isLoading: listLoading,
    isFetching,
    isError: listError,
  } = useAdminList(apiFilter);

  // ── Rows ──────────────────────────────────────────────────────────────────

  const apiRows = useMemo<AdminUser[]>(() => {
    return (listData?.items ?? []).map((item) => ({
      id: item.id,

      initials:
        item.initials ||
        (item.name ?? "")
          .split(" ")
          .filter(Boolean)
          .map((p: string) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),

      name: item.name ?? "",
      email: item.email ?? "",
      phone: item.phone ?? "",

      role: item.roleKey,

      status: item.status,

      dateLabel: item.activity ?? "",
    }));
  }, [listData]);

  const rows = useMemo(
    () => [...optimisticInvites, ...apiRows],
    [optimisticInvites, apiRows],
  );

  // ── Pagination data ───────────────────────────────────────────────────────

  const nextCursor = listData?.nextCursor ?? null;

  const canGoPrev = cursorStack.length > 1;
  const canGoNext = Boolean(nextCursor);

  // ── KPI cards ─────────────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const d = summaryData;

    return [
      {
        title: "Total",
        value: d ? String(d.total) : "—",
      },
      {
        title: "Active",
        value: d ? String(d.active) : "—",
      },
      {
        title: "Pending invite",
        value: d ? String(d.pendingInvite) : "—",
      },
      {
        title: "Expired",
        value: d ? String(d.expired) : "—",
      },
    ];
  }, [summaryData]);

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

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);

    setCursor(null);

    setCursorStack([null]);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);

    setCursor(null);

    setCursorStack([null]);
  };

  // ── Invite ────────────────────────────────────────────────────────────────

  const openInvite = () => {
    setInvite({
      ...emptyInvite,
      role: "user_admin",
    });

    setInviteOpen(true);
  };

  const submitInvite = (e: React.FormEvent) => {
    e.preventDefault();

    const name = invite.name.trim();
    const email = invite.email.trim();
    const phone = invite.phone.trim();

    if (!name || !email || !phone) return;

    const initials = name
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newRow: AdminUser = {
      id: `optimistic-${Date.now()}`,

      initials,

      name,
      email,
      phone,

      role: invite.role,

      status: "pending",

      dateLabel: `Invited ${dayjs().format("MMM D, YYYY")}`,
    };

    setOptimisticInvites((prev) => [newRow, ...prev]);

    setInviteOpen(false);

    setInvite(emptyInvite);

    showSuccess(
      "Invitation sent. User will appear as pending until they accept.",
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-white/40">{dateLine}</p>

          <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#8247E5]/20 text-[#c084fc] sm:size-10">
              <Shield className="size-5" strokeWidth={1.75} />
            </span>

            Admin users
          </h1>

          <p className="mt-1 text-sm text-white/45">
            Finance, station, support, and user admins · invite by email
          </p>
        </div>

        <button
          type="button"
          onClick={openInvite}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#8247E5]/50 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#8247E5] hover:bg-[#8247E5]/10 sm:self-auto"
        >
          <Plus className="size-4" strokeWidth={2} />
          Invite admin
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <KpiSkeleton key={`kpi-${i}`} />
          ))
        ) : summaryError ? (
          <div className="col-span-4 rounded-xl border border-dashed border-red-500/30 bg-red-500/5 px-6 py-6 text-center text-sm text-red-400">
            Failed to load admin metrics.
          </div>
        ) : (
          kpis.map((k) => (
            <UsersListKpi
              key={k.title}
              title={k.title}
              value={k.value}
            />
          ))
        )}
      </div>

      {/* Table */}
      <div className={tableCard}>
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2 className="shrink-0 text-base font-semibold text-white">
            Directory
          </h2>

          <div
            className="flex min-w-0 items-center gap-2 overflow-x-auto pb-0.5 sm:max-w-none sm:justify-end sm:overflow-visible sm:pb-0"
            role="search"
            aria-label="Directory search and filters"
          >
            {/* Search */}
            <div className="relative h-9 w-[152px] shrink-0 sm:w-[180px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />

              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, email..."
                className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.07] py-0 pl-8 pr-2 text-xs text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2"
                aria-label="Search admin users"
              />
            </div>

            {/* Role */}
            <div className="h-9 w-[140px] shrink-0 sm:w-[148px]">
              <AdminSelect
                icon={Filter}
                size="sm"
                triggerClassName="h-9 min-h-9 py-0 text-xs"
                options={[
                  {
                    value: "all",
                    label: "All roles",
                  },

                  ...ADMIN_ROLE_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  })),
                ]}
                value={roleFilter}
                onValueChange={handleRoleFilterChange}
                aria-label="Filter by role"
              />
            </div>

            {/* Status */}
            <div className="h-9 w-[128px] shrink-0 sm:w-[136px]">
              <AdminSelect
                size="sm"
                triggerClassName="h-9 min-h-9 py-0 text-xs"
                options={[
                  {
                    value: "all",
                    label: "All statuses",
                  },
                  {
                    value: "active",
                    label: "Active",
                  },
                  {
                    value: "pending",
                    label: "Pending",
                  },
                  {
                    value: "expired",
                    label: "Expired",
                  },
                ]}
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
                aria-label="Filter by status"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {listError && (
          <div className="px-6 py-12 text-center text-sm text-red-400">
            Failed to load admin users. Please try again.
          </div>
        )}

        {/* Table */}
        {!listError && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Activity</th>
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
                      No admin users found.
                    </td>
                  </tr>
                ) : (
                  rows.map((u, index) => (
                    <tr
                      key={`${u.id}-${index}`}
                      className="text-white/85 transition hover:bg-white/[0.02]"
                    >
                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8247E5] to-[#3b82f6] text-xs font-semibold text-white">
                            {u.initials || "AU"}
                          </div>

                          <span className="font-semibold text-white">
                            {u.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-white/70">
                        {u.email}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 tabular-nums text-white/70">
                        {u.phone}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <span className="text-white/80">
                          {roleLabel(u.role)}
                        </span>

                        <span className="mt-0.5 block font-mono text-[10px] text-white/35">
                          {u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={u.status} />
                      </td>

                      {/* Activity */}
                      <td className="px-4 py-3.5 text-xs text-white/45">
                        {u.dateLabel}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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

      {/* Invite modal */}
      <Modal
        open={inviteOpen}
        onOpenChange={(o) => {
          setInviteOpen(o);

          if (!o) {
            setInvite({
              ...emptyInvite,
              role: "user_admin",
            });
          }
        }}
        size="md"
        showCloseButton
        className="border border-white/[0.08] bg-[#161222] text-white sm:max-w-md [&>button]:text-white/70 [&>button]:hover:text-white"
        title="Invite admin user"
        description="Send an invitation with platform access. They will receive email instructions to complete setup."
        headerTitleCss="text-left text-lg font-semibold text-white"
        headerCss="text-left"
      >
        <form onSubmit={submitInvite} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="inv-name"
              className="text-xs font-medium text-white/60"
            >
              Full name
            </label>

            <input
              id="inv-name"
              required
              autoComplete="name"
              value={invite.name}
              onChange={(e) =>
                setInvite((s) => ({
                  ...s,
                  name: e.target.value,
                }))
              }
              placeholder="e.g. Adaora Nwosu"
              className={inputDark}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="inv-email"
              className="text-xs font-medium text-white/60"
            >
              Work email
            </label>

            <input
              id="inv-email"
              type="email"
              required
              autoComplete="email"
              value={invite.email}
              onChange={(e) =>
                setInvite((s) => ({
                  ...s,
                  email: e.target.value,
                }))
              }
              placeholder="name@company.com"
              className={inputDark}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="inv-phone"
              className="text-xs font-medium text-white/60"
            >
              Phone
            </label>

            <input
              id="inv-phone"
              type="tel"
              required
              autoComplete="tel"
              value={invite.phone}
              onChange={(e) =>
                setInvite((s) => ({
                  ...s,
                  phone: e.target.value,
                }))
              }
              placeholder="+234 801 234 5678"
              className={inputDark}
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-white/60">
              Admin role
            </span>

            <AdminSelect
              options={ADMIN_ROLE_OPTIONS}
              value={invite.role}
              onValueChange={(v) =>
                setInvite((s) => ({
                  ...s,
                  role: v as AdminRole,
                }))
              }
              aria-label="Admin role"
            />
          </div>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              className="rounded-xl border border-white/[0.12] bg-transparent px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.06]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#7c3aed]"
            >
              Send invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}