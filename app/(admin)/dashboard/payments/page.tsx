"use client";

import { MainLayout } from "@/components/layout/dashboard";
import PaymentsOverview from "@/components/payments/PaymentsOverview";

export default function PaymentsPage() {
  return (
    <MainLayout>
      <PaymentsOverview />
    </MainLayout>
  );
}
