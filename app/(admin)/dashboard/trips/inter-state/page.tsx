"use client";

import { MainLayout } from "@/components/layout/dashboard";
import Link from "next/link";
import { Route } from "lucide-react";

export default function InterStateTripsPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div>
          <p className="text-xs text-white/40">Trips · Inter state</p>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#8247E5]/20 text-[#c084fc] sm:size-10">
              <Route className="size-5" strokeWidth={1.75} />
            </span>
            Inter state
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/45">
            Dedicated inter-state admin views can extend the global trips list with routes, pricing, and
            partner legs. For now, use{" "}
            <Link href="/dashboard/trips" className="font-semibold text-[#00d7c4] hover:underline">
              All trips
            </Link>{" "}
            and filter by <span className="text-white/70">Inter state</span> in the service line column.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
