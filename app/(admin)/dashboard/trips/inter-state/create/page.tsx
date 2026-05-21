"use client";

import { MainLayout } from "@/components/layout/dashboard";
import InterStateCreateTripForm from "@/components/trips/inter-state/InterStateCreateTripForm";
import InterStateShell from "@/components/trips/inter-state/InterStateShell";

export default function InterStateCreateTripPage() {
  return (
    <MainLayout>
      <InterStateShell>
        <InterStateCreateTripForm />
      </InterStateShell>
    </MainLayout>
  );
}
