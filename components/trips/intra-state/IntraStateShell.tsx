"use client";

import { Route } from "lucide-react";

export default function IntraStateShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <p className="text-xs text-white/40">Trips · Intra state</p>
        <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#8247E5]/20 text-[#c084fc] sm:size-10">
            <Route className="size-5" strokeWidth={1.75} />
          </span>
          Intra state trips
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-white/45">
          Monitor and manage all intra-state trips across the platform.
        </p>
      </div>

      {children}
    </div>
  );
}