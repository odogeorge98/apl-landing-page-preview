"use client";

import { useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { ArrowUpRight, Filter, MoreVertical, Plus, Search } from "lucide-react";
import {
  mockStationsAll,
  mockStationsTotalCount,
  STATION_SEGMENT_TO_CATEGORY,
  stationsKpis,
  type StationSegment,
} from "@/lib/data/stations-mock";
import { TablePaginationBar } from "@/components/users/TablePaginationBar";
import { cn } from "@/lib/utils";
import AdminSelect from "@/components/ui/AdminSelect";

const tableCard =
  "overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

const kpiCard =
  "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

function StationTypeText({ label }: { label: string }) {
  const isEv = label === "EV Station";
  const isCng = label === "CNG Station";
  const isConv = label === "CNG Conversion";
  return (
    <span
      className={cn(
        "text-sm font-semibold",
        isEv && "text-[#7dd3fc]",
        isCng && "text-[#5eead4]",
        isConv && "text-[#5eead4]",
      )}
    >
      {label}
    </span>
  );
}

function StatusPill({ status }: { status: "Active" | "Inactive" }) {
  const active = status === "Active";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        active ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.08] text-white/45",
      )}
    >
      {status}
    </span>
  );
}

export default function StationsList({ segment }: { segment: StationSegment }) {
  const category = STATION_SEGMENT_TO_CATEGORY[segment];
  const rows = mockStationsAll.filter((r) => r.category === category);
  const dateLine = dayjs().format("dddd, MMM D, YYYY");
  const [stationFilter, setStationFilter] = useState("all");

  const pageStart = 1;
  const pageEnd = rows.length;

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-white/40">{dateLine}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Stations
          </h1>
          <p className="mt-1 text-sm text-white/45">Manage old and new stations</p>
        </div>
        <Link
          href="/dashboard/stations/new"
          className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-white/[0.12] bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.04] sm:self-auto"
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.04]">
            <Plus className="size-4" strokeWidth={2} />
          </span>
          Add New Station
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stationsKpis.map((k) => (
          <div key={k.title} className={kpiCard}>
            <div className="mb-6 flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-white/50">{k.title}</span>
              <span className="text-white/25">
                <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className={tableCard}>
          <div className="flex flex-col gap-4 border-b border-white/[0.06] p-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="shrink-0 text-base font-semibold text-white">All Stations</h2>
            <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3 lg:max-w-3xl lg:flex-1 lg:justify-end">
              <div className="relative min-w-0 w-full flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
                <input
                  type="search"
                  placeholder="Search location name, address…"
                  className="w-full rounded-xl bg-white/[0.07] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2"
                  aria-label="Search stations"
                />
              </div>
              <div className="w-full shrink-0 sm:w-[min(100%,200px)] sm:shrink-0">
                <AdminSelect
                  icon={Filter}
                  size="lg"
                  options={[
                    { value: "all", label: "Filter" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  value={stationFilter}
                  onValueChange={setStationFilter}
                  aria-label="Filter stations"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3 font-medium">Station Name</th>
                  <th className="px-4 py-3 font-medium">Station Type</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last Updated</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {rows.map((row) => (
                  <tr key={row.id} className="text-white/85 transition hover:bg-white/[0.02]">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">{row.name}</p>
                      <p className="mt-1 max-w-[280px] text-xs leading-relaxed text-white/40">
                        {row.addressLine}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StationTypeText label={row.stationTypeLabel} />
                    </td>
                    <td className="px-4 py-4 text-white/75">{row.location}</td>
                    <td className="px-4 py-4">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-4 tabular-nums text-white/65">{row.lastUpdated}</td>
                    <td className="px-4 py-4 text-right">
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
        </div>

        <TablePaginationBar
          pageStart={pageStart}
          pageEnd={pageEnd}
          total={mockStationsTotalCount}
          className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
        />
      </div>
    </div>
  );
}
