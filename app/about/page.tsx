import type { Metadata } from "next";
import { About } from "@/components/about/About";
import { SiteShell } from "@/components/landing";

export const metadata: Metadata = {
  title: "About · Academic Pavilion",
  description: "Connecting the people who move Nigerian tertiary education forward.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <About />
    </SiteShell>
  );
}
