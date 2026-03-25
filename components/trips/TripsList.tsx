"use client";

import dayjs from "dayjs";
import {
  Car,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  Search,
  ShipWheel,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { mockTrips, mockTripsTotalCount, tripsKpis, type TripStatus } from "@/lib/data/trips-mock";
import { TablePaginationBar } from "@/components/users/TablePaginationBar";
import { cn } from "@/lib/utils";

const tableCard =
  "overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

const kpiIconMap: Record<(typeof tripsKpis)[number]["key"], LucideIcon> = {
  ongoing: Car,
  completed: CheckCircle2,
  cancelled: X,
  scheduled: Clock,
  total: ShipWheel,
};

function TripKpiCard({
  title,
  value,
  trend,
  kpiKey,
}: {
  title: string;
  value: string;
  trend: string;
  kpiKey: (typeof tripsKpis)[number]["key"];
}) {
  const Icon = kpiIconMap[kpiKey];
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95",
        "p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
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
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white lg:text-[28px]">{value}</p>
      <p className="mt-2 text-xs font-medium text-emerald-400/95">{trend}</p>
    </div>
  );
}

function TripStatusPill({ status }: { status: TripStatus }) {
  const styles: Record<TripStatus, string> = {
    Active:
      "bg-teal-500/15 text-teal-300",
    Canceled: "bg-white/10 text-white/50",
    Completed: "bg-emerald-500/15 text-emerald-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        styles[status],
      )}
    >
      {status === "Active" ? <span className="size-1.5 rounded-full bg-teal-400" /> : null}
      {status}
    </span>
  );
}

export default function TripsList() {
  const dateLine = dayjs().format("dddd, MMM D, YYYY");
  const pageStart = 1;
  const pageEnd = mockTrips.length;

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <div>
        <p className="text-xs text-white/40">{dateLine}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Trips</h1>
        <p className="mt-1 text-sm text-white/45">Monitor and manage every trip</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {tripsKpis.map((k) => (
          <TripKpiCard
            key={k.key}
            kpiKey={k.key}
            title={k.title}
            value={k.value}
            trend={k.trend}
          />
        ))}
      </div>

      <div className={tableCard}>
        <div className="flex flex-col gap-4 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-white">All Trips</h2>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 sm:min-w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                placeholder="Search ID, driver or rider name…"
                className="w-full rounded-xl bg-white/[0.07] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2"
                aria-label="Search trips"
              />
            </div>
            <label className="relative flex shrink-0 items-center sm:min-w-[140px]">
              <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
              <select
                className="h-[42px] w-full cursor-pointer appearance-none rounded-xl bg-white/[0.07] py-2 pl-10 pr-9 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-[#a855f7]/25"
                defaultValue="all"
                aria-label="Filter trips"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                <th className="px-4 py-3 font-medium">Trip ID</th>
                <th className="px-4 py-3 font-medium">Passenger</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Trip Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Fare</th>
                <th className="px-4 py-3 font-medium">Date &amp; Time</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {mockTrips.map((trip, idx) => (
                <tr key={trip.id} className="text-white/85 transition hover:bg-white/[0.02]">
                  <td className="px-4 py-3.5 font-mono text-sm tabular-nums text-white">{trip.tripId}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-9 shrink-0 rounded-full bg-gradient-to-br from-[#8247E5] to-[#3b82f6]"
                        style={{ opacity: 0.9 + (idx % 3) * 0.03 }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{trip.passenger.name}</p>
                        <p className="truncate text-xs text-white/40">{trip.passenger.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-700" />
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{trip.driver.name}</p>
                        <p className="truncate text-xs text-white/40">{trip.driver.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-white/75">{trip.tripType}</td>
                  <td className="px-4 py-3.5">
                    <TripStatusPill status={trip.status} />
                  </td>
                  <td className="px-4 py-3.5 tabular-nums font-medium text-white">{trip.fare}</td>
                  <td className="px-4 py-3.5 tabular-nums text-white/65">{trip.dateTime}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      className="text-sm font-semibold text-[#00d7c4] transition hover:text-[#5eead4]"
                    >
                      View Details &gt;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePaginationBar
          pageStart={pageStart}
          pageEnd={pageEnd}
          total={mockTripsTotalCount}
        />
      </div>
    </div>
  );
}
