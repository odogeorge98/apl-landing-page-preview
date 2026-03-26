"use client";

import OverviewLanding from "@/components/dashboard/OverviewLanding";
import { MainLayout } from "@/components/layout/dashboard";

/** Same experience as `/dashboard/overview` — intra-state entry in the sidebar. */
export default function IntraStateTripsPage() {
  return (
    <MainLayout>
      <OverviewLanding />
    </MainLayout>
  );
}
