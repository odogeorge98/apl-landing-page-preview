import Image from "next/image";
import { Building2, HeartHandshake, History, Lock } from "lucide-react";
import { Container, Eyebrow, H2 } from "./Section";
import { IDENTITY } from "./data";

const ICONS = { lock: Lock, history: History, heart: HeartHandshake };

export function Identity() {
  return (
    <section id="about" className="scroll-mt-20 border-b border-line bg-white py-16 md:py-20">
      <Container className="grid items-center gap-10 lg:grid-cols-[540px_1fr] lg:gap-20">
        <div className="relative aspect-[540/480] overflow-hidden rounded-xl bg-navy">
          <Image src="/assets/landing/library.jpg" alt="Students collaborating in a university library" fill sizes="(min-width:1024px) 540px, 100vw" className="object-cover" />
          <div className="absolute inset-x-4 bottom-4 rounded-lg border border-white/50 bg-white/85 p-4 shadow-lg backdrop-blur md:inset-x-6 md:bottom-0 md:translate-y-0">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-bold text-ink"><Building2 className="size-4 text-brand" />Ìmọ University</p>
              <span className="rounded bg-lav px-2 py-1 text-[10px] font-bold text-brand">Private workspace</span>
            </div>
            <p className="mt-3 text-xs text-muted">Your identity. Your academic calendar. Your records.</p>
          </div>
        </div>
        <div>
          <Eyebrow>Institution first, by design</Eyebrow>
          <H2 lines={["Your identity.", "Your own space."]} className="mt-4" />
          <p className="mt-6 text-sm text-muted">Your brand, your sign-in, your academic community.</p>
          <ul className="mt-8 space-y-6">
            {IDENTITY.map((it) => {
              const Icon = ICONS[it.icon as keyof typeof ICONS];
              return (
                <li key={it.title} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-lav text-brand"><Icon className="size-4" /></span>
                  <div>
                    <h3 className="text-sm font-bold text-ink">{it.title}</h3>
                    <p className="mt-1 text-xs text-muted">{it.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
