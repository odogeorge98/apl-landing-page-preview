
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Compass,
  GraduationCap,
  Hammer,
  Handshake,
  Layers,
  Library,
  LoaderCircle,
  RefreshCw,
  Search,
  UserCheck,
  Clock3,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { http } from "@/lib/utils/http";
import { LEARNING_APPROACH } from "@/lib/data/curriculum";

const surfaceClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

type CurriculumModule = {
  id: string;
  programmeId: string;
  title: string;
  description: string;
  sequence: number;
  durationMinutes: number;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type CurriculumProgramme = {
  id: string;
  name: string;
  description: string;
  hours: number;
  moduleCount: number;
  createdAt: string;
  updatedAt: string;
};

type CurriculumSummary = {
  programmeCount: number;
  outlinesAvailable: number;
  totalModules: number;
};

type ApiResponse<T> = {
  status: string;
  statusCode: number;
  message: string;
  data: T;
};

type CurriculumListData = {
  summary: CurriculumSummary;
  items: CurriculumProgramme[];
  nextCursor: string | null;
};

type ProgrammeCurriculumData = {
  programme: CurriculumProgramme;
  modules: {
    items: CurriculumModule[];
    nextCursor: string | null;
  };
};

const approachIcons: Record<
  (typeof LEARNING_APPROACH)[number]["id"],
  LucideIcon
> = {
  practical: Hammer,
  mentorship: UserCheck,
  internship: Handshake,
};

function getProgrammeCategory(name: string) {
  const categories: Record<string, string> = {
    Cybersecurity: "Cybersecurity",
    "Data Science": "Data Science",
    "UI/UX Design": "Product Design",
    "Web Development": "Software Development",
  };

  return categories[name] ?? "Technology programme";
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  const hours = minutes / 60;

  return Number.isInteger(hours)
    ? `${hours} ${hours === 1 ? "hour" : "hours"}`
    : `${hours.toFixed(1)} hours`;
}

function ProgrammeTab({
  programme,
  selected,
  onSelect,
}: {
  programme: CurriculumProgramme;
  selected: boolean;
  onSelect: () => void;
}) {
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
          <span className="block truncate text-sm font-semibold">
            {programme.name}
          </span>
          <span
            className={cn(
              "mt-0.5 block text-xs",
              selected ? "text-white/65" : "text-[#8490a6]",
            )}
          >
            {getProgrammeCategory(programme.name)}
          </span>
        </span>

        {programme.moduleCount > 0 ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
              selected
                ? "bg-[#f5c542] text-[#101d49]"
                : "bg-[#fff6d8] text-[#765800]",
            )}
          >
            {programme.moduleCount}{" "}
            {programme.moduleCount === 1 ? "module" : "modules"}
          </span>
        ) : (
          <span
            className={cn(
              "shrink-0 text-[11px] font-medium",
              selected ? "text-white/60" : "text-[#9aa5b8]",
            )}
          >
            Outline pending
          </span>
        )}
      </button>
    </li>
  );
}

