"use client";

import { MainLayout } from "@/components/layout/dashboard";
import InterStateBookingsReport from "@/components/trips/inter-state/InterStateBookingsReport";
import InterStateShell from "@/components/trips/inter-state/InterStateShell";

export default function InterStateTripsPage() {
  return (
    <MainLayout>
      <InterStateShell>
        <InterStateBookingsReport />
      </InterStateShell>
    </MainLayout>
  );
}
