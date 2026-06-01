"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Clock,
  Filter,
  Globe,
  LogIn,
  Monitor,
  RefreshCcw,
  Search,
  Shield,
  Smartphone,
  Tablet,
  Timer,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

import {
  useActivityMonitor,
  useActivitySummary,
  useOnlineStaff,
  activityKeys,
} from "@/lib/hooks/activity/use-activity-monitor";
import type { ActivityLog, GetActivityParams } from "@/lib/interfaces/activity";
import { cn }              from "@/lib/utils";
import AdminSelect         from "@/components/ui/AdminSelect";
import { TablePaginationBar } from "@/components/users/TablePaginationBar";

dayjs.extend(relativeTime);

// ─── Frontend-only type aliases ───────────────────────────────────────────────

type ActivityStatus = "online" | "idle" | "offline";
type DeviceType     = "desktop" | "mobile" | "tablet";
type ActivityRole   =
  | "super_admin" | "finance_admin" | "station_admin"
  | "support_admin" | "user_admin"  | "driver" | "rider";

// ─── Backend UserType → display role ─────────────────────────────────────────
// The backend returns raw UserType enum strings.
// All visual mapping lives here — the backend never knows about Tailwind.

const USER_TYPE_TO_ACTIVITY_ROLE: Record<string, ActivityRole> = {
  SUPER_ADMIN:   "super_admin",
  PEPP_ADMIN:    "user_admin",
  PEPP_MANAGER:  "support_admin",
  FINANCE_ADMIN: "finance_admin",
  STATION_ADMIN: "station_admin",
  SUPPORT_ADMIN: "support_admin",
  USER_ADMIN:    "user_admin",
  DRIVER:        "driver",
  USER:          "rider",
};

// ─── Visual config maps ───────────────────────────────────────────────────────

const ROLE_GRADIENTS: Record<ActivityRole, string> = {
  super_admin:   "from-[#8247E5] to-purple-800",
  finance_admin: "from-[#00d7c4] to-teal-700",
  station_admin: "from-amber-500 to-yellow-700",
  support_admin: "from-sky-500 to-blue-700",
  user_admin:    "from-emerald-500 to-teal-700",
  driver:        "from-amber-500 to-orange-700",
  rider:         "from-rose-500 to-pink-700",
};

const ROLE_CFG: Record<
  ActivityRole,
  { label: string; cls: string; group: "admin" | "driver" | "rider" }
> = {
  super_admin:   { label: "Super Admin",    cls: "bg-[#8247E5]/20 text-[#c084fc]",   group: "admin"  },
  finance_admin: { label: "Finance Admin",  cls: "bg-[#00d7c4]/15 text-[#00d7c4]",   group: "admin"  },
  station_admin: { label: "Station Admin",  cls: "bg-amber-500/15 text-amber-300",    group: "admin"  },
  support_admin: { label: "Support Admin",  cls: "bg-sky-500/15 text-sky-300",        group: "admin"  },
  user_admin:    { label: "User Admin",     cls: "bg-emerald-500/15 text-emerald-300", group: "admin" },
  driver:        { label: "Driver",         cls: "bg-orange-500/15 text-orange-300",  group: "driver" },
  rider:         { label: "Rider",          cls: "bg-rose-500/15 text-rose-300",      group: "rider"  },
};

const STATUS_CFG: Record<
  ActivityStatus,
  { label: string; dot: string; text: string; bg: string; pulse: boolean }
