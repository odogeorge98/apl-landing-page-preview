"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MainLayout } from "@/components/layout/dashboard";
import { useFeesList, useUpdateFee } from "@/lib/hooks/fees/use-fees";
import type { FeeItem } from "@/lib/interfaces/fees";
import { cn } from "@/lib/utils";
import { Car, Coins, Plus, Wallet, Zap } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ngn = new Intl.NumberFormat("en-NG", {
  style:                "currency",
  currency:             "NGN",
  maximumFractionDigits: 0,
});

function toNumber(val: string): number {
  return parseFloat(val) || 0;
}

const cardBase =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

const inputCls =
  "w-full min-w-0 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white tabular-nums outline-none transition focus:border-white/[0.18] focus:ring-1 focus:ring-white/20";

const CAR_TYPE_CFG: Record<string, { label: string; cls: string }> = {
  PUBLIC:  { label: "Public",  cls: "bg-sky-500/15 text-sky-300"          },
  PRIVATE: { label: "Private", cls: "bg-[#8247E5]/20 text-[#c084fc]" },
};

// ─── FeeCard ─────────────────────────────────────────────────────────────────

interface LocalFee {
  baseFee:         string;
  piBaseFee:       string;
  peppCoinBaseFee: string;
}

function isDirty(original: FeeItem, local: LocalFee): boolean {
  return (
    toNumber(local.baseFee)         !== toNumber(original.baseFee)         ||
    toNumber(local.piBaseFee)       !== toNumber(original.piBaseFee)       ||
    toNumber(local.peppCoinBaseFee) !== toNumber(original.peppCoinBaseFee)
  );
}

