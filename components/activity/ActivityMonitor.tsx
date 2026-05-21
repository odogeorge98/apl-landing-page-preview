"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
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
import { cn } from "@/lib/utils";
import AdminSelect from "@/components/ui/AdminSelect";
import { TablePaginationBar } from "@/components/users/TablePaginationBar";

dayjs.extend(relativeTime);

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivityRole =
  | "super_admin"
  | "finance_admin"
  | "station_admin"
  | "support_admin"
  | "user_admin"
  | "driver"
  | "rider";

type ActivityStatus = "online" | "idle" | "offline";
type DeviceType = "desktop" | "mobile" | "tablet";

interface ActivityLog {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  role: ActivityRole;
  status: ActivityStatus;
  /** ISO — when the session started */
  lastLoginAt: string;
  /** ISO — most recent API heartbeat / last action */
  lastActiveAt: string;
  /** Running session length in minutes; 0 = never finished */
  sessionDurationMins: number;
  device: DeviceType;
  os: string;
  browser: string;
  location: string;
  ipAddress: string;
  loginCountToday: number;
  avatarGradient: string;
}

// ─── Config maps ──────────────────────────────────────────────────────────────

const ROLE_CFG: Record<
  ActivityRole,
  {
    label: string;
    cls: string;
    group: "admin" | "driver" | "rider";
  }
> = {
  super_admin: {
    label: "Super Admin",
    cls: "bg-[#8247E5]/20 text-[#c084fc]",
    group: "admin",
  },

  finance_admin: {
    label: "Finance Admin",
    cls: "bg-[#00d7c4]/15 text-[#00d7c4]",
    group: "admin",
  },

  station_admin: {
    label: "Station Admin",
    cls: "bg-amber-500/15 text-amber-300",
    group: "admin",
  },

  support_admin: {
    label: "Support Admin",
    cls: "bg-sky-500/15 text-sky-300",
    group: "admin",
  },

  user_admin: {
    label: "User Admin",
    cls: "bg-emerald-500/15 text-emerald-300",
    group: "admin",
  },

  driver: {
    label: "Driver",
    cls: "bg-orange-500/15 text-orange-300",
    group: "driver",
  },

  rider: {
    label: "Rider",
    cls: "bg-rose-500/15 text-rose-300",
    group: "rider",
  },
};

const STATUS_CFG: Record<
  ActivityStatus,
  {
    label: string;
    dot: string;
    text: string;
    bg: string;
    pulse: boolean;
  }
> = {
  online: {
    label: "Online",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    bg: "bg-emerald-500/15",
    pulse: true,
  },

  idle: {
    label: "Idle",
    dot: "bg-amber-400",
    text: "text-amber-400",
    bg: "bg-amber-500/15",
    pulse: false,
  },

  offline: {
    label: "Offline",
    dot: "bg-white/25",
    text: "text-white/40",
    bg: "bg-white/[0.06]",
    pulse: false,
  },
};

// ─── Dummy data ───────────────────────────────────────────────────────────────
// Replace this with API calls once the backend endpoints are ready.

const _n = dayjs();

