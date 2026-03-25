"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function TablePaginationBar({
  pageStart,
  pageEnd,
  total,
  className,
}: {
  pageStart: number;
  pageEnd: number;
  total: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-xs text-white/45">
        {pageStart} - {pageEnd} of {total}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-white/45">
          <span>Rows per page:</span>
          <div className="relative">
            <select
              className="h-8 cursor-pointer appearance-none rounded-lg bg-white/[0.07] py-1 pl-2 pr-7 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-[#a855f7]/25"
              defaultValue={10}
              aria-label="Rows per page"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-white/45" />
          </div>
        </label>
        <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.04]">
          <button
            type="button"
            className="border-r border-white/[0.08] p-2 text-white/55 hover:bg-white/[0.06] hover:text-white"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className="p-2 text-white/55 hover:bg-white/[0.06] hover:text-white"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
