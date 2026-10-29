"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { useMountTransition } from "./motion";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  /** Optional muted second line, e.g. "Default template". */
  hint?: string;
};

type SelectProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  /** Plain strings are used as both value and label. */
  options: readonly (T | SelectOption<T>)[];
  /** Pair with a <label htmlFor={id}> — buttons are labelable elements. */
  id?: string;
  /** Accessible name when there is no visible label (e.g. table filters). */
  ariaLabel?: string;
  size?: "md" | "lg";
  invalid?: boolean;
  className?: string;
};

const PANEL_MAX_HEIGHT = 288;

/**
 * Custom dropdown that replaces the native <select> on the admin pages.
 *
 * Why not a native select? Its open menu is drawn by the operating system and
 * cannot be styled, so it clashes with the portal's design. This component
 * keeps the native keyboard behaviour learners and admins expect:
 *   ↑/↓ move · Home/End jump · Enter/Space choose · Esc/Tab close ·
 *   typing a letter jumps to the next matching option.
 *
 * Accessibility follows the WAI-ARIA "select-only combobox" pattern: focus
 * stays on the trigger and `aria-activedescendant` points at the highlighted
 * option.
 *
 * The panel is rendered in a portal on <body> with fixed positioning so it
 * is never clipped by a scrolling dialog or table, and it repositions on
 * scroll/resize. It opens upwards when there is not enough room below.
 */
export function Select<T extends string>({
  value,
  onChange,
  options,
  id,
  ariaLabel,
  size = "md",
  invalid = false,
  className,
}: SelectProps<T>) {
  const autoId = useId();
  const triggerId = id ?? `select-${autoId}`;
  const listId = `${triggerId}-listbox`;

  const normalised = useMemo<SelectOption<T>[]>(
    () => options.map((option) => (typeof option === "string" ? { value: option, label: option } : option)),
    [options],
  );
  const selectedIndex = Math.max(0, normalised.findIndex((option) => option.value === value));
  const selected = normalised[selectedIndex];

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; upward: boolean } | null>(null);
  const { mounted, visible } = useMountTransition(open, 160);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", timer: 0 });

  /** Measure the trigger and decide whether to open up or down. */
  const measure = useCallback(() => {
    const box = triggerRef.current?.getBoundingClientRect();
    if (!box) return;
    const estimated = Math.min(normalised.length * 40 + 12, PANEL_MAX_HEIGHT);
    const spaceBelow = window.innerHeight - box.bottom;
    const upward = spaceBelow < estimated + 12 && box.top > spaceBelow;
    setRect({ top: upward ? box.top - 6 : box.bottom + 6, left: box.left, width: box.width, upward });
  }, [normalised.length]);

  const openList = () => {
    measure();
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = normalised[index];
    if (option) onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Follow the trigger while open (scrolling dialogs, window resize).
  useEffect(() => {
    if (!open) return;
    const update = () => measure();
    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    document.addEventListener("mousedown", handlePointer);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      document.removeEventListener("mousedown", handlePointer);
    };
  }, [open, measure]);

  // Keep the highlighted option scrolled into view during keyboard use.
  useLayoutEffect(() => {
    if (!open) return;
    panelRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, mounted]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = normalised.length - 1;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, last));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        // Stop the surrounding dialog from also closing on this Escape.
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        // Type-ahead: jump to the first option starting with typed text.
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const state = typeahead.current;
          window.clearTimeout(state.timer);
          state.text += event.key.toLowerCase();
          state.timer = window.setTimeout(() => (state.text = ""), 500);
          const match = normalised.findIndex((option) => option.label.toLowerCase().startsWith(state.text));
          if (match >= 0) setActiveIndex(match);
        }
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className={cn(
          "group flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 text-left text-sm text-[#101d49] outline-none",
          "transition-[border-color,box-shadow,background-color] duration-200",
          size === "lg" ? "h-11" : "h-10",
          open
            ? "border-[#f5c542] ring-2 ring-[#f5c542]/25"
            : "border-[#dce3ef] hover:border-[#b9c5da] hover:bg-[#fbfcfe] focus-visible:border-[#f5c542] focus-visible:ring-2 focus-visible:ring-[#f5c542]/25",
          invalid && !open && "border-red-300",
          className,
        )}
      >
        <span className="min-w-0 truncate">{selected?.label ?? "Select…"}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn(
            "shrink-0 text-[#8995aa] transition-transform duration-200 group-hover:text-[#52627f] motion-reduce:transition-none",
            open && "rotate-180 text-[#101d49]",
          )}
        />
      </button>

      {mounted &&
        rect &&
        createPortal(
          <ul
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-labelledby={triggerId}
            tabIndex={-1}
            style={{
              top: rect.top,
              left: rect.left,
              width: Math.max(rect.width, 180),
              maxHeight: PANEL_MAX_HEIGHT,
              transform: rect.upward ? "translateY(-100%)" : undefined,
            }}
            className={cn(
              // z-index sits above dialogs (z-[100]).
              "fixed z-[120] overflow-y-auto rounded-xl border border-[#e4e9f2] bg-white p-1.5",
              "shadow-[0_18px_40px_-12px_rgba(16,29,73,0.28),0_2px_6px_rgba(16,29,73,0.06)]",
              "transition-[opacity,scale] duration-150 ease-out motion-reduce:transition-none",
              rect.upward ? "origin-bottom" : "origin-top",
              visible ? "scale-100 opacity-100" : "scale-[0.97] opacity-0",
            )}
          >
            {normalised.map((option, index) => {
              const isSelected = index === selectedIndex;
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  // preventDefault keeps focus on the trigger while clicking.
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(index)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-100",
                    isActive ? "bg-[#f1f4fa] text-[#101d49]" : "text-[#34415e]",
                    isSelected && "font-semibold text-[#101d49]",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.hint && <span className="block truncate text-xs font-normal text-[#8995aa]">{option.hint}</span>}
                  </span>
                  <Check
                    size={15}
                    aria-hidden="true"
                    className={cn("shrink-0 text-[#c59400] transition-opacity", isSelected ? "opacity-100" : "opacity-0")}
                  />
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
}
