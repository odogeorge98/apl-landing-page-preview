"use client";

import { MainLayout } from "@/components/layout/dashboard";
import IntraStateShell from "@/components/trips/intra-state/IntraStateShell";
import IntraStateTripsList from "@/components/trips/intra-state/IntraStateTripsList";

export default function IntraStateTripsPage() {
  return (
    <MainLayout>
      <IntraStateShell>
        <IntraStateTripsList />
      </IntraStateShell>
    </MainLayout>
  );
}