"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useMountTransition } from "./motion";

type AdminModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Small uppercase line above the title, e.g. "Assignment details". */
  eyebrow?: string;
  /** Sticky action row rendered at the bottom of the dialog. */
  footer?: ReactNode;
  /** "center" for forms/confirmations, "drawer" for detail panels. */
  variant?: "center" | "drawer";
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

/**
 * Lightweight accessible dialog used by the admin learning pages.
 *
 * Handles the essentials a professional modal needs:
 *  - `role="dialog"` + `aria-modal` + labelled title/description
 *  - closes on Escape (top-most dialog only) and on backdrop click
 *  - locks background scrolling while open
 *  - moves focus into the dialog on open and restores it on close
 *
 *  - animates in and out: centred dialogs fade and rise, drawers slide in
 *    from the right; the backdrop fades separately. Reduced-motion users
 *    get instant transitions.
 *
 * Parents should keep passing the content they had while `open` flips to
 * false (see `useLastDefined`) so the exit animation still shows it.
 */
export function AdminModal({
  open,
  onClose,
  title,
  description,
  eyebrow,
  footer,
  variant = "center",
  size = "md",
  children,
}: AdminModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const isDrawer = variant === "drawer";
  const { mounted, visible } = useMountTransition(open, isDrawer ? 300 : 220);

  // Keep the latest onClose in a ref so the effect below does not re-run
  // (and steal focus) every time the parent re-renders with a new callback.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first form control if there is one, otherwise the panel.
    // preventScroll avoids a jump while the panel is still animating in.
    const firstField = panelRef.current?.querySelector<HTMLElement>(
      "input, textarea, [role='combobox']",
    );
    (firstField ?? panelRef.current)?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // When dialogs are stacked (e.g. "Grade" opened from the detail drawer)
      // only the top-most one should close.
      // Dialogs that are animating out are flagged and ignored.
      const dialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]:not([data-closing])');
      if (dialogs[dialogs.length - 1] === panelRef.current) onCloseRef.current();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex bg-[#071027]/60 backdrop-blur-sm",
        "transition-opacity duration-200 ease-out motion-reduce:transition-none",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
        isDrawer ? "justify-end" : "items-center justify-center overflow-y-auto p-4",
      )}
      onMouseDown={(event) => {
        // Only a click on the backdrop itself closes the dialog — not a
        // drag that started inside the panel and ended outside it.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        data-closing={open ? undefined : ""}
        className={cn(
          "flex w-full flex-col bg-white shadow-2xl outline-none motion-reduce:transition-none",
          isDrawer
            ? cn(
                "h-full max-w-xl transition-[translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-2xl",
                visible ? "translate-x-0" : "translate-x-full",
              )
            : cn(
                "my-auto max-h-[calc(100dvh-2rem)] rounded-2xl transition-[opacity,translate,scale] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                sizeClasses[size],
                visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0",
              ),
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#edf0f6] px-6 py-5">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8995aa]">
                {eyebrow}
              </p>
            )}
            <h2 id={titleId} className="mt-1 text-lg font-bold text-[#101d49]">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm leading-6 text-[#64718a]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-2 rounded-lg p-2 text-[#64718a] transition-[background-color,color,rotate] duration-200 hover:rotate-90 hover:bg-[#f3f5f9] hover:text-[#101d49] motion-reduce:hover:rotate-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer actions */}
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-[#edf0f6] bg-[#fafbfd] px-6 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