function ProgrammeDetail({
  programme,
  modules,
  loading,
  error,
  onRetry,
}: {
  programme: CurriculumProgramme;
  modules: CurriculumModule[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const publishedModules = modules
    .filter((module) => module.status === "PUBLISHED")
    .sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="space-y-5">
      <section className={`${surfaceClass} overflow-hidden`}>
        <div className="h-1.5 bg-[#f5c542]" />

        <div className="p-5 sm:p-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf0ff] px-3 py-1.5 text-xs font-semibold text-[#101d49]">
            <GraduationCap size={14} aria-hidden="true" />
            {getProgrammeCategory(programme.name)}
          </span>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">
            {programme.name}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64718a] sm:text-base">
            {programme.description ||
              "Explore the curriculum and learning modules for this programme."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg bg-[#f4f6fa] px-3 py-2 text-xs font-medium text-[#52627f]">
              <Clock3 size={15} />
              {programme.hours} learning hours
            </span>

            <span className="inline-flex items-center gap-2 rounded-lg bg-[#f4f6fa] px-3 py-2 text-xs font-medium text-[#52627f]">
              <Layers size={15} />
              {programme.moduleCount}{" "}
              {programme.moduleCount === 1 ? "module" : "modules"}
            </span>
          </div>
        </div>
      </section>

      <section
        className={`${surfaceClass} p-5 sm:p-6`}
        aria-label={`${programme.name} modules`}
      >
        <div className="flex items-start gap-3 border-b border-[#edf0f6] pb-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f6fa] text-[#101d49]">
            <Layers size={19} aria-hidden="true" />
          </span>

          <div>
            <h3 className="font-semibold text-[#101d49]">
              What learners cover
            </h3>
            <p className="mt-1 text-xs leading-5 text-[#8490a6]">
              {programme.moduleCount}{" "}
              {programme.moduleCount === 1 ? "module" : "modules"} in this
              programme, arranged in teaching order.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-[#64718a]">
            <LoaderCircle
              size={28}
              className="animate-spin text-[#101d49]"
            />
            <p className="text-sm">Loading curriculum modules...</p>
          </div>
        ) : error ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
            <p className="text-sm font-semibold text-[#101d49]">
              Could not load curriculum modules
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
              {error}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#101d49] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1b2e65]"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        ) : publishedModules.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
            <BookOpen size={28} className="text-[#9aa5b8]" />
            <h4 className="mt-3 font-semibold text-[#101d49]">
              Curriculum outline pending
            </h4>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
              No published modules are currently available for this programme.
            </p>
          </div>
        ) : (
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            {publishedModules.map((module, index) => (
              <li
                key={module.id}
                className="flex gap-3 rounded-xl border border-[#edf0f6] bg-[#f9fafd] p-4"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#101d49] text-xs font-bold tabular-nums text-white">
                  {String(module.sequence || index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-[#101d49]">
                    {module.title}
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-[#64718a]">
                    {module.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#eaf0ff] px-2.5 py-1 text-[11px] font-medium text-[#101d49]">
                      {formatDuration(module.durationMinutes)}
                    </span>
                    <span className="rounded-full bg-[#e7f7ef] px-2.5 py-1 text-[11px] font-medium text-[#16744d]">
                      Published
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

export default function CurriculumOverview() {
  const [search, setSearch] = useState("");
  const [programmes, setProgrammes] = useState<CurriculumProgramme[]>([]);
  const [summary, setSummary] = useState<CurriculumSummary>({
    programmeCount: 0,
    outlinesAvailable: 0,
    totalModules: 0,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modules, setModules] = useState<CurriculumModule[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const loadProgrammes = useCallback(async () => {
    setListLoading(true);
    setListError(null);


      console.log('Response data: ');
    try {
      const response = await http.get<ApiResponse<CurriculumListData>>(
        "/programmes/curriculum",
      );

      const result = response.data.data;

      console.log('Response data: ', result);

      setProgrammes(result.items ?? []);
      setSummary(result.summary);

      setSelectedId((currentId) => {
        if (currentId && result.items.some((item) => item.id === currentId)) {
          return currentId;
        }

        return result.items[0]?.id ?? null;
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while loading programmes.";

      setListError(message);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProgrammes();
  }, [loadProgrammes, retryKey]);

  useEffect(() => {
    if (!selectedId) {
      setModules([]);
      setModulesError(null);
      setModulesLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCurriculum() {
      setModulesLoading(true);
      setModulesError(null);
      setModules([]);

      try {
        const response = await http.get<
          ApiResponse<ProgrammeCurriculumData>
        >(`/programmes/${selectedId}/curriculum`);

        console.log('Programme ID: ', selectedId);
        if (!cancelled) {
          setModules(response.data.data.modules.items ?? []);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "An unexpected error occurred while loading the curriculum.";

          setModulesError(message);
        }
      } finally {
        if (!cancelled) {
          setModulesLoading(false);
        }
      }
    }

    void loadCurriculum();

    return () => {
      cancelled = true;
    };
  }, [selectedId, retryKey]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return programmes;

    return programmes.filter(
      (programme) =>
        programme.name.toLowerCase().includes(query) ||
        programme.description.toLowerCase().includes(query),
    );
  }, [programmes, search]);

  const selected =
    programmes.find((programme) => programme.id === selectedId) ?? null;

  function retryModules() {
    setRetryKey((current) => current + 1);
  }

  return (
    <main className="mx-auto max-w-[1400px] space-y-7 pb-10 sm:space-y-9">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
            Programme management
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">
            Curriculum
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">
            Review what each Nugi Innovations training programme teaches and
            how learners are supported.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e4e9f2] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627f]">
          <span className="size-2 rounded-full bg-[#1d9a67]" aria-hidden="true" />
          Admin workspace
        </div>
      </header>

      <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-9">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -right-2 -top-12 size-52 rounded-full border border-white/10"
        />

        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
              <Library size={14} aria-hidden="true" />
              Curriculum library
            </span>

            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Learn. Build. Innovate.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
              Technology training built around hands-on practice, mentorship,
              and a route into internships.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 lg:min-w-40">
            <p className="text-xs font-medium text-white/65">
              Programmes offered
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {listLoading ? "—" : summary.programmeCount}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 lg:min-w-40">
            <p className="text-xs font-medium text-white/65">
              Outlines available
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {listLoading ? "—" : summary.outlinesAvailable}
              <span className="ml-1.5 text-sm font-medium text-white/60">
                · {listLoading ? "—" : summary.totalModules} modules
              </span>
            </p>
          </div>
        </div>
      </section>

      <section
        aria-label="How learners are supported"
        className="grid gap-4 md:grid-cols-3"
      >
        {LEARNING_APPROACH.map((item) => {
          const Icon = approachIcons[item.id];

          return (
            <article
              key={item.id}
              className={`${surfaceClass} flex gap-4 p-5`}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
                <Icon size={20} aria-hidden="true" />
              </span>

              <div>
                <h3 className="font-semibold text-[#101d49]">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#64718a]">
                  {item.description}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <section
        aria-label="Programme curriculum"
        className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start"
      >
        <aside className={`${surfaceClass} p-3 lg:sticky lg:top-24`}>
          <label className="relative mb-3 block">
            <span className="sr-only">Search programmes or modules</span>
            <Search
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8490a6]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search programmes"
              className="h-11 w-full rounded-xl border border-[#dce3ef] bg-white pl-10 pr-3 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5"
            />
          </label>

          {listLoading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-[#64718a]">
              <LoaderCircle
                size={26}
                className="animate-spin text-[#101d49]"
              />
              <p className="text-sm">Loading programmes...</p>
            </div>
          ) : listError ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm font-semibold text-[#101d49]">
                Could not load programmes
              </p>
              <p className="mt-2 break-words text-xs leading-5 text-[#64718a]">
                {listError}
              </p>
              <button
                type="button"
                onClick={retryModules}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#101d49] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1b2e65]"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <BookOpen
                size={22}
                className="mx-auto text-[#9aa5b8]"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-semibold text-[#101d49]">
                {programmes.length === 0
                  ? "No programmes available"
                  : "No matching programmes"}
              </p>
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
                  selected={programme.id === selectedId}
                  onSelect={() => setSelectedId(programme.id)}
                />
              ))}
            </ul>
          )}
        </aside>

        {selected && !listError ? (
          <ProgrammeDetail
            programme={selected}
            modules={modules}
            loading={modulesLoading}
            error={modulesError}
            onRetry={retryModules}
          />
        ) : listLoading ? (
          <section
            className={`${surfaceClass} flex min-h-[420px] flex-col items-center justify-center gap-3 px-6 text-center`}
          >
            <LoaderCircle
              size={30}
              className="animate-spin text-[#101d49]"
            />
            <p className="text-sm text-[#64718a]">
              Preparing your curriculum...
            </p>
          </section>
        ) : (
          <section
            className={`${surfaceClass} flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center`}
          >
            <Compass size={28} className="text-[#8490a6]" />
            <h2 className="mt-4 text-xl font-bold text-[#101d49]">
              Curriculum unavailable
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
              {listError ||
                "There are no programmes to display at the moment."}
            </p>
            {listError && (
              <button
                type="button"
                onClick={retryModules}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#101d49] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1b2e65]"
              >
                <RefreshCw size={15} />
                Try again
              </button>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
