"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  ArrowUpRight,
  Calendar,
  Car,
  ChevronRight,
  Clock,
  MoreVertical,
  ShipWheel,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  mockDriverEarnings,
  mockPassengerPayments,
  mockPayoutRequests,
  paymentsKpis,
  paymentsTrendPayout,
  paymentsTrendRevenue,
} from "@/lib/data/payments-mock";
import { cn } from "@/lib/utils";
import AdminSelect from "@/components/ui/AdminSelect";

const cardBase =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

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
  return `${smoothLinePath(points)} L ${points[points.length - 1]!.x} ${baseY} L ${points[0]!.x} ${baseY} Z`;
}

const kpiIcons: Record<(typeof paymentsKpis)[number]["key"], LucideIcon> = {
  revenue: Car,
  platform: Wallet,
  paid: ShipWheel,
  pending: Clock,
};

function formatLogYLabel(v: number): string {
  if (v >= 1_000_000_000) return `${v / 1_000_000_000}bn`;
  if (v >= 1_000_000) {
    const x = v / 1_000_000;
    return Number.isInteger(x) ? `${x}m` : `${x}m`.replace(/\.0+$/, "");
  }
  if (v >= 1_000) {
    const x = v / 1_000;
    if (x >= 100) return `${Math.round(x)}K`;
    return Number.isInteger(x) ? `${x}k` : `${x}k`.replace(/\.0+$/, "");
  }
  return String(v);
}

/** Logarithmic grid: 1·10ⁿ, 2·10ⁿ, 5·10ⁿ between 10k and 500m (uniform vertical spacing in log space). */
function logGridTicks(min: number, max: number): number[] {
  const out: number[] = [];
  const e0 = Math.floor(Math.log10(min));
  const e1 = Math.ceil(Math.log10(max));
  for (let e = e0; e <= e1; e++) {
    for (const m of [1, 2, 5]) {
      const v = m * 10 ** e;
      if (v >= min * 0.999 && v <= max * 1.001) out.push(v);
    }
  }
  return out.sort((a, b) => a - b);
}

