"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import AuthPagesWrapper from "@/components/layout/AuthWrapper";
import { Button } from "@/components/ui/Button";
import { verifyOtp } from "@/lib/api/auth";
import { otpSession } from "@/lib/utils/auth/otp-session";
import { buildDeviceName } from "@/lib/utils/auth/device-token";
import useAuthStore from "@/lib/store/auth";
import { showSuccess } from "@/lib/utils/error-handler";
import { cn } from "@/lib/utils";

// ─── OTP Input ───────────────────────────────────────────────────────────────
// Replicates the numeric-only / 6-digit behaviour from the reference OTP page
// using the exact same auth-dark visual language as the login InputField.

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

function OtpInput({ value, onChange, error, disabled }: OtpInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip anything that isn't a digit and cap at 6 characters
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
    onChange(digits);
  }

  return (
    <div className="flex flex-col">
      <label
        htmlFor="otp"
        className="text-sm font-medium text-white/75"
      >
        One-Time Password
      </label>

      <div className="relative mt-1.5">
        {/* Icon — same positioning as InputField's authDark icon */}
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
            // Base — matches InputField authDark class set exactly
            "w-full rounded-xl border py-3 pl-11 pr-3 transition-colors",
            "auth-form-input-transparent appearance-none",
            "bg-transparent text-white placeholder:text-white/35",
            "focus:outline-none focus:ring-2",
            // Tracking makes a 6-digit code easier to read
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

// ─── Masked email helper ──────────────────────────────────────────────────────
// Shows "d*****a@gmail.com" instead of the full address

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}${"*".repeat(Math.min(local.length - 2, 5))}${local[local.length - 1]}@${domain}`;
}

// ─── Core component ───────────────────────────────────────────────────────────

function VerifyOtp() {
  const router = useRouter();
  const storeLogin = useAuthStore((s) => s.login);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // Tri-state: null = still checking session, true = session ok, false = no session
  const [sessionStatus, setSessionStatus] = useState<"checking" | "valid" | "invalid">("checking");
  const [maskedEmail, setMaskedEmail] = useState("");

  // ── Session guard ─────────────────────────────────────────────────────────
  // Run once on mount — if there's no valid session the user landed here
  // directly or the session expired, so send them back to login.

  useEffect(() => {
    const session = otpSession.read();

    if (!session) {
      setSessionStatus("invalid");
      router.replace("/login");
      return;
    }

    setMaskedEmail(maskEmail(session.email));
    setSessionStatus("valid");
  }, [router]);

  // Clear inline field error whenever the user types a new digit
  const handleOtpChange = useCallback((value: string) => {
    setOtp(value);
    if (otpError) setOtpError(undefined);
    if (submitError) setSubmitError(undefined);
  }, [otpError, submitError]);

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Client-side validation
    if (otp.length !== 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }

    // Re-read session at submit time — it may have expired while the user was
    // on the page (unlikely within 5 min but handles the edge case correctly).
    const session = otpSession.read();
    if (!session) {
      setSubmitError("Your session expired. Redirecting to login…");
      setTimeout(() => router.replace("/login?reason=session_expired"), 1500);
      return;
    }

    setIsLoading(true);
    setSubmitError(undefined);

    try {
      const response = await verifyOtp({
        email: session.email,
        password: session.password,
        otp,
        rememberMe: session.rememberMe,
        deviceInfo: {
          deviceFCMToken: "",
          name: buildDeviceName(),
        },
      });

      // ── Sensitive data cleared immediately after a single use ────────────
      otpSession.clear();

      storeLogin(response.user, response.token);
      showSuccess("Login successful!");
      router.push("/dashboard/overview");
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again.",
      );
      // Keep the OTP input focused so the user can correct the code without
      // having to click back into the field manually.
      document.getElementById("otp")?.focus();
    } finally {
      setIsLoading(false);
    }
  }

  function handleBack() {
    otpSession.clear();
    router.push("/login");
  }

  // ── Render guards ─────────────────────────────────────────────────────────

  // While the session check is in-flight, render nothing to avoid a flash of
  // the form before the redirect fires.
  if (sessionStatus === "checking" || sessionStatus === "invalid") {
    return null;
  }

  // ── UI ────────────────────────────────────────────────────────────────────

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
          disabled={isLoading}
        />

        {/* Global submit error — shown below the field so it doesn't shift layout */}
        {submitError && (
          <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full h-auto py-3.5 mt-2 cursor-pointer rounded-xl font-semibold bg-[#8A4AF3] hover:bg-[#7a3fe0] shadow-lg shadow-[#8A4AF3]/20 disabled:cursor-not-allowed"
          size="lg"
        >
          {isLoading ? "Verifying…" : "Verify Code"}
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
// Wrapped in Suspense to match the login page pattern — required because
// useSearchParams (if added later) needs a Suspense boundary.

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