"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminOnboarding } from "@/lib/hooks/admin/use-admin";

// ─── Password requirements ─────────────────────────────────────────────────────

const REQUIREMENTS = [
  {
    id:    "length",
    label: "At least 8 characters",
    test:  (p: string) => p.length >= 8,
  },
  {
    id:    "upper",
    label: "One uppercase letter",
    test:  (p: string) => /[A-Z]/.test(p),
  },
  {
    id:    "number",
    label: "One number",
    test:  (p: string) => /\d/.test(p),
  },
  {
    id:    "special",
    label: "One special character",
    test:  (p: string) => /[^A-Za-z0-9]/.test(p),
  },
] as const;

// ─── Input field ──────────────────────────────────────────────────────────────

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-white/60">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
          <Lock className="size-4" strokeWidth={1.75} />
        </span>
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={id === "password" ? "new-password" : "new-password"}
          className={cn(
            "w-full rounded-xl border bg-white/[0.05] py-3 pl-10 pr-11 text-sm text-white",
            "placeholder:text-white/25 outline-none transition",
            "focus:ring-2 focus:ring-[#8247E5]/40",
            error
              ? "border-red-500/50 focus:ring-red-500/30"
              : "border-white/[0.1] hover:border-white/[0.15]",
          )}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white/70"
        >
          {visible ? (
            <EyeOff className="size-4" strokeWidth={1.75} />
          ) : (
            <Eye className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function AdminOnboardingClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [submitted,       setSubmitted]       = useState(false);
  const [successMessage,  setSuccessMessage]  = useState("");

  // ── Password requirement checks ────────────────────────────────────────────
  const reqResults = useMemo(
    () => REQUIREMENTS.map((r) => ({ ...r, met: r.test(password) })),
    [password],
  );
  const allRequirementsMet = reqResults.every((r) => r.met);

  const passwordStrength = reqResults.filter((r) => r.met).length;
  const strengthColor =
    passwordStrength <= 1
      ? "bg-red-500"
      : passwordStrength === 2
        ? "bg-amber-500"
        : passwordStrength === 3
          ? "bg-yellow-400"
          : "bg-emerald-400";

  // ── Validation ─────────────────────────────────────────────────────────────
  const confirmError =
    submitted && confirmPassword && password !== confirmPassword
      ? "Passwords do not match"
      : undefined;

  // ── Mutation ───────────────────────────────────────────────────────────────
  const { mutate, isPending, isError, error } = useAdminOnboarding({
    onSuccess: (msg) => {
      setSuccessMessage(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!allRequirementsMet)      return;
    if (password !== confirmPassword) return;

    mutate({ token, password });
  };

  // ── No token state ─────────────────────────────────────────────────────────
  if (!token) {
    return (
      <PageShell>
        <div className={card}>
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-red-500/15">
              <X className="size-7 text-red-400" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Invalid invitation link
              </h2>
              <p className="mt-1.5 text-sm text-white/50">
                This link is missing a valid token. Please check your email and
                use the original invitation link.
              </p>
            </div>
            <p className="text-xs text-white/35">
              Need help?{" "}
              <a
                href="mailto:support@peppcruise.com"
                className="text-[#00d7c4] underline-offset-4 hover:underline"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (successMessage) {
    return (
      <PageShell>
        <div className={card}>
          <div className="flex flex-col items-center gap-5 py-2 text-center">
            {/* Animated check circle */}
            <div className="relative flex size-16 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/20" />
              <span className="relative flex size-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
                <CheckCircle2
                  className="size-8 text-emerald-400"
                  strokeWidth={1.75}
                />
              </span>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Account setup complete!
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {successMessage}
              </p>
            </div>

            <Link
              href="/"
              className="mt-1 inline-flex items-center gap-2 rounded-xl bg-[#8247E5] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8247E5]/25 transition hover:bg-[#7c3aed]"
            >
              Go to Login
              <ArrowRight className="size-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Form state ─────────────────────────────────────────────────────────────
  return (
    <PageShell>
      <div className={card}>
        {/* Icon */}
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#8247E5]/20">
          <ShieldCheck className="size-6 text-[#c084fc]" strokeWidth={1.75} />
        </div>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Complete your setup
          </h1>
          <p className="text-sm leading-relaxed text-white/50">
            You've been invited to join the PEPP Cruise admin portal. Set a
            secure password to activate your account.
          </p>
        </div>

        {/* API error banner */}
        {isError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <AlertCircle
              className="mt-0.5 size-4 shrink-0 text-red-400"
              strokeWidth={1.75}
            />
            <p className="text-sm leading-relaxed text-red-300">
              {(error as Error)?.message ||
                "Something went wrong. The link may have expired."}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            id="password"
            label="New password"
            value={password}
            onChange={setPassword}
            placeholder="Create a strong password"
            visible={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            error={
              submitted && !allRequirementsMet && password.length > 0
                ? "Password does not meet all requirements"
                : undefined
            }
          />

          {/* Strength bar — only shown when the user has typed */}
          {password.length > 0 && (
            <div className="space-y-2">
              {/* Bar */}
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      passwordStrength >= step
                        ? strengthColor
                        : "bg-white/[0.08]",
                    )}
                  />
                ))}
              </div>

              {/* Requirement checklist */}
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {reqResults.map((r) => (
                  <li
                    key={r.id}
                    className={cn(
                      "flex items-center gap-1.5 text-xs transition-colors",
                      r.met ? "text-emerald-400" : "text-white/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-3.5 shrink-0 items-center justify-center rounded-full",
                        r.met
                          ? "bg-emerald-500/20"
                          : "bg-white/[0.06]",
                      )}
                    >
                      {r.met ? (
                        <Check className="size-2.5" strokeWidth={3} />
                      ) : (
                        <span className="size-1 rounded-full bg-white/20" />
                      )}
                    </span>
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <PasswordInput
            id="confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter your password"
            visible={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            error={confirmError}
          />

          {/* Confirm match indicator */}
          {confirmPassword.length > 0 && password.length > 0 && !confirmError && (
            <p
              className={cn(
                "flex items-center gap-1.5 text-xs",
                password === confirmPassword
                  ? "text-emerald-400"
                  : "text-white/30",
              )}
            >
              <Check className="size-3.5" strokeWidth={3} />
              Passwords match
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "mt-2 flex w-full items-center justify-center gap-2",
              "rounded-xl bg-[#8247E5] px-5 py-3.5 text-sm font-semibold text-white",
              "shadow-lg shadow-[#8247E5]/20 transition",
              "hover:bg-[#7c3aed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8247E5]/50",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {isPending ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Setting up account…
              </>
            ) : (
              <>
                Complete account setup
                <ArrowRight className="size-4" strokeWidth={2} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-white/30">
          Already have an account?{" "}
          <Link
            href="/"
            className="font-medium text-[#00d7c4] underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </PageShell>
  );
}

// ─── Layout sub-components ────────────────────────────────────────────────────

const card =
  "flex w-full flex-col gap-5 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)] sm:p-8";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#0a0812] px-4 py-10">
      {/* Subtle ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#8247E5]/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#00d7c4]/5 blur-[100px]"
      />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center gap-6">
        {/* Brand mark */}
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/peppcruise-mark.svg"
            alt="PEPP Cruise"
            width={40}
            height={40}
            priority
          />
          <span className="text-sm font-semibold tracking-wide text-white/70">
            PEPP Cruise Admin
          </span>
        </div>

        {children}

        <p className="text-center text-xs text-white/20">
          © {new Date().getFullYear()} PEPP Cruise. All rights reserved.
        </p>
      </div>
    </div>
  );
}