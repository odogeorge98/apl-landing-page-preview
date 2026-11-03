"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { AdminModal } from "@/components/admin/shared/AdminModal";
import { Select } from "@/components/admin/shared/Select";
import {
  darkButtonClass,
  inputClass,
  labelClass,
  secondaryButtonClass,
} from "@/components/admin/shared/admin-ui";
import {
  COURSE_OPTIONS,
  SUBMISSION_TYPES,
  TUTOR_OPTIONS,
  type AdminAssignment,
  type SubmissionType,
} from "@/lib/mock/admin-assignments";
import { cn } from "@/lib/utils";

/** Shape of the form — everything an admin can edit on an assignment. */
export type AssignmentFormValues = Pick<
  AdminAssignment,
  | "title"
  | "course"
  | "tutor"
  | "description"
  | "instructions"
  | "dueDate"
  | "points"
  | "submissionType"
  | "allowLateSubmissions"
>;

type AssignmentFormModalProps = {
  open: boolean;
  /** When provided the form is in "edit" mode and is pre-filled. */
  assignment?: AdminAssignment | null;
  onClose: () => void;
  /**
   * Called with validated values.
   * `publish` is true when the admin chose "Publish", false for "Save draft".
   */
  onSubmit: (values: AssignmentFormValues, publish: boolean) => void;
};

const emptyValues: AssignmentFormValues = {
  title: "",
  course: COURSE_OPTIONS[0],
  tutor: TUTOR_OPTIONS[0],
  description: "",
  instructions: [""],
  dueDate: "",
  points: 100,
  submissionType: "File upload",
  allowLateSubmissions: false,
};

type FormErrors = Partial<Record<keyof AssignmentFormValues, string>>;

/**
 * Client-side validation for the assignment form.
 * Mirrors the rules the API is expected to enforce so admins get instant
 * feedback; the server must still re-validate.
 */
function validate(values: AssignmentFormValues, isEdit: boolean): FormErrors {
  const errors: FormErrors = {};

  if (values.title.trim().length < 4) {
    errors.title = "Give the assignment a title of at least 4 characters.";
  }
  if (values.description.trim().length < 10) {
    errors.description = "Add a short description (10+ characters) so learners know what to do.";
  }
  if (!values.instructions.some((step) => step.trim())) {
    errors.instructions = "Add at least one instruction step.";
  }
  if (!values.dueDate) {
    errors.dueDate = "Choose a due date.";
  } else if (!isEdit && values.dueDate < new Date().toISOString().slice(0, 10)) {
    // Past dates are allowed when editing (e.g. fixing a closed assignment).
    errors.dueDate = "The due date cannot be in the past.";
  }
  if (!Number.isFinite(values.points) || values.points < 1 || values.points > 1000) {
    errors.points = "Maximum score must be between 1 and 1000.";
  }

  return errors;
}

/**
 * Create / edit assignment dialog.
 *
 * Supports a dynamic list of instruction steps, submission settings and two
 * submit paths (save as draft vs publish). Pure front end: the parent page
 * decides what to do with the values (currently updates local state; later,
 * call the create/update mutation).
 */
