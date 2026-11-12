import {
  Archive, ArrowUpRight, Award, BookOpen, Bookmark, Building2, Calendar, ChartColumn, CircleAlert, CircleCheck,
  CircleUser, ClipboardList, CreditCard, FileText, FileUp, GraduationCap, Grid3x3, Inbox, LayoutGrid, Link2,
  ListChecks, Mail, PenLine, Settings, Shield, ShieldCheck, Upload, UserCog, UserPlus, Users,
} from "lucide-react";
import { Container, Eyebrow, H2 } from "./Section";

const NAV = [
  { group: "Workspace", items: [["Overview", LayoutGrid], ["Admissions", UserPlus], ["Students", CircleUser]] },
  { group: "Academics", items: [["Faculties", Building2], ["Departments", Grid3x3], ["Programmes", BookOpen], ["Courses", Bookmark], ["Registration", PenLine], ["Lecturers", UserCog], ["Examinations", FileText], ["Results & transcripts", Award], ["Graduation & NYSC", GraduationCap]] },
  { group: "Operations", items: [["Finance & fees", CreditCard], ["Communication", Mail], ["Resources", Archive], ["Complaints", CircleAlert], ["Reports", ChartColumn]] },
  { group: "Administration", items: [["Integrations", Link2], ["Users & permissions", Shield], ["Audit trail", ListChecks], ["Settings", Settings]] },
] as const;

type Stat = { label: string; value: string; icon: React.ElementType; bg: string; chips?: string[]; bar?: number; foot?: string };
const STATS: Stat[] = [
  { label: "Active Students", value: "4,820", icon: Users, bg: "from-[#7c3aed] to-[#4f46e5]", chips: ["5 faculties", "18 depts"] },
  { label: "Published Batches", value: "24 / 28", icon: CircleCheck, bg: "from-[#f59e0b] to-[#d97706]", bar: 86, foot: "86% complete" },
  { label: "Open Requests", value: "12", icon: Inbox, bg: "from-[#ef4444] to-[#dc2626]", chips: ["8 records", "4 transcripts"] },
  { label: "NYSC Review", value: "24", icon: ShieldCheck, bg: "from-[#0ea5e9] to-[#0284c7]", foot: "2024/25 graduating cohort" },
];

const ACTIONS = [
  { t: "Upload student roster", s: "Bulk import · CSV supported", icon: Upload, c: "text-brand bg-brand/10" },
  { t: "Review results", s: "4 batches awaiting sign-off", icon: CircleCheck, c: "text-emerald-600 bg-emerald-50" },
  { t: "Upload admission list", s: "New intake · Batch C pending", icon: FileUp, c: "text-amber-600 bg-amber-50" },
  { t: "Manage NYSC list", s: "24 records under review", icon: ClipboardList, c: "text-sky-600 bg-sky-50" },
];

const BARS = [["3.12", "2022/23", 96], ["3.26", "2023/24", 104], ["3.34", "2024/25", 112], ["3.42", "2025/26", 124]] as const;

const CAL = [
  ["Result submission window", "27 Oct – 6 Nov · Academic office", "Open", "bg-emerald-50 text-emerald-600", "bg-emerald-500"],
  ["Department review closes", "10 Nov · HOD approval", "Upcoming", "bg-amber-50 text-amber-600", "bg-amber-500"],
  ["Senate results meeting", "16 Nov · Registry", "Upcoming", "bg-brand/10 text-brand", "bg-brand"],
] as const;

const QUEUE = [
  ["CSC 301 · Result batch", "Computer Science", "27 Oct · 09:18", "HOD review", "bg-brand/10 text-brand", "Review batch"],
  ["Graduation review · 2025/26", "Registry", "26 Oct · 14:32", "Pending checks", "bg-amber-50 text-amber-600", "Open list"],
  ["Transcript · APL-TR-0084", "Registry", "26 Oct · 12:06", "Processing", "bg-sky-50 text-sky-600", "View request"],
  ["Admission list · Batch B", "Admissions", "27 Oct · 09:32", "3 invalid rows", "bg-red-50 text-red-600", "View errors"],
] as const;

const card = "rounded-xl border border-line bg-white";
const pill = "rounded-md bg-brand/10 px-3 py-1.5 text-[11px] font-bold text-brand";

