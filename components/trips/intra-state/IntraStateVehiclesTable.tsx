"use client";

import { useMemo, useState } from "react";
import { Bus, Filter, Search } from "lucide-react";
import { peppFleetMock, type PeppFleetVehicle } from "@/lib/data/intra-state-mock";
import AdminSelect from "@/components/ui/AdminSelect";
import { cn } from "@/lib/utils";
import { TablePaginationBar } from "@/components/users/TablePaginationBar";

const card =
  "overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

function FleetStatus({ s }: { s: PeppFleetVehicle["status"] }) {
  const map = {
    active: "bg-emerald-500/15 text-emerald-300",
    maintenance: "bg-amber-500/15 text-amber-200",
    unassigned: "bg-white/10 text-white/45",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", map[s])}>
      {s.replace("_", " ")}
    </span>
  );
}

export default function IntraStateVehiclesTable() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const rows = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return peppFleetMock.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (!qq) return true;
      return (
        v.id.toLowerCase().includes(qq) ||
        v.type.toLowerCase().includes(qq) ||
        v.plateNumber.toLowerCase().includes(qq) ||
        v.assignedDriverName.toLowerCase().includes(qq) ||
        v.region.toLowerCase().includes(qq)
      );
    });
  }, [q, statusFilter]);

  return (
    <div className={card}>
      <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#8247E5]/20 text-[#c084fc]">
            <Bus className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">PEPP Cruise vehicles</h2>
            <p className="mt-0.5 text-xs text-white/45">
              Fleet units assigned to drivers for intra-state and terminal runs.
            </p>
          </div>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
          <div className="relative w-full max-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Plate, driver, region…"
              className="h-9 w-full rounded-xl bg-white/[0.07] py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/35 outline-none ring-[#8247E5]/25 transition focus:ring-2 sm:text-sm"
              aria-label="Search vehicles"
            />
          </div>
          <div className="w-full shrink-0 sm:w-[160px]">
            <AdminSelect
              icon={Filter}
              size="sm"
              options={[
                { value: "all", label: "All status" },
                { value: "active", label: "Active" },
                { value: "maintenance", label: "Maintenance" },
                { value: "unassigned", label: "Unassigned" },
              ]}
              value={statusFilter}
              onValueChange={setStatusFilter}
              aria-label="Fleet status"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
              <th className="px-4 py-3 font-medium">Vehicle ID</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Plate</th>
              <th className="px-4 py-3 font-medium">Seats</th>
              <th className="px-4 py-3 font-medium">Region</th>
              <th className="px-4 py-3 font-medium">Assigned driver</th>
              <th className="px-4 py-3 font-medium">Driver phone</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {rows.map((v) => (
              <tr key={v.id} className="text-white/85 transition hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-mono text-xs text-[#c4b5fd]">{v.id}</td>
                <td className="px-4 py-3 font-medium text-white">{v.type}</td>
                <td className="px-4 py-3 font-mono tabular-nums text-white/75">{v.plateNumber}</td>
                <td className="px-4 py-3 tabular-nums text-white/75">{v.capacity}</td>
                <td className="px-4 py-3 text-white/75">{v.region}</td>
                <td className="px-4 py-3 text-white/90">{v.assignedDriverName}</td>
                <td className="px-4 py-3 tabular-nums text-white/55">{v.assignedDriverPhone}</td>
                <td className="px-4 py-3">
                  <FleetStatus s={v.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePaginationBar pageStart={rows.length ? 1 : 0} pageEnd={rows.length} total={rows.length} />
    </div>
  );
}