const DUMMY_LOGS: ActivityLog[] = [
  // ── Online ────────────────────────────────────────────────────────────────
  {
    id: "a1", fullName: "Adaeze Okonkwo",   email: "adaeze.o@peppcruise.com",
    initials: "AO", role: "super_admin",   status: "online",
    lastLoginAt:  _n.subtract(12, "m").toISOString(),
    lastActiveAt: _n.subtract(30, "s").toISOString(),
    sessionDurationMins: 12, device: "desktop",
    os: "macOS 14", browser: "Safari 17",
    location: "Lagos, Nigeria", ipAddress: "197.211.48.xx",
    loginCountToday: 1, avatarGradient: "from-[#8247E5] to-purple-800",
  },
  {
    id: "a2", fullName: "Chioma Okafor",    email: "chioma.okafor@peppcruise.com",
    initials: "CO", role: "finance_admin", status: "online",
    lastLoginAt:  _n.subtract(83, "m").toISOString(),
    lastActiveAt: _n.subtract(2, "m").toISOString(),
    sessionDurationMins: 83, device: "desktop",
    os: "macOS 14", browser: "Chrome 124",
    location: "Lagos, Nigeria", ipAddress: "197.210.64.xx",
    loginCountToday: 2, avatarGradient: "from-[#00d7c4] to-teal-700",
  },
  {
    id: "a3", fullName: "Tunde Adeyemi",    email: "tunde.a@peppcruise.com",
    initials: "TA", role: "user_admin",    status: "online",
    lastLoginAt:  _n.subtract(34, "m").toISOString(),
    lastActiveAt: _n.subtract(1, "m").toISOString(),
    sessionDurationMins: 34, device: "desktop",
    os: "Windows 11", browser: "Edge 124",
    location: "Abuja, Nigeria", ipAddress: "105.112.30.xx",
    loginCountToday: 1, avatarGradient: "from-emerald-500 to-teal-700",
  },
  {
    id: "a4", fullName: "John Doe",         email: "john.doe@driver.peppcruise.com",
    initials: "JD", role: "driver",        status: "online",
    lastLoginAt:  _n.subtract(28, "m").toISOString(),
    lastActiveAt: _n.subtract(3, "m").toISOString(),
    sessionDurationMins: 28, device: "mobile",
    os: "Android 14", browser: "PeppApp v2.4.1",
    location: "Calabar, Nigeria", ipAddress: "196.216.xx.xx",
    loginCountToday: 3, avatarGradient: "from-amber-500 to-orange-700",
  },
  {
    id: "a5", fullName: "Moses Bassey",     email: "moses.bassey.e@gmail.com",
    initials: "MB", role: "rider",         status: "online",
    lastLoginAt:  _n.subtract(67, "m").toISOString(),
    lastActiveAt: _n.subtract(5, "m").toISOString(),
    sessionDurationMins: 67, device: "mobile",
    os: "iOS 17", browser: "PeppApp v2.4.1",
    location: "Calabar, Nigeria", ipAddress: "41.58.xx.xx",
    loginCountToday: 2, avatarGradient: "from-rose-500 to-pink-700",
  },
  // ── Idle ──────────────────────────────────────────────────────────────────
  {
    id: "a6", fullName: "Ibrahim Musa",     email: "ibrahim.m@peppcruise.com",
    initials: "IM", role: "station_admin", status: "idle",
    lastLoginAt:  _n.subtract(2, "h").toISOString(),
    lastActiveAt: _n.subtract(38, "m").toISOString(),
    sessionDurationMins: 120, device: "desktop",
    os: "Windows 10", browser: "Firefox 125",
    location: "Kano, Nigeria", ipAddress: "197.149.xx.xx",
    loginCountToday: 1, avatarGradient: "from-amber-500 to-yellow-700",
  },
  {
    id: "a7", fullName: "Grace Etim",       email: "grace.etim@peppcruise.com",
    initials: "GE", role: "support_admin", status: "idle",
    lastLoginAt:  _n.subtract(3, "h").toISOString(),
    lastActiveAt: _n.subtract(55, "m").toISOString(),
    sessionDurationMins: 190, device: "desktop",
    os: "macOS 13", browser: "Chrome 124",
    location: "Lagos, Nigeria", ipAddress: "197.210.xx.xx",
    loginCountToday: 1, avatarGradient: "from-sky-500 to-blue-700",
  },
  {
    id: "a8", fullName: "Ngozi Eze",        email: "ngozi.eze@peppcruise.com",
    initials: "NE", role: "finance_admin", status: "idle",
    lastLoginAt:  _n.subtract(65, "m").toISOString(),
    lastActiveAt: _n.subtract(42, "m").toISOString(),
    sessionDurationMins: 65, device: "desktop",
    os: "Windows 11", browser: "Chrome 124",
    location: "Port Harcourt, Nigeria", ipAddress: "105.158.xx.xx",
    loginCountToday: 2, avatarGradient: "from-fuchsia-500 to-purple-700",
  },
  // ── Offline ───────────────────────────────────────────────────────────────
  {
    id: "a9",  fullName: "Samuel Jonah",    email: "samuel.j@external.test",
    initials: "SJ", role: "station_admin", status: "offline",
    lastLoginAt:  _n.subtract(5, "h").toISOString(),
    lastActiveAt: _n.subtract(5, "h").toISOString(),
    sessionDurationMins: 220, device: "desktop",
    os: "Windows 11", browser: "Chrome 124",
    location: "Enugu, Nigeria", ipAddress: "102.89.xx.xx",
    loginCountToday: 1, avatarGradient: "from-slate-500 to-gray-700",
  },
  {
    id: "a10", fullName: "Emeka Chukwu",    email: "emeka.c@peppcruise.com",
    initials: "EC", role: "support_admin", status: "offline",
    lastLoginAt:  _n.subtract(8, "h").toISOString(),
    lastActiveAt: _n.subtract(8, "h").toISOString(),
    sessionDurationMins: 180, device: "desktop",
    os: "macOS 14", browser: "Safari 17",
    location: "Lagos, Nigeria", ipAddress: "197.210.xx.xx",
    loginCountToday: 1, avatarGradient: "from-orange-500 to-amber-700",
  },
  {
    id: "a11", fullName: "Fatima Aliyu",    email: "fatima.aliyu@peppcruise.com",
    initials: "FA", role: "user_admin",    status: "offline",
    lastLoginAt:  _n.subtract(1, "d").subtract(2, "h").toISOString(),
    lastActiveAt: _n.subtract(1, "d").subtract(2, "h").toISOString(),
    sessionDurationMins: 305, device: "desktop",
    os: "Windows 10", browser: "Chrome 123",
    location: "Abuja, Nigeria", ipAddress: "105.112.xx.xx",
    loginCountToday: 0, avatarGradient: "from-green-500 to-emerald-700",
  },
  {
    id: "a12", fullName: "Kelvin Otu",      email: "kelvin.otu@driver.peppcruise.com",
    initials: "KO", role: "driver",        status: "offline",
    lastLoginAt:  _n.subtract(3, "h").toISOString(),
    lastActiveAt: _n.subtract(3, "h").toISOString(),
    sessionDurationMins: 95, device: "mobile",
    os: "Android 13", browser: "PeppApp v2.3.8",
    location: "Calabar, Nigeria", ipAddress: "41.57.xx.xx",
    loginCountToday: 1, avatarGradient: "from-amber-400 to-yellow-600",
  },
  {
    id: "a13", fullName: "Blessing Nkemdirim", email: "blessing.n@gmail.com",
    initials: "BN", role: "rider",         status: "offline",
    lastLoginAt:  _n.subtract(6, "h").toISOString(),
    lastActiveAt: _n.subtract(6, "h").toISOString(),
    sessionDurationMins: 45, device: "mobile",
    os: "iOS 16", browser: "PeppApp v2.4.0",
    location: "Lagos, Nigeria", ipAddress: "197.210.xx.xx",
    loginCountToday: 1, avatarGradient: "from-pink-500 to-rose-700",
  },
  {
    id: "a14", fullName: "Dele Ogundimu",   email: "dele.o@peppcruise.com",
    initials: "DO", role: "finance_admin", status: "offline",
    lastLoginAt:  _n.subtract(2, "d").toISOString(),
    lastActiveAt: _n.subtract(2, "d").toISOString(),
    sessionDurationMins: 0, device: "desktop",
    os: "Windows 11", browser: "Edge 123",
    location: "Lagos, Nigeria", ipAddress: "197.211.xx.xx",
    loginCountToday: 0, avatarGradient: "from-indigo-500 to-blue-700",
  },
  {
    id: "a15", fullName: "Nkechi Obi",      email: "nkechi.o@peppcruise.com",
    initials: "NO", role: "support_admin", status: "offline",
    lastLoginAt:  _n.subtract(4, "h").toISOString(),
    lastActiveAt: _n.subtract(4, "h").toISOString(),
    sessionDurationMins: 130, device: "tablet",
    os: "iPadOS 17", browser: "Safari 17",
    location: "Abuja, Nigeria", ipAddress: "105.113.xx.xx",
    loginCountToday: 1, avatarGradient: "from-violet-500 to-fuchsia-700",
  },
  {
    id: "a16", fullName: "Chukwuemeka Eze", email: "ceze@driver.peppcruise.com",
    initials: "CE", role: "driver",        status: "offline",
    lastLoginAt:  _n.subtract(1, "h").toISOString(),
    lastActiveAt: _n.subtract(1, "h").toISOString(),
    sessionDurationMins: 45, device: "mobile",
    os: "Android 12", browser: "PeppApp v2.4.1",
    location: "Calabar, Nigeria", ipAddress: "196.216.xx.xx",
    loginCountToday: 2, avatarGradient: "from-orange-400 to-red-600",
  },
  {
    id: "a17", fullName: "Amara Udegbe",    email: "amara.u@gmail.com",
    initials: "AU", role: "rider",         status: "offline",
    lastLoginAt:  _n.subtract(12, "h").toISOString(),
    lastActiveAt: _n.subtract(12, "h").toISOString(),
    sessionDurationMins: 33, device: "mobile",
    os: "iOS 17", browser: "PeppApp v2.4.1",
    location: "Enugu, Nigeria", ipAddress: "102.89.xx.xx",
    loginCountToday: 0, avatarGradient: "from-cyan-500 to-teal-700",
  },
  {
    id: "a18", fullName: "Yemi Adeyinka",   email: "yemi.adeyinka@peppcruise.com",
    initials: "YA", role: "user_admin",    status: "offline",
    lastLoginAt:  _n.subtract(3, "d").toISOString(),
    lastActiveAt: _n.subtract(3, "d").toISOString(),
    sessionDurationMins: 0, device: "desktop",
    os: "macOS 13", browser: "Chrome 122",
    location: "Ibadan, Nigeria", ipAddress: "197.149.xx.xx",
    loginCountToday: 0, avatarGradient: "from-lime-500 to-green-700",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(mins: number): string {
  if (!mins) return "—";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatLastLogin(iso: string): string {
  const d   = dayjs(iso);
  const now = dayjs();
  const diffH = now.diff(d, "hour");
  if (diffH < 1)  return d.fromNow();
  if (diffH < 24) return d.format("h:mm A");
  if (diffH < 48) return `Yesterday · ${d.format("h:mm A")}`;
  return d.format("D MMM · h:mm A");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({
  status,
  size = "sm",
}: {
  status: ActivityStatus;
  size?: "sm" | "md";
}) {
  const cfg = STATUS_CFG[status];
  const sz  = size === "sm" ? "size-2" : "size-2.5";
  return (
    <span className="relative inline-flex items-center justify-center">
      {cfg.pulse && (
        <span
          className={cn(
            "absolute inline-flex animate-ping rounded-full opacity-60",
            sz,
            cfg.dot,
          )}
        />
      )}
      <span className={cn("relative inline-flex rounded-full", sz, cfg.dot)} />
    </span>
  );
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        cfg.bg,
        cfg.text,
      )}
    >
      <StatusDot status={status} />
      {cfg.label}
    </span>
  );
}

function RoleBadge({ role }: { role: ActivityRole }) {
  const cfg = ROLE_CFG[role];
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        cfg.cls,
      )}
    >
      {cfg.label}
    </span>
  );
}

