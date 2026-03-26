"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import AdminSelect from "@/components/ui/AdminSelect";

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
  const [rowsPerPage, setRowsPerPage] = useState("10");

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
          <div className="w-[68px] shrink-0">
            <AdminSelect
              size="sm"
              options={[
                { value: "10", label: "10" },
                { value: "25", label: "25" },
                { value: "50", label: "50" },
              ]}
              value={rowsPerPage}
              onValueChange={setRowsPerPage}
              aria-label="Rows per page"
            />
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
