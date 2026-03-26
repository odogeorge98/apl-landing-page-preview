"use client";

import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Inbox,
  MoreVertical,
} from "lucide-react";
import { MainLayout } from "@/components/layout/dashboard";
import Modals from "@/components/ui/dashboard/modals";
import { notificationsData } from "@/lib/data";
import { cn } from "@/lib/utils";
import AdminSelect from "@/components/ui/AdminSelect";

const cardBase =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

const typeFilterOptions = ["All Type", "Lead", "System", "Meeting", "Agent", "Team"].map((o) => ({
  value: o,
  label: o,
}));
const statusFilterOptions = ["All Status", "Unread", "Read"].map((o) => ({ value: o, label: o }));
const perPageOptions = [10, 25, 50].map((n) => ({ value: String(n), label: String(n) }));

type NotificationRow = (typeof notificationsData)[number];

function TypePill({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Lead: "bg-[#a855f7]/18 text-[#e9d5ff]",
    System: "bg-[#22d3ee]/14 text-[#a5f3fc]",
    Meeting: "bg-sky-500/15 text-sky-200",
    Agent: "bg-fuchsia-500/14 text-fuchsia-200",
    Team: "bg-white/[0.08] text-white/65",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        styles[type] ?? "bg-white/10 text-white/55",
      )}
    >
      {type}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const unread = status === "Unread";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        unread
          ? "bg-amber-500/18 text-amber-200"
          : "bg-white/[0.06] text-white/45",
      )}
    >
      {status}
    </span>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06]",
        "bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.22)]",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-[#8247E5]/15 text-[#c084fc]">
          <Icon className="size-4" strokeWidth={1.75} />
        </div>
      </div>
      <p className="text-xs font-medium text-white/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-white">{value}</p>
      {hint ? <p className="mt-1.5 text-[11px] text-white/35">{hint}</p> : null}
    </div>
  );
}

