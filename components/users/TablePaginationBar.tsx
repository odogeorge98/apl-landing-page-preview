"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import AdminSelect from "@/components/ui/AdminSelect";

interface TablePaginationBarProps {
  pageStart?: number;
  pageEnd?: number;
  total?: number;

  className?: string;

  rowsPerPage?: number;

  canGoNext?: boolean;
  canGoPrev?: boolean;

  isLoading?: boolean;

  onNext?: () => void;
  onPrev?: () => void;

  onRowsPerPageChange?: (value: number) => void;
}

export function TablePaginationBar({
  pageStart,
  pageEnd,
  total,

  className,

  rowsPerPage = 10,

  canGoNext = false,
  canGoPrev = false,

  isLoading = false,

  onNext,
  onPrev,

  onRowsPerPageChange,
}: TablePaginationBarProps) {
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(
    String(rowsPerPage),
  );

  // keep internal state synced with parent
  useEffect(() => {
    setInternalRowsPerPage(String(rowsPerPage));
  }, [rowsPerPage]);

  const handleRowsPerPageChange = (value: string) => {
    setInternalRowsPerPage(value);

    onRowsPerPageChange?.(Number(value));
  };

  // prevent invalid pagination text
  const safePageStart = total === 0 ? 0 : pageStart;

  const safePageEnd = total === 0 ? 0 : pageEnd;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-h-[20px] flex-1">
        {total != null &&
          total > 0 &&
          pageStart != null &&
          pageEnd != null && (
            <p className="text-sm text-white/45">
              Showing {pageStart.toLocaleString()}–
              {pageEnd.toLocaleString()} of {total.toLocaleString()}
            </p>
          )}
      </div>

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
              value={internalRowsPerPage}
              onValueChange={handleRowsPerPageChange}
              aria-label="Rows per page"
            />
          </div>
        </label>

        <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.04]">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canGoPrev || isLoading}
            className={cn(
              "border-r border-white/[0.08] p-2 transition",
              canGoPrev && !isLoading
                ? "text-white/55 hover:bg-white/[0.06] hover:text-white"
                : "cursor-not-allowed text-white/20",
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isLoading}
            className={cn(
              "p-2 transition",
              canGoNext && !isLoading
                ? "text-white/55 hover:bg-white/[0.06] hover:text-white"
                : "cursor-not-allowed text-white/20",
            )}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}