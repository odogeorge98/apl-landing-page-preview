"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Ban, MoreVertical, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuPosition {
  top: number;
  right: number;
}

export function RowActionsMenu({ profileHref }: { profileHref: string }) {
  const [open, setOpen]   = useState(false);
  const [pos, setPos]     = useState<MenuPosition>({ top: 0, right: 0 });
  const triggerRef        = useRef<HTMLButtonElement>(null);
  const menuRef           = useRef<HTMLDivElement>(null);

  // ── Position ──────────────────────────────────────────────────────────────
  // Reads the trigger's viewport rect. Called on open and on every scroll
  // frame so the menu tracks the row as the table scrolls.

  const syncPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top:   rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
  }, []);

  const handleToggle = () => {
    if (open) { setOpen(false); return; }
    syncPosition();
    setOpen(true);
  };

  // ── Listeners ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return;
      }

      setOpen(false);
    };

    // Close menu on scroll instead of recalculating position
    const handleScroll = () => {
      setOpen(false);
    };

    // Resize can invalidate positioning
    const handleResize = () => {
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    document.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });

    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      document.removeEventListener("scroll", handleScroll, {
        capture: true,
      });

      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex justify-end">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={handleToggle}
        className="rounded-lg p-2 text-white/50 transition hover:bg-white/[0.08] hover:text-white"
      >
        <MoreVertical className="size-4" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: pos.top, right: pos.right }}
            className={cn(
              "fixed z-[9999] w-48 overflow-hidden rounded-xl",
              "border border-white/[0.1] bg-[#1a1528]/98 py-1",
              "shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-md",
            )}
          >
            <Link
              href={profileHref}
              role="menuitem"
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/90 hover:bg-white/[0.06]"
              onClick={() => setOpen(false)}
            >
              <User className="size-4 text-white/55" strokeWidth={1.75} />
              View Profile
            </Link>

            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/[0.06]"
            >
              <User className="size-4 text-white/55" strokeWidth={1.75} />
              Message
            </button>

            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10"
            >
              <Ban className="size-4" strokeWidth={1.75} />
              Suspend
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}