"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnimatedSelectOption = {
  value: string;
  label: string;
};

type AnimatedSelectProps = {
  id?: string;
  value: string;
  options: readonly AnimatedSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  ariaDescribedBy?: string;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  ariaInvalid?: boolean;
  /** Allow the selected option to wrap when its label is long. */
  wrapSelectedLabel?: boolean;
  /** Stretch the trigger to its available width. */
  fullWidth?: boolean;
};

/** Compact, branded select popover for dashboard filters and page-size controls. */
export function AnimatedSelect({
  id,
  value,
  options,
  onChange,
  ariaLabel,
  ariaDescribedBy,
  className,
  menuClassName,
  disabled = false,
  ariaInvalid,
  wrapSelectedLabel = false,
  fullWidth = false,
}: AnimatedSelectProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const prefersReducedMotion = useReducedMotion();
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || disabled || options.length === 0) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      const anchor = triggerRef.current?.getBoundingClientRect();
      if (!anchor) return;

      const viewportPadding = 12;
      const maxHeight = Math.max(96, Math.min(240, window.innerHeight - viewportPadding * 2));
      const estimatedHeight = Math.min(options.length * 36 + 12, maxHeight);
      const roomBelow = window.innerHeight - anchor.bottom - 8;
      const roomAbove = anchor.top - 8;
      const opensDown = roomBelow >= estimatedHeight || roomBelow >= roomAbove;
      const width = Math.max(anchor.width, 84);
      const left = Math.max(
        viewportPadding,
        Math.min(anchor.right - width, window.innerWidth - width - viewportPadding),
      );
      const top = opensDown
        ? Math.min(anchor.bottom + 8, window.innerHeight - estimatedHeight - viewportPadding)
        : Math.max(viewportPadding, anchor.top - estimatedHeight - 8);

      setMenuStyle({
        position: "fixed",
        top,
        left,
        width,
        maxHeight,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [disabled, open, options.length]);

  const menu = typeof document === "undefined" ? null : createPortal(
    <AnimatePresence>
      {open && !disabled && options.length > 0 && menuStyle && (
        <motion.div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={ariaLabel}
          initial={prefersReducedMotion ? false : { opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4, scale: 0.985 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
          style={menuStyle}
          className={cn("z-[120] overflow-y-auto rounded-xl border border-[#e4e9f2] bg-white p-1.5 shadow-[0_14px_40px_rgba(16,29,73,0.16)]", menuClassName)}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm font-medium text-[#34415e] transition hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
            >
              <span className="flex-1">{option.label}</span>
              {option.value === value && <Check size={14} className="shrink-0 text-[#16845b]" aria-hidden="true" />}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

  return (
    <div ref={rootRef} className={cn("relative inline-flex", fullWidth && "flex w-full min-w-0")}>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex min-h-10 min-w-[5.25rem] items-center justify-between gap-2 rounded-xl border border-[#e4e9f2] bg-white px-3 text-sm font-semibold text-[#34415e] shadow-sm outline-none transition hover:border-[#cbd4e3] hover:bg-[#f8f9fc] focus-visible:ring-2 focus-visible:ring-[#f5c542] disabled:cursor-not-allowed disabled:opacity-50",
          wrapSelectedLabel && "h-auto py-2.5",
          className,
        )}
      >
        <span className={cn(wrapSelectedLabel
          ? "min-w-0 flex-1 whitespace-normal break-words text-left leading-5"
          : "truncate")}>{selectedOption?.label ?? value}</span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={cn("shrink-0 text-[#718099] transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {menu}
    </div>
  );
}
