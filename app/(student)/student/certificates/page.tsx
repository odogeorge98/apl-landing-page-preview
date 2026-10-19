"use client";

import { useState } from "react";
import {
  Award,
  Search,
  Download,
  Eye,
  ShieldCheck,
  GraduationCap,
  CalendarDays,
  FileCheck2,
  Sparkles,
} from "lucide-react";

import MainLayout from "@/components/layout/dashboard/MainLayout";

type Certificate = {
  id: string;
  title: string;
  student: string;
  certificateNumber: string;
  issuedDate: string;
  programme: string;
};

const certificates: Certificate[] = [
  {
    id: "1",
    title: "Certificate of Completion",
    student: "Student Name",
    certificateNumber: "NUGI-2026-001",
    issuedDate: "2026-09-15",
    programme: "Web Development",
  },
  {
    id: "2",
    title: "Certificate of Achievement",
    student: "Student Name",
    certificateNumber: "NUGI-2026-002",
    issuedDate: "2026-09-20",
    programme: "UI/UX Design",
  },
  {
    id: "3",
    title: "Professional Certificate",
    student: "Student Name",
    certificateNumber: "NUGI-2026-003",
    issuedDate: "2026-10-01",
    programme: "Digital Marketing",
  },
];

export default function CertificatesPage() {
  const [search, setSearch] = useState("");

  const filteredCertificates = certificates.filter((certificate) =>
    `${certificate.title} ${certificate.programme} ${certificate.certificateNumber}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Africa/Lagos",
    }).format(new Date(date));

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1400px] space-y-7 pb-10 sm:space-y-9">
        {/* Page heading */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
              <Sparkles size={15} className="text-[#c59400]" />
              Your achievements
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">
              My Certificates
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#64718a] sm:text-base">
              Celebrate your progress, view your achievements, and access your
              certificates earned through Nugi Innovations.
            </p>
          </div>
        </header>

        {/* Hero section */}
        <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-8 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-10">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-20 size-64 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -right-2 -top-10 size-44 rounded-full border border-white/10"
          />

          <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
                <Award size={15} />
                Certificate centre
              </span>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Every achievement tells your story.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                Your hard work deserves recognition. Access your certificates
                and keep building your professional journey.
              </p>
            </div>

            <div className="flex size-28 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] sm:size-36">
              <Award
                size={76}
                strokeWidth={1.2}
                className="text-[#f5c542]"
              />
            </div>
          </div>
        </section>

        {/* Certificate statistics */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#e4e9f2] bg-white p-5 shadow-[0_2px_10px_rgba(16,29,73,0.025)]">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#fff7dc] text-[#101d49]">
                <Award size={22} />
              </span>

              <span className="text-xs font-medium text-[#8490a6]">
                Achievements
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[#101d49]">
              {certificates.length}
            </p>

            <p className="mt-1 text-sm text-[#64718a]">
              Total certificates
            </p>
          </div>

          <div className="rounded-2xl border border-[#e4e9f2] bg-white p-5 shadow-[0_2px_10px_rgba(16,29,73,0.025)]">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
                <GraduationCap size={22} />
              </span>

              <span className="text-xs font-medium text-[#8490a6]">
                Learning
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[#101d49]">
              {new Set(certificates.map((item) => item.programme)).size}
            </p>

            <p className="mt-1 text-sm text-[#64718a]">
              Programmes represented
            </p>
          </div>

          <div className="rounded-2xl border border-[#e4e9f2] bg-white p-5 shadow-[0_2px_10px_rgba(16,29,73,0.025)] sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#e9f6ef] text-[#18794e]">
                <ShieldCheck size={22} />
              </span>

              <span className="text-xs font-medium text-[#8490a6]">
                Recognition
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[#101d49]">
              Digital
            </p>

            <p className="mt-1 text-sm text-[#64718a]">
              Certificate collection
            </p>
          </div>
        </section>

        {/* Certificate list */}
        <section>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#101d49]">
                Your achievements
              </h2>

              <p className="mt-1 text-sm text-[#64718a]">
                Browse and search your certificates.
              </p>
            </div>

            <label className="relative block w-full sm:max-w-sm">
              <span className="sr-only">
                Search certificates
              </span>

              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8490a6]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search certificates..."
                className="h-12 w-full rounded-xl border border-[#dce3ef] bg-white pl-10 pr-4 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5"
              />
            </label>
          </div>

          {filteredCertificates.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-[#e4e9f2] bg-white px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
                <Search size={25} />
              </span>

              <h3 className="mt-5 text-lg font-semibold text-[#101d49]">
                No certificates found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
                Try another search term to find a certificate.
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-[#101d49] hover:bg-[#f4f6fa]"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCertificates.map((certificate) => (
                <article
                  key={certificate.id}
                  className="group overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,29,73,0.09)]"
                >
                  {/* Certificate preview */}
                  <div className="relative overflow-hidden bg-[#101d49] p-6">
                    <div
                      aria-hidden="true"
                      className="absolute -right-8 -top-8 size-32 rounded-full border border-white/10"
                    />

                    <div className="relative flex items-center justify-between">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-[#f5c542]">
                        <Award size={25} />
                      </span>

                      <span className="rounded-full border border-[#f5c542]/30 bg-[#f5c542]/10 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
                        Certificate
                      </span>
                    </div>

                    <div className="relative mt-6 border-t border-white/15 pt-5 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ffd95c]">
                        Nugi Innovations
                      </p>

                      <h3 className="mt-3 text-lg font-bold text-white">
                        {certificate.title}
                      </h3>

                      <div className="mx-auto my-4 h-1 w-12 rounded-full bg-[#f5c542]" />

                      <p className="text-sm text-white/65">
                        Awarded for completing
                      </p>

                      <p className="mt-1 text-base font-semibold text-white">
                        {certificate.programme}
                      </p>

                      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/55">
                        <ShieldCheck size={14} className="text-[#f5c542]" />
                        <span>{certificate.certificateNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Certificate information */}
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
                        <FileCheck2 size={20} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-[#101d49]">
                          {certificate.programme}
                        </h4>

                        <p className="mt-1 text-sm text-[#64718a]">
                          {certificate.title}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2 border-t border-[#edf0f6] pt-4 text-sm text-[#64718a]">
                      <CalendarDays size={16} />
                      <span>Issued {formatDate(certificate.issuedDate)}</span>
                    </div>

                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() =>
                          window.alert(
                            "Connect this button to your certificate viewing or download feature."
                          )
                        }
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f5c542] px-4 py-2.5 text-sm font-semibold text-[#101d49] transition hover:bg-[#f8d35f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] focus-visible:ring-offset-2"
                      >
                        <Eye size={17} />
                        View certificate
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </MainLayout>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}