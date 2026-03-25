"use client";

import { MainLayout } from "@/components/layout/dashboard";
import DriversList from "@/components/users/DriversList";

export default function DriversPage() {
  return (
    <MainLayout>
      <DriversList />
    </MainLayout>
  );
}
