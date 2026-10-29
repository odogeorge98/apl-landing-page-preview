"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import { AdminModal } from "./AdminModal";
import {
  dangerButtonClass,
  darkButtonClass,
  secondaryButtonClass,
} from "./admin-ui";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  /** Main explanation of what will happen. */
  message: ReactNode;
  confirmLabel: string;
  /** Use for irreversible actions (delete, revoke) — renders a red button. */
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  /** Optional extra content, e.g. a "reason" textarea. */
  children?: ReactNode;
  /** Disable the confirm button until extra input is valid. */
  confirmDisabled?: boolean;
};

/**
 * Generic "are you sure?" dialog for admin actions.
 * Every bulk or destructive operation on the admin pages routes through
 * this so the confirmation copy and styling stay consistent.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  destructive = false,
  onConfirm,
  onClose,
  children,
  confirmDisabled = false,
}: ConfirmDialogProps) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={destructive ? dangerButtonClass : darkButtonClass}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        {destructive && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#c93636]">
            <AlertTriangle size={20} aria-hidden="true" />
          </span>
        )}
        <div className="text-sm leading-6 text-[#64718a]">{message}</div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </AdminModal>
  );
}
