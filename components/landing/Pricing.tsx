import { Check } from "lucide-react";
import { Container, Eyebrow, H2 } from "./Section";
import { FEE_ROWS, PLANS } from "./data";

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 bg-mist pb-16 pt-4 md:pb-24">
      <Container>
        <Eyebrow>Proposed pricing · Institution subscriptions</Eyebrow>
        <H2 lines={["Your institution.", "Your kind of plan."]} className="mt-4" />
        <p className="mt-6 text-base text-muted">Illustrative annual plans for Nigerian tertiary institutions, from growing campuses to complex operations.</p>
        <p className="mt-3 text-[11px] text-muted/70">Illustrative pricing. No live billing. Final pricing, scope and rollout are agreed during your demo.</p>

        <div className="mt-8 grid items-start gap-5 lg:grid-cols-3">
          {PLANS.map((p) => (
            <article key={p.name} className={`rounded-lg bg-white p-6 md:p-8 ${"featured" in p ? "border border-brand" : "border border-line"}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-2xl font-bold tracking-tight text-ink">{p.name}</h3>
                <span className="rounded-full bg-lav px-3 py-1.5 text-[10px] font-bold uppercase text-brand">{p.badge}</span>
              </div>
              <p className="mt-6 flex flex-col gap-1 text-ink sm:flex-row sm:items-baseline sm:gap-3">
                <span className="text-4xl font-bold tracking-[-0.04em]">{p.price}</span>
                <span className="text-sm text-muted">per year</span>
              </p>
              <p className="mt-4 text-sm text-muted">{p.blurb}</p>
              <ul className="mt-6 space-y-3 text-sm text-ink">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="mt-2 hidden size-1.5 shrink-0 rounded-full bg-brand md:block" />
                    <Check className="mt-0.5 size-4 shrink-0 text-brand md:hidden" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#demo" className="mt-8 flex h-12 items-center justify-center rounded-md bg-brand text-sm font-bold text-white transition hover:bg-brand-dark">Request a demo</a>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-line bg-white p-6 md:p-8">
          <Eyebrow>Alternative pricing model</Eyebrow>
          <h3 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ink">School-fees-percentage pricing</h3>
          <p className="mt-4 text-sm text-muted">An alternative to the fixed annual subscription: one rate applies to the full annual tuition volume, not marginal bands. Rates are illustrative and subject to commercial approval.</p>
          <div className="mt-6 space-y-3 md:hidden">
            {FEE_ROWS.map((r) => (
              <div key={r[0]} className="rounded-lg bg-lav/60 p-4 text-xs text-ink">
                <p className="font-bold">{r[0]}</p>
                <p className="mt-3 text-xl font-bold tracking-tight">{r[1]} illustrative rate</p>
                <p className="mt-3">Basis: {r[2]}</p>
                <p className="mt-2">Billing: {r[3]}</p>
                <p className="mt-2">Example: {r[4]}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted/70">
                  {["Annual tuition volume", "Illustrative rate", "Basis", "Billing period", "Example calculation"].map((h) => (
                    <th key={h} className="pb-4 pr-4 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEE_ROWS.map((r) => (
                  <tr key={r[0]} className="border-t border-line text-ink">
                    {r.map((c) => <td key={c} className="py-4 pr-4">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 border-t border-line pt-4 text-[11px] text-muted/70">Illustrative example only. Actual pricing, billing period and implementation scope are confirmed during the demo process. This model is proposed for institution subscription charges, not student tuition.</p>
        </div>
      </Container>
    </section>
  );
}
