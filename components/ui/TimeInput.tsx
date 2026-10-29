"use client";

import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

type TimeInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

/** Styled 24-hour time field without the browser-specific native time popup. */
export function TimeInput({
  id,
  value,
  onChange,
  ariaLabel,
  required = false,
  disabled = false,
  className,
}: TimeInputProps) {
  return (
    <span className={cn("relative block min-w-0", className)}>
      <Clock3 size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8490a6]" aria-hidden="true" />
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, 5))}
        placeholder="HH:MM"
        pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
        title="Enter a time in 24-hour format, for example 09:30."
        maxLength={5}
        required={required}
        disabled={disabled}
        aria-label={ariaLabel}
        className="h-11 w-full rounded-xl border border-[#dce3ef] bg-white pl-9 pr-2 text-sm tabular-nums text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5 disabled:cursor-not-allowed disabled:bg-[#f5f6f8]"
      />
    </span>
  );
}
