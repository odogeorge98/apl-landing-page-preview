"use client";

import { MainLayout } from "@/components/layout/dashboard";
import IntraStateCreateTripForm from "@/components/trips/intra-state/IntraStateCreateTripForm";
import IntraStateShell from "@/components/trips/intra-state/IntraStateShell";

export default function IntraStateCreateTripPage() {
  return (
    <MainLayout>
      <IntraStateShell>
        <IntraStateCreateTripForm />
      </IntraStateShell>
    </MainLayout>
  );
}
