"use client";

import React from "react";
import { User, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

export function UpdateProfileConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  subjectLabel,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  subjectLabel: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "gap-6 border border-white/[0.08] bg-[#141022] p-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:max-w-md",
        )}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.05]">
            <User className="size-7 text-white/90" strokeWidth={1.5} />
          </div>
          <DialogHeader className="mt-5 space-y-2">
            <DialogTitle className="text-lg font-semibold text-white">
              Update {subjectLabel}?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-white/55">
              Please note that any changes made will reflect across all related platforms.
              Ensure that all the updated information provided is correct and valid.
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="flex w-full flex-row gap-3 sm:justify-center">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-11 flex-1 rounded-xl border border-white/15 bg-transparent px-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="h-11 flex-1 rounded-xl bg-gradient-to-r from-[#8247E5] to-[#a855f7] px-4 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
          >
            Confirm Update
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProfileUpdatedSuccessModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "gap-6 border border-white/[0.08] bg-[#141022] p-8 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:max-w-md",
        )}
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#00d7c4]/15">
          <Check className="size-8 text-[#00d7c4]" strokeWidth={2.5} />
        </div>
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-semibold text-[#00d7c4]">
            Profile Updated Successfully
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-white/55">
            The changes to the profile have been saved and will be reflected in the system.
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="mx-auto h-11 w-full max-w-[200px] rounded-xl border border-white/10 bg-white/[0.06] text-sm font-semibold text-white transition hover:bg-white/[0.1]"
        >
          Close
        </button>
      </DialogContent>
    </Dialog>
  );
}
