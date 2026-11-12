import type { Metadata } from "next";
import { SiteShell } from "@/components/landing";
import { DiscoveriesBrowser, JournalsSection } from "@/components/discoveries/DiscoveriesBrowser";

export const metadata: Metadata = {
  title: "Discoveries · Academic Pavilion",
  description: "Learning materials and journals for a curious academic community.",
};

export default function DiscoveriesPage() {
  return (
    <SiteShell>
      <DiscoveriesBrowser />
      <JournalsSection />
    </SiteShell>
  );
}
