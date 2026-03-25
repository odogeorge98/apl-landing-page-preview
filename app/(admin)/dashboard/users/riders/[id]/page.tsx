"use client";

import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/dashboard";
import { UserRecordDetail } from "@/components/users/UserRecordDetail";

export default function RiderDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "r-demo";

  return (
    <MainLayout>
      <UserRecordDetail kind="rider" userId={id} />
    </MainLayout>
  );
}
