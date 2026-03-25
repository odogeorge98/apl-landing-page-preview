"use client";

import { MainLayout } from "@/components/layout/dashboard";
import AddStationForm from "@/components/stations/AddStationForm";

export default function NewStationPage() {
  return (
    <MainLayout>
      <AddStationForm />
    </MainLayout>
  );
}
