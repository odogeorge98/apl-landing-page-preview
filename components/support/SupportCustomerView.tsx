"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  MessageSquare,
  Phone,
  RotateCcw,
  Send,
  User,
} from "lucide-react";
import type { SupportCustomer, SupportMessage, SupportTicket } from "@/lib/data/support-mock";
import { getSupportCustomer } from "@/lib/data/support-mock";
import { cn } from "@/lib/utils";
import { showSuccess } from "@/lib/utils/error-handler";

const cardBase =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

function deepCloneCustomer(c: SupportCustomer): SupportCustomer {
  return {
    ...c,
    tickets: c.tickets.map((t) => ({
      ...t,
      messages: t.messages.map((m) => ({ ...m })),
    })),
  };
}

function StatusPill({ status }: { status: SupportTicket["status"] }) {
  const map = {
    open: "bg-amber-500/18 text-amber-200",
    pending: "bg-sky-500/18 text-sky-200",
    resolved: "bg-emerald-500/16 text-emerald-300",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        map[status],
      )}
    >
      {status}
    </span>
  );
}

export default function SupportCustomerView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const customerId = typeof params.customerId === "string" ? params.customerId : "";
  const ticketFromUrl = searchParams.get("ticket");

  const base = useMemo(() => getSupportCustomer(customerId), [customerId]);
  const [customer, setCustomer] = useState<SupportCustomer | null>(null);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (!base) {
      setCustomer(null);
      setActiveTicketId(null);
      return;
    }
    const c = deepCloneCustomer(base);
    setCustomer(c);
    let tid: string | null = null;
    if (ticketFromUrl && c.tickets.some((t) => t.id === ticketFromUrl)) {
      tid = ticketFromUrl;
    } else {
      const open = c.tickets.find((t) => t.status === "open" || t.status === "pending");
      tid = (open ?? c.tickets[0])?.id ?? null;
    }
    setActiveTicketId(tid);
  }, [base, ticketFromUrl]);

  const activeTicket = customer?.tickets.find((t) => t.id === activeTicketId) ?? null;
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  if (!base) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6">
        <Link
          href="/dashboard/support"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#00d7c4] hover:text-[#5eead4]"
        >
          <ArrowLeft className="size-4" />
          Back to inbox
        </Link>
        <p className="text-white/55">Customer not found.</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6">
        <Link
          href="/dashboard/support"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#00d7c4] hover:text-[#5eead4]"
        >
          <ArrowLeft className="size-4" />
          Back to inbox
        </Link>
        <p className="text-sm text-white/45">Loading conversation…</p>
      </div>
    );
  }

  const total = customer.tickets.length;
  const openCount = customer.tickets.filter(
    (t) => t.status === "open" || t.status === "pending",
  ).length;

  const sendReply = () => {
    const text = draft.trim();
    if (!text || !activeTicketId) return;
    setSending(true);
    const now = new Date();
    const sentAt = now.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const newMsg: SupportMessage = {
      id: `m-${Date.now()}`,
      from: "admin",
      senderName: "PEPP Support",
      body: text,
      sentAt,
    };
    setCustomer((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tickets: prev.tickets.map((t) =>
          t.id === activeTicketId
            ? {
                ...t,
                messages: [...t.messages, newMsg],
                status: t.status === "resolved" ? t.status : ("pending" as const),
                updatedAt: sentAt,
              }
            : t,
        ),
      };
    });
    setDraft("");
    window.setTimeout(() => setSending(false), 280);
  };

  const formatNow = () =>
    new Date().toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const resolveTicket = () => {
    if (!activeTicketId) return;
    const sentAt = formatNow();
    setCustomer((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tickets: prev.tickets.map((t) =>
          t.id === activeTicketId
            ? { ...t, status: "resolved" as const, updatedAt: sentAt }
            : t,
        ),
      };
    });
    showSuccess("Ticket marked as resolved.");
  };

  const reopenTicket = () => {
    if (!activeTicketId) return;
    const sentAt = formatNow();
    setCustomer((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tickets: prev.tickets.map((t) =>
          t.id === activeTicketId
            ? { ...t, status: "open" as const, updatedAt: sentAt }
            : t,
        ),
      };
    });
    showSuccess("Ticket reopened.");
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/support"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#00d7c4] hover:text-[#5eead4]"
        >
          <ArrowLeft className="size-4" />
          Back to inbox
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(260px,300px)_1fr] lg:items-start">
        <aside className={cn(cardBase, "space-y-5 p-5")}>
          <div className="flex items-start gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8247E5] to-[#5b21b6] text-lg font-semibold text-white">
              {customer.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-white">{customer.name}</h1>
              <p className="mt-0.5 text-xs font-medium text-[#00d7c4]">{customer.role}</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-white/[0.06] pt-4 text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <Mail className="size-4 shrink-0 text-white/40" strokeWidth={1.75} />
              <span className="truncate">{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Phone className="size-4 shrink-0 text-white/40" strokeWidth={1.75} />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <User className="size-4 shrink-0 text-white/40" strokeWidth={1.75} />
              <span>Member since {customer.memberSince}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-4">
            <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
              <p className="text-[11px] font-medium text-white/45">Total tickets</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-white">{total}</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
              <p className="text-[11px] font-medium text-white/45">Open / pending</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-amber-200">{openCount}</p>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Conversations
            </p>
            <ul className="mt-3 space-y-1">
              {customer.tickets.map((t) => {
                const active = t.id === activeTicketId;
                return (
                  <li key={t.id}>
                    <Link
                      href={`/dashboard/support/${customer.id}?ticket=${t.id}`}
                      onClick={() => setActiveTicketId(t.id)}
                      className={cn(
                        "block rounded-xl border px-3 py-2.5 text-left transition",
                        active
                          ? "border-[#8247E5]/45 bg-[#8247E5]/15 text-white"
                          : "border-transparent bg-white/[0.03] text-white/70 hover:bg-white/[0.06]",
                      )}
                    >
                      <p className="line-clamp-2 text-sm font-medium">{t.subject}</p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <StatusPill status={t.status} />
                        <span className="text-[11px] text-white/35">{t.messages.length} msgs</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <section className={cn(cardBase, "flex min-h-[480px] flex-col overflow-hidden")}>
          {activeTicket ? (
            <>
              <div className="border-b border-white/[0.06] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-white">{activeTicket.subject}</h2>
                    <p className="mt-1 text-xs text-white/45">
                      {activeTicket.id.toUpperCase()} · {activeTicket.category} · Created{" "}
                      {activeTicket.createdAt}
                    </p>
                  </div>
                  <StatusPill status={activeTicket.status} />
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
                {activeTicket.messages.map((m) => {
                  const isAdmin = m.from === "admin";
                  return (
                    <div
                      key={m.id}
                      className={cn("flex", isAdmin ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[min(100%,520px)] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                          isAdmin
                            ? "rounded-br-md bg-[#8247E5]/25 text-white/95 ring-1 ring-[#8247E5]/25"
                            : "rounded-bl-md bg-white/[0.06] text-white/85 ring-1 ring-white/[0.06]",
                        )}
                      >
                        <p className="text-[11px] font-semibold text-white/50">
                          {m.senderName} · {m.sentAt}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap">{m.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                      <CheckCircle2 className="size-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Resolve ticket</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/45">
                        Close this thread when the issue is fixed or no further action is needed. The
                        customer can still open a new ticket later.
                      </p>
                    </div>
                  </div>
                  {activeTicket.status === "resolved" ? (
                    <button
                      type="button"
                      onClick={reopenTicket}
                      className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/[0.1] sm:self-center"
                    >
                      <RotateCcw className="size-4" strokeWidth={1.75} />
                      Reopen ticket
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={resolveTicket}
                      className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-emerald-600/90 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-600 sm:self-center"
                    >
                      <CheckCircle2 className="size-4" strokeWidth={1.75} />
                      Mark as resolved
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-white/[0.06] p-4 sm:p-5">
                <label htmlFor="support-reply" className="sr-only">
                  Reply to customer
                </label>
                <textarea
                  id="support-reply"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  placeholder="Write a reply to the customer…"
                  disabled={activeTicket.status === "resolved"}
                  className="w-full resize-none rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-[#8247E5]/35 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-white/35">
                    {activeTicket.status === "resolved"
                      ? "This ticket is resolved. Reopen it above to send another reply."
                      : "Replies are saved for this demo. Use Resolve ticket when the case is closed."}
                  </p>
                  <button
                    type="button"
                    disabled={!draft.trim() || sending || activeTicket.status === "resolved"}
                    onClick={sendReply}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Send className="size-4" strokeWidth={1.75} />
                    Send reply
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <MessageSquare className="size-10 text-white/25" strokeWidth={1.25} />
              <p className="mt-3 text-sm text-white/50">Select a conversation</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
