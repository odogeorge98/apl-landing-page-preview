"use client";

import { Suspense } from "react";
import { MainLayout } from "@/components/layout/dashboard";
import SupportCustomerView from "@/components/support/SupportCustomerView";

export default function SupportCustomerPage() {
  return (
    <MainLayout>
      <Suspense
        fallback={
          <div className="mx-auto max-w-[1600px] px-1 text-sm text-white/45">Loading…</div>
        }
      >
        <SupportCustomerView />
      </Suspense>
    </MainLayout>
  );
}
