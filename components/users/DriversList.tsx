"use client";

import { useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { Filter, Plus, Search } from "lucide-react";
import { mockDrivers, driversKpis } from "@/lib/data/users-mock";
import { UsersListKpi } from "./UsersListKpi";
import { DriverStatusBadge, KycStatusText } from "./UserStatusBadge";
import { RowActionsMenu } from "./RowActionsMenu";
import { TablePaginationBar } from "./TablePaginationBar";
import AdminSelect from "@/components/ui/AdminSelect";

const tableCard =
  "overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

export default function DriversList() {
  const dateLine = dayjs().format("dddd, MMM D, YYYY");
  const [driverFilter, setDriverFilter] = useState("all");

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-white/40">{dateLine}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Drivers
          </h1>
          <p className="mt-1 text-sm text-white/45">Manage all drivers</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#8247E5]/50 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#8247E5] hover:bg-[#8247E5]/10 sm:self-auto"
        >
          <Plus className="size-4" strokeWidth={2} />
          Add New User
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {driversKpis.map((k) => (
          <UsersListKpi key={k.title} title={k.title} value={k.value} />
        ))}
      </div>

      <div className={tableCard}>
        <div className="flex flex-col gap-4 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-white">All Drivers</h2>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 sm:min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                placeholder="Search driver name, phone, email…"
                className="w-full rounded-xl bg-white/[0.07] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2"
                aria-label="Search drivers"
              />
            </div>
            <div className="w-full shrink-0 sm:min-w-[160px]">
              <AdminSelect
                icon={Filter}
                size="lg"
                options={[
                  { value: "all", label: "All filters" },
                  { value: "active", label: "Active" },
                  { value: "kyc", label: "KYC pending" },
                ]}
                value={driverFilter}
                onValueChange={setDriverFilter}
                aria-label="Filter drivers"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                <th className="px-4 py-3 font-medium">Driver Name</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total Trips</th>
                <th className="px-4 py-3 font-medium">Earnings</th>
                <th className="px-4 py-3 font-medium">Last Active</th>
                <th className="px-4 py-3 font-medium">KYC Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {mockDrivers.map((d) => (
                <tr key={d.id} className="text-white/85 transition hover:bg-white/[0.02]">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#92400e]" />
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/users/drivers/${d.id}`}
                          className="font-semibold text-white hover:text-[#c4b5fd]"
                        >
                          {d.name}
                        </Link>
                        <p className="truncate text-xs text-white/40">{d.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-white/75">{d.vehicle}</td>
                  <td className="px-4 py-3.5">
                    <DriverStatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3.5 tabular-nums">{d.totalTrips}</td>
                  <td className="px-4 py-3.5 tabular-nums font-medium text-white">{d.earnings}</td>
                  <td className="px-4 py-3.5 text-white/65">{d.lastActive}</td>
                  <td className="px-4 py-3.5">
                    <KycStatusText status={d.kyc} />
                  </td>
                  <td className="px-4 py-3.5">
                    <RowActionsMenu profileHref={`/dashboard/users/drivers/${d.id}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePaginationBar pageStart={1} pageEnd={10} total={460} />
      </div>
    </div>
  );
}