export function DashboardPreview() {
  return (
    <section id="platform" className="scroll-mt-24 bg-lav py-16 md:py-24">
      <Container>
        <div className="text-left md:text-center">
          <Eyebrow>Your institution workspace</Eyebrow>
          <H2 lines={["Your institution. In focus."]} className="mt-4" />
        </div>

        <div className="mt-8 rounded-xl border border-line bg-white p-4 shadow-[0_20px_50px_-20px_rgba(91,76,239,0.3)] md:hidden">
          <p className="text-xs font-bold text-brand">Ìmọ University</p>
          <p className="mt-4 text-2xl font-bold tracking-tight text-ink">Your institution, in focus.</p>
          <p className="mt-3 text-[11px] text-muted">2025/26 · First semester · Example data</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[["4,820", "Active students", "from-[#7c3aed] to-[#6d28d9]"], ["24 / 28", "Results published", "from-[#d97706] to-[#b45309]"], ["12", "Open requests", "from-[#dc2626] to-[#b91c1c]"], ["24", "NYSC ready", "from-[#0891b2] to-[#0e7490]"]].map(([v, l, g]) => (
              <div key={l} className={`rounded-lg bg-gradient-to-br ${g} p-4 text-white`}>
                <p className="text-2xl font-bold">{v}</p>
                <p className="mt-3 text-[11px]">{l}</p>
              </div>
            ))}
          </div>
          <div className={`${card} mt-3 p-4`}>
            <p className="text-sm font-bold text-ink">Academic progress</p>
            <p className="mt-1 text-[10px] text-muted">Average CGPA · Published results</p>
            <div className="mt-4 flex h-36 items-end justify-between gap-2">
              {[["3.12", "22/23", 64], ["3.28", "23/24", 80], ["3.34", "24/25", 92], ["3.42", "25/26", 112]].map(([v, y, h]) => (
                <div key={y} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-brand">{v}</span>
                  <div className="w-full rounded-sm bg-[#6d4aed]" style={{ height: h as number }} />
                  <span className="text-[9px] text-muted">{y}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs font-bold text-brand">Institution CGPA 3.42 · Pass rate 86%</p>
        </div>

        <div className="relative mx-auto mt-14 hidden max-h-[900px] overflow-hidden md:block rounded-xl border border-line bg-white shadow-[0_30px_80px_-30px_rgba(91,76,239,0.35)] lg:max-h-[1120px]">
          <div className="flex">
            <aside className="hidden w-[212px] shrink-0 border-r border-line bg-white p-3 lg:block">
              <p className="px-3 pt-2 text-[13px] font-bold leading-snug text-ink">APL /<br />Academic Pavilion</p>
              <div className="mt-4 rounded-lg bg-brand/10 p-3 text-brand">
                <p className="text-xs font-bold">• Ìmọ University</p>
                <p className="mt-1 text-[10px]">imo.apl.ng · Ibadan, Oyo</p>
                <p className="text-[10px]">2025/26 · First semester</p>
              </div>
              {NAV.map((g) => (
                <div key={g.group} className="mt-4">
                  <p className="px-3 text-[9px] font-bold uppercase tracking-widest text-muted/70">{g.group}</p>
                  <ul className="mt-1">
                    {g.items.map(([label, Icon], k) => (
                      <li key={label} className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs ${g.group === "Workspace" && k === 0 ? "bg-lav font-bold text-brand" : "text-muted"}`}>
                        <Icon className="size-3.5" />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </aside>

            <div className="min-w-0 flex-1 bg-[#f4f4fb]">
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-white px-4 py-4 md:px-8">
                <div>
                  <p className="text-lg font-bold text-ink">Your institution, in focus.</p>
                  <p className="text-xs text-muted">Here&apos;s what needs your attention at Ìmọ University today.</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="rounded-md bg-lav px-3 py-2 text-muted">27 Oct 2026</span>
                  <span className="rounded-md bg-brand px-4 py-2 text-white">View reports</span>
                </div>
              </header>

              <div className="space-y-4 p-4 md:p-8">
                <div className={`${card} flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11px] text-muted`}>
                  <p className="flex flex-wrap items-center gap-3">
                    <span className="rounded bg-brand px-2.5 py-1 font-bold text-white">2025/26</span>
                    <span className="text-xs font-bold text-ink">First semester</span>
                    <span><span className="text-emerald-500">●</span> Results publication &amp; review · Active</span>
                  </p>
                  <p><span className="text-amber-500">●</span> Submission window closes 6 Nov <b className="ml-3 text-brand">View calendar →</b></p>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                  {STATS.map((s) => (
                    <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.bg} p-4 text-white`}>
                      <div className="flex items-start justify-between">
                        <span className="grid size-8 place-items-center rounded-lg bg-white/20"><s.icon className="size-4" /></span>
                        <span className="text-[10px] font-bold opacity-80">{s.label}</span>
                      </div>
                      <p className="mt-4 text-3xl font-bold tracking-tight">{s.value}</p>
                      {s.bar && <div className="mt-2 h-1 rounded bg-white/30"><div className="h-full rounded bg-white" style={{ width: `${s.bar}%` }} /></div>}
                      <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                        {s.chips?.map((c) => <span key={c} className="rounded bg-white/20 px-2 py-0.5 font-semibold">{c}</span>)}
                        {s.foot && <span className="opacity-90">{s.foot}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                  {ACTIONS.map((a) => (
                    <div key={a.t} className={`${card} flex items-center gap-3 p-3`}>
                      <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${a.c}`}><a.icon className="size-4" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-ink">{a.t}</span>
                        <span className="block truncate text-[10px] text-muted">{a.s}</span>
                      </span>
                      <ArrowUpRight className="size-3.5 text-brand" />
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_270px]">
                  <div className={`${card} p-5`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-ink">Academic progress, in perspective</p>
                        <p className="text-[10px] text-muted">Average CGPA · Published results · Institution aggregate</p>
                      </div>
                      <span className={`${pill} hidden sm:block`}>Explore analytics →</span>
                    </div>
                    <div className="mt-6 flex h-40 items-end justify-around gap-4">
                      {BARS.map(([v, y, h], k) => (
                        <div key={y} className="flex flex-col items-center gap-1">
                          <span className="text-[11px] font-bold text-brand">{v}</span>
                          <div className="w-10 rounded-t-md bg-gradient-to-b from-brand/90 to-brand/10 md:w-12" style={{ height: h, opacity: 0.35 + k * 0.22 }} />
                          <span className="text-[10px] text-muted">{y}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1 border-t border-line pt-3 text-[11px] text-muted">
                      <span><span className="text-brand">■</span> Cohort mean <b className="text-ink">3.42 / 5.00</b></span>
                      <span><span className="text-emerald-500">●</span> Institution pass rate <b className="text-emerald-600">81%</b></span>
                      <span><span className="text-amber-500">●</span> Coverage <b className="text-ink">24 / 28 batches</b></span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={`${card} p-4`}>
                      <p className="flex items-center gap-3 text-sm font-bold text-ink"><span className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand"><Calendar className="size-4" /></span>Academic calendar</p>
                      <ul className="mt-3 space-y-2">
                        {CAL.map(([t, s, b, bc, dot]) => (
                          <li key={t} className="flex gap-2">
                            <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dot}`} />
                            <span>
                              <span className="block text-xs font-bold text-ink">{t}</span>
                              <span className="block text-[10px] text-muted">{s}</span>
                              <span className={`mt-1 inline-block rounded px-1.5 text-[9px] font-bold ${bc}`}>{b}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 rounded-md bg-lav py-2 text-center text-[11px] font-bold text-brand">Open academic calendar</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] p-4 text-white">
                      <p className="flex justify-between text-[11px] font-bold">Institution CGPA <span className="rounded bg-white/20 px-2">2025/26</span></p>
                      <p className="mt-2 text-3xl font-bold">3.42</p>
                      <div className="mt-3 h-1 rounded bg-white/30"><div className="h-full w-[68%] rounded bg-white" /></div>
                      <p className="mt-3 text-[10px]">68.4% of 5.00 maximum scale</p>
                    </div>
                  </div>
                </div>

                <div className={`${card} overflow-hidden p-5`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-3 text-sm font-bold text-ink"><span className="grid size-8 place-items-center rounded-lg bg-red-50 text-red-500"><CircleAlert className="size-4" /></span>Your institution&apos;s review queue</p>
                      <p className="mt-1 text-[10px] text-muted">Items requiring an authorised review, not automatic approval</p>
                    </div>
                    <span className={`${pill} hidden sm:block`}>View all requests →</span>
                  </div>
                  <div className="mt-4 overflow-x-auto rounded-lg border border-line">
                    <table className="w-full min-w-[640px] text-left text-xs">
                      <thead className="bg-[#f4f4fb] text-[9px] uppercase tracking-widest text-muted/80">
                        <tr>{["Item", "Owner", "Received", "Status", "Next step"].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {QUEUE.map(([item, owner, at, st, sc, next]) => (
                          <tr key={item} className="border-t border-line">
                            <td className="px-4 py-3 font-bold text-ink">{item}</td>
                            <td className="px-4 py-3 text-muted">{owner}</td>
                            <td className="px-4 py-3 text-muted/80">{at}</td>
                            <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${sc}`}>{st}</span></td>
                            <td className="px-4 py-3 font-bold text-brand">{next} →</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-lav to-transparent" />
        </div>
      </Container>
    </section>
  );
}
