"use client";

import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/dashboard";
import TripDetailView from "@/components/trips/TripDetailView";

export default function TripDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  return (
    <MainLayout>
      <TripDetailView tripRowId={id} />
    </MainLayout>
  );
}
