"use client";

import { useMemo } from "react";
import AdminSelect, { type AdminSelectOption } from "./AdminSelect";
import { cn } from "@/lib/utils";

/**
 * Light-themed select with custom option list (legacy “base” layout).
 * Prefer `AdminSelect` with `variant="light"` for new code.
 */
export default function SelectAltInput({
  isEmpty,
  options,
  className,
  value,
  onChange,
}: {
  isEmpty: boolean;
  options: string[];
  className?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
}) {
  const mapped: AdminSelectOption[] = useMemo(
    () => options.map((o) => ({ value: o, label: o })),
    [options],
  );
  const selectedValue = value ?? options[0] ?? "";

  return (
    <AdminSelect
      variant="light"
      options={mapped}
      value={selectedValue}
      onValueChange={(v) => onChange?.({ target: { value: v } })}
      disabled={isEmpty}
      className="w-full"
      triggerClassName={cn("h-[46px]", className)}
      size="md"
    />
  );
}
