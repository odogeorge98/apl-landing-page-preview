"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Mail, UserPlus, Users } from "lucide-react";

import { AdminModal } from "@/components/admin/shared/AdminModal";
import { Select } from "@/components/admin/shared/Select";
import {
  darkButtonClass,
  inputClass,
  labelClass,
  secondaryButtonClass,
} from "@/components/admin/shared/admin-ui";
import {
  CERTIFICATE_TITLES,
  CERTIFICATE_TYPES,
  PROGRAMME_OPTIONS,
  recommendType,
  type CertificateTemplate,
  type CertificateType,
  type EligibleLearner,
} from "@/lib/mock/admin-certificates";
import { cn } from "@/lib/utils";
import { CertificatePreview } from "./CertificatePreview";

/** Values handed back to the page when the admin clicks "Issue". */
export type IssueCertificateValues = {
  /** Set when issuing to a learner from the eligibility list. */
  eligibleLearnerId?: string;
  recipientName: string;
  recipientEmail: string;
  programme: string;
  cohort: string;
  type: CertificateType;
  templateId: string;
  issuedDate: string;
  finalScore: number;
  notifyLearner: boolean;
};

type IssueCertificateModalProps = {
  open: boolean;
  onClose: () => void;
  eligibleLearners: EligibleLearner[];
  templates: CertificateTemplate[];
  /** Number the new certificate will receive — shown in the live preview. */
  nextCertificateNumber: string;
  /** Pre-select a learner (when opened from the "Awaiting issuance" tab). */
  initialLearnerId?: string | null;
  onIssue: (values: IssueCertificateValues) => void;
};

type Source = "eligible" | "manual";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Issue a single certificate.
 *
 * Two ways to choose the recipient:
 *  - **Eligible learner** — picks from learners who met completion criteria;
 *    details and a recommended certificate type are filled in automatically.
 *  - **Manual entry** — for exceptional cases (e.g. learners migrated from an
 *    older system). The backend should log these for audit.
 *
 * A live preview on the right updates as fields change.
 */