function PaymentsTrendChart() {
  /** Slightly wider than plot so xMin+slice keeps month labels when filling card height. */
  const viewW = 736;
  const viewH = 248;
  const plotL = 54;
  const plotR = 702;
  const plotT = 34;
  const plotB = 196;
  const monthY = 228;
  const labelX = 46;
  const yMinLog = 10_000;
  const yMaxLog = 500_000_000;
  const logMin = Math.log10(yMinLog);
  const logMax = Math.log10(yMaxLog);
  const sub10kBand = 10;
  const majorVals = new Set([
    10_000, 100_000, 1_000_000, 10_000_000, 100_000_000, 500_000_000,
  ]);

  const yAt = (v: number) => {
    if (!Number.isFinite(v) || v <= 0) return plotB;
    if (v < yMinLog) {
      return plotB - (v / yMinLog) * sub10kBand;
    }
    const vClamped = Math.min(yMaxLog, v);
    const t = (Math.log10(vClamped) - logMin) / (logMax - logMin);
    return plotB - sub10kBand - t * (plotB - plotT - sub10kBand);
  };

  const xAt = (i: number) => plotL + (i / 11) * (plotR - plotL);

  const revPts = paymentsTrendRevenue.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  const payPts = paymentsTrendPayout.map((v, i) => ({ x: xAt(i), y: yAt(v) }));

  const gridTickValues = logGridTicks(yMinLog, yMaxLog);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const june = 5;
  const tipX = xAt(june);
  const tipYRev = yAt(paymentsTrendRevenue[june]!);

  const scrollBar =
    "[scrollbar-width:thin] [scrollbar-color:rgba(168,85,247,0.5)_rgba(255,255,255,0.07)] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/[0.06] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#8247E5]/45 hover:[&::-webkit-scrollbar-thumb]:bg-[#8247E5]/65";

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <div
        className={cn(
          "min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1",
          scrollBar,
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="h-full min-h-[200px]" style={{ width: "max(100%, 42rem)" }}>
          <svg
            viewBox={`0 0 ${viewW} ${viewH}`}
            width="100%"
            height="100%"
            className="block min-h-[200px]"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Payments trend: revenue and payout over twelve months"
          >
        <defs>
          <linearGradient id="payFillRev" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="payFillPayout" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={plotL}
          x2={plotR}
          y1={plotB}
          y2={plotB}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {gridTickValues.map((val) => {
          const y = yAt(val);
          const major = majorVals.has(val);
          return (
            <g key={val}>
              <line
                x1={plotL}
                x2={plotR}
                y1={y}
                y2={y}
                stroke={major ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)"}
                strokeWidth="1"
                strokeDasharray={major ? "5 5" : "3 6"}
              />
              <text
                x={labelX}
                y={y + 4}
                textAnchor="end"
                fill={major ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.28)"}
                fontSize={major ? 10 : 8.5}
                fontWeight="500"
              >
                {formatLogYLabel(val)}
              </text>
            </g>
          );
        })}
        <text
          x={labelX}
          y={plotB + 13}
          textAnchor="end"
          fill="rgba(255,255,255,0.38)"
          fontSize="10"
          fontWeight="500"
        >
          0K
        </text>

        {months.map((m, i) => (
          <text
            key={m}
            x={xAt(i)}
            y={monthY}
            textAnchor="middle"
            fill="rgba(255,255,255,0.38)"
            fontSize="10"
            fontWeight="500"
          >
            {m}
          </text>
        ))}

        <path d={smoothAreaPath(payPts, plotB)} fill="url(#payFillPayout)" />
        <path d={smoothAreaPath(revPts, plotB)} fill="url(#payFillRev)" />

        <path
          d={smoothLinePath(payPts)}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <path
          d={smoothLinePath(revPts)}
          fill="none"
          stroke="#c084fc"
          strokeWidth="2.25"
          strokeLinecap="round"
        />

        <circle cx={tipX} cy={tipYRev} r="6" fill="#ffffff" stroke="#a855f7" strokeWidth="2" />

        <g transform={`translate(${tipX}, ${tipYRev - 58})`}>
          <rect
            x="-64"
            y="-44"
            width="128"
            height="48"
            rx="10"
            fill="rgba(80,40,120,0.94)"
            stroke="rgba(168,85,247,0.35)"
            strokeWidth="1"
          />
          <text x="-54" y="-24" fill="#fff" fontSize="11" fontWeight="700">
            $125.2k
          </text>
          <rect x="2" y="-32" width="52" height="17" rx="6" fill="rgba(168,85,247,0.45)" />
          <text x="28" y="-19.5" textAnchor="middle" fill="#e9d5ff" fontSize="8.5" fontWeight="600">
            Payout ↗
          </text>
          <text x="0" y="-6" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="9">
            June 21, 2023
          </text>
        </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function PaymentKpiCard({
  title,
  value,
  trend,
  positive,
  kpiKey,
}: {
  title: string;
  value: string;
  trend: string;
  positive: boolean;
  kpiKey: (typeof paymentsKpis)[number]["key"];
}) {
  const Icon = kpiIcons[kpiKey];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06]",
        "bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95",
        "p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl text-[#a855f7]">
          <Icon className="size-4" strokeWidth={1.75} />
        </div>
        <span className="p-1 text-white/25">
          <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
        </span>
      </div>
      <p className="text-xs font-medium leading-tight text-white/50">{title}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-[26px]">
        {value}
      </p>
      <p
        className={cn(
          "mt-2 text-xs font-medium",
          positive ? "text-emerald-400/95" : "text-rose-400/95",
        )}
      >
        {trend}
      </p>
    </div>
  );
}

function PassengerStatusPill({ status }: { status: string }) {
  if (status === "Successful") {
    return (
      <span className="inline-flex rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
        Successful
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span className="inline-flex rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/50">
      {status}
    </span>
  );
}

function PersonCell({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-[#8247E5] to-[#5b21b6]" />
      <div className="min-w-0">
        <p className="font-semibold text-white">{name}</p>
        <p className="truncate text-xs text-white/45">{email}</p>
      </div>
    </div>
  );
}

const linkClass = "text-sm font-semibold text-[#00d7c4] transition hover:text-[#5eead4]";

const paymentsPeriodOptions = [
  { value: "2024", label: "Jan 2024 - Dec 2024" },
  { value: "2023", label: "Jan 2023 - Dec 2023" },
] as const;

export default function PaymentsOverview() {
  const [paymentsPeriod, setPaymentsPeriod] = React.useState("2024");

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Payments Overview
          </h1>
          <p className="mt-1 text-sm text-white/45">Manage Payments and Payouts</p>
        </div>
        <Link
          href="/dashboard/transactions/drivers"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[#00d7c4] transition hover:border-[#00d7c4]/35 hover:bg-[#00d7c4]/10 hover:text-[#5eead4] sm:self-auto"
        >
          <ArrowRightLeft className="size-4" strokeWidth={1.75} />
          Transactions
          <ChevronRight className="size-4 opacity-80" strokeWidth={1.75} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {paymentsKpis.map((k) => (
          <PaymentKpiCard
            key={k.key}
            kpiKey={k.key}
            title={k.title}
            value={k.value}
            trend={k.trend}
            positive={k.positive}
          />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
        <section
          className={cn(
            cardBase,
            "flex min-h-[min(520px,calc(100vh-220px))] flex-col p-5 sm:min-h-[480px]",
          )}
        >
          <div className="mb-3 flex shrink-0 flex-col gap-3 sm:mb-4 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
            <h2 className="shrink-0 text-base font-semibold text-white">Payments trend</h2>
            <div className="flex flex-1 flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-white/45">
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#a855f7]" />
                Revenue
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#22d3ee]" />
                Payout
              </span>
            </div>
            <AdminSelect
              icon={Calendar}
              size="sm"
              className="inline-flex w-full max-w-[220px] shrink-0"
              options={[...paymentsPeriodOptions]}
              value={paymentsPeriod}
              onValueChange={setPaymentsPeriod}
              aria-label="Payments period"
            />
          </div>
          <div className="relative min-h-0 w-full flex-1">
            <PaymentsTrendChart />
          </div>
        </section>

        <section
          className={cn(
            cardBase,
            "flex min-h-[min(520px,calc(100vh-220px))] flex-col p-5 sm:min-h-[480px]",
          )}
        >
          <div className="mb-3 flex shrink-0 items-start justify-between gap-3 sm:mb-4">
            <h2 className="text-base font-semibold text-white">Recent Payout Requests</h2>
            <a href="#" className={cn(linkClass, "shrink-0 text-xs sm:text-sm")}>
              View All &gt;
            </a>
          </div>
          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  <th className="pb-3 pl-0 pr-3 pt-0 font-medium">Driver</th>
                  <th className="pb-3 px-3 pt-0 font-medium">Amount Requested</th>
                  <th className="pb-3 px-3 pt-0 font-medium">Date</th>
                  <th className="pb-3 pl-3 pr-0 pt-0 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {mockPayoutRequests.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={cn("text-white/85", idx % 2 === 1 && "bg-white/[0.03]")}
                  >
                    <td className="py-3 pl-0 pr-3">
                      <PersonCell name={row.driver.name} email={row.driver.email} />
                    </td>
                    <td className="px-3 py-3 tabular-nums font-medium text-white">{row.amount}</td>
                    <td className="px-3 py-3 tabular-nums text-white/65">{row.date}</td>
                    <td className="py-3 pl-3 pr-0 text-right">
                      <button
                        type="button"
                        className="inline-flex rounded-lg p-2 text-white/45 hover:bg-white/[0.08] hover:text-white"
                        aria-label="Row actions"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={cn(cardBase, "p-5")}>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-base font-semibold text-white">Recent Passenger Payments</h2>
            <Link href="/dashboard/transactions/drivers" className={cn(linkClass, "text-xs sm:text-sm")}>
              View all transactions &gt;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  <th className="pb-3 pl-0 pr-3 pt-0 font-medium">Passenger</th>
                  <th className="pb-3 px-3 pt-0 font-medium">Amount Paid</th>
                  <th className="pb-3 px-3 pt-0 font-medium">Payment Method</th>
                  <th className="pb-3 pl-3 pr-0 pt-0 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {mockPassengerPayments.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={cn("text-white/85", idx % 2 === 1 && "bg-white/[0.025]")}
                  >
                    <td className="py-4 pl-0 pr-3">
                      <PersonCell name={row.passenger.name} email={row.passenger.email} />
                    </td>
                    <td className="px-3 py-4 tabular-nums font-medium text-white">{row.amount}</td>
                    <td className="px-3 py-4 text-white/70">{row.method}</td>
                    <td className="py-4 pl-3 pr-0">
                      <PassengerStatusPill status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={cn(cardBase, "p-5")}>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-base font-semibold text-white">Recent Driver Earnings</h2>
            <a href="#" className={cn(linkClass, "text-xs sm:text-sm")}>
              View All Earnings &gt;
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  <th className="pb-3 pl-0 pr-3 pt-0 font-medium">Driver</th>
                  <th className="pb-3 px-3 pt-0 font-medium">Trips Completed</th>
                  <th className="pb-3 px-3 pt-0 font-medium">Earnings amount</th>
                  <th className="pb-3 pl-3 pr-0 font-medium">Available balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {mockDriverEarnings.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={cn("text-white/85", idx % 2 === 1 && "bg-white/[0.025]")}
                  >
                    <td className="py-4 pl-0 pr-3">
                      <PersonCell name={row.driver.name} email={row.driver.email} />
                    </td>
                    <td className="px-3 py-4 tabular-nums text-white">{row.trips}</td>
                    <td className="px-3 py-4 tabular-nums font-medium text-white">{row.earnings}</td>
                    <td className="py-4 pl-3 pr-0 tabular-nums text-white/80">{row.available}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
