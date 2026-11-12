import { Container, Eyebrow, H2 } from "./Section";
import { MILESTONES } from "./data";

export function Milestones() {
  return (
    <section className="bg-mist py-16 md:py-24">
      <Container>
        <Eyebrow>From first offer to next chapter</Eyebrow>
        <H2 lines={["Every milestone connected."]} className="mt-4" />
        <p className="mt-5 text-sm text-muted">From first offer to graduation, keep every milestone connected.</p>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MILESTONES.map((m, i) => (
            <li key={m.title} className="rounded-lg border-t-[3px] border-[#e2dff0] bg-white p-6 shadow-sm">
              <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold ${i === 0 ? "bg-lav text-brand" : "bg-[#e9ecf5] text-muted"}`}>0{i + 1}</span>
              <h3 className="mt-4 text-2xl font-bold tracking-tight text-ink">{m.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">{m.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
