"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Ban, MoreVertical, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function RowActionsMenu({
  profileHref,
}: {
  profileHref: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg p-2 text-white/50 transition hover:bg-white/[0.08] hover:text-white"
      >
        <MoreVertical className="size-4" />
      </button>
      {open ? (
        <div
          className={cn(
            "absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-xl",
            "border border-white/[0.1] bg-[#1a1528]/98 py-1 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-md",
          )}
        >
          <Link
            href={profileHref}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/90 hover:bg-white/[0.06]"
            onClick={() => setOpen(false)}
          >
            <User className="size-4 text-white/55" strokeWidth={1.75} />
            View Profile
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/[0.06]"
          >
            <User className="size-4 text-white/55" strokeWidth={1.75} />
            Message
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10"
          >
            <Ban className="size-4" strokeWidth={1.75} />
            Suspend
          </button>
        </div>
      ) : null}
    </div>
  );
}
