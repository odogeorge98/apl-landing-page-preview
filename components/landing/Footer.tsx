import Link from "next/link";
import { Logo } from "./Logo";
import { Container } from "./Section";
import { FOOTER_COLUMNS } from "./data";

export function Footer({ variant = "home" }: { variant?: "home" | "inner" }) {
  return (
    <footer className="border-t border-line bg-foot py-14 md:py-16">
      <Container>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-6 text-sm text-muted">One Platform. Every Academic Journey.</p>
            <p className="mt-5 text-[11px] text-muted/70">Built around Nigeria’s academic community.</p>
          </div>
          {FOOTER_COLUMNS[variant].map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h4 className="text-xs font-bold text-ink">{c.title}</h4>
              <ul className="mt-4 space-y-3 text-xs text-muted">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-brand">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-2 border-t border-line pt-6 text-[11px] text-muted/80">
          <p>© 2026 Academic Pavilion · Product design concept</p>
          <p>Terms · Privacy · Accessibility</p>
        </div>
      </Container>
    </footer>
  );
}
