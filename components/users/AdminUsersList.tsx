"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Filter, Plus, Search, Shield } from "lucide-react";
import {
  ADMIN_ROLE_OPTIONS,
  adminUsersKpis,
  initialAdminUsers,
  roleLabel,
  type AdminRole,
  type AdminUser,
  type AdminUserStatus,
} from "@/lib/data/admin-users-mock";
import { UsersListKpi } from "./UsersListKpi";
import { TablePaginationBar } from "./TablePaginationBar";
import AdminSelect from "@/components/ui/AdminSelect";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { showSuccess } from "@/lib/utils/error-handler";

const tableCard =
  "overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

const inputDark =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:ring-2 focus:ring-[#8247E5]/35";

function StatusBadge({ status }: { status: AdminUserStatus }) {
  const styles: Record<AdminUserStatus, string> = {
    active: "bg-emerald-500/15 text-emerald-300",
    pending: "bg-amber-500/15 text-amber-200",
    expired: "bg-white/[0.08] text-white/45",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

const emptyInvite = {
  name: "",
  email: "",
  phone: "",
  role: "user_admin" as AdminRole,
};

export default function AdminUsersList() {
  const dateLine = dayjs().format("dddd, MMM D, YYYY");
  const [rows, setRows] = useState<AdminUser[]>(() => [...initialAdminUsers]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState(emptyInvite);

  const kpis = useMemo(() => adminUsersKpis(rows), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      );
    });
  }, [rows, query, roleFilter, statusFilter]);

  const openInvite = () => {
    setInvite({ ...emptyInvite, role: "user_admin" });
    setInviteOpen(true);
  };

  const submitInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const name = invite.name.trim();
    const email = invite.email.trim();
    const phone = invite.phone.trim();
    if (!name || !email || !phone) return;
    const id = `a-${Date.now()}`;
    const newRow: AdminUser = {
      id,
      name,
      email,
      phone,
      role: invite.role,
      status: "pending",
      dateLabel: `Invited ${dayjs().format("MMM D, YYYY")}`,
    };
    setRows((prev) => [newRow, ...prev]);
    setInviteOpen(false);
    setInvite(emptyInvite);
    showSuccess("Invitation sent. User will appear as pending until they accept.");
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-white/40">{dateLine}</p>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#8247E5]/20 text-[#c084fc] sm:size-10">
              <Shield className="size-5 sm:size-5" strokeWidth={1.75} />
            </span>
            Admin users
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Finance, station, support, and user admins · invite by email
          </p>
        </div>
        <button
          type="button"
          onClick={openInvite}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#8247E5]/50 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#8247E5] hover:bg-[#8247E5]/10 sm:self-auto"
        >
          <Plus className="size-4" strokeWidth={2} />
          Invite admin
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <UsersListKpi key={k.title} title={k.title} value={k.value} />
        ))}
      </div>

      <div className={tableCard}>
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2 className="shrink-0 text-base font-semibold text-white">Directory</h2>
          <div
            className="flex min-w-0 items-center gap-2 overflow-x-auto pb-0.5 sm:max-w-none sm:justify-end sm:overflow-visible sm:pb-0"
            role="search"
            aria-label="Directory search and filters"
          >
            <div className="relative h-9 w-[152px] shrink-0 sm:w-[160px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, email…"
                className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.07] py-0 pl-8 pr-2 text-xs text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2"
                aria-label="Search admin users"
              />
            </div>
            <div className="h-9 w-[140px] shrink-0 sm:w-[148px]">
              <AdminSelect
                icon={Filter}
                size="sm"
                triggerClassName="h-9 min-h-9 py-0 text-xs"
                options={[
                  { value: "all", label: "All roles" },
                  ...ADMIN_ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
                ]}
                value={roleFilter}
                onValueChange={setRoleFilter}
                aria-label="Filter by role"
              />
            </div>
            <div className="h-9 w-[128px] shrink-0 sm:w-[136px]">
              <AdminSelect
                size="sm"
                triggerClassName="h-9 min-h-9 py-0 text-xs"
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "pending", label: "Pending" },
                  { value: "expired", label: "Expired" },
                ]}
                value={statusFilter}
                onValueChange={setStatusFilter}
                aria-label="Filter by status"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.map((u) => (
                <tr key={u.id} className="text-white/85 transition hover:bg-white/[0.02]">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8247E5] to-[#3b82f6] text-xs font-semibold text-white">
                        {u.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <span className="font-semibold text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-white/70">{u.email}</td>
                  <td className="px-4 py-3.5 tabular-nums text-white/70">{u.phone}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-white/80">{roleLabel(u.role)}</span>
                    <span className="mt-0.5 block font-mono text-[10px] text-white/35">{u.role}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-white/45">{u.dateLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePaginationBar
          pageStart={filtered.length ? 1 : 0}
          pageEnd={filtered.length}
          total={filtered.length}
        />
      </div>

      <Modal
        open={inviteOpen}
        onOpenChange={(o) => {
          setInviteOpen(o);
          if (!o) setInvite({ ...emptyInvite, role: "user_admin" });
        }}
        size="md"
        showCloseButton
        className="border border-white/[0.08] bg-[#161222] text-white sm:max-w-md [&>button]:text-white/70 [&>button]:hover:text-white"
        title="Invite admin user"
        description="Send an invitation with platform access. They will receive email instructions to complete setup."
        headerTitleCss="text-left text-lg font-semibold text-white"
        headerCss="text-left"
      >
        <form onSubmit={submitInvite} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label htmlFor="inv-name" className="text-xs font-medium text-white/60">
              Full name
            </label>
            <input
              id="inv-name"
              required
              autoComplete="name"
              value={invite.name}
              onChange={(e) => setInvite((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g. Adaora Nwosu"
              className={inputDark}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="inv-email" className="text-xs font-medium text-white/60">
              Work email
            </label>
            <input
              id="inv-email"
              type="email"
              required
              autoComplete="email"
              value={invite.email}
              onChange={(e) => setInvite((s) => ({ ...s, email: e.target.value }))}
              placeholder="name@company.com"
              className={inputDark}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="inv-phone" className="text-xs font-medium text-white/60">
              Phone
            </label>
            <input
              id="inv-phone"
              type="tel"
              required
              autoComplete="tel"
              value={invite.phone}
              onChange={(e) => setInvite((s) => ({ ...s, phone: e.target.value }))}
              placeholder="+234 801 234 5678"
              className={inputDark}
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-white/60">Admin role</span>
            <AdminSelect
              options={ADMIN_ROLE_OPTIONS}
              value={invite.role}
              onValueChange={(v) => setInvite((s) => ({ ...s, role: v as AdminRole }))}
              aria-label="Admin role"
            />
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              className="rounded-xl border border-white/[0.12] bg-transparent px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#7c3aed]"
            >
              Send invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
