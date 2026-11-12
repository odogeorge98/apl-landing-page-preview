import Image from "next/image";
import Link from "next/link";
import { Container, Eyebrow, H2 } from "./Section";
import { DISCOVER } from "./data";

export function Discover() {
  return (
    <section id="discoveries" className="scroll-mt-20 bg-mist py-16 md:py-24">
      <Container>
        <Eyebrow>Explore the academic community</Eyebrow>
        <H2 lines={["Great minds.", "New discoveries."]} className="mt-4" />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <p className="text-base text-muted">Explore institutions, people and ideas. No account needed.</p>
          <Link href="/discoveries" className="text-sm font-bold text-brand hover:underline">Explore the directory</Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {DISCOVER.map((d) => (
            <article key={d.title} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="relative aspect-[410/220]">
                <Image src={d.image} alt="" fill sizes="(min-width:1024px) 410px, (min-width:768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="p-6">
                <span className="rounded-md bg-lav px-2.5 py-1 text-[10px] font-bold uppercase text-brand">{d.tag}</span>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-ink">{d.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{d.body}</p>
                <Link href="/discoveries" className="mt-4 inline-block text-xs font-bold text-brand hover:underline">Discover more</Link>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 text-[11px] text-muted/70">Illustrative directory and editorial content. Institutions and people shown are fictional; no customer endorsement is implied.</p>
      </Container>
    </section>
  );
}