export function IssueCertificateModal({
  open,
  onClose,
  eligibleLearners,
  templates,
  nextCertificateNumber,
  initialLearnerId,
  onIssue,
}: IssueCertificateModalProps) {
  const defaultTemplate = templates.find((item) => item.isDefault) ?? templates[0];

  const [source, setSource] = useState<Source>("eligible");
  const [learnerId, setLearnerId] = useState<string>("");
  const [values, setValues] = useState<IssueCertificateValues>(() => blankValues(defaultTemplate?.id));
  const [error, setError] = useState<string | null>(null);

  /** Copy an eligible learner's details into the form. */
  const applyLearner = (id: string) => {
    setLearnerId(id);
    const learner = eligibleLearners.find((item) => item.id === id);
    if (!learner) return;
    const type = learner.recommendedType;
    setValues((previous) => ({
      ...previous,
      eligibleLearnerId: learner.id,
      recipientName: learner.name,
      recipientEmail: learner.email,
      programme: learner.programme,
      cohort: learner.cohort,
      finalScore: learner.finalScore,
      type,
      // Switch to the template designed for that type, if there is one.
      templateId: templates.find((item) => item.type === type)?.id ?? previous.templateId,
    }));
  };

  // Reset whenever the dialog opens; honour a pre-selected learner.
  useEffect(() => {
    if (!open) return;
    setError(null);
    setValues(blankValues(defaultTemplate?.id));
    const initial = initialLearnerId ?? eligibleLearners[0]?.id ?? "";
    setSource(eligibleLearners.length ? "eligible" : "manual");
    if (initial) applyLearner(initial);
    else setLearnerId("");
    // Intentionally keyed on `open`/`initialLearnerId` only: re-running when
    // the learner list or templates change would wipe the admin's edits.
  }, [open, initialLearnerId]);

  const update = <K extends keyof IssueCertificateValues>(key: K, value: IssueCertificateValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setError(null);
  };

  const switchSource = (next: Source) => {
    setSource(next);
    setError(null);
    if (next === "manual") {
      setLearnerId("");
      setValues((previous) => ({ ...blankValues(previous.templateId), notifyLearner: previous.notifyLearner }));
    } else if (eligibleLearners[0]) {
      applyLearner(eligibleLearners[0].id);
    }
  };

  const submit = () => {
    if (values.recipientName.trim().length < 3) return setError("Enter the recipient's full name.");
    if (!/^\S+@\S+\.\S+$/.test(values.recipientEmail.trim())) return setError("Enter a valid email address.");
    if (!values.issuedDate) return setError("Choose an issue date.");
    if (values.issuedDate > today()) return setError("The issue date cannot be in the future.");
    onIssue({ ...values, recipientName: values.recipientName.trim(), recipientEmail: values.recipientEmail.trim() });
  };

  const template = templates.find((item) => item.id === values.templateId) ?? defaultTemplate;
  const suggested = recommendType(values.finalScore);

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      size="xl"
      eyebrow="Certificates"
      title="Issue certificate"
      description="Confirm the recipient and design. The learner can download it from their Certificates page straight away."
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={submit} className={darkButtonClass}>
            <BadgeCheck size={16} aria-hidden="true" /> Issue {nextCertificateNumber}
          </button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* ---------------- Form column ---------------- */}
        <div className="space-y-5">
          {/* Recipient source switcher (segmented control) */}
          <div role="radiogroup" aria-label="Recipient source" className="grid grid-cols-2 gap-1 rounded-xl bg-[#f1f4f9] p-1">
            <SegmentButton active={source === "eligible"} onClick={() => switchSource("eligible")} icon={Users} label="Eligible learner" disabled={!eligibleLearners.length} />
            <SegmentButton active={source === "manual"} onClick={() => switchSource("manual")} icon={UserPlus} label="Manual entry" />
          </div>

          {source === "eligible" ? (
            <div className="space-y-1.5">
              <label htmlFor="ic-learner" className={labelClass}>Learner</label>
              <Select
                id="ic-learner"
                size="lg"
                value={learnerId}
                onChange={applyLearner}
                options={eligibleLearners.map((learner) => ({
                  value: learner.id,
                  label: learner.name,
                  hint: `${learner.programme} · ${learner.finalScore}%`,
                }))}
              />
              <p className="text-xs text-[#8995aa]">
                {values.recipientEmail} · {values.cohort}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField id="ic-name" label="Full name" value={values.recipientName} onChange={(value) => update("recipientName", value)} placeholder="As it should appear" />
              <TextField id="ic-email" label="Email" type="email" value={values.recipientEmail} onChange={(value) => update("recipientEmail", value)} placeholder="learner@example.com" />
              <div className="space-y-1.5">
                <label htmlFor="ic-programme" className={labelClass}>Programme</label>
                <Select id="ic-programme" size="lg" value={values.programme} onChange={(programme) => update("programme", programme)} options={PROGRAMME_OPTIONS} />
              </div>
              <TextField
                id="ic-score"
                label="Final score (%)"
                type="number"
                value={String(values.finalScore)}
                onChange={(value) => update("finalScore", Math.max(0, Math.min(100, Number(value) || 0)))}
              />
            </div>
          )}

          {/* Type picker with recommendation hint */}
          <fieldset className="space-y-2">
            <legend className={labelClass}>Certificate type</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {CERTIFICATE_TYPES.map((type) => (
                <label
                  key={type}
                  className={cn(
                    "relative cursor-pointer rounded-xl border px-3 py-2.5 text-sm transition-[background-color,border-color,color,box-shadow] duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#f5c542]",
                    values.type === type
                      ? "border-[#101d49] bg-[#eaf0ff] text-[#101d49] shadow-[inset_0_0_0_1px_#101d49]"
                      : "border-[#e4e9f2] text-[#52627f] hover:border-[#b9c5da] hover:bg-[#f7f9fc] hover:text-[#101d49]",
                  )}
                >
                  <input
                    type="radio"
                    name="ic-type"
                    value={type}
                    checked={values.type === type}
                    onChange={() => update("type", type)}
                    className="sr-only"
                  />
                  <span className="block font-semibold">{type}</span>
                  {suggested === type && (
                    <span className="mt-0.5 block text-[11px] font-semibold text-[#b7791f]">Recommended</span>
                  )}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="ic-template" className={labelClass}>Design template</label>
              <Select
                id="ic-template"
                size="lg"
                value={values.templateId}
                onChange={(templateId) => update("templateId", templateId)}
                options={templates.map((item) => ({
                  value: item.id,
                  label: item.name,
                  hint: `${CERTIFICATE_TITLES[item.type]}${item.isDefault ? " · default" : ""}`,
                }))}
              />
            </div>
            <TextField id="ic-date" label="Issue date" type="date" value={values.issuedDate} onChange={(value) => update("issuedDate", value)} max={today()} />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e4e9f2] bg-[#fafbfd] px-4 py-3 transition-colors duration-150 hover:border-[#c3cddf] hover:bg-white">
            <input
              type="checkbox"
              checked={values.notifyLearner}
              onChange={(event) => update("notifyLearner", event.target.checked)}
              className="size-4 cursor-pointer accent-[#101d49]"
            />
            <Mail size={16} className="text-[#64718a]" aria-hidden="true" />
            <span className="text-sm text-[#34415e]">Email the learner a download link</span>
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </div>

        {/* ---------------- Live preview column ---------------- */}
        <div className="space-y-3">
          <p className={labelClass}>Live preview</p>
          {template && (
            <CertificatePreview
              template={template}
              data={{
                recipientName: values.recipientName,
                programme: values.programme,
                type: values.type,
                issuedDate: values.issuedDate,
                certificateNumber: nextCertificateNumber,
              }}
            />
          )}
          <p className="text-xs leading-5 text-[#8995aa]">
            {CERTIFICATE_TITLES[values.type]} · {template?.name} template. The final PDF is generated from the same design.
          </p>
        </div>
      </div>
    </AdminModal>
  );
}

function blankValues(templateId = ""): IssueCertificateValues {
  return {
    recipientName: "",
    recipientEmail: "",
    programme: PROGRAMME_OPTIONS[0],
    cohort: "Manual issue",
    type: "Completion",
    templateId,
    issuedDate: today(),
    finalScore: 70,
    notifyLearner: true,
  };
}

function SegmentButton({
  active,
  onClick,
  icon: Icon,
  label,
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Users;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        active ? "bg-white text-[#101d49] shadow-sm" : "text-[#64718a] hover:bg-white/60 hover:text-[#101d49]",
      )}
    >
      <Icon size={15} aria-hidden="true" /> {label}
    </button>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  max,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  max?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(inputClass, "h-11")}
      />
    </div>
  );
}
