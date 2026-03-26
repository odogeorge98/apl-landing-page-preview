"use client";

import { MainLayout } from "@/components/layout/dashboard";
import Link from "next/link";
import { Bus, ListOrdered, Truck } from "lucide-react";

const cardBase =
  "flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition hover:border-[#8247E5]/35";

export default function FleetTripsPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-[1600px] space-y-8">
        <div>
          <p className="text-xs text-white/40">Trips · Fleet</p>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#8247E5]/20 text-[#c084fc] sm:size-10">
              <Truck className="size-5" strokeWidth={1.75} />
            </span>
            Fleet
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/45">
            Contract and fleet-ops trips appear under the <span className="text-white/70">Fleet</span> service
            line in the global list. Use PEPP vehicles to see shuttle assets assigned to drivers for scheduled
            runs (intra-state).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/trips?line=fleet" className={cardBase}>
            <div className="flex items-center gap-2 text-white">
              <ListOrdered className="size-4 text-[#00d7c4]" strokeWidth={1.75} />
              <span className="text-sm font-semibold">Fleet trips</span>
            </div>
            <p className="text-xs leading-relaxed text-white/45">
              Open all trips with the service line preset to Fleet.
            </p>
            <span className="text-xs font-semibold text-[#00d7c4]">View list →</span>
          </Link>

          <Link href="/dashboard/trips/intra-state/vehicles" className={cardBase}>
            <div className="flex items-center gap-2 text-white">
              <Bus className="size-4 text-[#c084fc]" strokeWidth={1.75} />
              <span className="text-sm font-semibold">PEPP vehicles</span>
            </div>
            <p className="text-xs leading-relaxed text-white/45">
              Fleet shuttle units and which driver each vehicle is assigned to.
            </p>
            <span className="text-xs font-semibold text-[#00d7c4]">Manage fleet →</span>
          </Link>

          <Link href="/dashboard/trips/intra-state/create" className={cardBase}>
            <div className="flex items-center gap-2 text-white">
              <Truck className="size-4 text-amber-300/90" strokeWidth={1.75} />
              <span className="text-sm font-semibold">Create intra-state trip</span>
            </div>
            <p className="text-xs leading-relaxed text-white/45">
              Schedule a run and attach a vehicle (and driver) from the PEPP pool.
            </p>
            <span className="text-xs font-semibold text-[#00d7c4]">Create trip →</span>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
