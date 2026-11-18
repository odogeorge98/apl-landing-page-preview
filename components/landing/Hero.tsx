"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "./Section";
import { HERO_SLIDES } from "./data";

const N = HERO_SLIDES.length;
const pad = (n: number) => String(n + 1).padStart(2, "0");

function Title({ lines }: { lines: string[] }) {
  return (
    <h1 className="text-[40px] font-bold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">
      {lines.map((l) => (
        <span key={l} className="block">
          {l}
        </span>
      ))}
    </h1>
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
    <div
      id="top"
      aria-roledescription="carousel"
      aria-label="Academic Pavilion highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <section className="bg-navy text-white">
        <div className="grid">
          {HERO_SLIDES.map((s, idx) => {
            const active = idx === i;
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
                {idx === 0 ? (
                  <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-12 md:px-10 lg:min-h-[740px] lg:grid-cols-2 lg:gap-16 lg:px-[72px] lg:py-20">
                    <div>
                      <span className="inline-block rounded-md bg-lime px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink">{s.tag}</span>
                      <div className="mt-6">
                        <Title lines={s.title} />
                      </div>
                      {s.body && <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">{s.body}</p>}
                      {s.cta && (
                        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                          <ButtonLink href={s.cta.href} className="h-[52px] px-8">{s.cta.label}</ButtonLink>
                          <ButtonLink href="#demo" variant="light" className="h-[52px] w-full px-8 sm:w-auto">Book a demo</ButtonLink>
                        </div>
                      )}
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl lg:aspect-auto lg:h-[580px]">
                      <Image src={s.image} alt="Three Nigerian university students walking across a campus walkway" fill priority sizes="(min-width:1024px) 620px, 100vw" className="object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="relative flex min-h-[560px] flex-col items-center justify-center px-5 py-16 text-center sm:min-h-[640px] lg:min-h-[740px]">
                    <Image src={s.image} alt="" fill sizes="100vw" className="-z-20 object-cover" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/60 via-[#2a2670]/45 to-navy/80" />
                    <span className="rounded-md border border-white/25 bg-brand/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide backdrop-blur">{s.tag}</span>
                    <div className="mt-6">
                      <Title lines={s.title} />
                    </div>
                    {s.body && <p className="mt-6 max-w-2xl text-base leading-relaxed sm:text-lg">{s.body}</p>}
                    {s.cta && (
                      <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <ButtonLink href={s.cta.href}>{s.cta.label}</ButtonLink>
                        <ButtonLink href="#demo" variant="glass">Book a demo</ButtonLink>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Slide controls: sit in the lime strip under the hero */}
      <section className="bg-lime" aria-label="Slide controls">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 md:px-10 lg:px-20">
          <p className="flex items-center gap-3 text-sm text-ink" aria-live="polite">
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand">
              Slider {pad(i)} / {pad(N - 1)}
            </span>
            <span className="font-semibold">{HERO_SLIDES[i].label}</span>
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => go(i - 1)} aria-label="Previous slide" className="grid size-9 place-items-center rounded-full bg-ink/10 text-ink transition hover:bg-ink/20">
              <ArrowLeft className="size-4" />
            </button>
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.label}
                onClick={() => go(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === i}
                className={cn("h-9 min-w-10 rounded-full px-3 text-xs font-bold transition", idx === i ? "bg-brand text-white" : "bg-ink/10 text-ink hover:bg-ink/20")}
              >
                {pad(idx)}
              </button>
            ))}
            <button onClick={() => go(i + 1)} aria-label="Next slide" className="grid size-9 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-dark">
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
