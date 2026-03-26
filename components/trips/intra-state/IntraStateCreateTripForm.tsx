"use client";

import { useMemo, useState } from "react";
import { Calendar, Car } from "lucide-react";
import {
  NIGERIA_STATES_INTRA,
  peppFleetMock,
  terminalPairsByState,
} from "@/lib/data/intra-state-mock";
import AdminSelect from "@/components/ui/AdminSelect";
import { cn } from "@/lib/utils";
import { showSuccess } from "@/lib/utils/error-handler";

const card =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] sm:p-8";

const input =
  "mt-1.5 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:ring-2 focus:ring-[#8247E5]/35";

const labelCls = "text-xs font-medium text-white/60";

function firstTerminals(st: string) {
  const t = terminalPairsByState[st];
  return { pu: t?.pickup[0] ?? "", de: t?.dest[0] ?? "" };
}

export default function IntraStateCreateTripForm() {
  const [state, setState] = useState<string>(NIGERIA_STATES_INTRA[0]!);
  const init = firstTerminals(NIGERIA_STATES_INTRA[0]!);
  const [pickup, setPickup] = useState(init.pu);
  const [destination, setDestination] = useState(init.de);
  const terminals = terminalPairsByState[state] ?? { pickup: [], dest: [] };
  const [tripDate, setTripDate] = useState("");
  const [slot, setSlot] = useState<"Morning" | "Afternoon">("Morning");
  const [departureTime, setDepartureTime] = useState("06:45");
  const [vehicleId, setVehicleId] = useState(peppFleetMock[0]?.id ?? "");

  const activeFleet = useMemo(
    () => peppFleetMock.filter((v) => v.status === "active"),
    [],
  );

  const selectedVehicle = useMemo(
    () => peppFleetMock.find((v) => v.id === vehicleId),
    [vehicleId],
  );

  const pickupOptions = useMemo(
    () => terminals.pickup.map((p) => ({ value: p, label: p })),
    [terminals.pickup],
  );
  const destOptions = useMemo(
    () => terminals.dest.map((p) => ({ value: p, label: p })),
    [terminals.dest],
  );

  const onStateChange = (s: string) => {
    setState(s);
    const t = terminalPairsByState[s];
    setPickup(t?.pickup[0] ?? "");
    setDestination(t?.dest[0] ?? "");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !destination || !tripDate || !vehicleId) return;
    showSuccess(
      `Trip draft saved (mock). ${selectedVehicle?.type ?? "Vehicle"} · ${pickup} → ${destination} on ${tripDate}.`,
    );
  };

  return (
    <div className={cn(card)}>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#8247E5]/20 text-[#c084fc]">
          <Car className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white">Create intra-state trip</h2>
          <p className="text-xs text-white/45">
            Assign a PEPP vehicle and route (state, terminals, date, slot) — mirrors the mobile booking
            steps.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Pick-up &amp; destination
          </p>
          <div>
            <span className={labelCls}>State</span>
            <div className="mt-1.5">
              <AdminSelect
                options={NIGERIA_STATES_INTRA.map((s) => ({ value: s, label: s }))}
                value={state}
                onValueChange={onStateChange}
                placeholder="Select state"
                aria-label="State"
              />
            </div>
          </div>
          <div>
            <span className={labelCls}>Pick-up terminal</span>
            <div className="mt-1.5">
              <AdminSelect
                options={
                  pickupOptions.length
                    ? pickupOptions
                    : [{ value: "", label: "No terminals", disabled: true }]
                }
                value={pickup || pickupOptions[0]?.value || ""}
                onValueChange={setPickup}
                placeholder="Choose departure terminal"
                aria-label="Pickup terminal"
              />
            </div>
          </div>
          <div>
            <span className={labelCls}>Destination terminal</span>
            <div className="mt-1.5">
              <AdminSelect
                options={
                  destOptions.length
                    ? destOptions
                    : [{ value: "", label: "No terminals", disabled: true }]
                }
                value={destination || destOptions[0]?.value || ""}
                onValueChange={setDestination}
                placeholder="Select destination terminal"
                aria-label="Destination terminal"
              />
            </div>
          </div>
          <div>
            <label htmlFor="trip-date" className={labelCls}>
              Trip date
            </label>
            <div className="relative mt-1.5">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
              <input
                id="trip-date"
                type="date"
                required
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className={cn(input, "pl-10")}
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Schedule &amp; vehicle assignment
          </p>
          <div>
            <span className={labelCls}>Time slot</span>
            <div className="mt-1.5">
              <AdminSelect
                options={[
                  { value: "Morning", label: "Morning" },
                  { value: "Afternoon", label: "Afternoon" },
                ]}
                value={slot}
                onValueChange={(v) => setSlot(v as "Morning" | "Afternoon")}
                aria-label="Morning or afternoon"
              />
            </div>
          </div>
          <div>
            <label htmlFor="dep-time" className={labelCls}>
              Departure time
            </label>
            <input
              id="dep-time"
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={labelCls}>PEPP vehicle (assigned driver)</span>
            <div className="mt-1.5">
              <AdminSelect
                options={activeFleet.map((v) => ({
                  value: v.id,
                  label: `${v.type} · ${v.plateNumber} · ${v.assignedDriverName}`,
                }))}
                value={vehicleId}
                onValueChange={setVehicleId}
                placeholder="Select vehicle"
                aria-label="Vehicle"
              />
            </div>
            {selectedVehicle ? (
              <p className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-white/50">
                Driver: <span className="text-white/80">{selectedVehicle.assignedDriverName}</span> ·{" "}
                {selectedVehicle.assignedDriverPhone} · {selectedVehicle.capacity} seats ·{" "}
                {selectedVehicle.region}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-6 lg:col-span-2 lg:flex-row lg:justify-end">
          <button
            type="submit"
            className="rounded-xl bg-[#8B5CF6] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#7c3aed]"
          >
            Save trip &amp; publish slot
          </button>
        </div>
      </form>
    </div>
  );
}
