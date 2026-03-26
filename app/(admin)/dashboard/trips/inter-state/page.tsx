"use client";

import { MainLayout } from "@/components/layout/dashboard";
import TripsList from "@/components/trips/TripsList";

/** Same trips table, KPIs, and filters as All trips, scoped to the inter state service line by default. */
export default function InterStateTripsPage() {
  return (
    <MainLayout>
      <TripsList
        defaultServiceLineFilter="inter_state"
        headingTitle="Inter state"
        headingDescription="Inter-state trips — filters, search, and trip details match the main trips list."
        tableSectionTitle="Inter state trips"
      />
    </MainLayout>
  );
}
