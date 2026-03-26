"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import AdminSelect from "@/components/ui/AdminSelect";

const inputClass =
  "mt-2 w-full rounded-xl bg-white/[0.07] px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2";

const labelClass = "text-sm font-medium text-white/55";

const stationTypeOptions = [
  "CNG Conversion",
  "CNG Stations",
  "Charging Stations",
] as const;

export default function AddStationForm() {
  const [stationType, setStationType] = useState("");
  const [location, setLocation] = useState("");

  return (
    <div className="mx-auto max-w-[900px] space-y-8">
      <div className="flex items-start gap-3">
        <Link
          href="/dashboard/stations/cng-conversion"
          className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Add New Location
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
            Register a new station location so riders and drivers can easily find and use it.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6">
          <div>
            <label htmlFor="station-name" className={labelClass}>
              Station Name
            </label>
            <input
              id="station-name"
              type="text"
              placeholder="Enter station name"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="station-type" className={labelClass}>
              Station Type
            </label>
            <div className="mt-2">
              <AdminSelect
                id="station-type"
                placeholder="Select type"
                options={stationTypeOptions.map((opt) => ({ value: opt, label: opt }))}
                value={stationType}
                onValueChange={setStationType}
                aria-label="Station type"
                size="lg"
              />
            </div>
          </div>
          <div>
            <label htmlFor="address" className={labelClass}>
              Address
            </label>
            <input
              id="address"
              type="text"
              placeholder="Enter station address"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="city-state" className={labelClass}>
              City / State
            </label>
            <div className="mt-2">
              <AdminSelect
                id="city-state"
                placeholder="Select location"
                options={[
                  { value: "abuja", label: "Abuja, FCT" },
                  { value: "lagos", label: "Lagos State" },
                  { value: "kano", label: "Kano State" },
                ]}
                value={location}
                onValueChange={setLocation}
                aria-label="City or state"
                size="lg"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.06] pt-8">
          <p className="text-sm font-semibold text-white">Actions</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/stations/cng-conversion"
              className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-xl border border-[#8247E5]/45 bg-transparent px-5 text-sm font-semibold text-white transition hover:bg-[#8247E5]/10"
            >
              Discard
            </Link>
            <button
              type="button"
              className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-xl bg-[#8B5CF6] px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#7c3aed]"
            >
              Save Station
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
