import { ChartNoAxesCombined, FolderCheck, GraduationCap, Users } from "lucide-react";
import { Container, Eyebrow, H2 } from "./Section";
import { CAPABILITIES } from "./data";

const ICONS = { folder: FolderCheck, chart: ChartNoAxesCombined, users: Users, cap: GraduationCap };

export function Capabilities() {
  return (
    <section className="bg-mist py-16 md:py-24">
      <Container>
        <Eyebrow>One connected academic foundation</Eyebrow>
        <H2 lines={["Less admin.", "More progress."]} className="mt-4" />
        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 md:gap-5">
          {CAPABILITIES.map((c) => {
            const Icon = ICONS[c.icon as keyof typeof ICONS];
            return (
              <article key={c.title} className="rounded-lg border border-line bg-white p-6 md:p-8 md:pb-14">
                <span className="grid size-[52px] place-items-center rounded-lg bg-lav text-brand"><Icon className="size-6" /></span>
                <h3 className="mt-6 text-2xl font-bold tracking-tight text-ink md:mt-8">{c.title}</h3>
                <p className="mt-4 text-sm text-muted">{c.body}</p>
                <a href="#demo" className="mt-6 inline-block text-sm font-bold text-brand hover:underline">Explore capability</a>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
