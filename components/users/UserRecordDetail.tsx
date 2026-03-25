"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  Car,
  Eye,
  EyeOff,
  ImageIcon,
  Pencil,
  Scale,
  User,
  Wallet,
  X,
} from "lucide-react";
import { defaultPassengerProfile, mockActivityRides } from "@/lib/data/users-mock";
import { TripActivityBadge } from "./UserStatusBadge";
import { UpdateProfileConfirmModal, ProfileUpdatedSuccessModal } from "./UserProfileModals";
import { cn } from "@/lib/utils";

type TabId = "account" | "activity" | "disputes";

export function UserRecordDetail({
  kind,
  userId: _userId,
}: {
  kind: "rider" | "driver";
  userId: string;
}) {
  void _userId;
  const profile = defaultPassengerProfile;
  const [tab, setTab] = useState<TabId>("account");
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [showCoins, setShowCoins] = useState(true);

  const title = kind === "rider" ? "Passenger Management" : "Driver Management";
  const recordLabel = kind === "rider" ? "Passenger Record" : "Driver Record";
  const backHref = kind === "rider" ? "/dashboard/users/riders" : "/dashboard/users/drivers";

  const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: "account", label: "Account", icon: User },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "disputes", label: "Disputes", icon: Scale },
  ];

  const subjectNoun = kind === "rider" ? "Passenger" : "Driver";

  const divider = "border-b border-white/[0.06]";
  const row = "flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8";

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="flex size-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-56">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
            {recordLabel}
          </p>
          <nav className="flex flex-col gap-1 border-r border-white/[0.06] pr-4">
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                    active
                      ? "bg-[#8247E5]/25 text-white shadow-[inset_3px_0_0_0_#a855f7]"
                      : "text-white/50 hover:bg-white/[0.06] hover:text-white/85",
                  )}
                >
                  <Icon className="size-4 shrink-0 opacity-90" strokeWidth={1.75} />
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          {tab === "account" && (
            <>
              <div
                className={cn(
                  "overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/98 to-[#12101c]/98",
                  "shadow-[0_8px_40px_rgba(0,0,0,0.35),0_0_80px_-20px_rgba(130,71,229,0.25)]",
                )}
              >
                <div className={divider}>
                  <div className={row}>
                    <span className="text-sm text-white/45">Full Name</span>
                    {editing ? (
                      <input
                        defaultValue={profile.fullName}
                        className="w-full max-w-md rounded-xl bg-white/[0.08] px-3 py-2 text-right text-sm text-white outline-none ring-[#8247E5]/30 focus:ring-2 sm:text-left"
                      />
                    ) : (
                      <span className="text-sm font-medium text-white">{profile.fullName}</span>
                    )}
                  </div>
                </div>
                <div className={divider}>
                  <div className={row}>
                    <span className="text-sm text-white/45">Email</span>
                    <span className="text-sm font-medium text-white">{profile.email}</span>
                  </div>
                </div>
                <div className={divider}>
                  <div className={row}>
                    <span className="text-sm text-white/45">Phone Number</span>
                    {editing ? (
                      <input
                        defaultValue={profile.phone}
                        className="w-full max-w-md rounded-xl bg-white/[0.08] px-3 py-2 text-right text-sm text-white outline-none ring-[#8247E5]/30 focus:ring-2 sm:text-left"
                      />
                    ) : (
                      <span className="text-sm font-medium tabular-nums text-white">
                        {profile.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className={divider}>
                  <div className={cn(row, "!items-start")}>
                    <span className="text-sm text-white/45">Photo</span>
                    <div className="flex w-full max-w-lg flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="flex flex-col items-center gap-2">
                        <div className="size-20 overflow-hidden rounded-full bg-gradient-to-br from-[#8247E5] to-blue-500" />
                        <button type="button" className="text-xs font-semibold text-red-400 hover:text-red-300">
                          Delete
                        </button>
                      </div>
                      <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#00d7c4]/40 bg-white/[0.03] px-4 py-8 text-center transition hover:border-[#00d7c4]/65 hover:bg-white/[0.05]">
                        <ImageIcon className="size-8 text-[#00d7c4]/80" strokeWidth={1.25} />
                        <p className="mt-2 text-xs text-white/55">
                          Click to upload or drag and drop. SVG, PNG, JPG or GIF (max. 800 × 400px)
                        </p>
                        <input type="file" className="hidden" accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>
                <div className={divider}>
                  <div className={row}>
                    <span className="text-sm text-white/45">Join date</span>
                    <span className="text-sm text-white">{profile.joinDate}</span>
                  </div>
                </div>
                <div className={divider}>
                  <div className={row}>
                    <span className="text-sm text-white/45">Status</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                      <span className="size-1.5 rounded-full bg-amber-400" />
                      Pending Verification
                    </span>
                  </div>
                </div>
                <div>
                  <div className={cn(row, "!items-start")}>
                    <span className="text-sm text-white/45">Short description</span>
                    {editing ? (
                      <textarea
                        defaultValue={profile.description}
                        rows={4}
                        className="w-full max-w-xl rounded-xl bg-white/[0.08] px-3 py-2 text-sm text-white outline-none ring-[#8247E5]/30 focus:ring-2"
                      />
                    ) : (
                      <p className="max-w-xl text-right text-sm leading-relaxed text-white/80 sm:text-left">
                        {profile.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {editing ? (
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-xl border border-[#8247E5]/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8247E5]/10"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    className="rounded-xl bg-gradient-to-r from-[#8247E5] to-[#a855f7] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-95"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2a2438] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#352d48]"
                  >
                    <Pencil className="size-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-red-400/50 bg-transparent px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                  >
                    <X className="size-4" />
                    Suspend
                  </button>
                </div>
              )}
            </>
          )}

          {tab === "activity" && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                  <div className="mb-4 flex items-center gap-2 text-[#a855f7]">
                    <Car className="size-5" strokeWidth={1.75} />
                    <span className="text-sm font-semibold text-white/80">Total Rides</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-emerald-400/90">Completed</p>
                      <p className="mt-1 text-2xl font-bold text-white">113</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-400/90">Canceled</p>
                      <p className="mt-1 text-2xl font-bold text-white">17</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                  <div className="mb-4 flex items-center gap-2 text-[#a855f7]">
                    <Wallet className="size-5" strokeWidth={1.75} />
                    <span className="text-sm font-semibold text-white/80">Total Spend</span>
                  </div>
                  <p className="text-2xl font-bold text-white">N 133,000.00</p>
                </div>
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
                    "bg-gradient-to-br from-[#1c182b]/95 to-[#151221]/95",
                  )}
                >
                  <div
                    className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full border border-[#8247E5]/15"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute -right-4 top-12 size-28 rounded-full border border-[#8247E5]/10"
                    aria-hidden
                  />
                  <div className="relative mb-2 flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-white/80">Total Pepp Coins</span>
                    <Image src="/peppcoin.svg" alt="" width={48} height={50} className="drop-shadow-lg" />
                  </div>
                  <div className="relative mt-3 flex items-center gap-2">
                    <span className="text-2xl font-bold tabular-nums text-white">
                      {showCoins ? "1,322" : "••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCoins((s) => !s)}
                      className="rounded-lg p-1.5 text-white/40 hover:bg-white/[0.08] hover:text-white/70"
                      aria-label={showCoins ? "Hide balance" : "Show balance"}
                    >
                      {showCoins ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                        <th className="px-4 py-3">Pickup</th>
                        <th className="px-4 py-3">Drop Off</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {mockActivityRides.map((ride) => (
                        <tr key={ride.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-white">{ride.pickupName}</p>
                            <p className="mt-0.5 max-w-[220px] text-xs text-white/45">
                              {ride.pickupAddr}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-white">{ride.dropName}</p>
                            <p className="mt-0.5 max-w-[220px] text-xs text-white/45">
                              {ride.dropAddr}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <TripActivityBadge status={ride.status} />
                          </td>
                          <td className="px-4 py-3.5 tabular-nums text-white/65">{ride.date}</td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              type="button"
                              className="text-sm font-semibold text-[#00d7c4] hover:text-[#5eead4]"
                            >
                              View details &gt;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === "disputes" && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center">
              <Scale className="mx-auto size-10 text-white/25" strokeWidth={1.25} />
              <p className="mt-3 text-sm text-white/45">No open disputes for this {subjectNoun.toLowerCase()}.</p>
            </div>
          )}
        </div>
      </div>

      <UpdateProfileConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => {
          setEditing(false);
          setSuccessOpen(true);
        }}
        subjectLabel={subjectNoun + " Information"}
      />
      <ProfileUpdatedSuccessModal open={successOpen} onOpenChange={setSuccessOpen} />
    </div>
  );
}
