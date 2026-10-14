"use client";

import dayjs from "dayjs";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Headphones, MessageSquare, Search, Users } from "lucide-react";
import { getSupportInboxRows, getSupportKpis } from "@/lib/data/support-mock";
import type { SupportTicketStatus } from "@/lib/data/support-mock";
import { cn } from "@/lib/utils";
import AdminSelect from "@/components/ui/AdminSelect";

const cardBase =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_8px_32px_rgba(16,29,73,0.06)]";

const statCard =
  "relative overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white p-4 shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

function StatusPill({ status }: { status: SupportTicketStatus }) {
  const map = {
    open: "bg-[#fff6d8] text-[#765800]",
    pending: "bg-[#eaf0ff] text-[#2857a4]",
    resolved: "bg-[#e7f5ee] text-[#16845b]",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        map[status],
      )}
    >
      {status}
    </span>
  );
}

function PriorityDot({ p }: { p: "low" | "normal" | "high" }) {
  const color =
    p === "high" ? "bg-[#c93636]" : p === "normal" ? "bg-[#d89f12]" : "bg-[#aab4c5]";
  return <span className={cn("inline-block size-2 rounded-full", color)} title={p} />;
}

export default function SupportInbox() {
  const rows = useMemo(() => getSupportInboxRows(), []);
  const kpis = useMemo(() => getSupportKpis(), []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | SupportTicketStatus>("all");
  const dateLine = dayjs().format("dddd, MMM D, YYYY");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okStatus = status === "all" || r.status === status;
      const needle = q.trim().toLowerCase();
      const okQ =
        !needle ||
        r.customerName.toLowerCase().includes(needle) ||
        r.email.toLowerCase().includes(needle) ||
        r.subject.toLowerCase().includes(needle) ||
        r.ticketId.toLowerCase().includes(needle);
      return okStatus && okQ;
    });
  }, [rows, q, status]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 sm:space-y-8">
      <div>
        <p className="text-xs font-medium text-[#64718a]">{dateLine}</p>
        <h1 className="mt-1 flex items-center gap-3 text-2xl font-semibold tracking-tight text-[#101d49] sm:text-3xl">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#fff6d8] text-[#765800]">
            <Headphones className="size-5" strokeWidth={1.75} />
          </span>
          Learner support
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64718a]">
          Manage student and tutor requests about programmes, courses, assignments, and portal access.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className={statCard}>
          <p className="text-xs font-medium text-[#64718a]">Total requests</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#101d49]">{kpis.totalTickets}</p>
        </div>
        <div className={statCard}>
          <p className="text-xs font-medium text-[#64718a]">Open</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#8a6500]">{kpis.open}</p>
        </div>
        <div className={statCard}>
          <p className="text-xs font-medium text-[#64718a]">Pending</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#2857a4]">{kpis.pending}</p>
        </div>
        <div className={statCard}>
          <p className="text-xs font-medium text-[#64718a]">Resolved</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#16845b]">{kpis.resolved}</p>
        </div>
        <div className={statCard}>
          <p className="text-xs font-medium text-[#64718a]">People supported</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#101d49]">{kpis.customers}</p>
          <p className="mt-1 text-[11px] text-[#8490a6]">With current or past requests</p>
        </div>
      </div>

      <section className={cn(cardBase, "overflow-hidden")}>
        <div className="flex flex-col gap-4 border-b border-[#edf0f6] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-sm font-semibold text-[#101d49]">Support inbox</h2>
            <p className="mt-0.5 text-xs text-[#64718a]">Newest activity first · {filtered.length} shown</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8490a6]" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search student, tutor, email, or request…"
                aria-label="Search support requests"
                className="h-10 w-full rounded-xl border border-[#e4e9f2] bg-white py-2 pl-10 pr-3 text-sm text-[#17233f] placeholder:text-[#8490a6] outline-none focus:border-[#101d49]/35 focus:ring-2 focus:ring-[#101d49]/10"
              />
            </div>
            <div className="w-full shrink-0 sm:w-[180px]">
              <AdminSelect
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "open", label: "Open" },
                  { value: "pending", label: "Pending" },
                  { value: "resolved", label: "Resolved" },
                ]}
                value={status}
                onValueChange={(v) => setStatus(v as typeof status)}
                aria-label="Filter by status"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#edf0f6] text-[11px] font-semibold uppercase tracking-wider text-[#64718a]">
                <th className="px-4 py-3 font-medium">Student / tutor</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Msgs</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0f6]">
              {filtered.map((r, idx) => (
                <tr
                  key={r.ticketId}
                  className={cn(
                    "text-[#17233f] transition hover:bg-[#f9fafd]",
                    idx % 2 === 1 && "bg-[#f9fafd]/70",
                  )}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#101d49] text-xs font-semibold text-[#f5c542]">
                        {r.customerName
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#101d49]">{r.customerName}</p>
                        <p className="truncate text-xs text-[#64718a]">{r.email}</p>
                        <p className="text-[11px] text-[#8490a6]">{r.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[240px] px-4 py-3.5">
                    <p className="truncate font-medium text-[#17233f]">{r.subject}</p>
                    <p className="text-[11px] text-[#8490a6]">{r.ticketId.toUpperCase()}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[#64718a]">{r.category}</td>
                  <td className="px-4 py-3.5">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-2">
                      <PriorityDot p={r.priority} />
                      <span className="text-[#64718a] capitalize">{r.priority}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-[#64718a]">{r.messageCount}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[#64718a]">{r.updatedAt}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/dashboard/support/${r.customerId}?ticket=${r.ticketId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#fff6d8] px-3 py-1.5 text-xs font-semibold text-[#765800] transition hover:bg-[#ffefbd]"
                    >
                      <MessageSquare className="size-3.5" strokeWidth={1.75} />
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="size-10 text-[#aab4c5]" strokeWidth={1.25} />
            <p className="mt-3 text-sm font-medium text-[#17233f]">No requests match</p>
            <p className="mt-1 text-xs text-[#64718a]">Try another search or status filter.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
