"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useMountTransition } from "./motion";

export type ActionMenuItem = {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  /** Renders the item in red — use for delete / revoke. */
  destructive?: boolean;
  /** Hide the item entirely (e.g. "Publish" on an already-published row). */
  hidden?: boolean;
  /** Draw a divider above this item to group related actions. */
  separated?: boolean;
};

const ITEM_HEIGHT = 38;

/**
 * "⋯" row-actions dropdown for admin tables.
 *
 * - Animated open/close (fade + slight scale from the trigger corner).
 * - Rendered in a portal with fixed positioning so `overflow-x-auto` table
 *   wrappers and animated dialogs never clip it; flips upwards near the
 *   bottom of the viewport.
 * - Keyboard: focus moves to the first item on open, ↑/↓/Home/End move,
 *   Esc closes and returns focus to the trigger, Tab closes.
 * - Closes on outside click, scroll or resize (a fixed menu would otherwise
 *   drift away from its row).
 */
export function ActionMenu({
  items,
  label = "Open actions",
}: {
  items: ActionMenuItem[];
  /** Accessible name for the trigger, e.g. "Actions for AS001". */
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0, upward: false });
  const { mounted, visible } = useMountTransition(open, 150);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.filter((item) => !item.hidden);

  const toggle = () => {
    if (open) return setOpen(false);
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const separators = visibleItems.filter((item) => item.separated).length;
      const estimatedHeight = visibleItems.length * ITEM_HEIGHT + separators * 9 + 16;
      const upward = rect.bottom + estimatedHeight > window.innerHeight - 8;
      setPosition({
        top: upward ? rect.top - 6 : rect.bottom + 6,
        right: window.innerWidth - rect.right,
        upward,
      });
    }
    setOpen(true);
  };

  const close = (returnFocus = false) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;

    // Move focus into the menu once it has rendered.
    const frame = requestAnimationFrame(() =>
      menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus(),
    );

    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const dismiss = () => setOpen(false);

    document.addEventListener("mousedown", handlePointer);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("mousedown", handlePointer);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = [...(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const focusAt = (next: number) => buttons[(next + buttons.length) % buttons.length]?.focus();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusAt(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusAt(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(buttons.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        event.nativeEvent.stopImmediatePropagation();
        close(true);
        break;
      case "Tab":
        close();
        break;
    }
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className={cn(
          "rounded-lg p-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]",
          open ? "bg-[#101d49] text-white" : "text-[#64718a] hover:bg-[#eef1f7] hover:text-[#101d49]",
        )}
      >
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>

      {mounted &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            onKeyDown={handleMenuKeyDown}
            style={{
              top: position.top,
              right: position.right,
              transform: position.upward ? "translateY(-100%)" : undefined,
            }}
            className={cn(
              "fixed z-[120] w-56 rounded-xl border border-[#e4e9f2] bg-white p-1.5",
              "shadow-[0_18px_40px_-12px_rgba(16,29,73,0.28),0_2px_6px_rgba(16,29,73,0.06)]",
              "transition-[opacity,scale] duration-150 ease-out motion-reduce:transition-none",
              position.upward ? "origin-bottom-right" : "origin-top-right",
              visible ? "scale-100 opacity-100" : "scale-[0.96] opacity-0",
            )}
          >
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label}>
                  {item.separated && <div className="mx-1 my-1 h-px bg-[#edf0f6]" />}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      close();
                      item.onSelect();
                    }}
                    className={cn(
                      "group/item flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors duration-100",
                      item.destructive
                        ? "text-[#c93636] hover:bg-red-50 focus-visible:bg-red-50"
                        : "text-[#34415e] hover:bg-[#f1f4fa] hover:text-[#101d49] focus-visible:bg-[#f1f4fa] focus-visible:text-[#101d49]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors duration-100",
                        item.destructive
                          ? "bg-red-50 group-hover/item:bg-red-100"
                          : "bg-[#f4f6fa] text-[#64718a] group-hover/item:bg-white group-hover/item:text-[#101d49] group-focus-visible/item:bg-white",
                      )}
                    >
                      <Icon size={14} aria-hidden="true" />
                    </span>
                    {item.label}
                  </button>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
