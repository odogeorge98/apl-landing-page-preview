"use client";

/**
 * ADMIN · Certificates
 * Route: /dashboard/certificates  (already linked from the admin sidebar in
 * lib/config/dashboard/ui-config.ts → "Learning › Certificates")
 *
 * The admin counterpart of the student page at
 * app/(student)/student/certificates. Students can only view their own
 * certificates; administrators can:
 *   • issue certificates — one at a time or in bulk to eligible learners
 *   • preview, download, resend and copy verification links
 *   • revoke (with a recorded reason), reinstate and reissue certificates
 *   • verify any certificate number
 *   • manage the design templates and choose the default
 *
 * UX notes: "Issue certificate" (and other dialog triggers) open after a
 * short, deliberate delay with a spinner on the button — see
 * `useDelayedAction`. All dropdowns use the animated <Select />, and rows,
 * cards and buttons share one hover language with the Assignments page.
 *
 * Dashboard and issued-register data are loaded from the admin certificates API.
 * Eligibility, templates and certificate mutations remain local until their APIs exist.
 */

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  ArrowRight,
  Copy,
  Download,
  Eye,
  GraduationCap,
  LayoutTemplate,
  Loader2,
  Mail,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
  ShieldOff,
  ShieldQuestion,
  Sparkles,
  Star,
  Undo2,
  X,
  XCircle,
} from "lucide-react";

import { MainLayout } from "@/components/layout/dashboard";
import { toast } from "@/components/ui/Toaster";
import { AdminAccessGuard } from "@/components/admin/shared/AdminAccessGuard";
import { ActionMenu } from "@/components/admin/shared/ActionMenu";
import { AdminModal } from "@/components/admin/shared/AdminModal";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { RowAccent } from "@/components/admin/shared/RowAccent";
import { Select, type SelectOption } from "@/components/admin/shared/Select";
import { useDelayedAction, useLastDefined } from "@/components/admin/shared/motion";
import {
  cardClass,
  cardHoverClass,
  darkButtonClass,
  dangerButtonClass,
  formatDate,
  formatDateTime,
  getInitials,
  iconNudgeOnHover,
  iconSpinOnHover,
  inputClass,
  labelClass,
  primaryButtonClass,
  rowHoverClass,
  secondaryButtonClass,
  thClass,
} from "@/components/admin/shared/admin-ui";
import { CertificatePreview } from "@/components/admin/certificates/CertificatePreview";
import {
  IssueCertificateModal,
  type IssueCertificateValues,
} from "@/components/admin/certificates/IssueCertificateModal";
import {
  CERTIFICATE_TITLES,
  CERTIFICATE_TYPES,
  REVOKE_REASONS,
  mockCertificates,
  mockEligibleLearners,
  mockTemplates,
  type CertificateStatus,
  type CertificateTemplate,
  type CertificateType,
  type EligibleLearner,
  type IssuedCertificate,
} from "@/lib/mock/admin-certificates";
import { cn } from "@/lib/utils";
import { http } from "@/lib/utils/http";
import { useProgrammes } from "@/lib/hooks/programmes/use-programmes";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

type Tab = "issued" | "eligible" | "templates";

/** Placeholder signed-in admin name until the profile API is wired in. */
const CURRENT_ADMIN = "Admin · You";

/** Public verification URL learners/employers can visit. */
const verificationUrl = (certificateNumber: string) => `https://nugi.io/verify/${certificateNumber}`;

/** Generate the next `NUGI-YYYY-NNN` number. The backend will own this. */
function nextCertificateNumber(existing: IssuedCertificate[], offset = 0): string {
  const year = new Date().getFullYear();
  const max = existing.reduce((highest, item) => {
    const [, itemYear, sequence] = item.certificateNumber.split("-");
    return Number(itemYear) === year ? Math.max(highest, Number(sequence) || 0) : highest;
  }, 0);
  return `NUGI-${year}-${String(max + 1 + offset).padStart(3, "0")}`;
}

const typeStyles: Record<CertificateType, string> = {
  Completion: "bg-[#eaf0ff] text-[#101d49]",
  Achievement: "bg-[#fff7dc] text-[#765800]",
  Professional: "bg-emerald-50 text-emerald-700",
};

type ApiEnvelope<T> = {
  status: string;
  statusCode: number;
  message: string;
  data: T;
};

type CertificateDashboardData = {
  activeCertificates: number;
  revokedCertificates: number;
  awaitingIssuance: number;
  programmesRepresented: number;
  recordedVerifications: number;
};

type AdminCertificateRecord = {
  id: string;
  certificateNumber: string;
  studentId: string;
  programmeId: string;
  templateId: string;
  type: string;
  status: string;
  issuedAt: string;
  expiresAt: string | null;
  scorePercent: string | null;
  documentUrl: string | null;
  issuedByUserId: string;
  revokedAt: string | null;
  revocationReason: string | null;
  createdAt: string;
  updatedAt: string;
  student: { id: string; name: string; user: { id: string; email: string } };
  programme: { id: string; name: string };
  issuedBy: { id: string; email: string; role: string };
};

type AdminCertificatesData = {
  items: AdminCertificateRecord[];
  nextCursor: string | null;
};

type AdminCertificatesQuery = {
  search?: string;
  programmeId?: string;
  type?: string;
  status?: string;
  issueDateFrom?: string;
  issueDateTo?: string;
  limit?: number;
  cursor?: string;
};

