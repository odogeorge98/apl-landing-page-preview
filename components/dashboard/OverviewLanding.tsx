"use client";

import React from "react";
import dayjs from "dayjs";
import {
  Route,
  Users,
  UserCircle,
  AlertCircle,
  Wallet,
  ChevronDown,
  Plus,
  Minus,
  Search,
  Phone,
  Calendar,
  Car,
  TrendingUp,
  Timer,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const kpi = [
  {
    title: "Ongoing Trips (live)",
    value: "113",
    trend: "+20% from yesterday",
    icon: Route,
  },
  {
    title: "Active Drivers",
    value: "182",
    trend: "+12% from yesterday",
    icon: Users,
  },
  {
    title: "Active Passengers",
    value: "327",
    trend: "+8% from yesterday",
    icon: UserCircle,
  },
  {
    title: "Pending Disputes",
    value: "5",
    trend: "Stable",
    icon: AlertCircle,
  },
  {
    title: "Pending Payouts",
    value: "5",
    trend: "+3% from yesterday",
    icon: Wallet,
  },
];

const attention = [
  { text: "3 Drivers Awaiting approval…", link: "#" },
  { text: "6 Payout requests pending", link: "#" },
  { text: "3 New disputes", link: "#" },
  { text: "2 Vehicles pending inspection", link: "#" },
  { text: "5 Support tickets opened today", link: "#" },
  { text: "Station sync review needed", link: "#" },
];

const analyticsCard =
  "rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

function smoothLinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1]!;
    const p1 = points[i]!;
    const midX = (p0.x + p1.x) / 2;
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function smoothAreaPath(points: { x: number; y: number }[], baseY: number): string {
  if (points.length === 0) return "";
  const line = smoothLinePath(points);
  const last = points[points.length - 1]!;
  const first = points[0]!;
  return `${line} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
}

function ChartFilterSelect({
  icon: Icon,
  className,
  children,
  ...rest
}: React.ComponentProps<"select"> & {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <label
      className={cn(
        "relative inline-flex w-full max-w-[220px] shrink-0 sm:max-w-none",
        className,
      )}
    >
      {Icon ? (
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 z-10 size-3.5 -translate-y-1/2 text-white/40"
          strokeWidth={1.75}
        />
      ) : null}
      <select
        className={cn(
          "h-9 min-h-[36px] w-full min-w-[118px] cursor-pointer appearance-none rounded-xl bg-white/[0.07] py-2 text-left text-xs font-medium text-white outline-none transition hover:bg-white/[0.09] focus:ring-2 focus:ring-[#a855f7]/25",
          Icon ? "pl-9 pr-9" : "pl-3 pr-9",
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/45"
        strokeWidth={1.75}
      />
    </label>
  );
}

function TrendPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold tabular-nums tracking-tight text-emerald-400">
      {children}
    </span>
  );
}

function KpiCard({
  title,
  value,
  trend,
  icon: Icon,
}: (typeof kpi)[number]) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95",
        "p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
        "transition",
      )}
    >
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
      <p className="mt-2 text-xs font-medium text-emerald-400/95">{trend}</p>
    </div>
  );
}

function RevenueChart({ className }: { className?: string }) {
  const plotL = 52;
  const plotR = 688;
  const plotT = 36;
  const plotB = 214;
  const maxK = 250;
  const revK = [38, 45, 55, 64, 78, 125.2, 132, 148, 172, 198, 210, 240];
  const expK = [52, 48, 54, 60, 66, 72, 95, 110, 138, 120, 108, 102];
  const yAt = (k: number) => plotB - (k / maxK) * (plotB - plotT);
  const xAt = (i: number) => plotL + (i / 11) * (plotR - plotL);
  const revPts = revK.map((k, i) => ({ x: xAt(i), y: yAt(k) }));
  const expPts = expK.map((k, i) => ({ x: xAt(i), y: yAt(k) }));
  const juneIdx = 5;
  const tipX = xAt(juneIdx);
  const tipY = yAt(revK[juneIdx]!);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const yTicks = [250, 200, 150, 100, 50, 0];

  return (
    <div className={cn("relative min-h-[280px] w-full flex-1", className)}>
      <svg
        viewBox="0 0 720 248"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="fillRev" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fillExp" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tk) => {
          const y = yAt(tk);
          return (
            <g key={tk}>
              <line
                x1={plotL}
                x2={plotR}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
                strokeDasharray="5 5"
              />
              <text
                x={12}
                y={y + 4}
                fill="rgba(255,255,255,0.38)"
                fontSize="10"
                fontWeight="500"
              >
                {tk === 0 ? "0K" : `${tk}K`}
              </text>
            </g>
          );
        })}

        {months.map((m, i) => (
          <text
            key={m}
            x={xAt(i)}
            y={236}
            textAnchor="middle"
            fill="rgba(255,255,255,0.38)"
            fontSize="10"
            fontWeight="500"
          >
            {m}
          </text>
        ))}

        <path d={smoothAreaPath(expPts, plotB)} fill="url(#fillExp)" />
        <path d={smoothAreaPath(revPts, plotB)} fill="url(#fillRev)" />

        <path
          d={smoothLinePath(expPts)}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={smoothLinePath(revPts)}
          fill="none"
          stroke="#c084fc"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx={tipX} cy={tipY} r="6" fill="#0e0b16" stroke="#a855f7" strokeWidth="2.5" />

        <g transform={`translate(${tipX}, ${tipY - 58})`}>
          <rect
            x="-66"
            y="-40"
            width="132"
            height="48"
            rx="10"
            fill="rgba(18,14,28,0.96)"
          />
          <text x="-54" y="-22" fill="#fff" fontSize="11" fontWeight="700">
            $125.2k
          </text>
          <rect x="6" y="-30" width="48" height="17" rx="5" fill="rgba(34,197,94,0.22)" />
          <text x="30" y="-17.5" textAnchor="middle" fill="#4ade80" fontSize="8.5" fontWeight="700">
            12.5% ↑
          </text>
          <text x="0" y="-4" textAnchor="middle" fill="rgba(255,255,255,0.42)" fontSize="9" fontWeight="500">
            June 21, 2023
          </text>
        </g>
      </svg>
    </div>
  );
}

function ProfitChart() {
  const plotL = 44;
  const plotR = 300;
  const plotT = 22;
  const plotB = 112;
  const maxVal = 2000;
  const yAt = (v: number) => plotB - (v / maxVal) * (plotB - plotT);
  const yTicks = [2000, 1000, 500, 0];
  const barCount = 32;
  const rel = [
    0.32, 0.38, 0.35, 0.45, 0.42, 0.55, 0.48, 0.52, 0.62, 0.44, 0.5, 0.58, 0.41, 0.68, 0.52, 0.56, 0.48,
    0.45, 0.6, 0.42, 0.55, 0.5, 0.46, 0.64, 0.48, 0.54, 0.47, 0.58, 0.44, 0.52, 0.5, 0.46,
  ];
  const gap = (plotR - plotL) / barCount;
  const barW = gap * 0.58;

  return (
    <svg
      viewBox="0 0 312 128"
      className="mt-3 h-[132px] w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {yTicks.map((tk) => {
        const y = yAt(tk);
        return (
          <g key={tk}>
            <line
              x1={plotL}
              x2={plotR}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="5 5"
            />
            <text
              x={4}
              y={y + 3.5}
              fill="rgba(255,255,255,0.38)"
              fontSize="9"
              fontWeight="500"
            >
              {tk === 0 ? "0" : tk === 1000 ? "$1,000" : tk === 2000 ? "$2,000" : "500"}
            </text>
          </g>
        );
      })}

      {rel.map((h, i) => {
        const x = plotL + i * gap + (gap - barW) / 2;
        const bh = (plotB - plotT) * h;
        const y0 = plotB - bh;
        return (
          <rect
            key={i}
            x={x}
            y={y0}
            width={barW}
            height={bh}
            rx={3}
            fill={i % 2 === 0 ? "rgba(168,85,247,0.88)" : "rgba(34,211,238,0.78)"}
          />
        );
      })}

      {[
        { t: "12 AM", x: plotL },
        { t: "8 AM", x: plotL + (plotR - plotL) * 0.33 },
        { t: "4 PM", x: plotL + (plotR - plotL) * 0.67 },
        { t: "11 PM", x: plotR },
      ].map(({ t, x }) => (
        <text
          key={t}
          x={x}
          y={124}
          textAnchor={t === "12 AM" ? "start" : t === "11 PM" ? "end" : "middle"}
          fill="rgba(255,255,255,0.38)"
          fontSize="9"
          fontWeight="500"
        >
          {t}
        </text>
      ))}
    </svg>
  );
}

function TripsChart() {
  const plotL = 44;
  const plotR = 300;
  const plotT = 18;
  const plotB = 102;
  const maxY = 500;
  const yAt = (v: number) => plotB - (v / maxY) * (plotB - plotT);
  const n = 36;
  const vals: number[] = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const peak = Math.exp(-Math.pow((u - 0.67) / 0.18, 2));
    const base = 85 + peak * 335 + Math.sin(i * 0.55) * 28;
    vals.push(Math.min(495, Math.max(40, base)));
  }
  const pts = vals.map((v, i) => ({
    x: plotL + (i / (n - 1)) * (plotR - plotL),
    y: yAt(v),
  }));
  const yTicks = [500, 250, 100, 0];

  return (
    <svg
      viewBox="0 0 312 120"
      className="mt-3 h-[124px] w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="tripAreaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((tk) => {
        const y = yAt(tk);
        return (
          <g key={tk}>
            <line
              x1={plotL}
              x2={plotR}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="5 5"
            />
            <text x={4} y={y + 3.5} fill="rgba(255,255,255,0.38)" fontSize="9" fontWeight="500">
              {tk}
            </text>
          </g>
        );
      })}

      <path d={smoothAreaPath(pts, plotB)} fill="url(#tripAreaFill)" />
      <path
        d={smoothLinePath(pts)}
        fill="none"
        stroke="#c084fc"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {[
        { t: "12 AM", x: plotL },
        { t: "8 AM", x: plotL + (plotR - plotL) * 0.33 },
        { t: "4 PM", x: plotL + (plotR - plotL) * 0.67 },
        { t: "11 PM", x: plotR },
      ].map(({ t, x }) => (
        <text
          key={t}
          x={x}
          y={116}
          textAnchor={t === "12 AM" ? "start" : t === "11 PM" ? "end" : "middle"}
          fill="rgba(255,255,255,0.38)"
          fontSize="9"
          fontWeight="500"
        >
          {t}
        </text>
      ))}
    </svg>
  );
}

export default function OverviewLanding() {
  const dateLine = dayjs().format("dddd, MMM D, YYYY");

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-white/45">{dateLine}</p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpi.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5 lg:items-stretch">
        <section
          className={cn(
            analyticsCard,
            "flex min-h-[400px] flex-col lg:col-span-8 lg:min-h-[min(560px,72vh)]",
          )}
        >
          <div className="mb-2 shrink-0 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start">
            <div className="min-w-0 space-y-2 lg:justify-self-start">
              <p className="text-xs font-medium tracking-wide text-white/45">Total revenue</p>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-3xl font-bold tracking-tight text-white sm:text-[32px]">
                  $240.8K
                </span>
                <TrendPill>
                  <ArrowUp className="size-3" strokeWidth={2.75} />
                  18.2%
                </TrendPill>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 justify-self-center text-[11px] font-medium text-white/45 lg:pt-1">
              <span className="inline-flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full bg-[#a855f7]" aria-hidden />
                Revenue
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full bg-[#22d3ee]" aria-hidden />
                Expenses
              </span>
            </div>
            <div className="flex justify-stretch lg:justify-self-end">
              <ChartFilterSelect
                icon={Calendar}
                defaultValue="2024"
                className="w-full sm:min-w-[200px]"
                aria-label="Revenue date range"
              >
                <option value="2024">Jan 2024 - Dec 2024</option>
                <option value="2023">Jan 2023 - Dec 2023</option>
                <option value="q4">Oct 2024 - Dec 2024</option>
              </ChartFilterSelect>
            </div>
          </div>
          <div className="relative mt-2 min-h-0 flex-1">
            <RevenueChart />
          </div>
        </section>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <section className={analyticsCard}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 shrink-0 text-[#a855f7]" strokeWidth={1.75} />
                  <h3 className="text-sm font-semibold text-white/90">Total Profit Today</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-3xl font-bold tracking-tight text-white sm:text-[30px]">
                    $144.6K
                  </p>
                  <TrendPill>
                    <ArrowUp className="size-3" strokeWidth={2.75} />
                    28.5%
                  </TrendPill>
                </div>
              </div>
              <ChartFilterSelect defaultValue="today" className="sm:max-w-[120px]" aria-label="Profit period">
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This week</option>
              </ChartFilterSelect>
            </div>
            <ProfitChart />
          </section>

          <section className={analyticsCard}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex items-center gap-2">
                  <Timer className="size-4 shrink-0 text-[#a855f7]" strokeWidth={1.75} />
                  <h3 className="text-sm font-semibold text-white/90">Total Trips Today</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-3xl font-bold tracking-tight text-white sm:text-[30px]">400</p>
                  <TrendPill>
                    <ArrowUp className="size-3" strokeWidth={2.75} />
                    16.8%
                  </TrendPill>
                </div>
              </div>
              <ChartFilterSelect defaultValue="today" className="sm:max-w-[120px]" aria-label="Trips period">
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This week</option>
              </ChartFilterSelect>
            </div>
            <TripsChart />
            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/90 opacity-40" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
              </span>
              <span className="text-xs font-semibold text-emerald-400">Live</span>
              <span className="text-xs tabular-nums text-white/45">23 Trips</span>
            </div>
          </section>
        </div>
      </div>

      {/* Map + attention */}
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <section
          className={cn(
            "overflow-hidden rounded-2xl border border-white/[0.08] bg-[#13101f]",
            "shadow-[0_8px_40px_rgba(0,0,0,0.35)] lg:col-span-7",
          )}
        >
          <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold text-white">Map</h3>
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                placeholder="Vehicle, location, drivers, others…"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] py-2 pl-10 pr-3 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-[#8247E5]/35"
              />
            </div>
          </div>
          <div className="relative aspect-[16/10] min-h-[280px] w-full bg-[#0c0a12]">
            {/* Stylized map background */}
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage: `linear-gradient(rgba(56,189,248,0.08) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b16] via-transparent to-transparent" />
            <p className="absolute left-4 top-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
              Abuja
            </p>
            {/* Vehicle pins */}
            {[
              { l: "18%", t: "42%" },
              { l: "44%", t: "36%" },
              { l: "62%", t: "52%" },
              { l: "72%", t: "28%" },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-sm"
                style={{ left: pos.l, top: pos.t }}
              >
                <Car className="size-4" />
              </div>
            ))}
            {/* Popup card */}
            <div className="absolute left-[46%] top-[38%] z-10 w-[min(92%,280px)] -translate-x-1/2 rounded-2xl border border-white/[0.12] bg-[#1c182b]/90 p-3 shadow-2xl backdrop-blur-md sm:left-[48%] sm:translate-x-0">
              <div className="flex gap-3">
                <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-white/10" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white">Toyota Avanza 1.5 A/T</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-white/15 px-1.5 py-0.5 text-[10px] text-white/80">
                      B 3243 ABC
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-400" /> On trip
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-white/[0.08] pt-3">
                <div className="size-9 rounded-full bg-gradient-to-br from-[#8247E5] to-blue-500" />
                <div className="min-w-0 text-xs">
                  <p className="font-semibold text-white">Chris Evan</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-white/45">
                    <Phone className="size-3" /> 081273832821
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/45">
                    <Calendar className="size-3" /> Rent due: 24 Jun 2024
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 flex flex-col overflow-hidden rounded-lg border border-white/10 bg-[#1c182b]/90 shadow-lg">
              <button
                type="button"
                className="border-b border-white/10 px-3 py-2 text-white/80 hover:bg-white/5"
              >
                <Plus className="size-4" />
              </button>
              <button type="button" className="px-3 py-2 text-white/80 hover:bg-white/5">
                <Minus className="size-4" />
              </button>
            </div>
          </div>
        </section>

        <section
          className={cn(
            "flex flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95",
            "shadow-[0_8px_40px_rgba(0,0,0,0.3)] lg:col-span-5",
          )}
        >
          <div className="border-b border-white/[0.06] p-4">
            <h3 className="text-base font-semibold text-white">Needs Your Attention</h3>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {attention.map((row) => (
              <li
                key={row.text}
                className="flex items-start justify-between gap-3 px-4 py-3.5 text-sm"
              >
                <span className="text-white/85">{row.text}</span>
                <a
                  href={row.link}
                  className="shrink-0 font-medium text-[#00d7c4] transition hover:text-[#5eead4]"
                >
                  View details
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto border-t border-white/[0.06] p-4">
            <a
              href="#"
              className="text-sm font-semibold text-[#00d7c4] hover:text-[#5eead4]"
            >
              See All
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
