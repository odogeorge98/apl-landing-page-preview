"use client";

import { MainLayout } from "@/components/layout/dashboard";
import RidersList from "@/components/users/RidersList";

export default function RidersPage() {
  return (
    <MainLayout>
      <RidersList />
    </MainLayout>
  );
}
