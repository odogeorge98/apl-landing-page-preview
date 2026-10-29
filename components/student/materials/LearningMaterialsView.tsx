"use client";

import { useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ExternalLink,
  FileText,
  FolderOpen,
  GraduationCap,
  Info,
  Library,
  MonitorPlay,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  MATERIAL_FORMATS,
  learningMaterials,
  materialCourses,
  type LearningMaterial,
  type MaterialFormat,
} from "@/lib/data/student-materials";
import { useSavedMaterials } from "@/lib/hooks/student/use-saved-materials";

const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

const formatIcons: Record<MaterialFormat, LucideIcon> = {
  Documentation: FileText,
  Tutorial: GraduationCap,
  Book: BookOpen,
  Reference: Library,
  Interactive: MonitorPlay,
};

const formatStyles: Record<MaterialFormat, string> = {
  Documentation: "bg-[#eaf0ff] text-[#101d49] border-[#dce5ff]",
  Tutorial: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Book: "bg-[#fff7dc] text-[#765800] border-[#f5e6a9]",
  Reference: "bg-slate-100 text-slate-700 border-slate-200",
  Interactive: "bg-violet-50 text-violet-700 border-violet-100",
};

function MaterialCard({
  material,
  saved,
  onToggleSave,
}: {
  material: LearningMaterial;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const Icon = formatIcons[material.format];

  return (
    <article
      className={cn(
        cardClass,
        "flex flex-col p-5 transition hover:shadow-[0_8px_24px_rgba(16,29,73,0.06)] sm:p-6",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
          <Icon size={21} aria-hidden="true" />
        </span>
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${material.title} from saved` : `Save ${material.title}`}
          className={cn(
            "flex size-10 items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]",
            saved ? "bg-[#fff7dc] text-[#765800]" : "text-[#8490a6] hover:bg-[#f4f6fa]",
          )}
        >
          {saved ? <BookmarkCheck size={19} aria-hidden="true" /> : <Bookmark size={19} aria-hidden="true" />}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", formatStyles[material.format])}>
          {material.format}
        </span>
        <span className="text-xs text-[#8490a6]">{material.source}</span>
      </div>

      <h3 className="mt-3 text-base font-bold text-[#101d49] sm:text-lg">{material.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-[#64718a]">{material.description}</p>

      <p className="mt-4 text-xs leading-5 text-[#8490a6]">
        <span className="font-semibold text-[#52627f]">{material.course}</span> · {material.module}
      </p>

      <a
        href={material.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-4 text-sm font-semibold text-white transition hover:bg-[#192c65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] focus-visible:ring-offset-2"
      >
        Open resource
        <ExternalLink size={15} aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </article>
  );
}

export default function LearningMaterialsView() {
  const { saved, isSaved, toggle } = useSavedMaterials();

  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("All");
  const [format, setFormat] = useState<"All" | MaterialFormat>("All");
  const [savedOnly, setSavedOnly] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return learningMaterials.filter((item) => {
      const matchesSearch =
        !query ||
        `${item.title} ${item.description} ${item.course} ${item.module} ${item.source}`.toLowerCase().includes(query);
      return (
        matchesSearch &&
        (course === "All" || item.course === course) &&
        (format === "All" || item.format === format) &&
        (!savedOnly || saved.includes(item.id))
      );
    });
  }, [search, course, format, savedOnly, saved]);

  const hasFilters = Boolean(search) || course !== "All" || format !== "All" || savedOnly;
  const savedCount = learningMaterials.filter((item) => saved.includes(item.id)).length;

  const clearFilters = () => {
    setSearch("");
    setCourse("All");
    setFormat("All");
    setSavedOnly(false);
  };

  return (
    <main className="mx-auto max-w-[1400px] space-y-7 pb-10 sm:space-y-9">
      <header>
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
          <Sparkles size={15} className="text-[#c59400]" aria-hidden="true" />
          Learn at your pace
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">Learning Materials</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64718a] sm:text-base">
          Notes, guides and practice resources matched to the modules of your programme. Save the ones you want to
          come back to.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-8 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-10">
        <div aria-hidden="true" className="absolute -right-12 -top-20 size-64 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -right-2 -top-10 size-44 rounded-full border border-white/10" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
              <FolderOpen size={15} aria-hidden="true" />
              Resource library
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Everything you need to keep learning.</h2>
            <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
              Practical, hands-on resources to support your classes, assignments and projects.
            </p>
          </div>
          <div className="flex size-24 shrink-0 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/[0.06] sm:size-32 sm:self-auto">
            <FolderOpen size={58} strokeWidth={1.3} className="text-[#f5c542]" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Resources available", value: learningMaterials.length, icon: FileText, tone: "bg-[#eaf0ff] text-[#101d49]" },
          { label: "Programmes covered", value: materialCourses.length, icon: GraduationCap, tone: "bg-emerald-50 text-emerald-700" },
          { label: "Saved by you", value: savedCount, icon: BookmarkCheck, tone: "bg-[#fff7dc] text-[#765800]" },
        ].map((card) => (
          <div key={card.label} className={cn(cardClass, "p-5")}>
            <span className={cn("flex size-11 items-center justify-center rounded-xl", card.tone)}>
              <card.icon size={22} aria-hidden="true" />
            </span>
            <p className="mt-5 text-3xl font-bold text-[#101d49]">{card.value}</p>
            <p className="mt-1 text-sm text-[#64718a]">{card.label}</p>
          </div>
        ))}
      </section>

      <aside className="flex items-start gap-3 rounded-2xl border border-[#dce5ff] bg-[#f6f8ff] p-5">
        <Info size={21} className="mt-0.5 shrink-0 text-[#101d49]" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-bold text-[#101d49]">About these resources</h3>
          <p className="mt-1 text-sm leading-6 text-[#64718a]">
            These are free resources from trusted public sources and open in a new tab. Files shared by your tutors will
            appear here too once they are published.
          </p>
        </div>
      </aside>

      <section>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#101d49]">Browse resources</h2>
            <p className="mt-1 text-sm text-[#64718a]" aria-live="polite">
              Showing {filtered.length} of {learningMaterials.length} resources.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
            <label className="relative block flex-1">
              <span className="sr-only">Search learning materials</span>
              <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8490a6]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search materials..."
                className="h-12 w-full rounded-xl border border-[#dce3ef] bg-white pl-10 pr-4 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5"
              />
            </label>
            <label className="block sm:w-44">
              <span className="sr-only">Filter by format</span>
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value as "All" | MaterialFormat)}
                className="h-12 w-full rounded-xl border border-[#dce3ef] bg-white px-3.5 text-sm text-[#17233f] outline-none transition focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5"
              >
                <option value="All">All formats</option>
                {MATERIAL_FORMATS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {["All", ...materialCourses].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCourse(item)}
              aria-pressed={course === item}
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]",
                course === item
                  ? "bg-[#101d49] text-white"
                  : "border border-[#dce3ef] bg-white text-[#64718a] hover:bg-[#f8f9fc]",
              )}
            >
              {item === "All" ? "All programmes" : item}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSavedOnly((value) => !value)}
            aria-pressed={savedOnly}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]",
              savedOnly
                ? "bg-[#f5c542] text-[#101d49]"
                : "border border-[#dce3ef] bg-white text-[#64718a] hover:bg-[#f8f9fc]",
            )}
          >
            <BookmarkCheck size={16} aria-hidden="true" />
            Saved only
          </button>
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <MaterialCard key={item.id} material={item} saved={isSaved(item.id)} onToggleSave={() => toggle(item.id)} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-[#e4e9f2] bg-white px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
              {savedOnly && !search ? <Bookmark size={25} aria-hidden="true" /> : <Search size={25} aria-hidden="true" />}
            </span>
            <h3 className="mt-5 text-lg font-semibold text-[#101d49]">
              {savedOnly && saved.length === 0 ? "Nothing saved yet" : "No materials found"}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
              {savedOnly && saved.length === 0
                ? "Use the bookmark on any resource to keep it here for later."
                : "Try another search term or choose a different programme or format."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-[#101d49] hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