function FeeCard({
  fee,
  saving,
  onSave,
}: {
  fee:    FeeItem;
  saving: boolean;
  onSave: (id: string, baseFee: number, piBaseFee: number, peppCoinBaseFee: number) => void;
}) {
  const [local, setLocal] = useState<LocalFee>({
    baseFee:         fee.baseFee,
    piBaseFee:       fee.piBaseFee,
    peppCoinBaseFee: fee.peppCoinBaseFee,
  });

  // Keep local in sync when server data refreshes after a save
  useEffect(() => {
    setLocal({
      baseFee:         fee.baseFee,
      piBaseFee:       fee.piBaseFee,
      peppCoinBaseFee: fee.peppCoinBaseFee,
    });
  }, [fee.baseFee, fee.piBaseFee, fee.peppCoinBaseFee]);

  const dirty = isDirty(fee, local);

  const patch = (field: keyof LocalFee, raw: string) => {
    const num = raw.replace(/[^0-9.]/g, "");
    setLocal((prev) => ({ ...prev, [field]: num }));
  };

  const handleSave = () => {
    onSave(
      fee.id,
      toNumber(local.baseFee),
      toNumber(local.piBaseFee),
      toNumber(local.peppCoinBaseFee),
    );
  };

  const typeCfg = CAR_TYPE_CFG[fee.carType] ?? CAR_TYPE_CFG.PUBLIC;

  return (
    <div className={cn(cardBase, "overflow-hidden")}>
      {/* Vehicle image + header */}
      <div className="flex items-start gap-4 border-b border-white/[0.06] p-5">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.05]">
          {fee.vehicleImage ? (
            <Image
              src={fee.vehicleImage}
              alt={fee.className}
              width={64}
              height={64}
              className="object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <Car className="size-7 text-white/20" strokeWidth={1.5} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-white">{fee.className}</h3>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", typeCfg.cls)}>
              {typeCfg.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-white/45">{fee.description}</p>
          <p className="mt-1 text-[11px] text-white/30">
            {fee.vehicleSeaters} seats
          </p>
        </div>
      </div>

      {/* Fee inputs */}
      <div className="space-y-4 p-5">
        {(
          [
            {
              field:  "baseFee" as const,
              label:  "Base fare",
              icon:   Wallet,
              hint:   "Standard ride rate",
            },
            {
              field:  "piBaseFee" as const,
              label:  "PI base fare",
              icon:   Zap,
              hint:   "PeppInsurance rate",
            },
            {
              field:  "peppCoinBaseFee" as const,
              label:  "PeppCoin base fare",
              icon:   Coins,
              hint:   "PeppCoin payment rate",
            },
          ] as const
        ).map(({ field, label, icon: Icon, hint }) => (
          <div key={field}>
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-white/50">
              <Icon className="size-3.5" strokeWidth={1.75} />
              {label}
              <span className="ml-auto text-white/25">{hint}</span>
            </label>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/35">
                  ₦
                </span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={local[field]}
                  onChange={(e) => patch(field, e.target.value)}
                  className={cn(inputCls, "pl-7")}
                  aria-label={`${label} for ${fee.className}`}
                />
              </div>
              <span className="shrink-0 text-xs tabular-nums text-white/30">
                {ngn.format(toNumber(local[field]))}
              </span>
            </div>
          </div>
        ))}

        {/* Save button — only active when values have changed */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className={cn(
            "mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition",
            dirty && !saving
              ? "bg-[#8247E5] text-white hover:bg-[#7c3aed]"
              : "cursor-not-allowed bg-white/[0.05] text-white/25",
          )}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
              Saving…
            </span>
          ) : dirty ? (
            "Save changes"
          ) : (
            "No changes"
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FeeSkeleton() {
  return (
    <div className={cn(cardBase, "animate-pulse overflow-hidden")}>
      <div className="flex items-start gap-4 border-b border-white/[0.06] p-5">
        <div className="size-16 rounded-xl bg-white/[0.06]" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-28 rounded bg-white/10" />
          <div className="h-3 w-48 rounded bg-white/[0.07]" />
        </div>
      </div>
      <div className="space-y-4 p-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-24 rounded bg-white/[0.07]" />
            <div className="h-9 rounded-lg bg-white/[0.05]" />
          </div>
        ))}
        <div className="mt-2 h-10 rounded-xl bg-white/[0.05]" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RideClassFeesPage() {
  const { data: feesData, isLoading, isError } = useFeesList();
  const updateMutation = useUpdateFee();

  // Track which fee ID is currently being saved
  const savingId = updateMutation.isPending
    ? (updateMutation.variables as { id: string } | undefined)?.id
    : null;

  const fees = feesData?.data.items ?? [];

  const handleSave = (
    id:              string,
    baseFee:         number,
    piBaseFee:       number,
    peppCoinBaseFee: number,
  ) => {
    updateMutation.mutate({ id, payload: { baseFee, piBaseFee, peppCoinBaseFee } });
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-[1600px] space-y-8 pb-10">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-white/40">Settings</p>
            <h1 className="mt-1 flex flex-wrap items-center gap-2.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/[0.08] text-white/90">
                <Car className="size-5" strokeWidth={1.75} />
              </span>
              Ride class fees
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/45">
              Configure base fares per ride class. Each class saves independently — click
              <strong className="text-white/60"> Save changes</strong> on the card you've edited.
            </p>
          </div>

          {/* Create fee — inactive placeholder */}
          <button
            type="button"
            disabled
            title="Coming soon"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/30"
          >
            <Plus className="size-4" strokeWidth={2} />
            New ride class
          </button>
        </div>

        {/* Error state */}
        {isError && (
          <div className={cn(cardBase, "flex flex-col items-center gap-3 p-10 text-center")}>
            <p className="text-sm text-red-400">Failed to load ride class fees.</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <FeeSkeleton key={i} />)
            : fees.map((fee) => (
                <FeeCard
                  key={fee.id}
                  fee={fee}
                  saving={savingId === fee.id}
                  onSave={handleSave}
                />
              ))}
        </div>

        {/* Empty state */}
        {!isLoading && !isError && fees.length === 0 && (
          <div className={cn(cardBase, "flex flex-col items-center gap-3 p-10 text-center")}>
            <Car className="size-8 text-white/20" strokeWidth={1.5} />
            <p className="text-sm text-white/40">No ride classes configured yet.</p>
          </div>
        )}

        <p className="text-xs text-white/25">
          {!isLoading && fees.length > 0 && `${fees.length} ride class${fees.length !== 1 ? "es" : ""} · Changes are saved per class`}
        </p>
      </div>
    </MainLayout>
  );
}