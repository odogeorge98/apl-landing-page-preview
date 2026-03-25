"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function UsersListKpi({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95",
        "p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
      )}
    >
      <div className="mb-3 flex justify-end">
        <span className="p-1 text-white/25 transition group-hover:text-[#00d7c4]/80">
          <ChevronDown className="size-3.5 -rotate-45" />
        </span>
      </div>
      <p className="text-xs font-medium text-white/50">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white lg:text-[28px]">
        {value}
      </p>
    </div>
  );
}
