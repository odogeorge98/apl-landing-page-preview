"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Bookmark, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, Eyebrow } from "@/components/landing/Section";
import { JOURNALS, MATERIALS, SAVED_INITIAL } from "./data";

const select =
  "h-12 w-full rounded-lg border border-line bg-white px-4 text-xs font-bold text-ink outline-none focus:border-brand md:w-auto md:min-w-[120px]";

export function DiscoveriesBrowser() {
  const [tab, setTab] = useState<"materials" | "journals">("materials");
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const [format, setFormat] = useState("");
  const [access, setAccess] = useState("");
  const [saved, setSaved] = useState<string[]>(SAVED_INITIAL);
  const [page, setPage] = useState(1);

  const subjects = useMemo(() => [...new Set(MATERIALS.map((m) => m.subject))], []);
  const formats = useMemo(() => [...new Set(MATERIALS.map((m) => m.format))], []);

  const items = MATERIALS.filter(
    (m) =>
      (!subject || m.subject === subject) &&
      (!format || m.format === format) &&
      (!access || m.access === access) &&
      (!q || `${m.title} ${m.subject}`.toLowerCase().includes(q.toLowerCase())),
  );

  const toggle = (id: string) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <section className="bg-lav pb-14 pt-14 md:pb-16 md:pt-16">
        <Container>
          <Eyebrow>The APL resource centre</Eyebrow>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div>
              <h1 className="text-[40px] font-bold leading-[1.08] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[64px]">
                <span className="block">Stay curious.</span>
                <span className="block">Go further.</span>
              </h1>
              <p className="mt-6 max-w-md text-base text-muted md:max-w-none">Learning materials and journals for a curious academic community.</p>
            </div>
            <p className="max-w-sm text-[11px] leading-relaxed text-muted md:pb-1">Example content. Titles, authors and journals are illustrative — not published research or endorsements.</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <label className="flex h-12 w-full items-center md:flex-1 gap-3 rounded-lg border border-line bg-white px-4 focus-within:border-brand">
              <Search className="size-4 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="search"
                placeholder="Search a topic, title, author or course…"
                aria-label="Search resources"
                className="w-full bg-transparent text-xs outline-none placeholder:text-muted"
              />
            </label>
            <select aria-label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={select}>
              <option value="">All subjects</option>
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select aria-label="Format" value={format} onChange={(e) => setFormat(e.target.value)} className={select}>
              <option value="">All formats</option>
              {formats.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select aria-label="Access" value={access} onChange={(e) => setAccess(e.target.value)} className={select}>
              <option value="">Access</option>
              <option>Open access</option>
              <option>Institution access</option>
            </select>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between" role="tablist">
            <div className="flex gap-8">
              {([["materials", "Learning materials"], ["journals", "Journals"]] as const).map(([k, l]) => (
                <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("pb-1 font-semibold", tab === k ? "text-brand" : "text-muted hover:text-ink")}>
                  {l}
                </button>
              ))}
            </div>
            <p className="flex items-center gap-2 text-xs font-semibold text-brand"><Bookmark className="size-3.5" />Saved resources ({saved.length})</p>
          </div>

          <div className="mt-6 grid overflow-hidden rounded-lg md:grid-cols-[39%_1fr]">
            <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[230px]">
              <Image src="/assets/landing/courtyard.jpg" alt="Students walking through a university courtyard" fill priority sizes="(min-width:768px) 40vw, 100vw" className="object-cover" />
            </div>
            <div className="bg-navy p-6 text-white md:p-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b4adff]">Featured · Learning pathway</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em]">Begin with a better question.</h2>
              <p className="mt-4 text-sm">Plan your research. Question your sources. Make your case.</p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href="/discoveries" className="flex h-11 items-center justify-center rounded-md bg-brand px-5 text-xs font-bold hover:bg-brand-dark">Explore research methods</Link>
                <span className="text-[11px]">4 modules · Open access</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14 md:py-16">
        <Container>
          {tab === "materials" ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-3xl font-bold tracking-[-0.03em] text-ink">Find your next idea.</h2>
                <p className="w-full text-xs text-muted md:w-auto">Showing {items.length ? `1–${items.length}` : "0"} of 24 materials</p>
              </div>
              {items.length === 0 && <p className="mt-10 text-sm text-muted">No materials match your filters. Try clearing the search or filters.</p>}
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {items.map((m) => {
                  const isSaved = saved.includes(m.id);
                  return (
                    <article key={m.id} className="overflow-hidden rounded-lg border border-line bg-white">
                      <div className={cn("flex h-[130px] flex-col justify-between p-5", m.accent ? "bg-brand text-white" : "bg-lav text-brand")}>
                        <div className="flex items-start justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-80">APL / Learning</span>
                          <button onClick={() => toggle(m.id)} aria-pressed={isSaved} aria-label={isSaved ? `Remove ${m.title} from saved` : `Save ${m.title}`}>
                            <Bookmark className={cn("size-4", isSaved && "fill-current")} />
                          </button>
                        </div>
                        <p className="text-2xl font-bold tracking-tight">{m.subject}</p>
                      </div>
                      <div className="p-6">
                        <p className="text-[10px] font-semibold text-brand">{m.meta}</p>
                        <h3 className="mt-3 text-xl font-bold leading-snug tracking-tight text-ink">{m.title}</h3>
                        <p className="mt-3 text-[11px] text-muted">APL editorial collection · Learn at your pace.</p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-md bg-[#f4f5fa] px-3 py-1.5 text-[10px] font-semibold text-muted max-sm:w-full">{m.access}</span>
                          <Link href="/discoveries" className="text-xs font-bold text-brand hover:underline">View resource</Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <nav aria-label="Pagination" className="mt-10 flex flex-wrap justify-center gap-2 text-xs font-bold">
                {/* TODO: wire to the API once the materials endpoint exists (24 items, 6 per page). */}
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="h-10 rounded-md border border-line px-4 disabled:opacity-50">← Previous</button>
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} aria-current={page === n} onClick={() => setPage(n)} className={cn("size-10 rounded-md border", page === n ? "border-brand bg-brand text-white" : "border-line")}>{n}</button>
                ))}
                <button disabled={page === 4} onClick={() => setPage((p) => p + 1)} className="h-10 rounded-md border border-line px-4 disabled:opacity-50">Next</button>
              </nav>
            </>
          ) : (
            <p className="text-sm text-muted">Showing example journals. <a href="#journals" className="font-bold text-brand">Jump to journals</a></p>
          )}
        </Container>
      </section>
    </>
  );
}

export function JournalsSection() {
  return (
    <section id="journals" className="scroll-mt-24 bg-band py-14 md:py-20">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Eyebrow>Read beyond the classroom</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-ink md:text-5xl">Ideas worth exploring.</h2>
            <p className="mt-4 max-w-xl text-sm text-muted">Browse example journals and article previews. Access terms are shown before you download.</p>
          </div>
          <Link href="/discoveries#journals" className="flex h-12 items-center rounded-md bg-white px-5 text-xs font-bold text-ink max-sm:w-full">Browse all journals</Link>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {JOURNALS.map((j) => (
            <article key={j.title} className="flex flex-col gap-4 sm:flex-row">
              <div className="flex h-24 w-full shrink-0 flex-col justify-between bg-navy p-2 text-white sm:w-16">
                <span className="text-[7px] uppercase tracking-wide">APL Journals</span>
                <span className="text-2xl">{j.letter}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-ink">{j.title}</h3>
                <p className="mt-2 text-[11px] text-muted">{j.issue}</p>
                <p className="mt-3 text-xs text-muted">{j.desc}</p>
                <Link href={j.href} className="mt-3 inline-block text-xs font-bold text-brand hover:underline">View journal</Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
