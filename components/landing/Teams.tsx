import { ArrowUpRight } from "lucide-react";
import { Container } from "./Section";
import { TEAMS } from "./data";

export function Teams() {
  return (
    <section id="institutions" className="scroll-mt-20 bg-navy py-16 text-white md:py-24">
      <Container className="grid gap-12 lg:grid-cols-2 lg:gap-24">
        <div>
          <span className="inline-block rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-lime">Designed around people</span>
          <h2 className="mt-8 text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-[56px]">
            <span className="block">One institution.</span>
            <span className="block">Every team.</span>
          </h2>
          <p className="mt-8 text-sm">Give every team the right tools — and the right access.</p>
          <p className="mt-6 text-sm font-bold">Less searching. Clearer ownership. Better handoffs.</p>
        </div>
        <ol className="divide-y divide-white/20 border-b border-white/20">
          {TEAMS.map((t, i) => (
            <li key={t.title} className="flex items-center gap-5 py-6 md:gap-8">
              <span className="w-6 text-xs font-bold">0{i + 1}</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold md:text-2xl">{t.title}</h3>
                <p className="mt-2 text-sm text-white/90">{t.body}</p>
              </div>
              <ArrowUpRight className="size-4 text-white/50" />
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