function DeviceIcon({ device }: { device: DeviceType }) {
  const Map: Record<DeviceType, React.FC<React.SVGProps<SVGSVGElement>>> = {
    desktop: Monitor,
    mobile:  Smartphone,
    tablet:  Tablet,
  };
  const Icon = Map[device];
  return <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />;
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

interface KpiProps {
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  live?: boolean;
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

// ─── Online avatar strip ──────────────────────────────────────────────────────

function OnlineStrip({ logs }: { logs: ActivityLog[] }) {
  const online   = logs.filter((l) => l.status === "online");
  const MAX_SHOW = 8;
  const visible  = online.slice(0, MAX_SHOW);
  const overflow = online.length - MAX_SHOW;

  if (online.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/35">
        <WifiOff className="size-4" strokeWidth={1.75} />
        No staff currently online
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Overlapping avatars */}
      <div className="flex">
        {visible.map((u, i) => (
          <div
            key={u.id}
            title={`${u.fullName} · ${ROLE_CFG[u.role].label}`}
            style={{ zIndex: visible.length - i, marginLeft: i === 0 ? 0 : -10 }}
            className="relative size-9 rounded-full ring-2 ring-[#12101c]"
          >
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white",
                u.avatarGradient,
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

      {/* Labels */}
      <div>
        <p className="text-sm font-semibold text-white">
          {online.length} online right now
        </p>
        <p className="mt-0.5 text-xs text-white/40">
          {online
            .slice(0, 3)
            .map((u) => u.fullName.split(" ")[0])
            .join(", ")}
          {online.length > 3 && ` + ${online.length - 3} more`}
        </p>
      </div>
    </div>
  );
}

// ─── Recent activity feed ─────────────────────────────────────────────────────

function RecentFeed({ logs }: { logs: ActivityLog[] }) {
  const feed = useMemo(
    () =>
      [...logs]
        .sort((a, b) => dayjs(b.lastActiveAt).diff(dayjs(a.lastActiveAt)))
        .slice(0, 6),
    [logs],
  );

  const actionLabel = (status: ActivityStatus) =>
    status === "online"
      ? "logged in"
      : status === "idle"
        ? "went idle"
        : "logged out";

  const actionColor = (status: ActivityStatus) =>
    status === "online"
      ? "text-emerald-400"
      : status === "idle"
        ? "text-amber-400"
        : "text-white/40";

  return (
    <ul className="space-y-3">
      {feed.map((log) => (
        <li key={log.id} className="flex items-start gap-3">
          <div className="relative mt-0.5 shrink-0">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white",
                log.avatarGradient,
              )}
            >
              {log.initials}
            </div>
            <StatusDot status={log.status} size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs leading-tight">
              <span className="font-semibold text-white">{log.fullName}</span>{" "}
              <span className={cn("font-medium", actionColor(log.status))}>
                {actionLabel(log.status)}
              </span>
            </p>
            <p className="mt-0.5 text-[10px] text-white/35">
              {dayjs(log.lastActiveAt).fromNow()}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ─── Row skeleton ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

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
  const dateLine = dayjs().format("dddd, MMM D, YYYY");

  // ── Filters ────────────────────────────────────────────────────────────────
  const [searchQuery,     setSearchQuery]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleGroup,       setRoleGroup]       = useState("all");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [period,          setPeriod]          = useState("today");

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page,        setPage]        = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);

  // ── Debounce ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ── KPI aggregations ──────────────────────────────────────────────────────
  const onlineCount  = DUMMY_LOGS.filter((l) => l.status === "online").length;
  const idleCount    = DUMMY_LOGS.filter((l) => l.status === "idle").length;
  const offlineCount = DUMMY_LOGS.filter((l) => l.status === "offline").length;
  const todayCount   = DUMMY_LOGS.filter((l) => l.loginCountToday > 0).length;

  const avgSession = useMemo(() => {
    const active = DUMMY_LOGS.filter((l) => l.sessionDurationMins > 0);
    if (!active.length) return 0;
    return Math.round(
      active.reduce((s, l) => s + l.sessionDurationMins, 0) / active.length,
    );
  }, []);

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    const now = dayjs();
    let out = [...DUMMY_LOGS];

    // Period
    if (period === "today") {
      out = out.filter((l) => dayjs(l.lastLoginAt).isAfter(now.startOf("day")));
    } else if (period === "week") {
      out = out.filter((l) => dayjs(l.lastLoginAt).isAfter(now.subtract(7, "day")));
    }

    // Role group
    if (roleGroup !== "all") {
      out = out.filter((l) => ROLE_CFG[l.role].group === roleGroup);
    }

    // Status
    if (statusFilter !== "all") {
      out = out.filter((l) => l.status === statusFilter);
    }

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      out = out.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q),
      );
    }

    // Sort: online → idle → offline; within group by recency
    const ORDER: Record<ActivityStatus, number> = { online: 0, idle: 1, offline: 2 };
    out.sort((a, b) => {
      const d = ORDER[a.status] - ORDER[b.status];
      return d !== 0 ? d : dayjs(b.lastActiveAt).diff(dayjs(a.lastActiveAt));
    });

    return out;
  }, [period, roleGroup, statusFilter, debouncedSearch]);

  const totalFiltered = filteredLogs.length;
  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage,
  );

  const canGoPrev = page > 0;
  const canGoNext = (page + 1) * rowsPerPage < totalFiltered;

  const resetPage = (fn: () => void) => {
    fn();
    setPage(0);
  };

  // ── Render ────────────────────────────────────────────────────────────────
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
            <span className="hidden text-xs text-white/35 sm:inline">
              · updates on demand
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.09] hover:text-white"
          >
            <RefreshCcw className="size-3.5" strokeWidth={2} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
          value={DUMMY_LOGS.length}
          sub="admins · drivers · riders"
          accent="text-white"
        />
      </div>

      {/* Currently online + recent feed */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Online strip — 2/3 width */}
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
            <OnlineStrip logs={DUMMY_LOGS} />
          </div>

          {/* Status proportion bar */}
          <div className="border-t border-white/[0.05] px-5 py-3">
            <div className="flex items-center gap-4">
              {(
                [
                  { label: "Online",  count: onlineCount,  color: "bg-emerald-400/80" },
                  { label: "Idle",    count: idleCount,    color: "bg-amber-400/80"   },
                  { label: "Offline", count: offlineCount, color: "bg-white/20"       },
                ] as const
              ).map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs">
                  <span className={cn("size-2 rounded-full", color)} />
                  <span className="text-white/50">
                    <span className="font-semibold text-white">{count}</span>{" "}
                    {label}
                  </span>
                </div>
              ))}

              {/* Visual bar */}
              <div className="ml-auto hidden h-2 w-36 overflow-hidden rounded-full bg-white/[0.06] sm:flex">
                {[
                  { w: (onlineCount  / DUMMY_LOGS.length) * 100, cls: "bg-emerald-400/70" },
                  { w: (idleCount    / DUMMY_LOGS.length) * 100, cls: "bg-amber-400/70"   },
                ].map(({ w, cls }, i) => (
                  <div key={i} className={cn("h-full", cls)} style={{ width: `${w}%` }} />
                ))}
                <div className="h-full flex-1 bg-white/15" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity feed — 1/3 width */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
          <div className="border-b border-white/[0.05] px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Clock className="size-4 text-[#a855f7]" strokeWidth={1.75} />
              Recent Activity
            </h2>
          </div>
          <div className="p-5">
            <RecentFeed logs={DUMMY_LOGS} />
          </div>
        </div>
      </div>

      {/* ── Activity Table ─────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Login History</h2>
            <p className="mt-0.5 text-xs text-white/40">
              {totalFiltered} record{totalFiltered !== 1 ? "s" : ""}
              {filteredLogs.some((l) => l.status === "online") && (
                <>
                  {" · "}
                  <span className="text-emerald-400">
                    {filteredLogs.filter((l) => l.status === "online").length} online
                  </span>
                </>
              )}
              {filteredLogs.some((l) => l.status === "idle") && (
                <>
                  {" · "}
                  <span className="text-amber-400">
                    {filteredLogs.filter((l) => l.status === "idle").length} idle
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
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

            {/* Role group */}
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
                value={roleGroup}
                onValueChange={(v) => resetPage(() => setRoleGroup(v))}
                aria-label="Filter by role group"
              />
            </div>

            {/* Status */}
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
                value={statusFilter}
                onValueChange={(v) => resetPage(() => setStatusFilter(v))}
                aria-label="Filter by status"
              />
            </div>

            {/* Period */}
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
                value={period}
                onValueChange={(v) => resetPage(() => setPeriod(v))}
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

            <tbody className="divide-y divide-white/[0.05]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-white/40"
                  >
                    No activity records match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={cn(
                      "transition hover:bg-white/[0.025]",
                      log.status === "online" && "bg-emerald-500/[0.025]",
                    )}
                  >
                    {/* Staff */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div
                            className={cn(
                              "flex size-9 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white",
                              log.avatarGradient,
                            )}
                          >
                            {log.initials}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5">
                            <StatusDot status={log.status} />
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
                      <RoleBadge role={log.role} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={log.status} />
                    </td>

                    {/* Last login */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-white/80">
                        {formatLastLogin(log.lastLoginAt)}
                      </p>
                      <p className="mt-0.5 text-[10px] tabular-nums text-white/30">
                        {dayjs(log.lastLoginAt).format("D MMM YYYY")}
                      </p>
                    </td>

                    {/* Session duration + bar */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-white/80">
                        {formatDuration(log.sessionDurationMins)}
                      </p>
                      <div className="mt-1.5 h-[3px] w-20 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            log.status === "online"
                              ? "bg-emerald-400/75"
                              : log.status === "idle"
                                ? "bg-amber-400/75"
                                : "bg-white/20",
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
                      <p className="mt-0.5 text-[10px] text-white/30">{log.browser}</p>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-white/65">
                        <Globe className="size-3.5 shrink-0 text-white/25" strokeWidth={1.75} />
                        <span className="text-xs">{log.location}</span>
                      </div>
                      <p className="mt-0.5 text-[10px] tabular-nums text-white/25">
                        {log.ipAddress}
                      </p>
                    </td>

                    {/* Today's login count */}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePaginationBar
          rowsPerPage={rowsPerPage}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
          isLoading={false}
          onNext={() => { if (canGoNext) setPage((p) => p + 1); }}
          onPrev={() => { if (canGoPrev) setPage((p) => p - 1); }}
          onRowsPerPageChange={(v) => { setRowsPerPage(v); setPage(0); }}
          className="border-t border-white/[0.06]"
        />
      </div>
    </div>
  );
}