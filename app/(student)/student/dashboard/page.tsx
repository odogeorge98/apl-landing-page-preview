"use client";

import MainLayout from "@/components/layout/dashboard/MainLayout";
import StudentDashboardView from "@/components/dashboard/student/student-dashboard-view";
import { useStudentDashboard } from "@/lib/hooks/dashboard/use-student-dashboard";

export default function StudentDashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useStudentDashboard();

  return (
    <MainLayout>
      <StudentDashboardView
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
