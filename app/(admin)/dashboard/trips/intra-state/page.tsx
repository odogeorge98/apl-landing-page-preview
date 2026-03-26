"use client";

import { MainLayout } from "@/components/layout/dashboard";
import IntraStateBookingsReport from "@/components/trips/intra-state/IntraStateBookingsReport";
import IntraStateShell from "@/components/trips/intra-state/IntraStateShell";

export default function IntraStateTripsPage() {
  return (
    <MainLayout>
      <IntraStateShell>
        <IntraStateBookingsReport />
      </IntraStateShell>
    </MainLayout>
  );
}
