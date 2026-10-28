"use client";

import MainLayout from "@/components/layout/dashboard/MainLayout";
import ScheduleView from "@/components/student/schedule/ScheduleView";

export default function StudentSchedulePage() {
  return (
    <MainLayout>
      <ScheduleView />
    </MainLayout>
  );
}
