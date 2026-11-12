"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/landing/Section";
import { ARTICLES } from "./data";

type Article = (typeof ARTICLES)[string];
const card = "rounded-lg border border-line bg-white p-6";
const outline = "flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-xs font-bold text-ink transition hover:border-brand max-sm:w-full";

export function ArticleView({ a }: { a: Article }) {
  const [saved, setSaved] = useState(false);
  const [style, setStyle] = useState<"apa" | "mla" | "chicago">("apa");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(a.cite[style]);
      toast.success("Citation copied");
    } catch {
      toast.error("Couldn’t copy. Select the text and copy it manually.");
    }
  };

  const exportRis = () => {
    const url = URL.createObjectURL(new Blob([a.ris], { type: "application/x-research-info-systems" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: "citation.ris" });
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className="bg-lav pb-10 pt-10 md:pb-14 md:pt-14">
        <Container className="md:max-w-[1160px]">
          <nav aria-label="Breadcrumb" className="text-xs text-muted">
            <Link href="/discoveries" className="hover:text-brand">Discoveries</Link> / <Link href="/discoveries#journals" className="hover:text-brand">Journals</Link> / {a.journal} / Article preview
          </nav>
          <div className="mt-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <span className="rounded bg-brand/10 px-2.5 py-1.5 text-[10px] font-bold uppercase text-brand max-sm:w-full">Journal article</span>
            <span className="rounded bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 max-sm:w-full">Open preview</span>
          </div>
          <h1 className="mt-6 text-[40px] font-bold leading-[1.08] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[64px]">{a.title}</h1>
          <p className="mt-6 text-lg text-muted">{a.subtitle}</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Author</p>
              <p className="mt-2 text-sm font-bold text-ink">{a.author}</p>
              <p className="mt-2 text-xs text-muted">{a.authorRole}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand">{a.journal}</p>
              <p className="mt-2 text-sm text-ink">{a.issue}</p>
              <p className="mt-2 text-xs text-muted">{a.meta}</p>
            </div>
            <div>
              <button onClick={() => { setSaved((s) => !s); toast(saved ? "Removed from reading list" : "Saved to reading list"); }} aria-pressed={saved} className={cn(outline, "h-12", saved && "border-brand text-brand")}>
                {saved ? "Saved to reading list" : "Save to reading list"}
              </button>
              <p className="mt-3 text-[11px] text-muted">Sign in to keep resources across devices.</p>
            </div>
          </div>
          <div className="mt-8 flex gap-3 rounded-lg bg-[#e9e6fb] p-4 text-xs md:p-5">
            <Info className="mt-0.5 size-4 shrink-0 text-brand" />
            <div>
              <p className="font-bold text-brand">Example editorial material</p>
              <p className="mt-1 text-muted">This is an illustrative article preview, not a published research finding. No DOI or research claim is asserted.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#f6f6fb] pb-16 pt-6 md:pt-0">
        <Container className="grid gap-5 md:max-w-[1160px] lg:grid-cols-[1fr_320px] lg:gap-8">
          <div>
            <div className={card}>
              <h2 className="text-base font-bold text-ink">Abstract</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">{a.abstract}</p>
              <p className="mt-4 text-xs text-muted">{a.keywords}</p>
            </div>
            <article id="preview" className={cn(card, "mt-5 scroll-mt-28 p-6 md:p-9")}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand">{a.pageLabel}</p>
              <h2 className="mt-5 text-3xl font-bold tracking-[-0.03em] text-ink">{a.heading}</h2>
              {a.paragraphs.map((p) => <p key={p} className="mt-5 text-sm leading-relaxed text-muted">{p}</p>)}
              <div className="mt-6 rounded bg-lav p-5 md:p-6">
                <h3 className="text-xl font-bold tracking-tight text-ink">{a.calloutTitle}</h3>
                <p className="mt-3 text-sm text-muted">{a.callout}</p>
              </div>
              <p className="mt-6 text-xs text-muted">{a.end}</p>
            </article>

            <h2 className="mt-10 text-3xl font-bold tracking-[-0.03em] text-ink">Related materials</h2>
            <ul className="mt-5 space-y-4">
              {a.related.map((r) => (
                <li key={r.title} className="flex flex-col justify-between gap-3 rounded-lg border border-line bg-white p-5 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-ink">{r.title}</h3>
                    <p className="mt-1 text-xs text-muted">{r.meta}</p>
                  </div>
                  <Link href="/discoveries" className={cn(outline, "h-10 px-6")}>View</Link>
                </li>
              ))}
            </ul>
          </div>

          <aside className="space-y-5 lg:pt-0">
            <div className={card}>
              <h2 className="text-base font-bold text-ink">Access this article</h2>
              <p className="mt-4 text-xs leading-relaxed text-muted">Open example preview. Download controls show the intended resource experience.</p>
              <button onClick={() => toast.info("This is an example file. No PDF is attached yet.")} className="mt-4 h-11 rounded-md bg-brand px-5 text-xs font-bold text-white hover:bg-brand-dark max-sm:w-full">Download example PDF</button>
              <a href="#preview" className={cn(outline, "mt-3 w-fit max-sm:w-full")}>Read full preview</a>
              <p className="mt-4 text-[11px] text-muted">PDF · 8 pages · Example file</p>
            </div>
            <div className={card}>
              <h2 className="text-base font-bold text-ink">In this article</h2>
              <ul className="mt-4 space-y-4 text-xs text-muted">
                {a.toc.map((t) => <li key={t}><a href="#preview" className="hover:text-brand">{t}</a></li>)}
              </ul>
            </div>
            <div className={card}>
              <h2 className="text-base font-bold text-ink">Cite this material</h2>
              <select aria-label="Citation style" value={style} onChange={(e) => setStyle(e.target.value as typeof style)} className="mt-4 rounded-md bg-[#f1f2f8] px-3 py-1.5 text-[11px] font-bold text-muted max-sm:w-full">
                <option value="apa">APA 7th edition</option>
                <option value="mla">MLA 9th edition</option>
                <option value="chicago">Chicago</option>
              </select>
              <p className="mt-4 text-xs leading-relaxed text-muted">{a.cite[style]}</p>
              <button onClick={copy} className={cn(outline, "mt-4")}>Copy citation</button>
              <button onClick={exportRis} className={cn(outline, "mt-3")}>Export RIS</button>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
