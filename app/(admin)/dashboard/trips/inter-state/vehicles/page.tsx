"use client";

import { MainLayout } from "@/components/layout/dashboard";
import InterStateShell from "@/components/trips/inter-state/InterStateShell";
import InterStateVehiclesTable from "@/components/trips/inter-state/InterStateVehiclesTable";

export default function InterStateVehiclesPage() {
  return (
    <MainLayout>
      <InterStateShell>
        <InterStateVehiclesTable />
      </InterStateShell>
    </MainLayout>
  );
}
