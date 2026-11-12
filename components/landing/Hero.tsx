"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "./Section";
import { HERO_SLIDES } from "./data";

const N = HERO_SLIDES.length;
const pad = (n: number) => String(n + 1).padStart(2, "0");

function Dots({ i, go, glass }: { i: number; go: (n: number) => void; glass?: boolean }) {
  return (
    <>
      {HERO_SLIDES.map((s, idx) => (
        <button
          key={s.label}
          onClick={() => go(idx)}
          aria-label={`Go to slide ${idx + 1}`}
          aria-current={idx === i}
          className={cn(
            "h-9 min-w-10 rounded-full px-3 text-xs font-semibold transition",
            idx === i ? "bg-brand text-white" : glass ? "bg-white/10 text-white hover:bg-white/20" : "bg-white/10 text-white hover:bg-white/20",
          )}
        >
          {pad(idx)}
        </button>
      ))}
    </>
  );
}

function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const Icon = dir === "prev" ? ArrowLeft : ArrowRight;
  return (
    <button
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
      className={cn("grid size-9 place-items-center rounded-full text-white transition", dir === "next" ? "bg-brand hover:bg-brand-dark" : "bg-white/10 hover:bg-white/20")}
    >
      <Icon className="size-4" />
    </button>
  );
}

export function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = useCallback((n: number) => setI(((n % N) + N) % N), []);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % N), 3000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      id="top"
      aria-roledescription="carousel"
      aria-label="Academic Pavilion highlights"
      className="bg-navy text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="grid">
        {HERO_SLIDES.map((s, idx) => {
          const active = idx === i;
          const first = idx === 0;
          return (
            <div
              key={s.label}
              role="group"
              aria-roledescription="slide"
              aria-label={`${idx + 1} of ${N}`}
              aria-hidden={!active}
              inert={!active}
              className={cn("relative col-start-1 row-start-1 transition-opacity duration-700", active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0")}
            >
              {first ? (
                <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-12 md:px-10 lg:min-h-[740px] lg:grid-cols-2 lg:gap-16 lg:px-[72px] lg:py-20">
                  <div>
                    <span className="inline-block rounded-md border border-lime bg-lime px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink">{s.tag}</span>
                    <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">
                      {s.title.map((l) => (
                        <span key={l} className="block">
                          {l}
                        </span>
                      ))}
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">{s.body}</p>
                    <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                      <ButtonLink href={s.cta.href} className="h-[52px] px-8">{s.cta.label}</ButtonLink>
                      <ButtonLink href="#demo" variant="light" className="h-[52px] w-full px-8 sm:w-auto">Book a demo</ButtonLink>
                    </div>
                    <p className="mt-6 text-xs text-white/80">{"note" in s ? s.note : null}</p>
                    <div className="mt-8 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/5 p-2">
                      <Dots i={i} go={go} />
                      <span className="h-9 rounded-full bg-white/10 px-4 text-xs font-semibold leading-9">Slide {pad(i)} of 0{N}</span>
                    </div>
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl lg:aspect-auto lg:h-[580px]">
                    <Image src={s.image} alt="Three Nigerian university students walking across a campus walkway" fill priority sizes="(min-width:1024px) 620px, 100vw" className="object-cover" />
                  </div>
                </div>
              ) : (
                <div className="relative flex min-h-[640px] flex-col items-center justify-center px-5 pb-40 pt-16 text-center sm:min-h-[700px] lg:min-h-[780px] lg:pb-48">
                  <Image src={s.image} alt="" fill sizes="100vw" className="-z-20 object-cover" />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/60 via-[#2a2670]/45 to-navy/80" />
                  <span className="rounded-md border border-white/25 bg-brand/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide backdrop-blur">{s.tag}</span>
                  <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">
                    {s.title.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-relaxed sm:text-lg">{s.body}</p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <ButtonLink href={s.cta.href}>{s.cta.label}</ButtonLink>
                    <ButtonLink href="#demo" variant="glass">Book a demo</ButtonLink>
                  </div>
                  {"note" in s && <p className="mt-6 text-xs text-white/75">{s.note}</p>}
                  <div className="absolute inset-x-5 bottom-8 mx-auto flex max-w-[1000px] items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:justify-between sm:pl-20 lg:bottom-[120px]">
                    <p className="hidden items-center gap-3 text-sm sm:flex">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-[#c9c2ff]">Slider {pad(idx)} / 0{N}</span>
                      <span>{s.label}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <Arrow dir="prev" onClick={() => go(i - 1)} />
                      <Dots i={i} go={go} glass />
                      <Arrow dir="next" onClick={() => go(i + 1)} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
