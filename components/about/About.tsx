import Image from "next/image";
import { History, KeyRound, ShieldCheck } from "lucide-react";
import { ButtonLink, Container, Eyebrow, H2 } from "@/components/landing/Section";

const ROLES = [
  { title: "Institution teams", body: "A familiar institutional home for admissions, Registry, finance and academic operations." },
  { title: "Academic staff", body: "Focused tools for teaching, score entry, review and publication responsibilities." },
  { title: "Students & families", body: "Clear progress, learning resources and authorized guardian access — never open access to every record." },
];
const STEPS = [
  { title: "Admit", body: "Validate admission lists and establish an institution-owned record." },
  { title: "Enrol", body: "Organize programmes, courses, sessions and registration." },
  { title: "Progress", body: "Review results and resolve issues before publication." },
  { title: "Graduate", body: "Confirm graduation records, transcripts and NYSC readiness." },
];
const TRUST = [
  { icon: ShieldCheck, title: "Institution-owned identity", body: "Your institution governs its records, calendar and student identity." },
  { icon: KeyRound, title: "Role-aware permissions", body: "People see the work they are authorized to do, in the appropriate tenant." },
  { icon: History, title: "Accountable change", body: "Corrections and approvals need a clear owner and a retained history." },
];

export function About() {
  return (
    <>
      <section className="bg-lav py-14 md:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-[1fr_440px] lg:gap-20">
          <div>
            <Eyebrow>About Academic Pavilion</Eyebrow>
            <h1 className="mt-8 text-[40px] font-bold leading-[1.08] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[64px]">
              <span className="block">Built for people.</span>
              <span className="block">Made for progress.</span>
            </h1>
            <p className="mt-7 text-lg text-muted">Connecting the people who move Nigerian tertiary education forward.</p>
            <p className="mt-6 text-sm text-muted">Our mission: make every academic milestone clearer, from admission to life after graduation.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/#platform" className="h-12">Explore the platform</ButtonLink>
              <ButtonLink href="/#demo" variant="light" className="h-12 border border-line">Talk to APL</ButtonLink>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg bg-white lg:relative lg:bg-transparent">
            <div className="relative aspect-[4/3] lg:aspect-[440/395]">
              <Image src="/assets/landing/library.jpg" alt="Students collaborating in a university library" fill priority sizes="(min-width:1024px) 440px, 100vw" className="object-cover" />
            </div>
            <div className="p-5 lg:absolute lg:inset-x-5 lg:bottom-5 lg:rounded-lg lg:bg-white lg:p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Institution first. People always.</p>
              <p className="mt-2 text-xs text-muted">A shared foundation, with space for each institution’s identity.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-navy py-14 text-white md:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-lime">Why APL exists</p>
              <h2 className="mt-6 text-4xl font-bold leading-[1.1] tracking-[-0.04em] md:text-5xl">Progress shouldn’t get lost between systems.</h2>
            </div>
            <div className="text-base leading-relaxed lg:pt-4">
              <p>APL brings institutional administration, academic records and student services into role-aware workspaces.</p>
              <p className="mt-5 text-sm">Clear ownership. Better handoffs. Your institution stays in control.</p>
            </div>
          </div>
          <div className="mt-12 grid gap-0 lg:grid-cols-3 lg:gap-12">
            {ROLES.map((r) => (
              <div key={r.title} className="border-t border-white/25 py-6 lg:pt-8">
                <h3 className="text-2xl font-bold tracking-tight">{r.title}</h3>
                <p className="mt-4 text-sm leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#f5f6fb] py-14 md:py-20">
        <Container>
          <Eyebrow>From first offer to next chapter</Eyebrow>
          <H2 lines={["One journey. Connected milestones."]} className="mt-6 lg:text-5xl" />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-lg border-t-2 border-brand bg-white p-6 shadow-sm">
                <span className="text-[10px] font-bold text-brand">0{i + 1}</span>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-ink">{s.title}</h3>
                <p className="mt-4 text-xs leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-white py-14 md:py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>Trust is a design principle</Eyebrow>
            <H2 lines={["Right people.", "Right access."]} className="mt-6" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">Academic records belong to the institution. Access should be purposeful, limited and accountable.</p>
          </div>
          <ul className="space-y-7">
            {TRUST.map((t) => (
              <li key={t.title} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <t.icon className="size-5 shrink-0 text-brand" />
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-ink">{t.title}</h3>
                  <p className="mt-2 text-sm text-muted">{t.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-lime py-14 md:py-16">
        <Container className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <Eyebrow>A clearer next step</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-ink md:text-5xl">Let’s meet your institution.</h2>
            <p className="mt-4 max-w-xl text-sm text-muted">Explore academic workflows, access responsibilities and rollout needs in a focused demo.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/#demo" className="h-12">Book a demo</ButtonLink>
            <ButtonLink href="/#demo" variant="light" className="h-12">Send a contact enquiry</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
