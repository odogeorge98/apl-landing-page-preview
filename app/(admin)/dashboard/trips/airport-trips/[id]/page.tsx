"use client";

import { useParams } from "next/navigation";

import { MainLayout } from "@/components/layout/dashboard";
import ScheduledAirportTripDetailView from "@/components/trips/airport-trip/ScheduledAirportTripDetailView";

export default function AirportTripDetailPage() {
  const params = useParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  return (
    <MainLayout>
      <ScheduledAirportTripDetailView tripId={id} />
    </MainLayout>
  );
}