> = {
  online:  { label: "Online",  dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/15", pulse: true  },
  idle:    { label: "Idle",    dot: "bg-amber-400",   text: "text-amber-400",   bg: "bg-amber-500/15",   pulse: false },
  offline: { label: "Offline", dot: "bg-white/25",    text: "text-white/40",    bg: "bg-white/[0.06]",   pulse: false },
};

const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getActivityRole(rawRole: string): ActivityRole {
  return USER_TYPE_TO_ACTIVITY_ROLE[rawRole] ?? "user_admin";
}

function getAvatarGradient(rawRole: string): string {
  return ROLE_GRADIENTS[getActivityRole(rawRole)];
}

function formatDuration(mins: number): string {
  if (!mins) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0)  return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatLastLogin(iso: string | null): string {
  if (!iso) return "—";
  const d      = dayjs(iso);
  const diffH  = dayjs().diff(d, "hour");
  if (diffH < 1)  return d.fromNow();
  if (diffH < 24) return d.format("h:mm A");
  if (diffH < 48) return `Yesterday · ${d.format("h:mm A")}`;
  return d.format("D MMM · h:mm A");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status, size = "sm" }: { status: ActivityStatus; size?: "sm" | "md" }) {
  const cfg = STATUS_CFG[status];
  const sz  = size === "sm" ? "size-2" : "size-2.5";
  return (
    <span className="relative inline-flex items-center justify-center">
      {cfg.pulse && (
        <span className={cn("absolute inline-flex animate-ping rounded-full opacity-60", sz, cfg.dot)} />
      )}
      <span className={cn("relative inline-flex rounded-full", sz, cfg.dot)} />
    </span>
  );
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", cfg.bg, cfg.text)}>
      <StatusDot status={status} />
      {cfg.label}
    </span>
  );
}

function RoleBadge({ role }: { role: ActivityRole }) {
  const cfg = ROLE_CFG[role];
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold", cfg.cls)}>
      {cfg.label}
    </span>
  );
}

function DeviceIcon({ device }: { device: DeviceType }) {
  if (device === "mobile")  return <Smartphone className="size-3.5 shrink-0" strokeWidth={1.75} />;
  if (device === "tablet")  return <Tablet     className="size-3.5 shrink-0" strokeWidth={1.75} />;
  return                           <Monitor    className="size-3.5 shrink-0" strokeWidth={1.75} />;
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

interface KpiProps {
  icon:    React.FC<{ className?: string; strokeWidth?: number }>;
  label:   string;
  value:   string | number;
  sub?:    string;
  accent?: string;
  live?:   boolean;
}

function KpiCard({ icon: Icon, label, value, sub, accent = "text-white", live }: KpiProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl text-[#a855f7]">
          <Icon className="size-4" strokeWidth={1.75} />
        </div>
        {live && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
            Live
          </span>
        )}
      </div>
      <p className="mt-3 text-xs font-medium text-white/50">{label}</p>
      <p className={cn("mt-1.5 text-2xl font-bold tracking-tight lg:text-[28px]", accent)}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-white/30">{sub}</p>}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
      <div className="mb-3 size-9 rounded-xl bg-white/10" />
      <div className="h-3 w-24 rounded bg-white/10" />
      <div className="mt-2 h-7 w-16 rounded bg-white/[0.07]" />
    </div>
  );
}

// ─── Online avatar strip ──────────────────────────────────────────────────────

function OnlineStrip({ logs, loading }: { logs: ActivityLog[]; loading: boolean }) {
  const MAX_SHOW = 8;
  const visible  = logs.slice(0, MAX_SHOW);
  const overflow = logs.length - MAX_SHOW;

  if (loading) {
    return (
      <div className="flex animate-pulse items-center gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="size-9 rounded-full bg-white/10" style={{ marginLeft: i === 0 ? 0 : -10 }} />
        ))}
        <div className="ml-2 space-y-1.5">
          <div className="h-3 w-32 rounded bg-white/10" />
          <div className="h-2.5 w-24 rounded bg-white/[0.06]" />
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/35">
        <WifiOff className="size-4" strokeWidth={1.75} />
        No staff currently online
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex">
        {visible.map((u, i) => (
          <div
            key={u.id}
            title={`${u.fullName} · ${ROLE_CFG[getActivityRole(u.role)].label}`}
            style={{ zIndex: visible.length - i, marginLeft: i === 0 ? 0 : -10 }}
            className="relative size-9 rounded-full ring-2 ring-[#12101c]"
          >
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white",
                getAvatarGradient(u.role),
              )}
            >
              {u.initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-1 ring-[#12101c]" />
          </div>
        ))}
        {overflow > 0 && (
          <div
            style={{ zIndex: 0, marginLeft: -10 }}
            className="flex size-9 items-center justify-center rounded-full bg-white/[0.08] text-[11px] font-semibold text-white/60 ring-2 ring-[#12101c]"
          >
            +{overflow}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{logs.length} online right now</p>
        <p className="mt-0.5 text-xs text-white/40">
          {logs.slice(0, 3).map((u) => u.fullName.split(" ")[0]).join(", ")}
          {logs.length > 3 && ` + ${logs.length - 3} more`}
        </p>
      </div>
    </div>
  );
}

