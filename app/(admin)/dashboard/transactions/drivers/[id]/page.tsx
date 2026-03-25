"use client";

import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/dashboard";
import DriverTransactionDetail from "@/components/transactions/DriverTransactionDetail";

export default function DriverTransactionDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  return (
    <MainLayout>
      <DriverTransactionDetail driverId={id} />
    </MainLayout>
  );
}
