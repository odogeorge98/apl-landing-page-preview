"use client";

import { useMemo, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Copy,
  Fingerprint,
  GraduationCap,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShieldUser,
  UserRound,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import MainLayout from "@/components/layout/dashboard/MainLayout";
import { useTutorProfile } from "@/lib/hooks/profile/use-tutor-profile";
import type { TutorProfile } from "@/lib/interfaces/profile";

function formatDate(value: string | null | undefined): string {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]).join("").toUpperCase() || "TU";
}

function DetailItem({
  icon: Icon,
  label,
  value,
  description,
  action,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-[#e8edf5] bg-white p-4 transition-colors hover:border-[#d8dfec] sm:p-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f4fc] text-[#101d49]">
        <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-[#71809a]">{label}</p>
        <div className="mt-1 flex min-w-0 items-center gap-2">
          <p className="break-all text-sm font-semibold text-[#101d49]">{value}</p>
          {action}
        </div>
        {description && <p className="mt-1 text-xs leading-5 text-[#8490a6]">{description}</p>}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="Loading tutor profile">
      <div className="h-52 rounded-2xl bg-white" />
      <div className="rounded-2xl border border-[#e8edf5] bg-white p-6">
        <div className="h-5 w-40 rounded bg-[#edf1f7]" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 rounded-xl bg-[#f4f6fa]" />)}
        </div>
      </div>
      <span className="sr-only">Loading your profile…</span>
    </div>
  );
}

function ProfileError({
  message,
  isFetching,
  onRetry,
}: {
  message: string;
  isFetching: boolean;
  onRetry: () => void;
}) {
  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-[#e8edf5] bg-white px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600"><XCircle size={26} aria-hidden="true" /></div>
      <h2 className="mt-5 text-lg font-bold text-[#101d49]">Unable to load your profile</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#71809a]">
        {message || "Something went wrong while retrieving your account details. Please try again."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isFetching}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#101d49] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a2d68] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#f5c542] focus:ring-offset-2"
      >
        <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} aria-hidden="true" />
        {isFetching ? "Retrying…" : "Try again"}
      </button>
    </section>
  );
}

function ProfileContent({ profile }: { profile: TutorProfile }) {
  const initials = useMemo(() => getInitials(profile.name), [profile.name]);

  const copyProfileId = async () => {
    try {
      await navigator.clipboard.writeText(profile.id);
    } catch {
      // Clipboard may be unavailable; the account ID remains visible.
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-[#e8edf5] bg-white shadow-[0_4px_24px_rgba(16,29,73,0.035)]">
        <div className="h-2 bg-[#f5c542]" />
        <div className="relative p-5 sm:p-7 lg:p-8">
          <div className="absolute -right-12 -top-16 size-48 rounded-full bg-[#f5c542]/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="flex size-[76px] shrink-0 items-center justify-center rounded-2xl bg-[#101d49] text-2xl font-bold tracking-wide text-[#f5c542] shadow-lg shadow-[#101d49]/10 sm:size-[88px]">
                {initials}
              </div>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7dc] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c6500]">
                  <GraduationCap size={13} aria-hidden="true" />Tutor
                </span>
                <h2 className="mt-3 break-words text-xl font-bold tracking-tight text-[#101d49] sm:text-2xl">{profile.name}</h2>
                <p className="mt-1 break-all text-sm text-[#71809a]">{profile.email}</p>
              </div>
            </div>

            <div className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold ${profile.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {profile.isActive ? <CheckCircle2 size={15} aria-hidden="true" /> : <XCircle size={15} aria-hidden="true" />}
              {profile.isActive ? "Account active" : "Account inactive"}
            </div>
          </div>

          <div className="relative mt-7 grid gap-3 border-t border-[#edf0f6] pt-5 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#f1f4fc] text-[#101d49]"><ShieldUser size={17} aria-hidden="true" /></div>
              <div><p className="text-[11px] text-[#8490a6]">Account role</p><p className="mt-0.5 text-sm font-semibold text-[#101d49]">{profile.role}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#fff7dc] text-[#8c6500]"><CalendarDays size={17} aria-hidden="true" /></div>
              <div><p className="text-[11px] text-[#8490a6]">Member since</p><p className="mt-0.5 text-sm font-semibold text-[#101d49]">{formatDate(profile.createdAt)}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Activity size={17} aria-hidden="true" /></div>
              <div><p className="text-[11px] text-[#8490a6]">Account status</p><p className="mt-0.5 text-sm font-semibold text-[#101d49]">{profile.isActive ? "Enabled" : "Disabled"}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e8edf5] bg-white p-5 shadow-[0_4px_24px_rgba(16,29,73,0.025)] sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#f1f4fc] text-[#101d49]"><UserRound size={18} aria-hidden="true" /></div>
          <div>
            <h2 className="text-base font-bold text-[#101d49] sm:text-lg">Tutor information</h2>
            <p className="mt-1 text-sm leading-6 text-[#71809a]">Your teaching account identity and contact details.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <DetailItem icon={UserRound} label="Full name" value={profile.name || "Not provided"} description="Name associated with your tutor account." />
          <DetailItem icon={Mail} label="Email address" value={profile.email || "Not provided"} description="Your registered tutor email address." />
          <DetailItem icon={Phone} label="Phone number" value={profile.phone || "Not provided"} description="Your contact phone number." />
          <DetailItem icon={ShieldCheck} label="Role" value={profile.role} description="Your assigned access role." />
          <DetailItem
            icon={Fingerprint}
            label="Tutor ID"
            value={profile.id}
            description="Unique identifier assigned to your account."
            action={
              <button
                type="button"
                onClick={copyProfileId}
                aria-label="Copy tutor ID"
                title="Copy tutor ID"
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-[#71809a] transition hover:bg-[#f1f4fc] hover:text-[#101d49] focus:outline-none focus:ring-2 focus:ring-[#f5c542]"
              ><Copy size={14} aria-hidden="true" /></button>
            }
          />
          <DetailItem
            icon={Activity}
            label="Account status"
            value={profile.isActive ? "Active" : "Inactive"}
            description={profile.isActive ? "Your tutor account is currently enabled." : "Your tutor account is currently disabled."}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[#e8edf5] bg-white p-5 shadow-[0_4px_24px_rgba(16,29,73,0.025)] sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#fff7dc] text-[#8c6500]"><Activity size={18} aria-hidden="true" /></div>
          <div>
            <h2 className="text-base font-bold text-[#101d49] sm:text-lg">Account activity</h2>
            <p className="mt-1 text-sm text-[#71809a]">Important dates associated with your tutor account.</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-[#f7f8fc] p-4 sm:p-5">
            <dt className="text-xs font-medium text-[#71809a]">Account created</dt>
            <dd className="mt-2 text-sm font-bold text-[#101d49]">{formatDateTime(profile.createdAt)}</dd>
          </div>
          <div className="rounded-xl bg-[#f7f8fc] p-4 sm:p-5">
            <dt className="text-xs font-medium text-[#71809a]">Last profile update</dt>
            <dd className="mt-2 text-sm font-bold text-[#101d49]">{formatDateTime(profile.updatedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="flex items-start gap-3 rounded-2xl border border-[#e7eaf2] bg-[#f8f9fc] p-4 sm:p-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#101d49] text-[#f5c542]"><ShieldCheck size={18} aria-hidden="true" /></div>
        <div>
          <h3 className="text-sm font-bold text-[#101d49]">Keep your account secure</h3>
          <p className="mt-1 text-sm leading-6 text-[#71809a]">
            Protect your sign-in credentials and sign out when using a shared device. Contact support if your profile details need to be updated.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function TutorProfilePage() {
  const router = useRouter();
  const {
    data: profile,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useTutorProfile();

  const retry = () => {
    void refetch();
  };
  const errorMessage = error instanceof Error
    ? error.message
    : "We couldn't retrieve your account information.";

  return (
    <MainLayout>
      <main className="min-h-full bg-[#f5f7fc]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <button
                type="button"
                onClick={() => router.back()}
                className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-[#71809a] transition hover:text-[#101d49] focus:outline-none focus:underline"
              ><ArrowLeft size={15} aria-hidden="true" />Back</button>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff5d3] px-3 py-1.5 text-[11px] font-bold text-[#8c6500]">
                  <span className="size-1.5 rounded-full bg-[#f5c542]" />Nugi Innovations
                </span>
                <span className="text-xs text-[#9aa4b7]">/ Account</span>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">My profile</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71809a]">
                View your tutor details, account status, and important profile activity.
              </p>
            </div>
            <div className="flex flex-col gap-2 self-start sm:flex-row sm:items-center sm:self-center">
              <div className="flex items-center gap-2 rounded-xl border border-[#e8edf5] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#101d49]">
                <ShieldCheck size={16} className="text-emerald-600" aria-hidden="true" />Secure account
              </div>
              <button
                type="button"
                onClick={retry}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe5f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#101d49] transition hover:border-[#101d49]/30 hover:bg-[#f8f9fc] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#f5c542] focus:ring-offset-2"
              >
                <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} aria-hidden="true" />
                {isFetching ? "Refreshing…" : "Refresh profile"}
              </button>
            </div>
          </div>

          {isLoading && !profile ? (
            <ProfileSkeleton />
          ) : isError && !profile ? (
            <ProfileError message={errorMessage} isFetching={isFetching} onRetry={retry} />
          ) : profile ? (
            <>
              {isError && (
                <div role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Profile refresh failed. Showing the most recently loaded profile data.
                </div>
              )}
              <ProfileContent profile={profile} />
            </>
          ) : (
            <ProfileError message="No profile information was returned by the server." isFetching={isFetching} onRetry={retry} />
          )}
        </div>
      </main>
    </MainLayout>
  );
}
