"use client";

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useId,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type Variant = "dark" | "light";

export type AdminSelectProps = {
  options: AdminSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  id?: string;
  "aria-label"?: string;
  variant?: Variant;
};

function useDropdownPosition(
  open: boolean,
  triggerRef: React.RefObject<HTMLElement | null>,
) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const update = useCallback(() => {
    const el = triggerRef.current;
    if (!el || !open) return;
    const r = el.getBoundingClientRect();
    const gap = 6;
    setPos({
      top: r.bottom + gap,
      left: r.left,
      width: r.width,
    });
  }, [open, triggerRef]);

  useLayoutEffect(() => {
    update();
  }, [update]);

  useEffect(() => {
    if (!open) return;
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, update]);

  return pos;
}

export default function AdminSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  disabled = false,
  className,
  triggerClassName,
  size = "md",
  icon: Icon,
  id,
  "aria-label": ariaLabel,
  variant = "dark",
}: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const listboxId = `${autoId}-listbox`;
  const pos = useDropdownPosition(open, triggerRef);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? (value ? value : null);
  const showPlaceholder = !displayLabel;

  const sizeCls =
    size === "sm"
      ? "min-h-9 py-1.5 text-xs"
      : size === "lg"
        ? "min-h-[42px] py-2 text-sm"
        : "min-h-10 py-2 text-sm";

  const triggerVariant =
    variant === "dark"
      ? cn(
          "border-white/[0.1] bg-white/[0.06] text-white hover:bg-white/[0.08]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/30",
          disabled && "pointer-events-none opacity-45",
        )
      : cn(
          "border-[#D0D5DD] bg-white text-[#101828] shadow-sm hover:border-[#98A2B3]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/25",
          disabled && "pointer-events-none bg-[#F9FAFB] text-[#98A2B3]",
        );

  const chevronCls =
    variant === "dark" ? "text-white/45" : "text-[#667085]";

  const panelVariant =
    variant === "dark"
      ? "border border-white/[0.12] bg-[#1a1628] shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
      : "border border-[#EAECF0] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.14)]";

  const optionVariant = (isSelected: boolean) =>
    variant === "dark"
      ? cn(
          "text-white/90",
          isSelected ? "bg-white/[0.12]" : "hover:bg-white/[0.07]",
        )
      : cn(
          "text-[#101828]",
          isSelected
            ? "bg-[#F4EBFF] font-medium text-[#6B21A8]"
            : "hover:bg-[#F9FAFB]",
        );

  const portal =
    mounted &&
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={listRef}
        id={listboxId}
        role="listbox"
        className={cn(
          "fixed z-[300] overflow-hidden rounded-xl py-1",
          panelVariant,
        )}
        style={{
          top: pos.top,
          left: pos.left,
          width: Math.max(pos.width, 160),
        }}
      >
        <div className="max-h-[min(280px,calc(100vh-24px))] overflow-y-auto overscroll-contain py-0.5">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const isDisabled = opt.disabled;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  onValueChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors",
                  optionVariant(isSelected),
                  isDisabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border",
                    variant === "dark"
                      ? isSelected
                        ? "border-white/30 bg-white/15 text-white"
                        : "border-white/15 text-transparent"
                      : isSelected
                        ? "border-violet-500 bg-violet-500 text-white"
                        : "border-[#D0D5DD] text-transparent",
                  )}
                >
                  <Check className="size-3" strokeWidth={2.5} />
                </span>
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>,
      document.body,
    );

  return (
    <div className={cn("relative w-full", className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 text-left font-medium transition-colors",
          sizeCls,
          Icon && "pl-9",
          triggerVariant,
          triggerClassName,
        )}
      >
        {Icon ? (
          <Icon
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2",
              variant === "dark" ? "text-white/40" : "text-[#667085]",
            )}
            strokeWidth={1.75}
          />
        ) : null}
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            showPlaceholder &&
              (variant === "dark" ? "text-white/40" : "text-[#98A2B3]"),
          )}
        >
          {showPlaceholder ? placeholder : displayLabel}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            chevronCls,
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>
      {portal}
    </div>
  );
}
