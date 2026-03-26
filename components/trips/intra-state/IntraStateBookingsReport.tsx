"use client";

import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import {
  intraBookingsMock,
  NIGERIA_STATES_INTRA,
  type IntraBooking,
  type IntraBookingStatus,
} from "@/lib/data/intra-state-mock";
import AdminSelect from "@/components/ui/AdminSelect";
import { cn } from "@/lib/utils";
import { TablePaginationBar } from "@/components/users/TablePaginationBar";

const card =
  "overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

function StatusPill({ status }: { status: IntraBookingStatus }) {
  const map: Record<IntraBookingStatus, string> = {
    confirmed: "bg-emerald-500/15 text-emerald-300",
    pending: "bg-amber-500/15 text-amber-200",
    canceled: "bg-white/10 text-white/45",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", map[status])}>
      {status}
    </span>
  );
}

export default function IntraStateBookingsReport() {
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [slotFilter, setSlotFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return intraBookingsMock.filter((b) => {
      if (stateFilter !== "all" && b.state !== stateFilter) return false;
      if (slotFilter !== "all" && b.slot !== slotFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!qq) return true;
      return (
        b.reference.toLowerCase().includes(qq) ||
        b.passengerName.toLowerCase().includes(qq) ||
        b.email.toLowerCase().includes(qq) ||
        b.phone.includes(qq) ||
        b.pickupTerminal.toLowerCase().includes(qq) ||
        b.destinationTerminal.toLowerCase().includes(qq) ||
        b.vehicleType.toLowerCase().includes(qq) ||
        b.driverName.toLowerCase().includes(qq) ||
        b.plateNumber.toLowerCase().includes(qq)
      );
    });
  }, [q, stateFilter, slotFilter, statusFilter]);

  const summary = useMemo(() => {
    const rows = filtered;
    const confirmed = rows.filter((b) => b.status === "confirmed").length;
    const pending = rows.filter((b) => b.status === "pending").length;
    const canceled = rows.filter((b) => b.status === "canceled").length;
    const revenueNgn = rows.reduce((sum, b) => {
      const digits = b.price.replace(/\D/g, "");
      return sum + (digits ? parseInt(digits, 10) : 0);
    }, 0);
    return { rows: rows.length, confirmed, pending, canceled, revenueNgn };
  }, [filtered]);

  return (
    <div className={cn(card)}>
      <div className="grid gap-3 border-b border-white/[0.06] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Rows (filtered)</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{summary.rows}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Confirmed</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-200">{summary.confirmed}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Pending</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-200">{summary.pending}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Fare (filtered)</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-[#00d7c4] sm:text-2xl">
            ₦{summary.revenueNgn.toLocaleString("en-NG")}
          </p>
          {summary.canceled > 0 ? (
            <p className="mt-1 text-[10px] text-white/35">{summary.canceled} canceled in view</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 shrink">
          <h2 className="text-base font-semibold text-white">Complete bookings report</h2>
          <p className="mt-0.5 text-xs text-white/45">
            All intra-state trips: terminals, passengers, seats, next of kin, vehicle & driver.
          </p>
        </div>
        <div
          className="flex min-w-0 items-center gap-2 overflow-x-auto pb-0.5 sm:max-w-[min(100%,820px)] sm:flex-1 sm:justify-end sm:overflow-visible sm:pb-0"
          role="search"
          aria-label="Bookings search and filters"
        >
          <div className="relative h-9 w-[168px] shrink-0 sm:w-[180px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ref, passenger…"
              className="h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.07] py-0 pl-8 pr-2 text-xs text-white placeholder:text-white/35 outline-none ring-[#8247E5]/25 transition focus:ring-2"
              aria-label="Search bookings"
            />
          </div>
          <div className="h-9 w-[148px] shrink-0 sm:w-[156px]">
            <AdminSelect
              icon={Filter}
              size="sm"
              triggerClassName="h-9 min-h-9 py-0 text-xs"
              options={[
                { value: "all", label: "All states" },
                ...NIGERIA_STATES_INTRA.map((s) => ({ value: s, label: s })),
              ]}
              value={stateFilter}
              onValueChange={setStateFilter}
              aria-label="State"
            />
          </div>
          <div className="h-9 w-[128px] shrink-0 sm:w-[136px]">
            <AdminSelect
              size="sm"
              triggerClassName="h-9 min-h-9 py-0 text-xs"
              options={[
                { value: "all", label: "All slots" },
                { value: "Morning", label: "Morning" },
                { value: "Afternoon", label: "Afternoon" },
              ]}
              value={slotFilter}
              onValueChange={setSlotFilter}
              aria-label="Time slot"
            />
          </div>
          <div className="h-9 w-[136px] shrink-0 sm:w-[144px]">
            <AdminSelect
              size="sm"
              triggerClassName="h-9 min-h-9 py-0 text-xs"
              options={[
                { value: "all", label: "All status" },
                { value: "confirmed", label: "Confirmed" },
                { value: "pending", label: "Pending" },
                { value: "canceled", label: "Canceled" },
              ]}
              value={statusFilter}
              onValueChange={setStatusFilter}
              aria-label="Booking status"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-white/40">
              <th className="sticky left-0 z-[1] bg-[#1c182b]/95 px-3 py-3 font-medium backdrop-blur-sm">Ref</th>
              <th className="px-3 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Slot</th>
              <th className="px-3 py-3 font-medium">State</th>
              <th className="px-3 py-3 font-medium">Pickup</th>
              <th className="px-3 py-3 font-medium">Destination</th>
              <th className="px-3 py-3 font-medium">Departure</th>
              <th className="px-3 py-3 font-medium">Vehicle</th>
              <th className="px-3 py-3 font-medium">Driver</th>
              <th className="px-3 py-3 font-medium">Passenger</th>
              <th className="px-3 py-3 font-medium">Contact</th>
              <th className="px-3 py-3 font-medium">Seat</th>
              <th className="px-3 py-3 font-medium">Luggage</th>
              <th className="px-3 py-3 font-medium">Next of kin</th>
              <th className="px-3 py-3 font-medium">Fare</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filtered.map((b) => (
              <tr key={b.id} className="text-white/85 transition hover:bg-white/[0.02]">
                <td className="sticky left-0 z-[1] bg-[#1a1628]/95 px-3 py-3 font-mono text-xs text-[#c4b5fd] backdrop-blur-sm">
                  {b.reference}
                </td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-white/75">{b.tripDate}</td>
                <td className="px-3 py-3 text-white/75">{b.slot}</td>
                <td className="px-3 py-3 text-white/75">{b.state}</td>
                <td className="max-w-[140px] px-3 py-3 text-xs text-white/70">{b.pickupTerminal}</td>
                <td className="max-w-[140px] px-3 py-3 text-xs text-white/70">{b.destinationTerminal}</td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-white/75">{b.departureTime}</td>
                <td className="px-3 py-3">
                  <span className="text-white/90">{b.vehicleType}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-white/35">{b.plateNumber}</span>
                </td>
                <td className="max-w-[120px] px-3 py-3 text-xs">
                  <span className="text-white/90">{b.driverName}</span>
                  <span className="mt-0.5 block text-white/40">{b.driverPhone}</span>
                </td>
                <td className="px-3 py-3 font-medium text-white">{b.passengerName}</td>
                <td className="max-w-[160px] px-3 py-3 text-xs text-white/55">
                  <span className="break-all">{b.email}</span>
                  <span className="mt-0.5 block tabular-nums">{b.phone}</span>
                </td>
                <td className="px-3 py-3 tabular-nums text-white/75">{b.seat}</td>
                <td className="px-3 py-3 text-white/75">{b.luggage}</td>
                <td className="max-w-[130px] px-3 py-3 text-xs text-white/55">
                  {b.nextOfKinName}
                  <span className="mt-0.5 block tabular-nums text-white/40">{b.nextOfKinPhone}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-medium tabular-nums text-white">{b.price}</td>
                <td className="px-3 py-3">
                  <StatusPill status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePaginationBar
        pageStart={filtered.length ? 1 : 0}
        pageEnd={filtered.length}
        total={filtered.length}
      />
    </div>
  );
}
