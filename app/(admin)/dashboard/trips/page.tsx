"use client";

import { MainLayout } from "@/components/layout/dashboard";
import TripsList from "@/components/trips/TripsList";

export default function TripsPage() {
  return (
    <MainLayout>
      <TripsList />
    </MainLayout>
  );
}
