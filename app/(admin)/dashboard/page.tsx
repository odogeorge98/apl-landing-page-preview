
"use client";

import AdminDashboardView from "@/components/dashboard/admin/admin-dashboard-view";
import MainLayout from "@/components/layout/dashboard/MainLayout";
import { useAdminDashboard } from "@/lib/hooks/dashboard/use-admin-dashboard";

export default function AdminDashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useAdminDashboard();

  return (
    <MainLayout>
      <AdminDashboardView
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error instanceof Error ? error : null}
        isFetching={isFetching}
        onRetry={() => {
          void refetch();
        }}
      />
    </MainLayout>
  );
}
