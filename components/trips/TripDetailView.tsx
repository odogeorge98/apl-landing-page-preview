"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Car,
  Clock,
  CreditCard,
  MapPin,
  Navigation,
  Route,
  User,
  Users,
} from "lucide-react";
import type { TripDetail } from "@/lib/data/trips-mock";
import { getTripDetail } from "@/lib/data/trips-mock";
import { cn } from "@/lib/utils";

const cardBase =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

function StatusHeaderPill({ status }: { status: TripDetail["status"] }) {
  const styles = {
    Active: "bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/20",
    Canceled: "bg-white/10 text-white/55 ring-1 ring-white/10",
    Completed: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20",
  };
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", styles[status])}>
      {status}
    </span>
  );
}

function PaymentPill({ status }: { status: TripDetail["paymentStatus"] }) {
  const map = {
    Paid: "bg-emerald-500/12 text-emerald-300",
    Pending: "bg-amber-500/15 text-amber-200",
    Refunded: "bg-sky-500/12 text-sky-200",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", map[status])}>
      {status}
    </span>
  );
}

export default function TripDetailView({ tripRowId }: { tripRowId: string }) {
  const trip: TripDetail | null = tripRowId ? getTripDetail(tripRowId) : null;

  if (!trip) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6">
        <Link
          href="/dashboard/trips"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#00d7c4] hover:text-[#5eead4]"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Back to trips
        </Link>
        <div className={cn(cardBase, "p-10 text-center")}>
          <p className="text-white/55">Trip not found.</p>
          <p className="mt-2 text-sm text-white/35">Check the link or return to the trips list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Link
            href="/dashboard/trips"
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#00d7c4] transition hover:text-[#5eead4]"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            Back to trips
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Trip{" "}
              <span className="font-mono text-[#c4b5fd] tabular-nums">{trip.tripId}</span>
            </h1>
            <StatusHeaderPill status={trip.status} />
          </div>
          <p className="text-sm text-white/45">
            {trip.tripType} · {trip.regionLabel} · {trip.dateTime}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">Fare</p>
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-white">{trip.fare}</p>
          <div className="flex items-center gap-2">
            <PaymentPill status={trip.paymentStatus} />
            <span className="text-xs text-white/45">{trip.paymentMethod}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
        <div className="space-y-5 lg:col-span-7">
          <section className={cn(cardBase, "overflow-hidden")}>
            <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Navigation className="size-4 text-[#a855f7]" strokeWidth={1.75} />
                Route
              </h2>
            </div>
            <div className="space-y-0 divide-y divide-white/[0.06]">
              <div className="flex gap-4 px-5 py-4 sm:px-6">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <MapPin className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                    Pickup
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/90">{trip.pickupAddress}</p>
                </div>
              </div>
              <div className="flex gap-4 px-5 py-4 sm:px-6">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
                  <MapPin className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                    Drop-off
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/90">{trip.dropoffAddress}</p>
                </div>
              </div>
            </div>
          </section>

          <section className={cn(cardBase, "p-5 sm:p-6")}>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Clock className="size-4 text-[#a855f7]" strokeWidth={1.75} />
              Trip timeline
            </h2>
            <ol className="mt-6 space-y-6">
              {trip.timeline.map((ev, idx) => {
                const last = idx === trip.timeline.length - 1;
                return (
                  <li key={ev.id} className="flex gap-4">
                    <div className="flex w-4 shrink-0 flex-col items-center pt-1">
                      <span
                        className={cn(
                          "size-3 rounded-full ring-2 ring-[#14101f]",
                          ev.done ? "bg-emerald-400" : "bg-white/30",
                        )}
                      />
                      {!last ? (
                        <span className="mt-2 min-h-[2.5rem] w-px flex-1 bg-gradient-to-b from-white/15 to-transparent" />
                      ) : null}
                    </div>
                    <div className="min-w-0 pb-1">
                      <p className="text-sm font-semibold text-white">{ev.title}</p>
                      <p className="mt-0.5 text-xs tabular-nums text-white/45">{ev.at}</p>
                      {ev.description ? (
                        <p className="mt-2 text-xs leading-relaxed text-white/50">{ev.description}</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <div className="space-y-5 lg:col-span-5">
          <section className={cn(cardBase, "p-5 sm:p-6")}>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Route className="size-4 text-[#a855f7]" strokeWidth={1.75} />
              Summary
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/[0.03] px-4 py-3">
                <dt className="text-[11px] font-medium text-white/40">Distance</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-white">
                  {trip.distanceKm} km
                </dd>
              </div>
              <div className="rounded-xl bg-white/[0.03] px-4 py-3">
                <dt className="text-[11px] font-medium text-white/40">Duration</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-white">
                  {trip.durationMins} min
                </dd>
              </div>
              <div className="rounded-xl bg-white/[0.03] px-4 py-3 sm:col-span-2">
                <dt className="text-[11px] font-medium text-white/40">Trip type</dt>
                <dd className="mt-1 text-sm font-medium text-white">{trip.tripType}</dd>
              </div>
            </dl>
          </section>

          <section className={cn(cardBase, "overflow-hidden")}>
            <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Users className="size-4 text-[#a855f7]" strokeWidth={1.75} />
                People
              </h2>
            </div>
            <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2">
              <div className="bg-[#1a1628]/90 p-5 sm:p-6">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  <User className="size-3.5" strokeWidth={1.75} />
                  Passenger
                </p>
                <p className="mt-3 font-semibold text-white">{trip.passenger.name}</p>
                <p className="mt-1 break-all text-xs text-white/50">{trip.passenger.email}</p>
              </div>
              <div className="bg-[#1a1628]/90 p-5 sm:p-6">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  <User className="size-3.5" strokeWidth={1.75} />
                  Driver
                </p>
                <p className="mt-3 font-semibold text-white">{trip.driver.name}</p>
                <p className="mt-1 break-all text-xs text-white/50">{trip.driver.email}</p>
              </div>
            </div>
          </section>

          <section className={cn(cardBase, "p-5 sm:p-6")}>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Car className="size-4 text-[#a855f7]" strokeWidth={1.75} />
              Vehicle
            </h2>
            <p className="mt-3 text-base font-medium text-white">{trip.vehicleLabel}</p>
            <p className="mt-1 font-mono text-sm text-white/55">{trip.plateNumber}</p>
            <div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-5">
              <CreditCard className="size-4 text-white/40" strokeWidth={1.75} />
              <div>
                <p className="text-xs text-white/40">Payment</p>
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-white">
                  <span>{trip.paymentMethod}</span>
                  <span className="text-white/25">·</span>
                  <PaymentPill status={trip.paymentStatus} />
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
