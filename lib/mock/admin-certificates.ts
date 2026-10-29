/**
 * Mock data + types for the ADMIN Certificates page
 * (app/(admin)/dashboard/certificates).
 *
 * FRONT-END ONLY. When the API is ready:
 *   - move the types to `lib/interfaces/certificates`
 *   - replace these arrays with React Query hooks such as
 *     `useAdminCertificates()`, `useCertificateEligibility()` and
 *     `useCertificateTemplates()`.
 *
 * Certificate numbers follow the same `NUGI-YYYY-NNN` format shown on the
 * student Certificates page so both views line up.
 */

export type CertificateType = "Completion" | "Achievement" | "Professional";

export type CertificateStatus = "Active" | "Revoked";

export type IssuedCertificate = {
  id: string;
  certificateNumber: string;
  recipientName: string;
  recipientEmail: string;
  programme: string;
  cohort: string;
  type: CertificateType;
  templateId: string;
  /** ISO date (YYYY-MM-DD). */
  issuedDate: string;
  issuedBy: string;
  /** Final programme score (%) recorded at issue time. */
  finalScore: number;
  status: CertificateStatus;
  revokedReason?: string;
  /** ISO timestamp. */
  revokedAt?: string;
  /** How many times the public verification page has been checked. */
  verificationCount: number;
};

/** A learner who has met the completion criteria but has no certificate yet. */
export type EligibleLearner = {
  id: string;
  name: string;
  email: string;
  programme: string;
  cohort: string;
  /** Percentage of required modules completed (100 = complete). */
  completion: number;
  finalScore: number;
  /** ISO date the learner completed the programme. */
  completedOn: string;
  /** Suggested certificate type based on score thresholds. */
  recommendedType: CertificateType;
};

export type CertificateTemplate = {
  id: string;
  name: string;
  type: CertificateType;
  description: string;
  /** Accent colour used by the preview (seal, rules). */
  accent: string;
  /** Background colour of the certificate frame. */
  frame: string;
  isDefault: boolean;
  /** ISO date. */
  updatedAt: string;
};

/** Display title printed on the certificate for each type. */
export const CERTIFICATE_TITLES: Record<CertificateType, string> = {
  Completion: "Certificate of Completion",
  Achievement: "Certificate of Achievement",
  Professional: "Professional Certificate",
};

export const CERTIFICATE_TYPES: CertificateType[] = ["Completion", "Achievement", "Professional"];

export const PROGRAMME_OPTIONS = [
  "Web Development",
  "UI/UX Design",
  "Digital Marketing",
  "Backend Development",
  "Data Analysis",
] as const;

/** Reasons offered in the revoke dialog (an "Other" free-text is also allowed). */
export const REVOKE_REASONS = [
  "Issued in error",
  "Academic misconduct",
  "Incorrect learner details",
  "Superseded by a reissued certificate",
] as const;

/**
 * Score thresholds used to suggest a certificate type.
 * Keep in sync with the backend's eligibility rules.
 */
export function recommendType(finalScore: number): CertificateType {
  if (finalScore >= 85) return "Achievement";
  if (finalScore >= 70) return "Professional";
  return "Completion";
}

export const mockTemplates: CertificateTemplate[] = [
  {
    id: "TPL-CLASSIC",
    name: "Classic Navy",
    type: "Completion",
    description: "The standard Nugi Innovations design for programme completion.",
    accent: "#f5c542",
    frame: "#101d49",
    isDefault: true,
    updatedAt: "2026-08-12",
  },
  {
    id: "TPL-GOLD",
    name: "Gold Distinction",
    type: "Achievement",
    description: "Reserved for learners who finish with distinction (85%+).",
    accent: "#c59400",
    frame: "#1a2a5e",
    isDefault: false,
    updatedAt: "2026-09-03",
  },
  {
    id: "TPL-PRO",
    name: "Professional Emerald",
    type: "Professional",
    description: "Industry-facing certificate for professional-track programmes.",
    accent: "#34d399",
    frame: "#0f3b33",
    isDefault: false,
    updatedAt: "2026-09-21",
  },
];