export function AssignmentFormModal({
  open,
  assignment,
  onClose,
  onSubmit,
}: AssignmentFormModalProps) {
  const isEdit = Boolean(assignment);
  const [values, setValues] = useState<AssignmentFormValues>(emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset the form each time the dialog opens so stale input never leaks
  // between "create" and "edit" sessions.
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setValues(
      assignment
        ? {
            title: assignment.title,
            course: assignment.course,
            tutor: assignment.tutor,
            description: assignment.description,
            instructions: assignment.instructions.length ? [...assignment.instructions] : [""],
            dueDate: assignment.dueDate,
            points: assignment.points,
            submissionType: assignment.submissionType,
            allowLateSubmissions: assignment.allowLateSubmissions,
          }
        : emptyValues,
    );
  }, [open, assignment]);

  /** Typed setter for a single field; clears that field's error. */
  const update = <K extends keyof AssignmentFormValues>(key: K, value: AssignmentFormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const updateInstruction = (index: number, text: string) => {
    update(
      "instructions",
      values.instructions.map((step, i) => (i === index ? text : step)),
    );
  };

  const submit = (publish: boolean) => (event?: FormEvent) => {
    event?.preventDefault();
    const nextErrors = validate(values, isEdit);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSubmit(
      {
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
        // Drop empty steps so learners never see blank bullet points.
        instructions: values.instructions.map((step) => step.trim()).filter(Boolean),
      },
      publish,
    );
  };

  // In edit mode we keep the current lifecycle state unless the admin
  // explicitly publishes, so the secondary button reads "Save changes".
  const secondaryLabel = isEdit ? "Save changes" : "Save as draft";
  const primaryLabel = isEdit
    ? assignment?.status === "Published"
      ? "Save & keep published"
      : "Save & publish"
    : "Publish assignment";

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      size="lg"
      eyebrow={isEdit ? `Editing ${assignment?.id}` : "New assignment"}
      title={isEdit ? "Edit assignment" : "Create assignment"}
      description="Set the brief, deadline and submission rules learners will see."
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={submit(false)} className={secondaryButtonClass}>
            {secondaryLabel}
          </button>
          <button type="submit" form="assignment-form" className={darkButtonClass}>
            {primaryLabel}
          </button>
        </>
      }
    >
      <form id="assignment-form" noValidate onSubmit={submit(true)} className="space-y-6">
        {/* ---- Section 1: Basics ------------------------------------------------ */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-bold text-[#101d49]">Basics</legend>

          <Field label="Title" htmlFor="as-title" error={errors.title}>
            <input
              id="as-title"
              value={values.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="e.g. Build a Responsive Landing Page"
              className={cn(inputClass, "h-11")}
              aria-invalid={Boolean(errors.title)}
            />
          </Field>

          {/* Assignments target a course; cohort targeting was removed by design. */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Course" htmlFor="as-course">
              <Select id="as-course" size="lg" value={values.course} onChange={(course) => update("course", course)} options={COURSE_OPTIONS} />
            </Field>
            <Field label="Marking tutor" htmlFor="as-tutor">
              <Select id="as-tutor" size="lg" value={values.tutor} onChange={(tutor) => update("tutor", tutor)} options={TUTOR_OPTIONS} />
            </Field>
          </div>

          <Field label="Description" htmlFor="as-description" error={errors.description}>
            <textarea
              id="as-description"
              rows={3}
              value={values.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Summarise what learners will build and why it matters."
              className={cn(inputClass, "resize-y py-3 leading-6")}
              aria-invalid={Boolean(errors.description)}
            />
          </Field>
        </fieldset>

        {/* ---- Section 2: Instructions (dynamic list) ------------------------- */}
        <fieldset className="space-y-3">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-bold text-[#101d49]">Instructions</legend>
            <span className="text-xs text-[#8995aa]">{values.instructions.length} step(s)</span>
          </div>

          <ol className="space-y-2">
            {values.instructions.map((step, index) => (
              <li key={index} className="flex items-center gap-2">
                <GripVertical size={16} className="shrink-0 text-[#c3cad8]" aria-hidden="true" />
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-xs font-semibold text-[#101d49]">
                  {index + 1}
                </span>
                <label className="sr-only" htmlFor={`as-step-${index}`}>Instruction {index + 1}</label>
                <input
                  id={`as-step-${index}`}
                  value={step}
                  onChange={(event) => updateInstruction(index, event.target.value)}
                  placeholder="Describe this step"
                  className={cn(inputClass, "h-10")}
                />
                <button
                  type="button"
                  onClick={() => update("instructions", values.instructions.filter((_, i) => i !== index))}
                  disabled={values.instructions.length === 1}
                  aria-label={`Remove instruction ${index + 1}`}
                  className="rounded-lg p-2 text-[#8995aa] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
          {errors.instructions && <p className="text-xs font-medium text-red-600">{errors.instructions}</p>}

          <button
            type="button"
            onClick={() => update("instructions", [...values.instructions, ""])}
            className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#101d49] transition-colors duration-150 hover:bg-[#fff6d8]"
          >
            <Plus size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:rotate-90 motion-reduce:transition-none" /> Add step
          </button>
        </fieldset>

        {/* ---- Section 3: Submission settings --------------------------------- */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-bold text-[#101d49]">Submission settings</legend>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Due date" htmlFor="as-due" error={errors.dueDate}>
              <input
                id="as-due"
                type="date"
                value={values.dueDate}
                onChange={(event) => update("dueDate", event.target.value)}
                className={cn(inputClass, "h-11")}
                aria-invalid={Boolean(errors.dueDate)}
              />
            </Field>
            <Field label="Maximum score" htmlFor="as-points" error={errors.points}>
              <input
                id="as-points"
                type="number"
                min={1}
                max={1000}
                value={Number.isNaN(values.points) ? "" : values.points}
                onChange={(event) => update("points", event.target.valueAsNumber)}
                className={cn(inputClass, "h-11")}
                aria-invalid={Boolean(errors.points)}
              />
            </Field>
            <Field label="Submission type" htmlFor="as-type">
              <Select<SubmissionType>
                id="as-type"
                size="lg"
                value={values.submissionType}
                onChange={(type) => update("submissionType", type)}
                options={SUBMISSION_TYPES}
              />
            </Field>
          </div>

          {/* Accessible toggle switch built on a native checkbox. */}
          <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-[#e4e9f2] bg-[#fafbfd] p-4 transition-colors duration-150 hover:border-[#c3cddf] hover:bg-white">
            <span>
              <span className="block text-sm font-semibold text-[#101d49]">Accept late submissions</span>
              <span className="mt-0.5 block text-xs leading-5 text-[#64718a]">
                Learners can still submit after the deadline; their work is flagged as late for the marker.
              </span>
            </span>
            <input
              type="checkbox"
              checked={values.allowLateSubmissions}
              onChange={(event) => update("allowLateSubmissions", event.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-[#d5dbe7] transition peer-checked:bg-[#101d49] peer-focus-visible:ring-2 peer-focus-visible:ring-[#f5c542] after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
            />
          </label>
        </fieldset>
      </form>
    </AdminModal>
  );
}

/** Label + control + inline error wrapper used throughout the form. */
function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
