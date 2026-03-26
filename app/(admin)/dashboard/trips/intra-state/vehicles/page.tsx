"use client";

import { MainLayout } from "@/components/layout/dashboard";
import IntraStateShell from "@/components/trips/intra-state/IntraStateShell";
import IntraStateVehiclesTable from "@/components/trips/intra-state/IntraStateVehiclesTable";

export default function IntraStateVehiclesPage() {
  return (
    <MainLayout>
      <IntraStateShell>
        <IntraStateVehiclesTable />
      </IntraStateShell>
    </MainLayout>
  );
}
