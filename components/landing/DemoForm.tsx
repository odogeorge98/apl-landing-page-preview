"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Container, Eyebrow, H2 } from "./Section";

const TOPICS = [
  "Academic records and institution onboarding",
  "Results publication and graduation",
  "Role-based workspaces and access",
  "Pricing and rollout",
];

const field = "block rounded-md border border-line bg-[#f7f8fc] px-4 py-3 text-xs font-semibold text-ink focus-within:border-brand";
const input = "mt-1 block w-full bg-transparent text-xs font-normal text-ink outline-none placeholder:text-muted";

export function DemoForm() {
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSending(true);
    // TODO: send to the enquiry endpoint once the backend contract is ready.
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Thanks! We’ll be in touch about your demo.");
    form.reset();
    setSending(false);
  }

  return (
    <section id="demo" className="scroll-mt-20 bg-band py-16 md:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-24">
        <div>
          <Eyebrow>A clearer next step</Eyebrow>
          <H2 lines={["Bring your campus", "together."]} className="mt-6" />
          <p className="mt-6 text-base text-muted">Let’s explore your workflows, access needs and rollout together.</p>
          <p className="mt-6 text-xs font-bold text-brand">A focused demo, built around you.</p>
        </div>
        <form onSubmit={onSubmit} className="rounded-lg border border-line bg-white p-6 shadow-[0_20px_50px_-20px_rgba(91,76,239,0.25)] md:p-8">
          <h3 className="text-xl font-bold tracking-tight text-ink">Let&apos;s meet your institution.</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className={field}>Your name<input required name="name" autoComplete="name" placeholder="Enter full name" className={input} /></label>
            <label className={field}>Work email<input required type="email" name="email" autoComplete="email" placeholder="Enter institutional email" className={input} /></label>
          </div>
          <label className={`${field} mt-4`}>Institution<input required name="institution" autoComplete="organization" placeholder="Enter institution name" className={input} /></label>
          <label className={`${field} mt-4`}>
            What would you like to explore?
            <select name="topic" defaultValue={TOPICS[0]} className={`${input} cursor-pointer`}>
              {TOPICS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button disabled={sending} className="h-12 rounded-md bg-brand px-6 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60">
              {sending ? "Sending…" : "Request a demo"}
            </button>
            <p className="text-[11px] text-muted/80">By submitting, you agree to be contacted about your enquiry.</p>
          </div>
        </form>
      </Container>
    </section>
  );
}
