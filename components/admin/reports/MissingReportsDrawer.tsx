"use client";

import { BellRing, CheckCircle2, Loader2 } from "lucide-react";

import { AdminModal } from "@/components/admin/shared/AdminModal";
import { getInitials, primaryButtonClass, rowHoverClass } from "@/components/admin/shared/admin-ui";
import { RowAccent } from "@/components/admin/shared/RowAccent";
import type { RosterMember } from "@/lib/mock/admin-daily-reports";
import { cn } from "@/lib/utils";
import { ReporterBadge } from "./ReporterBadge";

type MissingReportsDrawerProps = {
  open: boolean;
  onClose: () => void;
  /** People expected to report today who have not submitted yet. */
  missing: RosterMember[];
  /** IDs already reminded today (button shows "Reminded"). */
  remindedIds: Set<string>;
  isPending: (key: string) => boolean;
  onRemind: (member: RosterMember) => void;
  onRemindAll: () => void;
};

/**
 * Drawer listing everyone who has not submitted today's report, with
 * one-click reminders. Reminders are recorded per person for the day so the
 * same learner isn't nudged twice by accident.
 */
export function MissingReportsDrawer({
  open,
  onClose,
  missing,
  remindedIds,
  isPending,
  onRemind,
  onRemindAll,
}: MissingReportsDrawerProps) {
  const notYetReminded = missing.filter((member) => !remindedIds.has(member.id));

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      variant="drawer"
      eyebrow="Today"
      title="Not submitted yet"
      description="Students and interns who haven't sent today's report."
      footer={
        missing.length > 0 ? (
          <button
            type="button"
            onClick={onRemindAll}
            disabled={notYetReminded.length === 0}
            aria-busy={isPending("remind-all")}
            className={primaryButtonClass}
          >
            {isPending("remind-all") ? (
              <Loader2 size={15} aria-hidden="true" className="animate-spin" />
            ) : (
              <BellRing size={15} aria-hidden="true" className="origin-top transition-transform duration-300 group-hover:rotate-12 motion-reduce:transition-none" />
            )}
            {notYetReminded.length === 0 ? "Everyone reminded" : `Remind ${notYetReminded.length === missing.length ? "all" : "the rest"} (${notYetReminded.length})`}
          </button>
        ) : undefined
      }
    >
      {missing.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={26} aria-hidden="true" />
          </span>
          <p className="mt-4 font-semibold text-[#101d49]">Everyone has reported today</p>
          <p className="mt-1 text-sm text-[#64718a]">Nice. Nothing to chase.</p>
        </div>
      ) : (
        <ul className="-mx-6 divide-y divide-[#edf0f6] border-y border-[#edf0f6]">
          {missing.map((member) => {
            const reminded = remindedIds.has(member.id);
            const pending = isPending(`remind-${member.id}`);
            return (
              <li key={member.id} className={cn(rowHoverClass, "relative flex items-center gap-3 px-6 py-3.5")}>
                <RowAccent />
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-xs font-bold text-[#101d49]">
                  {getInitials(member.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#101d49]">
                    {member.name} <ReporterBadge type={member.reporterType} />
                  </p>
                  <p className="truncate text-xs text-[#8995aa]">{member.team} · {member.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemind(member)}
                  disabled={reminded || pending}
                  aria-busy={pending}
                  className={cn(
                    "inline-flex min-w-24 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] motion-reduce:active:scale-100",
                    reminded
                      ? "cursor-default border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border-[#e4e9f2] bg-white text-[#101d49] hover:border-[#101d49] hover:bg-[#101d49] hover:text-white",
                  )}
                >
                  {pending ? (
                    <Loader2 size={13} aria-hidden="true" className="animate-spin" />
                  ) : reminded ? (
                    <>
                      <CheckCircle2 size={13} aria-hidden="true" /> Reminded
                    </>
                  ) : (
                    <>
                      <BellRing size={13} aria-hidden="true" /> Remind
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </AdminModal>
  );
}