// ─── Recent activity feed ─────────────────────────────────────────────────────

function RecentFeed({ logs, loading }: { logs: ActivityLog[]; loading: boolean }) {
  if (loading) {
    return (
      <ul className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex animate-pulse items-start gap-3">
            <div className="size-7 rounded-full bg-white/10" />
            <div className="flex-1 space-y-1.5 pt-0.5">
              <div className="h-3 w-40 rounded bg-white/10" />
              <div className="h-2.5 w-20 rounded bg-white/[0.06]" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  const actionLabel = (status: ActivityStatus) =>
    status === "online" ? "logged in" : status === "idle" ? "went idle" : "logged out";

  const actionColor = (status: ActivityStatus) =>
    status === "online" ? "text-emerald-400" : status === "idle" ? "text-amber-400" : "text-white/40";

  return (
    <ul className="space-y-3">
      {logs.map((log) => (
        <li key={log.id} className="flex items-start gap-3">
          <div className="relative mt-0.5 shrink-0">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white",
                getAvatarGradient(log.role),
              )}
            >
              {log.initials}
            </div>
            <StatusDot status={log.status as ActivityStatus} size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs leading-tight">
              <span className="font-semibold text-white">{log.fullName}</span>{" "}
              <span className={cn("font-medium", actionColor(log.status as ActivityStatus))}>
                {actionLabel(log.status as ActivityStatus)}
              </span>
            </p>
            <p className="mt-0.5 text-[10px] text-white/35">{dayjs(log.lastActiveAt).fromNow()}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ─── Row skeleton ─────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-white/[0.05]">
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-white/10" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-white/10" />
                <div className="h-2.5 w-40 rounded bg-white/[0.06]" />
              </div>
            </div>
          </td>
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <div className="h-3.5 w-20 rounded bg-white/[0.07]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ActivityMonitor() {
  const queryClient = useQueryClient();
  const dateLine    = dayjs().format("dddd, MMM D, YYYY");

  // ── Filter state ────────────────────────────────────────────────────────────
  const [searchQuery,     setSearchQuery]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleGroup,       setRoleGroup]       = useState<GetActivityParams["roleGroup"]>("all");
  const [statusFilter,    setStatusFilter]    = useState<GetActivityParams["status"]>("all");
  const [period,          setPeriod]          = useState<GetActivityParams["period"]>("today");
  const [rowsPerPage,     setRowsPerPage]     = useState(PAGE_SIZE);

  // ── Cursor pagination ────────────────────────────────────────────────────────
  const [cursor,      setCursor]      = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);

  // ── Cursor reset — called by every filter that invalidates position ─────────
  const resetCursor = useCallback(() => {
    setCursor(null);
    setCursorStack([null]);
  }, []);

  // ── Debounce search — reset cursor when query settles ──────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      resetCursor();
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, resetCursor]);

  // ── Build backend params — only include non-default values ─────────────────
  const activityParams = useMemo<GetActivityParams>(() => {
    const params: GetActivityParams = {
      period:   period,
      limit:    rowsPerPage,
    };
    if (roleGroup    && roleGroup    !== "all") params.roleGroup = roleGroup;
    if (statusFilter && statusFilter !== "all") params.status    = statusFilter;
    if (debouncedSearch)                        params.search    = debouncedSearch;
    if (cursor)                                 params.cursor    = cursor;
    return params;
  }, [roleGroup, statusFilter, period, debouncedSearch, cursor, rowsPerPage]);

  // ── Queries ─────────────────────────────────────────────────────────────────
  const {
    data:      activityData,
    isLoading: tableLoading,
    isFetching,
  } = useActivityMonitor(activityParams);

  const {
    data:      summaryData,
    isLoading: summaryLoading,
  } = useActivitySummary();

  const {
    data:      onlineData,
    isLoading: onlineLoading,
  } = useOnlineStaff();

  // ── Derived data ─────────────────────────────────────────────────────────────
  const items      = activityData?.items      ?? [];
  const total      = activityData?.total      ?? 0;
  const nextCursor = activityData?.nextCursor ?? null;

  // KPI data: prefer the dedicated summary endpoint (always today / all roles).
  // Falls back to the page summary during the initial summary load.
  const kpi = summaryData ?? activityData?.summary;

  const onlineCount  = kpi?.onlineCount      ?? 0;
  const idleCount    = kpi?.idleCount        ?? 0;
  const offlineCount = kpi?.offlineCount     ?? 0;
  const todayCount   = kpi?.todayActiveCount ?? 0;
  const avgSession   = kpi?.avgSessionMins   ?? 0;
  const totalTracked = kpi?.totalTracked     ?? 0;

  const onlineStaff = onlineData?.items ?? [];

  // Recent feed: 6 most-recently-active entries from the current page.
  const recentFeed = useMemo(
    () =>
      [...items]
        .sort((a, b) => dayjs(b.lastActiveAt).diff(dayjs(a.lastActiveAt)))
        .slice(0, 6),
    [items],
  );

  // Filter-level online/idle counts for the toolbar subtitle.
  // `activityData.summary` is computed server-side from the full filtered set.
  const filterSummary = activityData?.summary;

  // ── Pagination ────────────────────────────────────────────────────────────
  const canGoNext = Boolean(nextCursor) && !isFetching;
  const canGoPrev = cursorStack.length > 1 && !isFetching;

  const handleNext = useCallback(() => {
    if (!nextCursor || isFetching) return;
    setCursorStack((prev) => [...prev, nextCursor]);
    setCursor(nextCursor);
  }, [nextCursor, isFetching]);

  const handlePrev = useCallback(() => {
    if (cursorStack.length <= 1 || isFetching) return;
    const updated  = [...cursorStack];
    updated.pop();
    const previous = updated[updated.length - 1] ?? null;
    setCursorStack(updated);
    setCursor(previous);
  }, [cursorStack, isFetching]);

  const handleRowsPerPageChange = useCallback((v: number) => {
    setRowsPerPage(v);
    resetCursor();
  }, [resetCursor]);

  // ── Filter change handlers — all reset cursor ─────────────────────────────
  const handleRoleGroupChange = useCallback((v: string) => {
    setRoleGroup(v as GetActivityParams["roleGroup"]);
    resetCursor();
  }, [resetCursor]);

  const handleStatusFilterChange = useCallback((v: string) => {
    setStatusFilter(v as GetActivityParams["status"]);
    resetCursor();
  }, [resetCursor]);

  const handlePeriodChange = useCallback((v: string) => {
    setPeriod(v as GetActivityParams["period"]);
    resetCursor();
  }, [resetCursor]);

  // ── Global refresh ────────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: activityKeys.all });
  }, [queryClient]);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[1600px] space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-white/40">{dateLine}</p>
          <h1 className="mt-1 flex flex-wrap items-center gap-2.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#8247E5]/20 text-[#c084fc] sm:size-10">
              <Activity className="size-5" strokeWidth={1.75} />
            </span>
            Activity Monitor
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Real-time staff visibility · login tracking · session analytics
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-semibold text-emerald-400">Live</span>
            <span className="hidden text-xs text-white/35 sm:inline">· updates every 30 s</span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.09] hover:text-white"
          >
            <RefreshCcw className="size-3.5" strokeWidth={2} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryLoading && !kpi ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              icon={UserCheck}
              label="Active right now"
              value={onlineCount}
              sub={`${idleCount} idle · ${offlineCount} offline`}
              accent="text-emerald-400"
              live
            />
            <KpiCard
              icon={LogIn}
              label="Logged in today"
              value={todayCount}
              sub="across all roles"
              accent="text-white"
            />
            <KpiCard
              icon={Timer}
              label="Avg session length"
              value={formatDuration(avgSession)}
              sub="across active sessions"
              accent="text-[#c084fc]"
            />
            <KpiCard
              icon={Users}
              label="Total tracked staff"
              value={totalTracked}
              sub="admins · drivers · riders"
              accent="text-white"
            />
          </>
        )}
      </div>

      {/* Currently online + recent feed */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Online strip — 2/3 */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)] lg:col-span-2">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Wifi className="size-4 text-emerald-400" strokeWidth={1.75} />
                Currently Online
              </h2>
              <p className="mt-0.5 text-xs text-white/40">
                Staff with a heartbeat in the last 5 minutes
              </p>
            </div>
            <OnlineStrip logs={onlineStaff} loading={onlineLoading} />
          </div>

          {/* Proportion bar */}
          <div className="border-t border-white/[0.05] px-5 py-3">
            <div className="flex items-center gap-4">
              {[
                { label: "Online",  count: onlineCount,  color: "bg-emerald-400/80" },
                { label: "Idle",    count: idleCount,    color: "bg-amber-400/80"   },
                { label: "Offline", count: offlineCount, color: "bg-white/20"       },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs">
                  <span className={cn("size-2 rounded-full", color)} />
                  <span className="text-white/50">
                    <span className="font-semibold text-white">{count}</span> {label}
                  </span>
                </div>
              ))}

              {/* Visual bar */}
              <div className="ml-auto hidden h-2 w-36 overflow-hidden rounded-full bg-white/[0.06] sm:flex">
                {totalTracked > 0 && (
                  <>
                    <div
                      className="h-full bg-emerald-400/70 transition-all"
                      style={{ width: `${(onlineCount / totalTracked) * 100}%` }}
                    />
                    <div
                      className="h-full bg-amber-400/70 transition-all"
                      style={{ width: `${(idleCount / totalTracked) * 100}%` }}
                    />
                  </>
                )}
                <div className="h-full flex-1 bg-white/15" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity feed — 1/3 */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
          <div className="border-b border-white/[0.05] px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Clock className="size-4 text-[#a855f7]" strokeWidth={1.75} />
              Recent Activity
            </h2>
          </div>
          <div className="p-5">
            <RecentFeed logs={recentFeed} loading={tableLoading} />
          </div>
        </div>
      </div>

      {/* Activity table */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Login History</h2>
            <p className="mt-0.5 text-xs text-white/40">
              {tableLoading ? "Loading…" : `${total} record${total !== 1 ? "s" : ""}`}
              {!tableLoading && filterSummary && filterSummary.onlineCount > 0 && (
                <> · <span className="text-emerald-400">{filterSummary.onlineCount} online</span></>
              )}
              {!tableLoading && filterSummary && filterSummary.idleCount > 0 && (
                <> · <span className="text-amber-400">{filterSummary.idleCount} idle</span></>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Debounced search */}
            <div className="relative h-9 w-full sm:w-[200px] lg:w-[230px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email, location…"
                className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.07] py-0 pl-8 pr-2 text-xs text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2"
              />
            </div>

            {/* Role group — sent to backend */}
            <div className="h-9 w-[138px] shrink-0">
              <AdminSelect
                icon={Shield}
                size="sm"
                triggerClassName="h-9 min-h-9 py-0 text-xs"
                options={[
                  { value: "all",    label: "All roles" },
                  { value: "admin",  label: "Admins"    },
                  { value: "driver", label: "Drivers"   },
                  { value: "rider",  label: "Riders"    },
                ]}
                value={roleGroup ?? "all"}
                onValueChange={handleRoleGroupChange}
                aria-label="Filter by role group"
              />
            </div>

            {/* Status — sent to backend */}
            <div className="h-9 w-[130px] shrink-0">
              <AdminSelect
                icon={Filter}
                size="sm"
                triggerClassName="h-9 min-h-9 py-0 text-xs"
                options={[
                  { value: "all",     label: "All statuses" },
                  { value: "online",  label: "Online"       },
                  { value: "idle",    label: "Idle"         },
                  { value: "offline", label: "Offline"      },
                ]}
                value={statusFilter ?? "all"}
                onValueChange={handleStatusFilterChange}
                aria-label="Filter by status"
              />
            </div>

            {/* Period — sent to backend */}
            <div className="h-9 w-[130px] shrink-0">
              <AdminSelect
                icon={Clock}
                size="sm"
                triggerClassName="h-9 min-h-9 py-0 text-xs"
                options={[
                  { value: "today", label: "Today"       },
                  { value: "week",  label: "Last 7 days" },
                  { value: "all",   label: "All time"    },
                ]}
                value={period ?? "today"}
                onValueChange={handlePeriodChange}
                aria-label="Filter by period"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Login</th>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Device</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Today</th>
              </tr>
            </thead>

            <tbody
              className={cn(
                "divide-y divide-white/[0.05] transition-opacity duration-150",
                isFetching && !tableLoading && "opacity-60",
              )}
            >
              {tableLoading ? (
                <RowSkeleton />
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-white/40">
                    No activity records match the current filters.
                  </td>
                </tr>
              ) : (
                items.map((log) => {
                  const activityRole = getActivityRole(log.role);
                  const gradient     = getAvatarGradient(log.role);
                  const status       = log.status as ActivityStatus;

                  return (
                    <tr
                      key={log.id}
                      className={cn(
                        "transition hover:bg-white/[0.025]",
                        status === "online" && "bg-emerald-500/[0.025]",
                      )}
                    >
                      {/* Staff */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div
                              className={cn(
                                "flex size-9 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white",
                                gradient,
                              )}
                            >
                              {log.initials}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5">
                              <StatusDot status={status} />
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white">{log.fullName}</p>
                            <p className="truncate text-xs text-white/40">{log.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <RoleBadge role={activityRole} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={status} />
                      </td>

                      {/* Last login */}
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-white/80">{formatLastLogin(log.lastLoginAt)}</p>
                        {log.lastLoginAt && (
                          <p className="mt-0.5 text-[10px] tabular-nums text-white/30">
                            {dayjs(log.lastLoginAt).format("D MMM YYYY")}
                          </p>
                        )}
                      </td>

                      {/* Session duration */}
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-white/80">
                          {formatDuration(log.sessionDurationMins)}
                        </p>
                        <div className="mt-1.5 h-[3px] w-20 overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              status === "online"  ? "bg-emerald-400/75"
                              : status === "idle"  ? "bg-amber-400/75"
                              :                      "bg-white/20",
                            )}
                            style={{
                              width: `${Math.min(100, (log.sessionDurationMins / 480) * 100)}%`,
                            }}
                          />
                        </div>
                      </td>

                      {/* Device */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-white/65">
                          <DeviceIcon device={log.device} />
                          <span className="text-xs">{log.os}</span>
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-white/30">{log.browser}</p>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-white/65">
                          <Globe className="size-3.5 shrink-0 text-white/25" strokeWidth={1.75} />
                          <span className="text-xs">{log.location}</span>
                        </div>
                        <p className="mt-0.5 text-[10px] tabular-nums text-white/25">{log.ipAddress}</p>
                      </td>

                      {/* Login count today */}
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            log.loginCountToday > 0 ? "text-white" : "text-white/25",
                          )}
                        >
                          {log.loginCountToday}
                        </span>
                        <p className="text-[10px] text-white/30">
                          login{log.loginCountToday !== 1 ? "s" : ""}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePaginationBar
          rowsPerPage={rowsPerPage}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
          isLoading={isFetching}
          onNext={handleNext}
          onPrev={handlePrev}
          onRowsPerPageChange={handleRowsPerPageChange}
          className="border-t border-white/[0.06]"
        />
      </div>
    </div>
  );
}