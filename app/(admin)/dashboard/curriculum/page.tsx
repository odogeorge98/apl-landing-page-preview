"use client";

import { MainLayout } from "@/components/layout/dashboard";
import CurriculumOverview from "@/components/curriculum/CurriculumOverview";

export default function AdminCurriculumPage() {
  return (
    <MainLayout>
      <CurriculumOverview />
    </MainLayout>
  );
}
