import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/dashboard";
import StationsList from "@/components/stations/StationsList";
import { isStationSegment } from "@/lib/data/stations-mock";

export default async function StationsSegmentPage({
  params,
}: {
  params: Promise<{ segment: string }>;
}) {
  const { segment } = await params;
  if (!isStationSegment(segment)) {
    notFound();
  }

  return (
    <MainLayout>
      <StationsList segment={segment} />
    </MainLayout>
  );
}
