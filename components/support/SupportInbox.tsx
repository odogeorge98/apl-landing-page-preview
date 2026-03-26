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
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

const statCard =
  "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.22)]";

function StatusPill({ status }: { status: SupportTicketStatus }) {
  const map = {
    open: "bg-amber-500/18 text-amber-200",
    pending: "bg-sky-500/18 text-sky-200",
    resolved: "bg-emerald-500/16 text-emerald-300",
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
    p === "high" ? "bg-rose-400" : p === "normal" ? "bg-amber-400/90" : "bg-white/35";
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
        <p className="text-xs text-white/40">{dateLine}</p>
        <h1 className="mt-1 flex items-center gap-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#8247E5]/20 text-[#c084fc]">
            <Headphones className="size-5" strokeWidth={1.75} />
          </span>
          Support
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/45">
          Review customer messages, see conversation history per customer, and reply from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className={statCard}>
          <p className="text-xs font-medium text-white/50">Total tickets</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{kpis.totalTickets}</p>
        </div>
        <div className={statCard}>
          <p className="text-xs font-medium text-white/50">Open</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-amber-200">{kpis.open}</p>
        </div>
        <div className={statCard}>
          <p className="text-xs font-medium text-white/50">Pending</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-sky-200">{kpis.pending}</p>
        </div>
        <div className={statCard}>
          <p className="text-xs font-medium text-white/50">Resolved</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-300">{kpis.resolved}</p>
        </div>
        <div className={statCard}>
          <p className="text-xs font-medium text-white/50">Customers</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{kpis.customers}</p>
          <p className="mt-1 text-[11px] text-white/35">With active or past tickets</p>
        </div>
      </div>

      <section className={cn(cardBase, "overflow-hidden")}>
        <div className="flex flex-col gap-4 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Inbox</h2>
            <p className="mt-0.5 text-xs text-white/45">Newest activity first · {filtered.length} shown</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search customer, email, subject…"
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] py-2 pl-10 pr-3 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-[#8247E5]/30"
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
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Msgs</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.map((r, idx) => (
                <tr
                  key={r.ticketId}
                  className={cn(
                    "text-white/80 transition hover:bg-white/[0.03]",
                    idx % 2 === 1 && "bg-white/[0.02]",
                  )}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8247E5] to-[#5b21b6] text-xs font-semibold text-white">
                        {r.customerName
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{r.customerName}</p>
                        <p className="truncate text-xs text-white/45">{r.email}</p>
                        <p className="text-[11px] text-white/35">{r.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[240px] px-4 py-3.5">
                    <p className="truncate font-medium text-white/90">{r.subject}</p>
                    <p className="text-[11px] text-white/35">{r.ticketId.toUpperCase()}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-white/60">{r.category}</td>
                  <td className="px-4 py-3.5">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-2">
                      <PriorityDot p={r.priority} />
                      <span className="text-white/55 capitalize">{r.priority}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-white/55">{r.messageCount}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-white/45">{r.updatedAt}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/dashboard/support/${r.customerId}?ticket=${r.ticketId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-[#00d7c4] transition hover:border-[#00d7c4]/30 hover:bg-[#00d7c4]/10"
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
            <Users className="size-10 text-white/25" strokeWidth={1.25} />
            <p className="mt-3 text-sm font-medium text-white/55">No tickets match</p>
            <p className="mt-1 text-xs text-white/35">Try another search or status filter.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
