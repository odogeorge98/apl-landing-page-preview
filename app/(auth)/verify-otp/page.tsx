"use client";

import React, { useState, useCallback, Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import AuthPagesWrapper from "@/components/layout/AuthWrapper";
import { Button } from "@/components/ui/Button";
import { useVerifyOtp } from "@/lib/hooks/auth/use-verify-otp";
import { cn } from "@/lib/utils";

// ─── OTP Input ────────────────────────────────────────────────────────────────

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

function OtpInput({ value, onChange, error, disabled }: OtpInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value.replace(/\D/g, "").slice(0, 6));
  }

  return (
    <div className="flex flex-col">
      <label htmlFor="otp" className="text-sm font-medium text-white/75">
        One-Time Password
      </label>
      <div className="relative mt-1.5">
        <ShieldCheck
          className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#A995C9]"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          id="otp"
          name="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          maxLength={6}
          aria-describedby={error ? "otp-error" : undefined}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full rounded-xl border py-3 pl-11 pr-3 transition-colors",
            "auth-form-input-transparent appearance-none",
            "bg-transparent text-white placeholder:text-white/35",
            "focus:outline-none focus:ring-2",
            "tracking-[0.35em] font-mono text-sm",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-red-500 focus:ring-red-500/40"
              : "border-white/[0.12] focus:ring-white/12 focus:border-white/22",
          )}
        />
      </div>
      {error && (
        <p id="otp-error" className="mt-1.5 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Core component ───────────────────────────────────────────────────────────

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>(undefined);

  const {
    mutate: submitOtp,
    isPending,
    error: mutationError,
    maskedEmail,
    sessionStatus,
    reset: resetMutation,
  } = useVerifyOtp();

  const handleOtpChange = useCallback(
    (value: string) => {
      setOtp(value);
      if (otpError) setOtpError(undefined);
      // Clear the previous server error once the user starts correcting the code
      if (mutationError) resetMutation();
    },
    [otpError, mutationError, resetMutation],
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }
    submitOtp(otp, {
      onError: () => {
        // Refocus the input after a failed attempt so the user can retype
        // without clicking back into the field.
        document.getElementById("otp")?.focus();
      },
    });
  }

  function handleBack() {
    // otpSession.clear() is intentionally NOT called here — if the user goes
    // back to fix their credentials and re-submits, a new session is written.
    // The old one will expire naturally via its TTL.
    window.history.back();
  }

  // Session is being validated or redirect is in flight — render nothing to
  // prevent a visible flash of the form before navigation occurs.
  if (sessionStatus === "checking" || sessionStatus === "invalid") {
    return null;
  }

  return (
    <AuthPagesWrapper>
      <div className="space-y-2 text-left">
        <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight text-white">
          Check your email
        </h1>
        <p className="max-w-md text-[15px] leading-relaxed text-white/55 md:text-base">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-white/80">{maskedEmail}</span>.
          Enter it below to continue.
        </p>
      </div>

      <form
        className="mt-8 md:mt-10 space-y-5"
        onSubmit={handleSubmit}
        noValidate
      >
        <OtpInput
          value={otp}
          onChange={handleOtpChange}
          error={otpError}
          disabled={isPending}
        />

        {mutationError && (
          <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {mutationError.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending || otp.length !== 6}
          className="w-full h-auto py-3.5 mt-2 cursor-pointer rounded-xl font-semibold bg-[#8A4AF3] hover:bg-[#7a3fe0] shadow-lg shadow-[#8A4AF3]/20 disabled:cursor-not-allowed disabled:opacity-70"
          size="lg"
        >
          {isPending ? "Verifying…" : "Verify Code"}
        </Button>

        <button
          type="button"
          onClick={handleBack}
          className="w-full py-3 text-sm font-medium text-white/50 transition hover:text-white/80"
        >
          ← Back to login
        </button>
      </form>
    </AuthPagesWrapper>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="login-page-landing min-h-[100dvh] w-full flex items-center justify-center text-white/60">
          Loading…
        </div>
      }
    >
      <VerifyOtp />
    </Suspense>
  );
}