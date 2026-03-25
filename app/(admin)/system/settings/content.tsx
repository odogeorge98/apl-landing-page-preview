"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MainLayout } from "@/components/layout/dashboard";
import { Modal } from "@/components/ui/Modal";
import { Pencil, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const cardBase =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

const inputDark =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:ring-2 focus:ring-[#8247E5]/35";

const SettingsContent = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [organizationName, setOrganizationName] = useState("PEPP Cruise");
  const [businessDescription, setBusinessDescription] = useState(
    "PEPP Cruise operations: rides, drivers, payments, and platform management.",
  );
  const [timeZone, setTimeZone] = useState("(GMT +01:00) West Africa Time - Lagos");

  const handleSaveChanges = () => {
    setShowEditModal(false);
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-[1600px] space-y-8 pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-white/40">Account</p>
            <h1 className="mt-1 flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#8247E5]/20 text-[#c084fc]">
                <Settings className="size-5" strokeWidth={1.75} />
              </span>
              Settings
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/45">
              Manage your organization profile, branding, and preferences.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#8247E5]/40 hover:bg-[#8247E5]/15"
          >
            <Pencil className="size-4 text-[#c084fc]" strokeWidth={1.75} />
            Edit
          </button>
        </div>

        <section className={cn(cardBase, "overflow-hidden")}>
          <div className="border-b border-white/[0.06] px-5 py-5 sm:px-8 sm:py-6">
            <h2 className="text-base font-semibold text-white sm:text-lg">General</h2>
            <p className="mt-1 text-sm text-white/45">
              Organization details used across reports, invoices, and notifications.
            </p>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 border-b border-white/[0.06] pb-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] ring-2 ring-[#8247E5]/25">
                  <Image
                    src="/assets/peppcruise_logo.png"
                    alt="PEPP Cruise"
                    width={80}
                    height={80}
                    className="h-full w-full object-contain p-2"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{organizationName}</p>
                  <p className="mt-0.5 text-xs text-white/40">Logo shown across the admin</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-8">
              <div className="grid gap-6 md:grid-cols-2 md:gap-10">
                <div>
                  <h3 className="text-sm font-semibold text-white">Organization name</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">
                    Used on documents, emails, and the rider and driver apps.
                  </p>
                </div>
                <p className="text-sm font-medium text-white/90">{organizationName}</p>
              </div>

              <div className="grid gap-6 border-t border-white/[0.06] pt-8 md:grid-cols-2 md:gap-10">
                <div>
                  <h3 className="text-sm font-semibold text-white">Business description</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">
                    Short summary for internal context and future automation.
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-white/80">{businessDescription}</p>
              </div>

              <div className="grid gap-6 border-t border-white/[0.06] pt-8 md:grid-cols-2 md:gap-10">
                <div>
                  <h3 className="text-sm font-semibold text-white">Time zone</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">
                    Schedules, notifications, and reports use this zone.
                  </p>
                </div>
                <p className="text-sm font-medium text-white/90">{timeZone}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Modal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        size="md"
        showCloseButton
        className="border border-white/[0.08] bg-[#161222] text-white sm:max-w-md [&>button]:text-white/70 [&>button]:hover:text-white"
        title="Edit organization"
        headerTitleCss="text-left text-lg font-semibold text-white"
        headerCss="text-left"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="biz-desc" className="text-sm font-medium text-white/70">
              Business description
            </label>
            <textarea
              id="biz-desc"
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              rows={4}
              className={cn(inputDark, "min-h-[100px] resize-none")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="tz" className="text-sm font-medium text-white/70">
              Time zone <span className="text-rose-400">*</span>
            </label>
            <select
              id="tz"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className={cn(inputDark, "cursor-pointer [&>option]:bg-[#1c182b]")}
            >
              <option value="(GMT +01:00) West Africa Time - Lagos">
                (GMT +01:00) West Africa Time - Lagos
              </option>
              <option value="(GMT +00:00) Greenwich Mean Time">(GMT +00:00) Greenwich Mean Time</option>
              <option value="(GMT -05:00) Eastern Time">(GMT -05:00) Eastern Time</option>
              <option value="(GMT -08:00) Pacific Time">(GMT -08:00) Pacific Time</option>
            </select>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="rounded-xl border border-white/[0.12] bg-transparent px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="rounded-xl bg-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#7c3aed]"
            >
              Save changes
            </button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default SettingsContent;
