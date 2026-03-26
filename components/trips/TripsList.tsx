"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
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
import {
  mockTrips,
  mockTripsTotalCount,
  serviceLineLabel,
  tripsKpis,
  type TripServiceLine,
  type TripStatus,
} from "@/lib/data/trips-mock";
import { TablePaginationBar } from "@/components/users/TablePaginationBar";
import { cn } from "@/lib/utils";
import AdminSelect from "@/components/ui/AdminSelect";

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

export type TripsListProps = {
  /** Initial service line filter (e.g. inter-state route). Users can still change it. */
  defaultServiceLineFilter?: TripServiceLine | "all";
  headingTitle?: string;
  headingDescription?: string;
  tableSectionTitle?: string;
};

export default function TripsList({
  defaultServiceLineFilter = "all",
  headingTitle = "Trips",
  headingDescription = "Monitor and manage every trip",
  tableSectionTitle = "All Trips",
}: TripsListProps = {}) {
  const dateLine = dayjs().format("dddd, MMM D, YYYY");
  const [tripFilter, setTripFilter] = useState("all");
  const [serviceLineFilter, setServiceLineFilter] = useState<string>(defaultServiceLineFilter);
  const [search, setSearch] = useState("");

  const filteredTrips = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockTrips.filter((t) => {
      if (tripFilter !== "all") {
        const want = tripFilter === "canceled" ? "Canceled" : tripFilter === "active" ? "Active" : "Completed";
        if (t.status !== want) return false;
      }
      if (serviceLineFilter !== "all" && t.serviceLine !== (serviceLineFilter as TripServiceLine)) {
        return false;
      }
      if (!q) return true;
      return (
        t.tripId.includes(q) ||
        t.passenger.name.toLowerCase().includes(q) ||
        t.driver.name.toLowerCase().includes(q) ||
        t.passenger.email.toLowerCase().includes(q) ||
        t.driver.email.toLowerCase().includes(q)
      );
    });
  }, [tripFilter, serviceLineFilter, search]);

  const pageStart = filteredTrips.length ? 1 : 0;
  const pageEnd = filteredTrips.length;

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <div>
        <p className="text-xs text-white/40">{dateLine}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{headingTitle}</h1>
        <p className="mt-1 text-sm text-white/45">{headingDescription}</p>
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
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-3 sm:gap-y-2">
          <h2 className="shrink-0 text-base font-semibold text-white">{tableSectionTitle}</h2>
          <div className="flex w-full min-w-0 flex-1 flex-wrap items-center gap-2 sm:justify-end">
            <div className="relative min-w-0 max-w-[260px] flex-1 sm:flex-initial sm:max-w-[280px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, names…"
                className="w-full rounded-lg bg-white/[0.07] py-2 pl-8 pr-2.5 text-xs text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2"
                aria-label="Search trips"
              />
            </div>
            <div className="w-[min(100%,160px)] shrink-0 sm:w-[150px]">
              <AdminSelect
                icon={Filter}
                size="md"
                options={[
                  { value: "all", label: "All lines" },
                  { value: "inter_state", label: "Inter state" },
                  { value: "intra_state", label: "Intra state" },
                  { value: "fleet", label: "Fleet" },
                ]}
                value={serviceLineFilter}
                onValueChange={setServiceLineFilter}
                aria-label="Filter by service line"
              />
            </div>
            <div className="w-[min(100%,150px)] shrink-0 sm:w-[140px]">
              <AdminSelect
                size="md"
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "completed", label: "Completed" },
                  { value: "canceled", label: "Canceled" },
                ]}
                value={tripFilter}
                onValueChange={setTripFilter}
                aria-label="Filter trips by status"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                <th className="px-4 py-3 font-medium">Trip ID</th>
                <th className="px-4 py-3 font-medium">Passenger</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Service line</th>
                <th className="px-4 py-3 font-medium">Trip Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Fare</th>
                <th className="px-4 py-3 font-medium">Date &amp; Time</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredTrips.map((trip, idx) => (
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
                  <td className="px-4 py-3.5 text-white/80">{serviceLineLabel(trip.serviceLine)}</td>
                  <td className="px-4 py-3.5 text-white/75">{trip.tripType}</td>
                  <td className="px-4 py-3.5">
                    <TripStatusPill status={trip.status} />
                  </td>
                  <td className="px-4 py-3.5 tabular-nums font-medium text-white">{trip.fare}</td>
                  <td className="px-4 py-3.5 tabular-nums text-white/65">{trip.dateTime}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/dashboard/trips/${trip.id}`}
                      className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-[#00d7c4] underline-offset-4 transition hover:text-[#5eead4] hover:underline"
                    >
                      View details
                      <span aria-hidden className="translate-y-px">
                        →
                      </span>
                    </Link>
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
