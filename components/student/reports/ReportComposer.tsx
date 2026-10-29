"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { CheckCircle2, List, Loader2, Send } from "lucide-react";

import {
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/admin/shared/admin-ui";
import type { ReportDraft } from "@/lib/store/daily-reports";
import { cn } from "@/lib/utils";
import { clockTime } from "@/components/admin/reports/report-utils";

export type ReportFormValues = Omit<ReportDraft, "savedAt">;

type ReportComposerProps = {
  /** Starting values (a saved draft, or the report being edited). */
  initial: ReportFormValues;
  mode: "new" | "edit";
  /** Who reads the report, e.g. "Fatima Bello" — used in helper copy. */
  supervisor: string;
  /** Called (debounced by the parent) as the learner types, for autosave. */
  onChange?: (values: ReportFormValues) => void;
  draftSavedAt?: string;
  submitting: boolean;
  onSubmit: (values: { accomplishments: string; problems: string }) => void;
  onCancel?: () => void;
};

const MIN_ACCOMPLISHMENTS = 20;
const MAX_LENGTH = 2000;

/**
 * The daily report form: two plain-text answers.
 *
 *  1. "What did you accomplish today?" (required, min 20 characters)
 *  2. "Any problems or blockers?" — learners must either describe one or tick
 *     "No problems today". Forcing an explicit answer means the admin can
 *     trust that an empty problems section really means "no problems".
 *
 * Text is sent exactly as typed (line breaks and "- " bullets are kept and
 * shown that way in the admin inbox). ⌘/Ctrl + Enter submits.
 */
export function ReportComposer({
  initial,
  mode,
  supervisor,
  onChange,
  draftSavedAt,
  submitting,
  onSubmit,
  onCancel,
}: ReportComposerProps) {
  const [values, setValues] = useState<ReportFormValues>(initial);
  const [errors, setErrors] = useState<{ accomplishments?: string; problems?: string }>({});
  const accomplishmentsRef = useRef<HTMLTextAreaElement>(null);
  const ids = { a: useId(), p: useId(), hint: useId() };

  // Report the latest values up for autosave (the parent debounces).
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    onChangeRef.current?.(values);
  }, [values]);

  const update = (changes: Partial<ReportFormValues>) => {
    setValues((previous) => ({ ...previous, ...changes }));
    setErrors({});
  };

  /** Start a new "- " bullet line at the cursor in the accomplishments box. */
  const insertBullet = () => {
    const field = accomplishmentsRef.current;
    if (!field) return;
    const { selectionStart, value } = field;
    const needsNewline = selectionStart > 0 && value[selectionStart - 1] !== "\n";
    const insert = `${needsNewline ? "\n" : ""}- `;
    const next = value.slice(0, selectionStart) + insert + value.slice(field.selectionEnd);
    // Commit the new value synchronously, then place the caret right after
    // the bullet in the same tick, so even fast typing lands in the right spot.
    flushSync(() => update({ accomplishments: next }));
    field.focus();
    const caret = selectionStart + insert.length;
    field.setSelectionRange(caret, caret);
  };

  const submit = () => {
    const accomplishments = values.accomplishments.trim();
    const problems = values.noProblems ? "" : values.problems.trim();
    const nextErrors: typeof errors = {};

    if (accomplishments.length < MIN_ACCOMPLISHMENTS) {
      nextErrors.accomplishments = `Tell us a little more: at least ${MIN_ACCOMPLISHMENTS} characters.`;
    }
    if (!values.noProblems && !problems) {
      nextErrors.problems = "Describe what got in your way, or tick “No problems today”.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      (nextErrors.accomplishments ? accomplishmentsRef.current : document.getElementById(ids.p))?.focus();
      return;
    }
    onSubmit({ accomplishments, problems });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submit();
    }
  };

  const length = values.accomplishments.trim().length;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="space-y-7"
    >
      {/* ---- 1. Accomplishments ------------------------------------------- */}
      <div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <label htmlFor={ids.a} className="text-base font-bold text-[#101d49]">
            What did you accomplish today?
          </label>
          <button
            type="button"
            // Keep focus (and the caret position) in the textarea on mouse clicks.
            onMouseDown={(event) => event.preventDefault()}
            onClick={insertBullet}
            className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-[#52627f] transition-colors duration-150 hover:bg-[#fff6d8] hover:text-[#101d49]"
          >
            <List size={14} aria-hidden="true" /> Add bullet point
          </button>
        </div>
        <p id={ids.hint} className="mt-1 text-sm text-[#64718a]">
          Tasks you finished, lessons or exercises completed, things you learned, and who you worked with.
        </p>
        <textarea
          id={ids.a}
          ref={accomplishmentsRef}
          rows={7}
          maxLength={MAX_LENGTH}
          value={values.accomplishments}
          onChange={(event) => update({ accomplishments: event.target.value })}
          onKeyDown={handleKeyDown}
          aria-describedby={ids.hint}
          aria-invalid={Boolean(errors.accomplishments)}
          placeholder={"- Finished the CSS Grid lesson\n- Built the gallery section of my landing page\n- Learned how grid-template-areas works"}
          className={cn(
            inputClass,
            "mt-3 resize-y py-3 text-[15px] leading-7 hover:border-[#b9c5da]",
            errors.accomplishments && "border-red-300",
          )}
        />
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span className={errors.accomplishments ? "font-medium text-red-600" : "text-[#8995aa]"}>
            {errors.accomplishments ?? (length < MIN_ACCOMPLISHMENTS ? `${MIN_ACCOMPLISHMENTS - length} more characters needed` : "Looks good")}
          </span>
          <span className="tabular-nums text-[#8995aa]">
            {values.accomplishments.length} / {MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* ---- 2. Problems --------------------------------------------------- */}
      <div>
        <label htmlFor={ids.p} className="text-base font-bold text-[#101d49]">
          Any problems or blockers?
        </label>
        <p className="mt-1 text-sm text-[#64718a]">
          Anything that slowed you down or that you need help with. {supervisor} will follow up.
        </p>

        <label className="mt-3 inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#e4e9f2] bg-[#fafbfd] px-3.5 py-2.5 text-sm font-medium text-[#34415e] transition-colors duration-150 hover:border-[#c3cddf] hover:bg-white has-[:checked]:border-emerald-200 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-800">
          <input
            type="checkbox"
            checked={values.noProblems}
            onChange={(event) => update({ noProblems: event.target.checked })}
            className="size-4 cursor-pointer accent-emerald-600"
          />
          No problems today
        </label>

        {/* Collapses smoothly when "No problems today" is ticked. */}
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
            values.noProblems ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
          )}
          aria-hidden={values.noProblems}
        >
          <div className="overflow-hidden">
            <textarea
              id={ids.p}
              rows={4}
              maxLength={MAX_LENGTH}
              tabIndex={values.noProblems ? -1 : undefined}
              value={values.problems}
              onChange={(event) => update({ problems: event.target.value })}
              onKeyDown={handleKeyDown}
              aria-invalid={Boolean(errors.problems)}
              placeholder="e.g. My laptop kept shutting down, so I lost part of my work."
              className={cn(
                inputClass,
                "mt-3 resize-y py-3 text-[15px] leading-7 hover:border-[#b9c5da]",
                errors.problems && "border-red-300",
              )}
            />
          </div>
        </div>
        {errors.problems && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.problems}</p>}
      </div>

      {/* ---- Actions ------------------------------------------------------- */}
      <div className="flex flex-col-reverse gap-3 border-t border-[#edf0f6] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#8995aa]" aria-live="polite">
          {mode === "new" && draftSavedAt ? (
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" aria-hidden="true" /> Draft saved at {clockTime(draftSavedAt)}
            </span>
          ) : (
            <span className="hidden sm:inline">
              Tip: <kbd className="font-sans">Ctrl</kbd>+<kbd className="font-sans">Enter</kbd> to {mode === "new" ? "submit" : "save"}
            </span>
          )}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          {onCancel && (
            <button type="button" onClick={onCancel} className={secondaryButtonClass}>
              Cancel
            </button>
          )}
          {/* Not `disabled` while submitting (that would dim it); repeat clicks are ignored upstream. */}
          <button type="submit" aria-busy={submitting} className={cn(primaryButtonClass, "min-w-44")}>
            {submitting ? (
              <Loader2 size={16} aria-hidden="true" className="animate-spin" />
            ) : (
              <Send size={15} aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
            )}
            {submitting ? (mode === "new" ? "Submitting…" : "Saving…") : mode === "new" ? "Submit today's report" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
