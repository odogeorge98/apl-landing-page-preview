import ActivityMonitor from "@/components/activity/ActivityMonitor";
import { MainLayout } from "@/components/layout/dashboard";

export const metadata = {
  title: "Activity Monitor — PEPP Cruise Admin",
};

export default function ActivityPage() {
  return (
    <MainLayout>
      <ActivityMonitor />
    </MainLayout>
  );
}