function mapApiCertificate(item: AdminCertificateRecord): IssuedCertificate {
  const typeMap: Record<string, CertificateType> = {
    COMPLETION: "Completion",
    ACHIEVEMENT: "Achievement",
    PROFESSIONAL: "Professional",
    Completion: "Completion",
    Achievement: "Achievement",
    Professional: "Professional",
  };

  return {
    id: item.id,
    certificateNumber: item.certificateNumber,
    recipientName: item.student?.name ?? "Unknown learner",
    recipientEmail: item.student?.user?.email ?? "",
    programme: item.programme?.name ?? "Unknown programme",
    cohort: "—",
    type: typeMap[item.type] ?? "Completion",
    templateId: item.templateId ?? "",
    issuedDate: item.issuedAt,
    issuedBy: item.issuedBy?.email ?? "—",
    finalScore: Number(item.scorePercent ?? 0),
    status: item.status?.toUpperCase() === "REVOKED" ? "Revoked" : "Active",
    verificationCount: 0,
    revokedAt: item.revokedAt ?? undefined,
    revokedReason: item.revocationReason ?? undefined,
    documentUrl: item.documentUrl ?? undefined,
  } as IssuedCertificate;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AdminCertificatesPage() {
  return (
    <MainLayout>
      {/* `viewCertificates` already exists in ROLE_PERMISSIONS but students
          also hold it, so management is gated on `manageAllCourses` (admin). */}
      <AdminAccessGuard permission="manageAllCourses" areaLabel="Certificate management">
        <CertificatesWorkspace />
      </AdminAccessGuard>
    </MainLayout>
  );
}

function CertificatesWorkspace() {
  // ---- Data --------------------------------------------------------------
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [eligible, setEligible] = useState<EligibleLearner[]>(mockEligibleLearners);
  const [templates, setTemplates] = useState<CertificateTemplate[]>(mockTemplates);
  const [dashboard, setDashboard] = useState<CertificateDashboardData | null>(null);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [certificatesError, setCertificatesError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // ---- View state --------------------------------------------------------
  const [tab, setTab] = useState<Tab>("issued");
  const [search, setSearch] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState("");

  // Keep programme loading and option construction identical to Daily Reports.
  const programmesQuery = useProgrammes();

  useEffect(() => {
    if (programmesQuery.hasNextPage && !programmesQuery.isFetchingNextPage) {
      void programmesQuery.fetchNextPage();
    }
  }, [
    programmesQuery.hasNextPage,
    programmesQuery.isFetchingNextPage,
    programmesQuery.fetchNextPage,
  ]);

  const programmeOptions = useMemo(() => {
    const items = programmesQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const unique = new Map(items.map((programme) => [programme.id, programme]));

    return [
      { value: "", label: "All programmes" },
      ...[...unique.values()].map((programme) => ({
        value: programme.id,
        label: programme.name,
      })),
    ] satisfies SelectOption<string>[];
  }, [programmesQuery.data]);
  const [typeFilter, setTypeFilter] = useState<"All types" | CertificateType>("All types");
  const [statusFilter, setStatusFilter] = useState<"All" | CertificateStatus>("All");
  const [selectedEligible, setSelectedEligible] = useState<Set<string>>(new Set());

  // ---- Dialog state ------------------------------------------------------
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueLearnerId, setIssueLearnerId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [templatePreview, setTemplatePreview] = useState<CertificateTemplate | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<IssuedCertificate | null>(null);
  const [reissueTarget, setReissueTarget] = useState<IssuedCertificate | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const templateById = useMemo(() => new Map(templates.map((item) => [item.id, item])), [templates]);
  const defaultTemplate = templates.find((item) => item.isDefault) ?? templates[0];

  /* ---------------------------- Derived data ----------------------------- */

  // All register filters, including programme, are applied by the API.
  const filteredCertificates = certificates;

  const metrics = {
    active: dashboard?.activeCertificates ?? 0,
    revoked: dashboard?.revokedCertificates ?? 0,
    programmes: dashboard?.programmesRepresented ?? 0,
    verifications: dashboard?.recordedVerifications ?? 0,
    awaiting: dashboard?.awaitingIssuance ?? 0,
  };

  const hasActiveFilters =
    Boolean(search) || Boolean(programmeFilter) || typeFilter !== "All types" || statusFilter !== "All";

  const previewCertificate = previewId ? certificates.find((item) => item.id === previewId) ?? null : null;
  const allEligibleSelected = eligible.length > 0 && eligible.every((item) => selectedEligible.has(item.id));

  const buildRegisterQuery = (cursor?: string): AdminCertificatesQuery => ({
    limit: 20,
    search: search.trim() || undefined,
    programmeId: programmeFilter || undefined,
    type: typeFilter !== "All types" ? typeFilter.toUpperCase() : undefined,
    status: statusFilter !== "All" ? statusFilter.toUpperCase() : undefined,
    cursor,
  });

  const fetchDashboard = async () => {
    try {
      const response = await http.get<ApiEnvelope<CertificateDashboardData>>(
        "/certificates/admin/dashboard"
      );
      setDashboard(response.data.data);
    } catch (error) {
      console.error("Failed to load certificate dashboard:", error);
      toast.error("Unable to load certificate dashboard");
    }
  };

  const fetchCertificates = async (query: AdminCertificatesQuery = { limit: 20 }, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else {
        setLoadingCertificates(true);
        setCertificatesError(null);
      }

      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
      });
      const endpoint = `/certificates/admin${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await http.get<ApiEnvelope<AdminCertificatesData>>(endpoint);
      const result = response.data.data;
      const mapped = (result.items ?? []).map(mapApiCertificate);

      setCertificates((previous) => append ? [...previous, ...mapped] : mapped);
      setNextCursor(result.nextCursor ?? null);
    } catch (error) {
      console.error("Failed to load certificate register:", error);
      if (!append) setCertificatesError("Unable to load certificates. Please try again.");
      else toast.error("Unable to load more certificates");
    } finally {
      setLoadingCertificates(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    void fetchDashboard();
    void fetchCertificates({ limit: 20 });
  }, []);

  const applyFilters = () => {
    void fetchCertificates(buildRegisterQuery());
  };

  const loadMoreCertificates = () => {
    if (nextCursor) void fetchCertificates(buildRegisterQuery(nextCursor), true);
  };

  /* ------------------------------ Mutations ------------------------------ */

  /** Build a certificate record from form values. */
  const buildCertificate = (values: Omit<IssueCertificateValues, "notifyLearner">, number: string): IssuedCertificate => ({
    // Temporary client-side ID; the API will return the real one.
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    certificateNumber: number,
    recipientName: values.recipientName,
    recipientEmail: values.recipientEmail,
    programme: values.programme,
    cohort: values.cohort,
    type: values.type,
    templateId: values.templateId,
    issuedDate: values.issuedDate,
    issuedBy: CURRENT_ADMIN,
    finalScore: values.finalScore,
    status: "Active",
    verificationCount: 0,
  });

  const issueOne = (values: IssueCertificateValues) => {
    // TODO(api): POST /certificates — server assigns the number and renders the PDF.
    const number = nextCertificateNumber(certificates);
    setCertificates((previous) => [buildCertificate(values, number), ...previous]);
    if (values.eligibleLearnerId) {
      setEligible((previous) => previous.filter((item) => item.id !== values.eligibleLearnerId));
      setSelectedEligible((previous) => {
        const next = new Set(previous);
        next.delete(values.eligibleLearnerId!);
        return next;
      });
    }
    setIssueOpen(false);
    setIssueLearnerId(null);
    toast.success(`Certificate ${number} issued`, {
      description: values.notifyLearner
        ? `${values.recipientName} has been emailed a download link.`
        : `${values.recipientName} can now see it on their Certificates page.`,
    });
  };

  /** Issue certificates to every selected eligible learner using the recommended type. */
  const issueBulk = () => {
    // TODO(api): POST /certificates/bulk
    const learners = eligible.filter((item) => selectedEligible.has(item.id));
    const created = learners.map((learner, index) =>
      buildCertificate(
        {
          recipientName: learner.name,
          recipientEmail: learner.email,
          programme: learner.programme,
          cohort: learner.cohort,
          type: learner.recommendedType,
          templateId: templates.find((item) => item.type === learner.recommendedType)?.id ?? defaultTemplate.id,
          issuedDate: new Date().toISOString().slice(0, 10),
          finalScore: learner.finalScore,
        },
        nextCertificateNumber(certificates, index),
      ),
    );
    setCertificates((previous) => [...created, ...previous]);
    setEligible((previous) => previous.filter((item) => !selectedEligible.has(item.id)));
    setSelectedEligible(new Set());
    setBulkConfirmOpen(false);
    toast.success(`${created.length} certificate${created.length === 1 ? "" : "s"} issued`, {
      description: "Learners have been notified by email.",
    });
  };

  const revoke = (certificate: IssuedCertificate, reason: string) => {
    // TODO(api): POST /certificates/:id/revoke { reason } — keep an audit trail.
    setCertificates((previous) =>
      previous.map((item) =>
        item.id === certificate.id
          ? { ...item, status: "Revoked", revokedReason: reason, revokedAt: new Date().toISOString() }
          : item,
      ),
    );
    setRevokeTarget(null);
    toast.success(`${certificate.certificateNumber} revoked`, {
      description: "Verification checks will now show this certificate as invalid.",
    });
  };

  const reinstate = (certificate: IssuedCertificate) => {
    // TODO(api): POST /certificates/:id/reinstate
    setCertificates((previous) =>
      previous.map((item) =>
        item.id === certificate.id ? { ...item, status: "Active", revokedReason: undefined, revokedAt: undefined } : item,
      ),
    );
    toast.success(`${certificate.certificateNumber} reinstated`);
  };

  /** Revoke the old certificate and issue a fresh number with today's date. */
  const reissue = (certificate: IssuedCertificate) => {
    // TODO(api): POST /certificates/:id/reissue
    const number = nextCertificateNumber(certificates);
    const fresh = buildCertificate({ ...certificate, issuedDate: new Date().toISOString().slice(0, 10) }, number);
    setCertificates((previous) => [
      fresh,
      ...previous.map((item) =>
        item.id === certificate.id && item.status === "Active"
          ? { ...item, status: "Revoked" as const, revokedReason: "Superseded by a reissued certificate", revokedAt: new Date().toISOString() }
          : item,
      ),
    ]);
    setReissueTarget(null);
    toast.success(`Reissued as ${number}`, { description: `${certificate.certificateNumber} has been superseded.` });
  };

  const copyLink = async (certificate: IssuedCertificate) => {
    try {
      await navigator.clipboard.writeText(verificationUrl(certificate.certificateNumber));
      toast.success("Verification link copied");
    } catch {
      toast.error("Couldn't copy the link", { description: verificationUrl(certificate.certificateNumber) });
    }
  };

  const download = (certificate: IssuedCertificate) => {
    const documentUrl = (certificate as IssuedCertificate & { documentUrl?: string }).documentUrl;
    if (documentUrl) {
      window.open(documentUrl, "_blank", "noopener,noreferrer");
      return;
    }
    toast.info(`PDF unavailable for ${certificate.certificateNumber}`, {
      description: "This certificate does not have a document URL yet.",
    });
  };

  const resend = (certificate: IssuedCertificate) => {
    // TODO(api): POST /certificates/:id/resend
    toast.success("Email sent", { description: `Download link resent to ${certificate.recipientEmail}.` });
  };

  const setDefaultTemplate = (template: CertificateTemplate) => {
    // TODO(api): PATCH /certificate-templates/:id { isDefault: true }
    setTemplates((previous) => previous.map((item) => ({ ...item, isDefault: item.id === template.id })));
    toast.success(`${template.name} is now the default template`);
  };

  const resetFilters = () => {
    setSearch("");
    setProgrammeFilter("");
    setTypeFilter("All types");
    setStatusFilter("All");
    void fetchCertificates({ limit: 20 });
  };

  // Short "opening…" pause before dialogs appear (spinner on the trigger).
  const opener = useDelayedAction();

  const openIssue = (learnerId: string | null = null) =>
    opener.run(learnerId ? `issue-${learnerId}` : "issue", () => {
      setIssueLearnerId(learnerId);
      setIssueOpen(true);
    });

  const openPreview = (id: string) => opener.run(`preview-${id}`, () => setPreviewId(id));

  // Keep dialog content on screen while each dialog animates out.
  const shownPreview = useLastDefined(previewCertificate);
  const shownTemplate = useLastDefined(templatePreview);
  const shownReissue = useLastDefined(reissueTarget);

  /* -------------------------------- Render ------------------------------- */

  // Wrapper is a <div>, not <main>: MainLayout already renders the page's
  // <main> landmark, and landmarks should not be nested.
  return (
    <div className="mx-auto max-w-[1500px] space-y-7 pb-10 sm:space-y-9">
      {/* ---- Heading ------------------------------------------------------ */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
            <Sparkles size={15} className="text-[#c59400]" aria-hidden="true" /> Learning · Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">Certificates</h1>
          <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">
            Issue, verify and manage every certificate awarded through Nugi Innovations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openIssue()}
          aria-busy={opener.isPending("issue")}
          className={cn(primaryButtonClass, "self-start lg:self-auto")}
        >
          {opener.isPending("issue") ? (
            <Loader2 size={16} aria-hidden="true" className="animate-spin" />
          ) : (
            <Plus size={16} aria-hidden="true" className={iconSpinOnHover} />
          )}
          {opener.isPending("issue") ? "Opening…" : "Issue certificate"}
        </button>
      </header>

      {/* ---- Hero + verification tool ------------------------------------ */}
      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-9">
          <div aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-2 -top-12 size-52 rounded-full border border-white/10" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
              <Award size={15} aria-hidden="true" /> Certificate centre
            </span>
            <h2 className="mt-4 max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">
              {metrics.awaiting > 0
                ? `${metrics.awaiting} learner${metrics.awaiting === 1 ? " has" : "s have"} earned a certificate.`
                : "Every eligible learner has been certified."}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/70">
              Recognise achievements promptly — certificates are added to the learner&apos;s portal the moment you issue them.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <HeroMetric label="Active" value={metrics.active} />
              <HeroMetric label="Awaiting issue" value={metrics.awaiting} />
              <HeroMetric label="Verifications" value={metrics.verifications} />
            </div>
            {metrics.awaiting > 0 && (
              <button type="button" onClick={() => setTab("eligible")} className={cn(primaryButtonClass, "mt-6")}>
                Review eligible learners
                <ArrowRight size={15} aria-hidden="true" className={iconNudgeOnHover} />
              </button>
            )}
          </div>
        </div>

        <VerifyPanel certificates={certificates} onOpen={(item) => openPreview(item.id)} />
      </section>

      {/* ---- Stat tiles -------------------------------------------------- */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={BadgeCheck} tint="bg-emerald-50 text-emerald-700" label="Active certificates" value={metrics.active} />
        <StatTile icon={GraduationCap} tint="bg-[#eaf0ff] text-[#101d49]" label="Programmes represented" value={metrics.programmes} />
        <StatTile icon={Award} tint="bg-[#fff7dc] text-[#765800]" label="Awaiting issuance" value={metrics.awaiting} />
        <StatTile icon={ShieldOff} tint="bg-red-50 text-[#c93636]" label="Revoked" value={metrics.revoked} />
      </section>

      {/* ---- Tabs -------------------------------------------------------- */}
      <div role="tablist" aria-label="Certificate views" className="flex gap-1 overflow-x-auto border-b border-[#e4e9f2]">
        <TabButton active={tab === "issued"} onClick={() => setTab("issued")} icon={BadgeCheck} label="Issued register" count={certificates.length} />
        <TabButton active={tab === "eligible"} onClick={() => setTab("eligible")} icon={GraduationCap} label="Awaiting issuance" count={eligible.length} highlight />
        <TabButton active={tab === "templates"} onClick={() => setTab("templates")} icon={LayoutTemplate} label="Templates" count={templates.length} />
      </div>

      {/* ================= ISSUED REGISTER ================= */}
      {tab === "issued" && (
        <section className={cn(cardClass, "overflow-hidden")} aria-labelledby="register-title">
          <div className="flex flex-col gap-4 border-b border-[#edf0f6] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 id="register-title" className="font-bold text-[#101d49]">Certificate register</h2>
              <p className="text-xs text-[#8995aa]">Showing {filteredCertificates.length} loaded certificate(s) · newest first</p>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_200px_170px_150px_auto]">
              <label className="relative block min-w-0">
                <span className="sr-only">Search certificates</span>
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8995aa]" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search number, learner, email or programme…"
                  className={cn(inputClass, "h-10 pl-10")}
                />
              </label>
              <Select
                ariaLabel="Filter by programme"
                value={programmeFilter}
                onChange={setProgrammeFilter}
                options={programmeOptions}
              />
              <Select<"All types" | CertificateType>
                ariaLabel="Filter by type"
                value={typeFilter}
                onChange={setTypeFilter}
                options={["All types", ...CERTIFICATE_TYPES]}
              />
              <Select<"All" | CertificateStatus>
                ariaLabel="Filter by status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "All", label: "All statuses" },
                  { value: "Active", label: "Active" },
                  { value: "Revoked", label: "Revoked" },
                ]}
              />
              <button type="button" onClick={applyFilters} disabled={loadingCertificates} className={cn(darkButtonClass, "h-10")}>
                {loadingCertificates ? <Loader2 size={15} className="animate-spin" /> : null}
                Apply
              </button>
              {hasActiveFilters && (
                <button type="button" onClick={resetFilters} className={secondaryButtonClass}>
                  <RotateCcw size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:-rotate-180 motion-reduce:transition-none" /> Reset
                </button>
              )}
            </div>
          </div>

          {loadingCertificates && certificates.length === 0 ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#101d49]" size={28} /></div>
          ) : certificatesError ? (
            <EmptyState title="Couldn't load certificates" message={certificatesError} action={{ label: "Try again", onClick: () => void fetchCertificates(buildRegisterQuery()) }} />
          ) : filteredCertificates.length === 0 ? (
            <EmptyState
              title="No certificates found"
              message="Try a different search term or filter."
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          ) : (
            <div className="relative overflow-x-auto">
              {/* `relative` keeps absolutely-positioned sr-only labels inside this
                  scroll area, preventing page-wide horizontal scroll on mobile. */}
              <table className="w-full min-w-[1040px]">
                <thead className="bg-[#fafbfd]">
                  <tr>
                    <th className={thClass}>Certificate</th>
                    <th className={thClass}>Recipient</th>
                    <th className={thClass}>Programme</th>
                    <th className={thClass}>Issued</th>
                    <th className={cn(thClass, "text-right")}>Score</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f6]">
                  {filteredCertificates.map((certificate) => {
                    const revoked = certificate.status === "Revoked";
                    return (
                      <tr key={certificate.id} className={cn(rowHoverClass, revoked && "bg-[#fdfafa]")}>
                        <td className="relative px-5 py-4">
                          <RowAccent />
                          <button type="button" onClick={() => openPreview(certificate.id)} className="group flex items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]">
                            {/* Seal tile lifts to gold on row hover; spinner while the preview opens. */}
                            <span
                              className={cn(
                                "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
                                revoked
                                  ? "bg-red-50 text-[#c93636]"
                                  : "bg-[#101d49] text-[#f5c542] group-hover/row:bg-[#f5c542] group-hover/row:text-[#101d49]",
                              )}
                            >
                              {opener.isPending(`preview-${certificate.id}`) ? (
                                <Loader2 size={18} aria-hidden="true" className="animate-spin" />
                              ) : (
                                <Award size={19} aria-hidden="true" />
                              )}
                            </span>
                            <span>
                              <span className="block whitespace-nowrap font-mono text-sm font-semibold text-[#101d49] decoration-[#f5c542] decoration-2 underline-offset-4 group-hover:underline">{certificate.certificateNumber}</span>
                              <span className={cn("mt-1 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-semibold", typeStyles[certificate.type])}>
                                {certificate.type}
                              </span>
                            </span>
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-xs font-bold text-[#101d49]">
                              {getInitials(certificate.recipientName)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#101d49]">{certificate.recipientName}</p>
                              <p className="truncate text-xs text-[#8995aa]">{certificate.recipientEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-[#34415e]">{certificate.programme}</p>
                          <p className="mt-0.5 text-xs text-[#8995aa]">{certificate.cohort}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="text-sm text-[#34415e]">{formatDate(certificate.issuedDate)}</p>
                          <p className="mt-0.5 text-xs text-[#8995aa]">{certificate.issuedBy}</p>
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-bold text-[#101d49]">{certificate.finalScore}%</td>
                        <td className="px-5 py-4">
                          <CertificateStatusBadge certificate={certificate} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <ActionMenu
                            label={`Actions for ${certificate.certificateNumber}`}
                            items={[
                              { label: "Preview", icon: Eye, onSelect: () => openPreview(certificate.id) },
                              { label: "Download PDF", icon: Download, onSelect: () => download(certificate), hidden: revoked },
                              { label: "Copy verification link", icon: Copy, onSelect: () => void copyLink(certificate) },
                              { label: "Resend to learner", icon: Mail, onSelect: () => resend(certificate), hidden: revoked },
                              { label: "Reissue", icon: RefreshCcw, onSelect: () => setReissueTarget(certificate), separated: true },
                              { label: "Reinstate", icon: Undo2, onSelect: () => reinstate(certificate), hidden: !revoked },
                              { label: "Revoke", icon: ShieldOff, destructive: true, onSelect: () => setRevokeTarget(certificate), hidden: revoked, separated: true },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {nextCursor && !loadingCertificates && (
            <div className="flex justify-center border-t border-[#edf0f6] p-5">
              <button type="button" onClick={loadMoreCertificates} disabled={loadingMore} className={secondaryButtonClass}>
                {loadingMore ? <><Loader2 size={15} className="animate-spin" /> Loading...</> : "Load more certificates"}
              </button>
            </div>
          )}
        </section>
      )}

      {/* ================= AWAITING ISSUANCE ================= */}
      {tab === "eligible" && (
        <section className={cn(cardClass, "overflow-hidden")} aria-labelledby="eligible-title">
          <div className="flex flex-col gap-3 border-b border-[#edf0f6] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 id="eligible-title" className="font-bold text-[#101d49]">Learners awaiting a certificate</h2>
              <p className="mt-1 text-xs text-[#8995aa]">
                These learners completed 100% of their programme. Recommended types follow the score thresholds (85%+ Achievement, 70%+ Professional).
              </p>
            </div>
            <button
              type="button"
              disabled={selectedEligible.size === 0}
              onClick={() => setBulkConfirmOpen(true)}
              className={cn(darkButtonClass, "shrink-0")}
            >
              <BadgeCheck size={16} aria-hidden="true" />
              Issue {selectedEligible.size > 0 ? selectedEligible.size : ""} selected
            </button>
          </div>

          {eligible.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="All caught up" message="Every learner who completed a programme has received their certificate." />
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead className="bg-[#fafbfd]">
                  <tr>
                    <th className="w-12 px-5 py-3.5">
                      <input
                        type="checkbox"
                        aria-label="Select all eligible learners"
                        checked={allEligibleSelected}
                        onChange={() => setSelectedEligible(allEligibleSelected ? new Set() : new Set(eligible.map((item) => item.id)))}
                        className="size-4 cursor-pointer accent-[#101d49]"
                      />
                    </th>
                    <th className={thClass}>Learner</th>
                    <th className={thClass}>Programme</th>
                    <th className={thClass}>Completed</th>
                    <th className={cn(thClass, "text-right")}>Final score</th>
                    <th className={thClass}>Recommended</th>
                    <th className={thClass}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f6]">
                  {eligible.map((learner) => {
                    const selected = selectedEligible.has(learner.id);
                    return (
                      <tr key={learner.id} className={cn(rowHoverClass, selected && "bg-[#fffaf0] hover:bg-[#fff6e3]")}>
                        <td className="relative px-5 py-4">
                          <RowAccent />
                          <input
                            type="checkbox"
                            aria-label={`Select ${learner.name}`}
                            checked={selected}
                            onChange={() =>
                              setSelectedEligible((previous) => {
                                const next = new Set(previous);
                                if (next.has(learner.id)) next.delete(learner.id);
                                else next.add(learner.id);
                                return next;
                              })
                            }
                            className="size-4 cursor-pointer accent-[#101d49]"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#101d49] text-xs font-bold text-[#f5c542]">
                              {getInitials(learner.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#101d49]">{learner.name}</p>
                              <p className="truncate text-xs text-[#8995aa]">{learner.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-[#34415e]">{learner.programme}</p>
                          <p className="mt-0.5 text-xs text-[#8995aa]">{learner.cohort}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-[#34415e]">{formatDate(learner.completedOn)}</td>
                        <td className="px-5 py-4 text-right text-sm font-bold text-[#101d49]">{learner.finalScore}%</td>
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold", typeStyles[learner.recommendedType])}>
                            {learner.recommendedType === "Achievement" && <Star size={12} aria-hidden="true" />}
                            {learner.recommendedType}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openIssue(learner.id)}
                            aria-busy={opener.isPending(`issue-${learner.id}`)}
                            className={cn(primaryButtonClass, "min-h-9 min-w-20 px-3.5")}
                          >
                            {opener.isPending(`issue-${learner.id}`) ? (
                              <Loader2 size={15} aria-hidden="true" className="animate-spin" />
                            ) : (
                              <>
                                Issue <ArrowRight size={14} aria-hidden="true" className={iconNudgeOnHover} />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ================= TEMPLATES ================= */}
      {tab === "templates" && (
        <section aria-labelledby="templates-title">
          <div className="mb-5">
            <h2 id="templates-title" className="text-xl font-bold text-[#101d49]">Certificate templates</h2>
            <p className="mt-1 text-sm text-[#64718a]">
              The default template is used whenever a type has no dedicated design. Template editing will arrive with the design service.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <article
                key={template.id}
                className={cn(cardClass, cardHoverClass, "group/card overflow-hidden", template.isDefault && "ring-2 ring-[#f5c542]")}
              >
                {/* Preview area: background warms and the certificate lifts slightly on hover. */}
                <div className="bg-[#f6f8fc] p-5 transition-colors duration-300 group-hover/card:bg-[#eef2f9] [&>div]:transition-transform [&>div]:duration-300 [&>div]:ease-out group-hover/card:[&>div]:-translate-y-1 motion-reduce:[&>div]:transition-none">
                  <CertificatePreview
                    template={template}
                    data={{
                      recipientName: "Learner Name",
                      programme: "Web Development",
                      type: template.type,
                      issuedDate: new Date().toISOString().slice(0, 10),
                      certificateNumber: "NUGI-0000-000",
                    }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#101d49]">{template.name}</h3>
                      <p className="mt-0.5 text-xs text-[#8995aa]">{CERTIFICATE_TITLES[template.type]} · updated {formatDate(template.updatedAt)}</p>
                    </div>
                    {template.isDefault && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#fff7dc] px-2.5 py-1 text-xs font-semibold text-[#765800]">
                        <Star size={12} aria-hidden="true" /> Default
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#64718a]">{template.description}</p>
                  <p className="mt-3 text-xs text-[#8995aa]">
                    Used on {certificates.filter((item) => item.templateId === template.id).length} certificate(s)
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => opener.run(`template-${template.id}`, () => setTemplatePreview(template))} aria-busy={opener.isPending(`template-${template.id}`)} className={cn(secondaryButtonClass, "flex-1")}>
                      {opener.isPending(`template-${template.id}`) ? (
                        <Loader2 size={15} aria-hidden="true" className="animate-spin" />
                      ) : (
                        <Eye size={15} aria-hidden="true" />
                      )}
                      Preview
                    </button>
                    <button
                      type="button"
                      disabled={template.isDefault}
                      onClick={() => setDefaultTemplate(template)}
                      className={cn(darkButtonClass, "flex-1")}
                    >
                      {template.isDefault ? "Current default" : "Set as default"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ================= Dialogs ================= */}
      <IssueCertificateModal
        open={issueOpen}
        onClose={() => {
          setIssueOpen(false);
          setIssueLearnerId(null);
        }}
        eligibleLearners={eligible}
        templates={templates}
        nextCertificateNumber={nextCertificateNumber(certificates)}
        initialLearnerId={issueLearnerId}
        onIssue={issueOne}
      />

      {/* Certificate preview + details */}
      {shownPreview && (
        <AdminModal
          open={Boolean(previewCertificate)}
          size="xl"
          onClose={() => setPreviewId(null)}
          eyebrow={CERTIFICATE_TITLES[shownPreview.type]}
          title={shownPreview.certificateNumber}
          description={`${shownPreview.recipientName} · ${shownPreview.programme}`}
          footer={
            <>
              <button type="button" onClick={() => void copyLink(shownPreview)} className={secondaryButtonClass}>
                <Copy size={15} aria-hidden="true" /> Copy verification link
              </button>
              {shownPreview.status === "Active" ? (
                <>
                  <button type="button" onClick={() => setRevokeTarget(shownPreview)} className={cn(secondaryButtonClass, "text-[#c93636]")}>
                    <ShieldOff size={15} aria-hidden="true" /> Revoke
                  </button>
                  <button type="button" onClick={() => download(shownPreview)} className={darkButtonClass}>
                    <Download size={15} aria-hidden="true" /> Download PDF
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => reinstate(shownPreview)} className={darkButtonClass}>
                  <Undo2 size={15} aria-hidden="true" /> Reinstate
                </button>
              )}
            </>
          }
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <CertificatePreview
              template={templateById.get(shownPreview.templateId) ?? defaultTemplate}
              revoked={shownPreview.status === "Revoked"}
              data={shownPreview}
            />
            <dl className="space-y-4 text-sm">
              <Detail label="Status"><CertificateStatusBadge certificate={shownPreview} /></Detail>
              {shownPreview.status === "Revoked" && (
                <Detail label="Revocation">
                  <span className="text-[#c93636]">{shownPreview.revokedReason}</span>
                  {shownPreview.revokedAt && (
                    <span className="block text-xs text-[#8995aa]">{formatDateTime(shownPreview.revokedAt)}</span>
                  )}
                </Detail>
              )}
              <Detail label="Recipient">
                {shownPreview.recipientName}
                <span className="block text-xs text-[#8995aa]">{shownPreview.recipientEmail}</span>
              </Detail>
              <Detail label="Programme">
                {shownPreview.programme}
                <span className="block text-xs text-[#8995aa]">{shownPreview.cohort}</span>
              </Detail>
              <Detail label="Final score">{shownPreview.finalScore}%</Detail>
              <Detail label="Issued">
                {formatDate(shownPreview.issuedDate)}
                <span className="block text-xs text-[#8995aa]">by {shownPreview.issuedBy}</span>
              </Detail>
              <Detail label="Template">{templateById.get(shownPreview.templateId)?.name ?? "Default"}</Detail>
              <Detail label="Verification checks">{shownPreview.verificationCount}</Detail>
            </dl>
          </div>
        </AdminModal>
      )}

      {/* Template full-size preview */}
      {shownTemplate && (
        <AdminModal open={Boolean(templatePreview)} size="xl" onClose={() => setTemplatePreview(null)} eyebrow="Template preview" title={shownTemplate.name} description={shownTemplate.description}>
          <CertificatePreview
            template={shownTemplate}
            data={{
              recipientName: "Learner Name",
              programme: "Web Development",
              type: shownTemplate.type,
              issuedDate: new Date().toISOString().slice(0, 10),
              certificateNumber: "NUGI-0000-000",
            }}
          />
        </AdminModal>
      )}

      <RevokeDialog certificate={revokeTarget} onClose={() => setRevokeTarget(null)} onConfirm={revoke} />

      <ConfirmDialog
        open={Boolean(reissueTarget)}
        onClose={() => setReissueTarget(null)}
        onConfirm={() => reissueTarget && reissue(reissueTarget)}
        title="Reissue certificate?"
        confirmLabel="Reissue"
        message={
          shownReissue && (
            <p>
              A new certificate number will be issued to <strong className="text-[#101d49]">{shownReissue.recipientName}</strong> with today&apos;s date.
              {shownReissue.status === "Active" && (
                <> The current certificate <strong className="font-mono text-[#101d49]">{shownReissue.certificateNumber}</strong> will be marked as superseded.</>
              )}
            </p>
          )
        }
      />

      <ConfirmDialog
        open={bulkConfirmOpen}
        onClose={() => setBulkConfirmOpen(false)}
        onConfirm={issueBulk}
        title={`Issue ${selectedEligible.size} certificate${selectedEligible.size === 1 ? "" : "s"}?`}
        confirmLabel="Issue certificates"
        message={
          <p>
            Each learner will receive their <strong className="text-[#101d49]">recommended certificate type</strong>, dated today, using the matching template. They will be notified by email.
          </p>
        }
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Verification panel                                                         */
/* -------------------------------------------------------------------------- */

type VerifyResult =
  | { state: "valid" | "revoked"; certificate: IssuedCertificate }
  | { state: "not-found"; query: string }
  | null;

/**
 * Quick lookup an admin can use when an employer calls to confirm a
 * certificate. Matching is case-insensitive and ignores spaces.
 * TODO(api): GET /certificates/verify/:number (the same endpoint the public
 * verification page uses).
 */
function VerifyPanel({
  certificates,
  onOpen,
}: {
  certificates: IssuedCertificate[];
  onOpen: (certificate: IssuedCertificate) => void;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<VerifyResult>(null);

  const verify = (event: FormEvent) => {
    event.preventDefault();
    const normalised = query.replace(/\s+/g, "").toUpperCase();
    if (!normalised) return;
    const match = certificates.find((item) => item.certificateNumber.toUpperCase() === normalised);
    setResult(
      match ? { state: match.status === "Active" ? "valid" : "revoked", certificate: match } : { state: "not-found", query: normalised },
    );
  };

  return (
    <div className={cn(cardClass, cardHoverClass, "flex flex-col p-6")}>
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
          <ShieldCheck size={22} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-bold text-[#101d49]">Verify a certificate</h2>
          <p className="text-xs text-[#8995aa]">Confirm authenticity for employers and partners.</p>
        </div>
      </div>

      <form onSubmit={verify} className="mt-5 flex gap-2">
        <label className="sr-only" htmlFor="verify-number">Certificate number</label>
        <input
          id="verify-number"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setResult(null);
          }}
          placeholder="e.g. NUGI-2026-002"
          className={cn(inputClass, "h-11 font-mono uppercase hover:border-[#b9c5da] placeholder:font-sans placeholder:normal-case")}
        />
        <button type="submit" className={cn(darkButtonClass, "h-11 shrink-0")}>
          Verify <ArrowRight size={15} aria-hidden="true" className={iconNudgeOnHover} />
        </button>
      </form>

      <div className="mt-4 flex-1" aria-live="polite">
        {result?.state === "valid" && (
          <ResultCard tone="success" icon={CheckCircle2} title="Valid certificate">
            <strong>{result.certificate.recipientName}</strong> · {result.certificate.programme}
            <br />Issued {formatDate(result.certificate.issuedDate)}
            <button type="button" onClick={() => onOpen(result.certificate)} className="group mt-2 inline-flex items-center gap-1 text-xs font-semibold underline decoration-1 underline-offset-2 transition-[text-decoration-color] hover:decoration-2">
              View certificate <ArrowRight size={12} aria-hidden="true" className={iconNudgeOnHover} />
            </button>
          </ResultCard>
        )}
        {result?.state === "revoked" && (
          <ResultCard tone="danger" icon={XCircle} title="Certificate revoked">
            {result.certificate.recipientName} · {result.certificate.programme}
            <br />Reason: {result.certificate.revokedReason}
            <button type="button" onClick={() => onOpen(result.certificate)} className="group mt-2 inline-flex items-center gap-1 text-xs font-semibold underline decoration-1 underline-offset-2 transition-[text-decoration-color] hover:decoration-2">
              View record <ArrowRight size={12} aria-hidden="true" className={iconNudgeOnHover} />
            </button>
          </ResultCard>
        )}
        {result?.state === "not-found" && (
          <ResultCard tone="neutral" icon={ShieldQuestion} title="No match found">
            No certificate with number <span className="font-mono">{result.query}</span> exists. Check for typos.
          </ResultCard>
        )}
        {!result && (
          <p className="rounded-xl border border-dashed border-[#dce3ef] px-4 py-5 text-center text-xs leading-5 text-[#8995aa]">
            Results appear here. The same check powers the public page at nugi.io/verify.
          </p>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: "success" | "danger" | "neutral";
  icon: typeof CheckCircle2;
  title: string;
  children: ReactNode;
}) {
  const tones = {
    success: "border-emerald-100 bg-emerald-50 text-emerald-800",
    danger: "border-red-100 bg-red-50 text-red-800",
    neutral: "border-[#e4e9f2] bg-[#f8f9fc] text-[#34415e]",
  } as const;
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4 text-sm leading-6", tones[tone])}>
      <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-bold">{title}</p>
        <div className="mt-0.5 opacity-90">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Revoke dialog                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Revocation requires a reason (kept on the record and shown on the
 * verification result), plus optional notes for "Other".
 */
function RevokeDialog({
  certificate: certificateProp,
  onClose,
  onConfirm,
}: {
  certificate: IssuedCertificate | null;
  onClose: () => void;
  onConfirm: (certificate: IssuedCertificate, reason: string) => void;
}) {
  // Keep the certificate details visible while the dialog animates out.
  const certificate = useLastDefined(certificateProp);
  const [reason, setReason] = useState<string>(REVOKE_REASONS[0]);
  const [notes, setNotes] = useState("");

  const finalReason = reason === "Other" ? notes.trim() : reason;

  /** Clear the form so the next revocation starts fresh. */
  const close = () => {
    setReason(REVOKE_REASONS[0]);
    setNotes("");
    onClose();
  };

  return (
    <AdminModal
      open={Boolean(certificateProp)}
      onClose={close}
      size="sm"
      title="Revoke certificate?"
      footer={
        <>
          <button type="button" onClick={close} className={secondaryButtonClass}>Cancel</button>
          <button
            type="button"
            disabled={!finalReason}
            onClick={() => {
              if (!certificate) return;
              onConfirm(certificate, finalReason);
              setReason(REVOKE_REASONS[0]);
              setNotes("");
            }}
            className={dangerButtonClass}
          >
            <ShieldOff size={15} aria-hidden="true" /> Revoke certificate
          </button>
        </>
      }
    >
      {certificate && (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[#64718a]">
            <strong className="font-mono text-[#101d49]">{certificate.certificateNumber}</strong> issued to{" "}
            <strong className="text-[#101d49]">{certificate.recipientName}</strong> will immediately fail verification and disappear from the learner&apos;s portal. You can reinstate it later.
          </p>
          <div className="space-y-1.5">
            <label htmlFor="revoke-reason" className={labelClass}>Reason</label>
            <Select
              id="revoke-reason"
              size="lg"
              value={reason}
              onChange={setReason}
              options={[...REVOKE_REASONS, "Other"]}
            />
          </div>
          {reason === "Other" && (
            <div className="space-y-1.5">
              <label htmlFor="revoke-notes" className={labelClass}>Describe the reason</label>
              <textarea id="revoke-notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} className={cn(inputClass, "resize-y py-3")} placeholder="This will be stored on the certificate record." />
            </div>
          )}
        </div>
      )}
    </AdminModal>
  );
}

/* -------------------------------------------------------------------------- */
/* Small presentational pieces                                                */
/* -------------------------------------------------------------------------- */

function CertificateStatusBadge({ certificate }: { certificate: IssuedCertificate }) {
  const revoked = certificate.status === "Revoked";
  return (
    <span
      title={revoked ? certificate.revokedReason : "Valid and verifiable"}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold",
        revoked ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700",
      )}
    >
      {revoked ? <X size={12} aria-hidden="true" /> : <CheckCircle2 size={12} aria-hidden="true" />}
      {certificate.status}
    </span>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-[#edf0f6] pb-3 last:border-0">
      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8995aa]">{label}</dt>
      <dd className="mt-1 font-medium text-[#101d49]">{children}</dd>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 transition-colors duration-200 hover:border-[#f5c542]/40 hover:bg-white/[0.1]">
      <p className="text-xs font-medium text-white/60">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</p>
    </div>
  );
}

function StatTile({ icon: Icon, tint, label, value }: { icon: typeof Award; tint: string; label: string; value: number }) {
  return (
    <div className={cn(cardClass, cardHoverClass, "p-5")}>
      <span className={cn("flex size-11 items-center justify-center rounded-xl", tint)}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <p className="mt-5 text-3xl font-bold text-[#101d49]">{value}</p>
      <p className="mt-1 text-sm text-[#64718a]">{label}</p>
    </div>
  );
}

/**
 * Tab with an underline that grows from the left: half-width preview on
 * hover, full width when active.
 */
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
  highlight = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Award;
  label: string;
  count: number;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative -mb-px inline-flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors duration-200",
        "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:rounded-full after:bg-[#101d49] after:transition-transform after:duration-300 after:ease-out motion-reduce:after:transition-none",
        active
          ? "text-[#101d49] after:scale-x-100"
          : "text-[#64718a] after:scale-x-0 hover:text-[#101d49] hover:after:scale-x-50 hover:after:bg-[#c3cddf]",
      )}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
      <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", highlight && count > 0 ? "bg-[#f5c542] text-[#101d49]" : "bg-[#eef1f6] text-[#64718a]")}>
        {count}
      </span>
    </button>
  );
}

function EmptyState({
  icon: Icon = Search,
  title,
  message,
  action,
}: {
  icon?: typeof Search;
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
        <Icon size={25} aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-[#101d49]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">{message}</p>
      {action && (
        <button type="button" onClick={action.onClick} className={cn(secondaryButtonClass, "mt-5")}>
          <RotateCcw size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:-rotate-180 motion-reduce:transition-none" />
          {action.label}
        </button>
      )}
    </div>
  );
}
