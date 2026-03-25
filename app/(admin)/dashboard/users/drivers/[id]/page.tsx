"use client";

import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/dashboard";
import { UserRecordDetail } from "@/components/users/UserRecordDetail";

export default function DriverDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "d-demo";

  return (
    <MainLayout>
      <UserRecordDetail kind="driver" userId={id} />
    </MainLayout>
  );
}
