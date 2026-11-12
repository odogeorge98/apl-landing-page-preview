import { Container, Eyebrow, ButtonLink } from "./Section";
import { FAQS } from "./data";

export function Faq() {
  return (
    <section id="faqs" className="scroll-mt-20 bg-white py-16 md:py-24">
      <Container>
        <div className="flex items-start justify-between">
          <div>
            <Eyebrow>A few things, answered</Eyebrow>
            <h2 className="mt-6 text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-ink sm:text-5xl lg:text-[56px]">
              <span className="block">
                Good <br className="hidden md:block" />
                questions.
              </span>
              <span className="block">Clear answers.</span>
            </h2>
            <svg aria-hidden viewBox="0 0 48 48" className="mt-6 size-8 fill-[#4b5568] md:hidden"><path d="M24 0C26 14 34 22 48 24 34 26 26 34 24 48 22 34 14 26 0 24 14 22 22 14 24 0Z" /></svg>
          </div>
          <svg aria-hidden viewBox="0 0 48 48" className="hidden size-12 shrink-0 fill-[#4b5568] md:mt-24 md:block">
            <path d="M24 0C26 14 34 22 48 24 34 26 26 34 24 48 22 34 14 26 0 24 14 22 22 14 24 0Z" />
          </svg>
        </div>
        <div className="mt-10 grid items-start gap-4 md:mt-14 md:grid-cols-2 md:gap-4">
          {FAQS.map((f, i) => {
            const solid = [1, 2, 5].includes(i);
            return (
              <article key={f.q} className={`rounded-lg border p-6 md:p-8 ${solid ? "border-brand bg-brand text-white" : "border-line bg-[#f4f5fa] text-ink"}`}>
                <h3 className="text-lg font-bold tracking-tight md:text-xl">{f.q}</h3>
                <p className={`mt-4 text-sm leading-relaxed ${solid ? "text-white/80" : "text-muted"}`}>{f.a}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <ButtonLink href="#demo" className="h-12">Book a demo</ButtonLink>
          <p className="text-xs text-muted/80">More questions? Send an enquiry above.</p>
        </div>
      </Container>
    </section>
  );
}
