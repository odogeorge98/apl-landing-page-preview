"use client";

import { MainLayout } from "@/components/layout/dashboard";
import IntraStateVehiclesTable from "@/components/trips/intra-state/IntraStateVehiclesTable";

export default function PeppVehiclesPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div>
          <p className="text-xs text-white/40">Fleet</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            PEPP vehicles
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/45">
            Peppcruise vehicles assigned to drivers — not tied to inter- or intra-state menus.
          </p>
        </div>
        <IntraStateVehiclesTable />
      </div>
    </MainLayout>
  );
}
