"use client";

import MainLayout from "@/components/layout/dashboard/MainLayout";
import LearningMaterialsView from "@/components/student/materials/LearningMaterialsView";

export default function StudentLearningMaterialsPage() {
  return (
    <MainLayout>
      <LearningMaterialsView />
    </MainLayout>
  );
}
