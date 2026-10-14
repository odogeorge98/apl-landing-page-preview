"use client";

import MainLayout from "@/components/layout/dashboard/MainLayout";
import StudentDashboardView from "@/components/dashboard/student/student-dashboard-view";
import { useStudentLearningProgress } from "@/lib/hooks/dashboard/use-student-learning-progress";
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
  const progressQuery = useStudentLearningProgress();

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
        progress={progressQuery.data}
        progressIsLoading={progressQuery.isLoading}
        progressIsError={progressQuery.isError}
        progressError={progressQuery.error instanceof Error ? progressQuery.error : null}
        progressIsFetching={progressQuery.isFetching}
        onProgressRetry={() => {
          void progressQuery.refetch();
        }}
      />
    </MainLayout>
  );
}