export const mockCertificates: IssuedCertificate[] = [
  { id: "1", certificateNumber: "NUGI-2026-001", recipientName: "Zainab Musa", recipientEmail: "zainab.musa@example.com", programme: "Web Development", cohort: "Cohort 3 · Jul 2026", type: "Completion", templateId: "TPL-CLASSIC", issuedDate: "2026-09-15", issuedBy: "Admin · Ngozi Uche", finalScore: 78, status: "Active", verificationCount: 12 },
  { id: "2", certificateNumber: "NUGI-2026-002", recipientName: "Samuel Adeyemi", recipientEmail: "samuel.adeyemi@example.com", programme: "UI/UX Design", cohort: "Cohort 3 · Jul 2026", type: "Achievement", templateId: "TPL-GOLD", issuedDate: "2026-09-20", issuedBy: "Admin · Ngozi Uche", finalScore: 91, status: "Active", verificationCount: 7 },
  { id: "3", certificateNumber: "NUGI-2026-003", recipientName: "Grace Ibrahim", recipientEmail: "grace.ibrahim@example.com", programme: "Digital Marketing", cohort: "Cohort 3 · Jul 2026", type: "Professional", templateId: "TPL-PRO", issuedDate: "2026-10-01", issuedBy: "Admin · Femi Ade", finalScore: 74, status: "Active", verificationCount: 3 },
  { id: "4", certificateNumber: "NUGI-2026-004", recipientName: "Kelechi Obi", recipientEmail: "kelechi.obi@example.com", programme: "Web Development", cohort: "Cohort 3 · Jul 2026", type: "Completion", templateId: "TPL-CLASSIC", issuedDate: "2026-10-03", issuedBy: "Admin · Femi Ade", finalScore: 66, status: "Revoked", revokedReason: "Incorrect learner details", revokedAt: "2026-10-05T10:20:00Z", verificationCount: 1 },
  { id: "5", certificateNumber: "NUGI-2026-005", recipientName: "Kelechi Obi", recipientEmail: "kelechi.obi@example.com", programme: "Web Development", cohort: "Cohort 3 · Jul 2026", type: "Completion", templateId: "TPL-CLASSIC", issuedDate: "2026-10-05", issuedBy: "Admin · Femi Ade", finalScore: 66, status: "Active", verificationCount: 4 },
  { id: "6", certificateNumber: "NUGI-2026-006", recipientName: "Ada Nwosu", recipientEmail: "ada.nwosu@example.com", programme: "Backend Development", cohort: "Cohort 4 · Sep 2026", type: "Achievement", templateId: "TPL-GOLD", issuedDate: "2026-10-18", issuedBy: "Admin · Ngozi Uche", finalScore: 88, status: "Active", verificationCount: 2 },
];

export const mockEligibleLearners: EligibleLearner[] = [
  { id: "EL1", name: "Ifeoma Chukwu", email: "ifeoma.chukwu@example.com", programme: "Web Development", cohort: "Cohort 4 · Sep 2026", completion: 100, finalScore: 89, completedOn: "2026-10-24", recommendedType: "Achievement" },
  { id: "EL2", name: "David Okon", email: "david.okon@example.com", programme: "UI/UX Design", cohort: "Cohort 4 · Sep 2026", completion: 100, finalScore: 72, completedOn: "2026-10-25", recommendedType: "Professional" },
  { id: "EL3", name: "Musa Garba", email: "musa.garba@example.com", programme: "Backend Development", cohort: "Cohort 4 · Sep 2026", completion: 100, finalScore: 61, completedOn: "2026-10-26", recommendedType: "Completion" },
  { id: "EL4", name: "Chiamaka Eze", email: "chiamaka.eze@example.com", programme: "Data Analysis", cohort: "Cohort 4 · Sep 2026", completion: 100, finalScore: 94, completedOn: "2026-10-27", recommendedType: "Achievement" },
  { id: "EL5", name: "Yusuf Lawal", email: "yusuf.lawal@example.com", programme: "Digital Marketing", cohort: "Cohort 4 · Sep 2026", completion: 100, finalScore: 77, completedOn: "2026-10-28", recommendedType: "Professional" },
];
