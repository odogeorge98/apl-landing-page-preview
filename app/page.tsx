import {
  SiteShell, Hero, DashboardPreview, Capabilities, Teams, Milestones,
  Identity, Discover, Pricing, DemoForm, Faq,
} from "@/components/landing";

export default function HomePage() {
  return (
    <SiteShell footer="home">
      <Hero />
      <DashboardPreview />
      <Capabilities />
      <Teams />
      <Milestones />
      <Identity />
      <Discover />
      <Pricing />
      <DemoForm />
      <Faq />
    </SiteShell>
  );
}