export default function NotificationsPage() {
  const [selectedType, setSelectedType] = useState("All Type");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [menuForId, setMenuForId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<NotificationRow | null>(null);
  const [notifications, setNotifications] = useState<NotificationRow[]>(notificationsData);

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => n.status === "Unread").length;
    const urgent = notifications.filter(
      (n) =>
        n.status === "Unread" &&
        (n.type === "System" ||
          /failed|expir/i.test(n.message)),
    ).length;
    const system = notifications.filter((n) => n.type === "System").length;
    return { total, unread, urgent, system };
  }, [notifications]);

  const filtered = useMemo(
    () =>
      notifications.filter((item) => {
        const typeOk = selectedType === "All Type" || item.type === selectedType;
        const statusOk = selectedStatus === "All Status" || item.status === selectedStatus;
        return typeOk && statusOk;
      }),
    [notifications, selectedType, selectedStatus],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);
  const startCount = filtered.length === 0 ? 0 : start + 1;
  const endCount = Math.min(start + itemsPerPage, filtered.length);

  const openDetails = (row: NotificationRow) => {
    setSelected(row);
    setDetailOpen(true);
    setMenuForId(null);
  };

  const markSelectedRead = () => {
    if (!selected) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === selected.id ? { ...n, status: "Read" } : n)),
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "Read" as const })));
  };

  useEffect(() => {
    if (!menuForId) return;
    const close = () => setMenuForId(null);
    const t = window.setTimeout(() => document.addEventListener("click", close), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", close);
    };
  }, [menuForId]);

  const dateLine = dayjs().format("dddd, MMM D, YYYY");

  return (
    <MainLayout>
      <div className="mx-auto max-w-[1600px] space-y-6 pb-10 sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-white/40">{dateLine}</p>
            <h1 className="mt-1 flex items-center gap-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#8247E5]/20 text-[#c084fc]">
                <Bell className="size-5" strokeWidth={1.75} />
              </span>
              Notifications
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/45">
              Review alerts, system messages, and team activity in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              type="button"
              onClick={markAllRead}
              className="rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:border-[#8247E5]/35 hover:bg-[#8247E5]/12"
            >
              Mark all read
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Total" value={stats.total} icon={Inbox} hint="All notifications" />
          <StatTile label="Unread" value={stats.unread} icon={Bell} hint="Needs attention" />
          <StatTile
            label="Priority"
            value={stats.urgent}
            icon={AlertTriangle}
            hint="Unread system or critical"
          />
          <StatTile label="System" value={stats.system} icon={Activity} hint="System-generated" />
            </div>

        <section className={cn(cardBase, "flex flex-col overflow-hidden")}>
          <div className="flex flex-col gap-4 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <h2 className="text-sm font-semibold text-white">Activity feed</h2>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <div className="w-full sm:w-[170px]">
                <AdminSelect
                  size="md"
                  options={typeFilterOptions}
                  value={selectedType}
                  onValueChange={(v) => {
                    setSelectedType(v);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by type"
                />
              </div>
              <div className="w-full sm:w-[170px]">
                <AdminSelect
                  size="md"
                  options={statusFilterOptions}
                  value={selectedStatus}
                  onValueChange={(v) => {
                    setSelectedStatus(v);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by status"
                />
              </div>
              </div>
            </div>

          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                  <thead>
                  <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Message</th>
                    <th className="px-4 py-3 font-medium">Lead / agent</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium"> </th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {paginated.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "text-white/80 transition hover:bg-white/[0.03]",
                        idx % 2 === 1 && "bg-white/[0.02]",
                      )}
                    >
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <TypePill type={row.type} />
                      </td>
                      <td className="max-w-[280px] px-4 py-3.5">
                        <span className="line-clamp-2 text-white/85">{row.message}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-white/60">{row.leadAgent}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-white/50">{row.date}</td>
                      <td className="px-4 py-3.5">
                        <StatusPill status={row.status} />
                        </td>
                      <td className="relative px-4 py-3.5 text-right">
                        <button
                          type="button"
                          className="inline-flex rounded-lg p-2 text-white/45 hover:bg-white/[0.08] hover:text-white"
                          aria-label="Actions"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuForId((id) => (id === row.id ? null : row.id));
                          }}
                        >
                          <MoreVertical className="size-4" />
                        </button>
                        {menuForId === row.id ? (
                          <div className="absolute right-3 top-[calc(100%-0.25rem)] z-20 w-44 overflow-hidden rounded-xl border border-white/[0.08] bg-[#14101f] py-1 shadow-xl">
                            <button
                              type="button"
                              className="w-full px-4 py-2.5 text-left text-sm text-white/85 hover:bg-white/[0.06]"
                              onClick={() => openDetails(row)}
                            >
                              View details
                            </button>
                          </div>
                        ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          <div className="flex flex-col gap-3 p-4 md:hidden">
            {paginated.map((row, idx) => (
              <div
                key={row.id}
                className={cn(
                  "rounded-xl border border-white/[0.06] bg-white/[0.03] p-4",
                  idx % 2 === 1 && "bg-white/[0.05]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <TypePill type={row.type} />
                  <StatusPill status={row.status} />
                    </div>
                <p className="mt-3 text-sm font-medium leading-snug text-white/90">{row.message}</p>
                <p className="mt-2 text-xs text-white/45">{row.leadAgent}</p>
                <p className="mt-1 text-xs text-white/35">{row.date}</p>
                    <button
                  type="button"
                  onClick={() => openDetails(row)}
                  className="mt-4 w-full rounded-xl border border-[#8247E5]/40 bg-[#8247E5]/15 py-2.5 text-sm font-semibold text-[#e9d5ff] transition hover:bg-[#8247E5]/25"
                    >
                      View details
                    </button>
                </div>
              ))}
            </div>

          <nav
            className="flex flex-col gap-3 border-t border-white/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            aria-label="Pagination"
          >
            <p className="text-xs text-white/45">
              {startCount}–{endCount} of {filtered.length}
              {filtered.length !== notifications.length ? (
                <span className="text-white/30"> (filtered)</span>
              ) : null}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-white/45">
                <span className="whitespace-nowrap">Per page</span>
                <div className="w-[72px] shrink-0">
                  <AdminSelect
                    size="sm"
                    options={perPageOptions}
                    value={String(itemsPerPage)}
                    onValueChange={(v) => {
                      setItemsPerPage(Number(v));
                      setCurrentPage(1);
                    }}
                    aria-label="Rows per page"
                  />
                </div>
              </label>
              <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-0.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  className="rounded-lg p-2 text-white/55 disabled:opacity-35 hover:bg-white/[0.06] hover:text-white"
                  aria-label="Previous page"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="min-w-[4.5rem] px-2 text-center text-xs tabular-nums text-white/55">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  className="rounded-lg p-2 text-white/55 disabled:opacity-35 hover:bg-white/[0.06] hover:text-white"
                  aria-label="Next page"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </nav>
        </section>
      </div>

      <Modals.NotificationDetails
        open={detailOpen}
        setTrigger={setDetailOpen}
        notification={selected ?? undefined}
        onMarkAsRead={markSelectedRead}
      />
    </MainLayout>
  );
}
