import { TRUST } from "./data";

export function TrustStrip() {
  return (
    <section className="bg-lime">
      <ul className="mx-auto grid max-w-[1440px] gap-x-6 gap-y-3 px-5 py-5 text-sm font-semibold text-ink sm:grid-cols-2 md:px-10 lg:flex lg:justify-between lg:px-20">
        {TRUST.map((t) => (
          <li key={t} className="flex items-center gap-3">
            <span className="size-1.5 shrink-0 rounded-full bg-brand" />
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}
