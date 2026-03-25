"use client";

import { MainLayout } from "@/components/layout/dashboard";
import DriverTransactionsList from "@/components/transactions/DriverTransactionsList";

export default function DriverTransactionsPage() {
  return (
    <MainLayout>
      <DriverTransactionsList />
    </MainLayout>
  );
}
