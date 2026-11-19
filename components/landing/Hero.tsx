"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "./Section";
import { HERO_SLIDES } from "./data";

const N = HERO_SLIDES.length;
const pad = (n: number) => String(n + 1).padStart(2, "0");

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
      // Fills exactly one screen under the navbar (56px mobile / 72px desktop): slides + control strip, no scrolling needed.
      className="flex font-brand h-[calc(100svh-56px)] min-h-[520px] flex-col md:h-[calc(100svh-72px)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <section className="relative min-h-0 flex-1 overflow-hidden bg-navy text-white">
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
              className={cn("absolute inset-0 transition-opacity duration-700", active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0")}
            >
              <Image
                src={s.image}
                alt=""
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-[#2a2670]/50 to-navy/80 md:from-navy/60 md:via-[#2a2670]/45" />

              <div className="relative mx-auto flex h-full max-w-[1440px] flex-col items-start justify-center px-5 py-8 text-left md:items-center md:px-10 md:text-center lg:px-20">
                <span className="rounded-md bg-lime px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink md:border md:border-white/25 md:bg-brand/30 md:text-white md:backdrop-blur">
                  {s.tag}
                </span>
                <h1 className="mt-5 text-[clamp(2.25rem,min(7vw,8.5svh),4.75rem)] font-extrabold leading-[1.02] tracking-[-0.045em] md:mt-6">
                  {s.title.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </h1>
                {s.body && <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/95 sm:text-lg md:mt-6">{s.body}</p>}
                {s.cta && (
                  <div className="mt-6 flex w-full flex-col items-start gap-3 md:mt-8 md:w-auto md:flex-row md:justify-center">
                    <ButtonLink href={s.cta.href} className="h-12 px-6 md:h-[52px] md:px-8">{s.cta.label}</ButtonLink>
                    <ButtonLink href="#demo" variant="light" className="h-12 w-full px-6 md:h-[52px] md:w-auto md:border md:border-white/30 md:bg-white/10 md:px-8 md:text-white md:backdrop-blur md:hover:bg-white/20">
                      Book a demo
                    </ButtonLink>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Slide controls: lime strip directly under the hero */}
      <section className="shrink-0 bg-lime" aria-label="Slide controls">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-5 py-3 md:px-10 md:py-4 lg:px-20">
          <p className="flex items-center gap-3 text-sm text-ink" aria-live="polite">
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand">
              Slider {pad(i)} / {pad(N - 1)}
            </span>
            <span className="hidden font-semibold sm:inline">{HERO_SLIDES[i].label}</span>
          </p>
          <div className="flex items-center gap-1.5 md:gap-2">
            <button onClick={() => go(i - 1)} aria-label="Previous slide" className="grid size-9 place-items-center rounded-full bg-ink/10 text-ink transition hover:bg-ink/20">
              <ArrowLeft className="size-4" />
            </button>
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.label}
                onClick={() => go(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === i}
                className={cn("h-9 min-w-9 rounded-full px-2.5 text-xs font-bold transition md:min-w-10 md:px-3", idx === i ? "bg-brand text-white" : "bg-ink/10 text-ink hover:bg-ink/20")}
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
