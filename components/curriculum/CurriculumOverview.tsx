"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Compass,
  GraduationCap,
  Hammer,
  Handshake,
  Layers,
  Library,
  Search,
  Sparkles,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  LEARNING_APPROACH,
  curriculumProgrammes,
  hasCurriculumOutline,
  type CurriculumProgramme,
} from "@/lib/data/curriculum";

const surfaceClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

const approachIcons: Record<(typeof LEARNING_APPROACH)[number]["id"], LucideIcon> = {
  practical: Hammer,
  mentorship: UserCheck,
  internship: Handshake,
};

function ProgrammeTab({
  programme,
  selected,
  onSelect,
}: {
  programme: CurriculumProgramme;
  selected: boolean;
  onSelect: () => void;
}) {
  const hasOutline = hasCurriculumOutline(programme);

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]",
          selected
            ? "border-[#101d49] bg-[#101d49] text-white"
            : "border-transparent bg-transparent text-[#17233f] hover:bg-[#f4f6fa]",
        )}
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{programme.name}</span>
          <span className={cn("mt-0.5 block text-xs", selected ? "text-white/65" : "text-[#8490a6]")}>
            {programme.category}
          </span>
        </span>
        {hasOutline ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
              selected ? "bg-[#f5c542] text-[#101d49]" : "bg-[#fff6d8] text-[#765800]",
            )}
          >
            {programme.modules.length} modules
          </span>
        ) : (
          <span className={cn("shrink-0 text-[11px] font-medium", selected ? "text-white/60" : "text-[#9aa5b8]")}>
            Outline pending
          </span>
        )}
      </button>
    </li>
  );
}

function ProgrammeDetail({ programme }: { programme: CurriculumProgramme }) {
  if (!hasCurriculumOutline(programme)) {
    return (
      <section className={`${surfaceClass} flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center`}>
        <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
          <Compass size={26} aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#8490a6]">{programme.category}</p>
        <h2 className="mt-1.5 text-xl font-bold tracking-tight text-[#101d49]">{programme.name}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#64718a]">
          This programme is offered by Nugi Innovations. Its detailed curriculum outline has not been added to the
          dashboard yet.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className={`${surfaceClass} overflow-hidden`}>
        <div className="h-1.5 bg-[#f5c542]" />
        <div className="p-5 sm:p-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf0ff] px-3 py-1.5 text-xs font-semibold text-[#101d49]">
            <GraduationCap size={14} aria-hidden="true" />
            {programme.category}
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">{programme.name}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64718a] sm:text-base">{programme.overview}</p>
        </div>
      </section>

      <section className={`${surfaceClass} p-5 sm:p-6`} aria-label={`${programme.name} modules`}>
        <div className="flex items-start gap-3 border-b border-[#edf0f6] pb-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f6fa] text-[#101d49]">
            <Layers size={19} aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-[#101d49]">What learners cover</h3>
            <p className="mt-1 text-xs leading-5 text-[#8490a6]">
              {programme.modules.length} modules, in the order they are taught.
            </p>
          </div>
        </div>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2">
          {programme.modules.map((module, index) => (
            <li key={module.id} className="flex gap-3 rounded-xl border border-[#edf0f6] bg-[#f9fafd] p-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#101d49] text-xs font-bold tabular-nums text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-[#101d49]">{module.title}</h4>
                <p className="mt-1 text-xs leading-5 text-[#64718a]">{module.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {programme.skillsFocus.length > 0 && (
        <section className={`${surfaceClass} p-5 sm:p-6`} aria-label="Professional skills focus">
          <div className="flex items-start gap-3 border-b border-[#edf0f6] pb-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff6d8] text-[#765800]">
              <Sparkles size={19} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-semibold text-[#101d49]">Professional skills focus</h3>
              <p className="mt-1 text-xs leading-5 text-[#8490a6]">Practised alongside the technical modules.</p>
            </div>
          </div>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {programme.skillsFocus.map((skill) => (
              <li key={skill} className="flex items-center gap-2.5 text-sm text-[#17233f]">
                <CheckCircle2 size={17} className="shrink-0 text-[#16845b]" aria-hidden="true" />
                {skill}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function CurriculumOverview() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(curriculumProgrammes[0]!.id);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return curriculumProgrammes;
    return curriculumProgrammes.filter(
      (programme) =>
        programme.name.toLowerCase().includes(query) ||
        programme.category.toLowerCase().includes(query) ||
        programme.modules.some((module) => module.title.toLowerCase().includes(query)),
    );
  }, [search]);

  const selected =
    curriculumProgrammes.find((programme) => programme.id === selectedId) ?? curriculumProgrammes[0]!;
  const outlinedCount = curriculumProgrammes.filter(hasCurriculumOutline).length;
  const totalModules = curriculumProgrammes.reduce((sum, programme) => sum + programme.modules.length, 0);

  return (
    <main className="mx-auto max-w-[1400px] space-y-7 pb-10 sm:space-y-9">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">Programme management</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">Curriculum</h1>
          <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">
            Review what each Nugi Innovations training programme teaches and how learners are supported.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e4e9f2] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627f]">
          <span className="size-2 rounded-full bg-[#1d9a67]" aria-hidden="true" />
          Admin workspace
        </div>
      </header>

      <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-9">
        <div aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -right-2 -top-12 size-52 rounded-full border border-white/10" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
              <Library size={14} aria-hidden="true" />
              Curriculum library
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Learn. Build. Innovate.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
              Technology training built around hands-on practice, mentorship, and a route into internships.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 lg:min-w-40">
            <p className="text-xs font-medium text-white/65">Programmes offered</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{curriculumProgrammes.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 lg:min-w-40">
            <p className="text-xs font-medium text-white/65">Outlines available</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {outlinedCount}
              <span className="ml-1.5 text-sm font-medium text-white/60">· {totalModules} modules</span>
            </p>
          </div>
        </div>
      </section>

      <section aria-label="How learners are supported" className="grid gap-4 md:grid-cols-3">
        {LEARNING_APPROACH.map((item) => {
          const Icon = approachIcons[item.id];
          return (
            <article key={item.id} className={`${surfaceClass} flex gap-4 p-5`}>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-[#101d49]">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#64718a]">{item.description}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section aria-label="Programme curriculum" className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
        <aside className={`${surfaceClass} p-3 lg:sticky lg:top-24`}>
          <label className="relative mb-3 block">
            <span className="sr-only">Search programmes or modules</span>
            <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8490a6]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search programmes"
              className="h-11 w-full rounded-xl border border-[#dce3ef] bg-white pl-10 pr-3 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5"
            />
          </label>

          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <BookOpen size={22} className="mx-auto text-[#9aa5b8]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-[#101d49]">No matching programmes</p>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#101d49] hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
              >
                Clear search
              </button>
            </div>
          ) : (
            <ul className="max-h-[560px] space-y-1 overflow-y-auto pr-0.5">
              {filtered.map((programme) => (
                <ProgrammeTab
                  key={programme.id}
                  programme={programme}
                  selected={programme.id === selected.id}
                  onSelect={() => setSelectedId(programme.id)}
                />
              ))}
            </ul>
          )}
        </aside>

        <ProgrammeDetail programme={selected} />
      </section>
    </main>
  );
}
