"use client";

import { useTutorDashboard } from "@/lib/hooks/dashboard/use-tutor-dashboard";
import MainLayout from "@/components/layout/dashboard/MainLayout";
import TutorDashboardView from "@/components/dashboard/tutor/tutor-dashboard-view";

export default function TutorDashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useTutorDashboard();

  return (
    <MainLayout>
      <TutorDashboardView
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
