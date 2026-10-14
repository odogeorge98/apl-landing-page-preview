"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CircleHelp,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { useCurrentUser } from "@/lib/hooks/auth/use-current-user";
import { useDashboardUIConfig } from "@/lib/hooks/ui-config/use-dashboard-ui-config";
import { UserType } from "@/lib/types/users";
import { cn } from "@/lib/utils";

const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

function getFirstName(email?: string): string {
  const localPart = email?.split("@")[0]?.trim();

  if (!localPart) return "there";

  const firstPart = localPart.split(/[._-\s]/)[0];
  return firstPart
    ? firstPart.charAt(0).toUpperCase() + firstPart.slice(1)
    : "there";
}

function DashboardLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading tutor dashboard">
      <div className="h-36 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-[#e4e9f2]" />
        ))}
      </div>
      <span className="sr-only">Loading your teaching dashboard…</span>
    </div>
  );
}

export default function TutorDashboardView() {
  const { user } = useCurrentUser();
  const { uiConfig, role, isReady } = useDashboardUIConfig();

  if (!isReady || role !== UserType.TUTOR || !uiConfig) {
    return <DashboardLoading />;
  }

  const firstName = getFirstName(user?.email);

  return (
    <div className="mx-auto max-w-[1600px] space-y-7">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-[#64718a]">{uiConfig.title}</p>
        <h1 className="text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-[#718099]">
          {uiConfig.description}
        </p>
      </header>

      <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_36px_rgba(16,29,73,0.14)] sm:px-8 sm:py-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-24 size-72 rounded-full border border-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-16 size-56 rounded-full border border-white/10" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/30 bg-[#f5c542]/10 px-3 py-1.5 text-xs font-semibold text-[#f8d978]">
              <Sparkles size={14} aria-hidden="true" />
              Teaching workspace
            </span>
            <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
              Help every learner make progress.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
              Your assigned courses, student activity, and upcoming sessions will be brought together here as tutor dashboard data becomes available.
            </p>
          </div>
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#f5c542] text-[#101d49] shadow-lg shadow-black/10">
            <GraduationCap size={30} aria-hidden="true" />
          </div>
        </div>
      </section>

      <section aria-labelledby="teaching-overview-title" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="teaching-overview-title" className="text-lg font-bold text-[#101d49]">
              Teaching overview
            </h2>
            <p className="mt-1 text-sm text-[#718099]">
              Live course and teaching totals are not available yet.
            </p>
          </div>
          <span className="text-xs font-medium text-[#8995aa]">Waiting for tutor dashboard data</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {uiConfig.stats.map(({ key, label, description, icon: Icon }) => (
            <article key={key} className={cn(cardClass, "p-5 sm:p-6")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-[#64718a]">{label}</h3>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]" aria-label={`${label}: unavailable`}>—</p>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
                  <Icon size={21} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#718099]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="tutor-actions-title" className="space-y-4">
        <div>
          <h2 id="tutor-actions-title" className="text-lg font-bold text-[#101d49]">
            Teaching workspace
          </h2>
          <p className="mt-1 text-sm text-[#718099]">
            Open a teaching area from the tutor navigation when its page is available.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {uiConfig.quickActions.map(({ key, title, description, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className={cn(
                cardClass,
                "group flex min-h-40 flex-col p-5 transition hover:-translate-y-0.5 hover:border-[#101d49]/20 hover:shadow-[0_8px_24px_rgba(16,29,73,0.08)] focus:outline-none focus:ring-4 focus:ring-[#101d49]/10",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff6d8] text-[#765800]">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <ArrowUpRight size={17} className="text-[#9aa5b8] transition group-hover:text-[#101d49]" aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-semibold text-[#101d49]">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-[#718099]">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <aside className="flex items-start gap-3 rounded-2xl border border-[#e4e9f2] bg-white px-5 py-4 text-sm text-[#64718a]">
        <CircleHelp size={18} className="mt-0.5 shrink-0 text-[#101d49]" aria-hidden="true" />
        <p>
          Need help? Use the Help &amp; Support option from the portal navigation.
        </p>
      </aside>
    </div>
  );
}
