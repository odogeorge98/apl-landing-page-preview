"use client";

import Link from "next/link";
import { ArrowLeft, TrendingUp, Car } from "lucide-react";
import { getDriverTransactionDetail } from "@/lib/data/driver-transactions-mock";
import type { DriverLedgerEntry } from "@/lib/data/driver-transactions-mock";
import { cn } from "@/lib/utils";
import { ChartFillSvg, smoothAreaPath, smoothLinePath } from "./chart-fill-utils";

const shell =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

const statCard =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.22)]";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className={statCard}>
      <p className="text-xs font-medium text-white/50">{label}</p>
      <p className="mt-3 text-xl font-bold tabular-nums tracking-tight text-white sm:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-2 text-[11px] text-white/40">{hint}</p> : null}
    </div>
  );
}

function EarningsTrendCard({ values }: { values: number[] }) {
  const plotL = 48;
  const plotR = 620;
  const plotT = 28;
  const plotB = 200;
  const maxV = Math.max(...values, 1);
  const minV = Math.min(...values);
  const span = Math.max(maxV - minV, maxV * 0.08);
  const yLow = minV - span * 0.12;
  const yHigh = maxV + span * 0.08;
  const yAt = (v: number) => plotB - ((v - yLow) / (yHigh - yLow)) * (plotB - plotT);
  const xAt = (i: number) => plotL + (i / 11) * (plotR - plotL);
  const pts = values.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <section className={cn(shell, "flex min-h-[360px] flex-col p-4 sm:min-h-[min(460px,52vh)] sm:p-5")}>
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-[#a855f7]" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-white">Earnings trend</h2>
        </div>
        <span className="text-[11px] font-medium text-white/45">Last 12 months (₦)</span>
      </div>
      <div className="relative min-h-[220px] w-full flex-1">
        <ChartFillSvg viewBox="0 0 640 220">
          <defs>
            <linearGradient id="drvEarnFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = plotT + t * (plotB - plotT);
            return (
              <line
                key={t}
                x1={plotL}
                x2={plotR}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}
          <path d={smoothAreaPath(pts, plotB)} fill="url(#drvEarnFill)" />
          <path
            d={smoothLinePath(pts)}
            fill="none"
            stroke="#c084fc"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
          {months.map((m, i) => (
            <text
              key={m}
              x={xAt(i)}
              y={214}
              textAnchor="middle"
              fill="rgba(255,255,255,0.35)"
              fontSize="9"
              fontWeight="500"
            >
              {m}
            </text>
          ))}
        </ChartFillSvg>
      </div>
    </section>
  );
}

function TxnStatusPill({ status }: { status: DriverLedgerEntry["status"] }) {
  if (status === "Completed") {
    return (
      <span className="inline-flex rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
        {status}
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span className="inline-flex rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">
      {status}
    </span>
  );
}

function TripVolumeCard({ values }: { values: number[] }) {
  const plotL = 48;
  const plotR = 620;
  const plotT = 32;
  const plotB = 200;
  const maxV = Math.max(...values, 1);
  const barGap = (plotR - plotL) / values.length;
  const barW = barGap * 0.52;
  const labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];

  return (
    <section className={cn(shell, "flex min-h-[360px] flex-col p-4 sm:min-h-[min(460px,52vh)] sm:p-5")}>
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Car className="size-4 text-[#22d3ee]" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-white">Trip volume</h2>
        </div>
        <span className="text-[11px] font-medium text-white/45">Recent 12 weeks</span>
      </div>
      <div className="relative min-h-[220px] w-full flex-1">
        <ChartFillSvg viewBox="0 0 640 220">
          {[0, 0.33, 0.66, 1].map((t) => {
            const y = plotT + t * (plotB - plotT);
            return (
              <line
                key={t}
                x1={plotL}
                x2={plotR}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}
          {values.map((v, i) => {
            const bh = Math.max(2, (v / maxV) * (plotB - plotT - 10));
            const x = plotL + i * barGap + (barGap - barW) / 2;
            const y = plotB - bh;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barW}
                height={bh}
                rx={3}
                fill={i % 2 === 0 ? "rgba(34,211,238,0.75)" : "rgba(168,85,247,0.75)"}
              />
            );
          })}
          {labels.map((lb, i) => (
            <text
              key={lb}
              x={plotL + i * barGap + barGap / 2}
              y={214}
              textAnchor="middle"
              fill="rgba(255,255,255,0.35)"
              fontSize="9"
              fontWeight="500"
            >
              {lb}
            </text>
          ))}
        </ChartFillSvg>
      </div>
    </section>
  );
}

export default function DriverTransactionDetail({ driverId }: { driverId: string }) {
  const detail = getDriverTransactionDetail(driverId);

  if (!detail) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6">
        <Link
          href="/dashboard/transactions/drivers"
          className="inline-flex items-center gap-2 text-sm text-[#00d7c4] hover:text-[#5eead4]"
        >
          <ArrowLeft className="size-4" />
          Back to driver transactions
        </Link>
        <p className="text-white/60">Driver not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/dashboard/transactions/drivers"
            className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-start gap-3">
            <div className="size-14 shrink-0 rounded-full bg-gradient-to-br from-[#8247E5] to-[#5b21b6]" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {detail.name}
              </h1>
              <p className="mt-1 text-sm text-white/45">{detail.email}</p>
              <p className="mt-2 text-xs text-white/35">Driver transaction profile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total earnings (MTD)" value={detail.stats.totalEarningsMtd} />
        <StatCard label="Pending settlement" value={detail.stats.pendingSettlement} />
        <StatCard
          label="Trips completed"
          value={String(detail.stats.tripsCompleted)}
          hint="Rolling window"
        />
        <StatCard label="Avg. per trip" value={detail.stats.avgPerTrip} />
      </div>

      <div className="grid min-h-0 gap-5 lg:grid-cols-2 lg:items-stretch">
        <EarningsTrendCard values={detail.monthlyEarnings} />
        <TripVolumeCard values={detail.weeklyTrips} />
      </div>

      <section className={cn(shell, "p-4 sm:p-5")}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">All transactions</h2>
            <p className="mt-1 text-sm text-white/45">
              Earnings, payouts, and adjustments for this driver (newest first)
            </p>
          </div>
          <span className="text-xs font-medium text-white/40">
            {detail.transactions.length} shown
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Description</th>
                <th className="px-3 py-3 font-medium">Amount</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {detail.transactions.map((t, idx) => (
                <tr
                  key={t.id}
                  className={cn("text-white/85", idx % 2 === 1 && "bg-white/[0.02]")}
                >
                  <td className="whitespace-nowrap px-3 py-3.5 text-white/65">{t.date}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-medium text-white">{t.type}</td>
                  <td className="max-w-[320px] px-3 py-3.5 text-white/70">
                    <span className="line-clamp-2">{t.description}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 tabular-nums font-medium text-white">
                    {t.amount}
                  </td>
                  <td className="px-3 py-3.5">
                    <TxnStatusPill status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
