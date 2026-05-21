import { Suspense } from "react";
import type { Metadata } from "next";
import AdminOnboardingClient from "@/components/auth/AdminOnboardingClient";

export const metadata: Metadata = {
  title: "Complete Setup — PEPP Cruise Admin",
  description: "Complete your admin account setup for PEPP Cruise.",
};

function PageSpinner() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0812]">
      <div className="size-8 animate-spin rounded-full border-2 border-white/10 border-t-[#8247E5]" />
    </div>
  );
}

export default function AdminOnboardingPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <AdminOnboardingClient />
    </Suspense>
  );
}