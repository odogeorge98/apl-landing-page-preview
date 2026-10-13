
"use client";

import React, { useState, type FormEvent } from "react";
import Link from "next/link";
import { useLogin } from "@/lib/hooks/auth/use-login";

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5C542] shadow-lg shadow-black/10 ${className}`}
      aria-hidden="true"
    >
      <img 
        src="/ni-logo.svg" 
        alt="" 
        className="h-7 w-7 object-contain"
      />
    </div>
  );
}


function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path
        d="m4 7 8 6 8-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        strokeLinecap="round"
      />
      <path d="M12 14v3" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"
        strokeLinecap="round"
      />
      <path
        d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.2 9.5 6.1a1.8 1.8 0 0 1 0 1.8 13.6 13.6 0 0 1-3.2 3.7M6.2 6.2a14 14 0 0 0-3.7 4.9 1.8 1.8 0 0 0 0 1.8C3.5 14.8 7 19 12 19a10 10 0 0 0 3-.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
      aria-hidden="true"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [validationError, setValidationError] = useState("");

  const { mutate: submitLogin, isPending } = useLogin();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setValidationError(
        "Please enter both your email address and password.",
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    submitLogin({
      email: normalizedEmail,
      password,
      rememberMe,
    });
  }

  return (
    <main className="min-h-[100dvh] bg-[#F6F8FC] text-[#101D49]">
      <div className="grid min-h-[100dvh] lg:grid-cols-[1.04fr_0.96fr]">
        {/* =====================================================
            BRAND / WELCOME PANEL
        ====================================================== */}
        <section className="relative isolate hidden overflow-hidden bg-[#101D49] lg:flex lg:flex-col lg:justify-between">
          {/* Decorative background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute -left-44 -top-40 h-[470px] w-[470px] rounded-full border border-white/[0.07]" />
            <div className="absolute -left-28 -top-24 h-[340px] w-[340px] rounded-full border border-white/[0.08]" />
            <div className="absolute -right-36 top-[27%] h-[420px] w-[420px] rounded-full bg-[#1C3474]/45 blur-[90px]" />
            <div className="absolute -bottom-48 -left-16 h-[430px] w-[430px] rounded-full bg-[#F5C542]/[0.07] blur-[90px]" />

            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "radial-gradient(#FFFFFF 0.7px, transparent 0.7px)",
                backgroundSize: "25px 25px",
                maskImage:
                  "linear-gradient(to bottom, black, transparent 85%)",
              }}
            />
          </div>

          {/* Brand header */}
          <header className="relative z-10 flex items-center gap-3 px-12 pb-6 pt-10 xl:px-16 xl:pt-12">
            <BrandMark />
            <div>
              <p className="text-[19px] font-bold tracking-[-0.04em] text-white">
                NUGI <span className="text-[#F5C542]">INNOVATIONS</span>
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.19em] text-blue-200/75">
                Enterprise Tech Programmes
              </p>
            </div>
          </header>

          {/* Main brand message */}
          <div className="relative z-10 mx-auto w-full max-w-[660px] px-12 py-10 xl:px-16">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#F5C542]/25 bg-[#F5C542]/[0.08] px-3.5 py-2 text-xs font-medium text-[#F8D978]">
              <SparkleIcon />
              Your next chapter starts here
            </div>

            <h1 className="max-w-[600px] text-5xl font-semibold leading-[1.13] tracking-[-0.055em] text-white xl:text-[64px]">
              Build skills.
              <br />
              <span className="text-[#F5C542]">Shape the future.</span>
            </h1>

            <p className="mt-6 max-w-[460px] text-[16px] leading-8 text-blue-100/75 xl:text-[17px]">
              Welcome to your learning and training hub. Access your
              programmes, track your progress, and turn your ambition
              into practical technology skills.
            </p>

            {/* Feature cards */}
            <div className="mt-10 grid max-w-[530px] grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.10] bg-white/[0.045] p-4 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5C542]/[0.13] text-[#F5C542]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      d="m12 3 9 5-9 5-9-5 9-5Z"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m5 11 7 4 7-4M5 15l7 4 7-4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-white">
                  Practical learning
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-100/60">
                  Develop skills through hands-on training.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.10] bg-white/[0.045] p-4 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5C542]/[0.13] text-[#F5C542]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="5" />
                    <path
                      d="m8.5 12-1 9 4.5-2.5 4.5 2.5-1-9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-white">
                  Career development
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-100/60">
                  Prepare for opportunities in technology.
                </p>
              </div>
            </div>

            {/* Decorative learning card */}
            <div className="mt-7 flex max-w-[530px] items-center gap-4 rounded-2xl border border-white/[0.10] bg-gradient-to-r from-white/[0.075] to-white/[0.025] p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5C542] text-[#101D49]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    d="m8 5-5 7 5 7M16 5l5 7-5 7M14 3l-4 18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  Learn. Build. Innovate.
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-100/65">
                  Take the next step in your technology journey.
                </p>
              </div>
              <div className="hidden shrink-0 text-[#F5C542] sm:block">
                <ArrowIcon />
              </div>
            </div>
          </div>

          {/* Brand footer */}
          <footer className="relative z-10 flex items-center justify-between gap-4 px-12 pb-8 pt-5 xl:px-16">
            <p className="text-xs text-blue-100/50">
              © {new Date().getFullYear()} Nugi Innovations
            </p>
            <p className="text-xs text-blue-100/50">
              Learn with purpose.
            </p>
          </footer>
        </section>

        {/* =====================================================
            LOGIN PANEL
        ====================================================== */}
        <section className="relative flex min-h-[100dvh] flex-col bg-[#F6F8FC]">
          {/* Mobile-only brand header */}
          <header className="flex items-center gap-3 px-6 pb-6 pt-7 sm:px-10 sm:pt-9 lg:hidden">
            <BrandMark />
            <div>
              <p className="text-base font-bold tracking-[-0.035em] text-[#101D49]">
                NUGI <span className="text-[#C49313]">INNOVATIONS</span>
              </p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Enterprise Tech Programmes
              </p>
            </div>
          </header>

          {/* Form container */}
          <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10 lg:px-12 xl:px-16">
            <div className="w-full max-w-[440px]">
              {/* Welcome copy */}
              <div className="mb-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#DCE4F2] bg-white px-3 py-1.5 text-xs font-medium text-[#405681] shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#E8B72D]" />
                  Your portal, all in one place
                </div>

                <h2 className="text-[34px] font-semibold leading-tight tracking-[-0.045em] text-[#101D49] sm:text-[40px]">
                  Welcome back<span className="text-[#D5A51F]">.</span>
                </h2>

                <p className="mt-3 max-w-[370px] text-sm leading-6 text-slate-500 sm:text-[15px]">
                  Sign in to access your courses, learning resources,
                  and training dashboard.
                </p>
              </div>

              {/* Form card */}
              <div className="rounded-2xl border border-[#E6EAF2] bg-white p-5 shadow-[0_18px_60px_-30px_rgba(16,29,73,0.22)] sm:p-8">
                <div className="mb-7">
                  <h3 className="text-lg font-semibold tracking-tight text-[#101D49]">
                    Sign in to your account
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Enter your registered account details below.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-5"
                >
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[13px] font-semibold text-[#263654]"
                    >
                      Email address
                    </label>

                    <div className="group relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors group-focus-within:text-[#24478E]">
                        <MailIcon />
                      </span>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setValidationError("");
                        }}
                        disabled={isPending}
                        required
                        aria-invalid={Boolean(validationError)}
                        aria-describedby={
                          validationError ? "login-error" : undefined
                        }
                        className="h-[52px] w-full rounded-xl border border-[#DDE3EE] bg-[#FBFCFE] pl-11 pr-4 text-sm text-[#101D49] outline-none transition placeholder:text-slate-400 hover:border-[#B8C6DE] focus:border-[#284B92] focus:bg-white focus:ring-4 focus:ring-[#284B92]/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label
                        htmlFor="password"
                        className="block text-[13px] font-semibold text-[#263654]"
                      >
                        Password
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-[#24478E] transition hover:text-[#C49313] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24478E] focus-visible:ring-offset-2"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="group relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors group-focus-within:text-[#24478E]">
                        <LockIcon />
                      </span>

                      <input
                        id="password"
                        name="password"
                        type={passwordVisible ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setValidationError("");
                        }}
                        disabled={isPending}
                        required
                        aria-invalid={Boolean(validationError)}
                        aria-describedby={
                          validationError ? "login-error" : undefined
                        }
                        className="h-[52px] w-full rounded-xl border border-[#DDE3EE] bg-[#FBFCFE] pl-11 pr-12 text-sm text-[#101D49] outline-none transition placeholder:text-slate-400 hover:border-[#B8C6DE] focus:border-[#284B92] focus:bg-white focus:ring-4 focus:ring-[#284B92]/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setPasswordVisible((previous) => !previous)
                        }
                        disabled={isPending}
                        aria-label={
                          passwordVisible ? "Hide password" : "Show password"
                        }
                        aria-pressed={passwordVisible}
                        className="absolute inset-y-0 right-0 flex items-center justify-center px-3.5 text-slate-400 transition hover:text-[#24478E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#24478E] disabled:cursor-not-allowed"
                      >
                        <EyeIcon visible={passwordVisible} />
                      </button>
                    </div>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center pt-0.5">
                    <label className="inline-flex cursor-pointer select-none items-center gap-2.5 text-[13px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(event.target.checked)
                        }
                        disabled={isPending}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#24478E] focus:ring-2 focus:ring-[#24478E]/30 focus:ring-offset-2 disabled:cursor-not-allowed"
                      />
                      Keep me signed in
                    </label>
                  </div>

                  {/* Client-side validation */}
                  {validationError && (
                    <div
                      id="login-error"
                      role="alert"
                      aria-live="polite"
                      className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path
                          d="M12 8v5m0 3h.01"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p>{validationError}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="group relative flex h-[53px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#F5C542] px-5 text-sm font-bold text-[#101D49] shadow-[0_5px_14px_-5px_rgba(197,148,25,0.55)] transition duration-200 hover:bg-[#F8D15B] hover:shadow-[0_8px_22px_-7px_rgba(197,148,25,0.65)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9AA28]/35 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65 disabled:shadow-none"
                  >
                    {isPending ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeOpacity=".25"
                            strokeWidth="3"
                          />
                          <path
                            d="M21 12a9 9 0 0 0-9-9"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        Signing you in...
                      </>
                    ) : (
                      <>
                        Sign in to your account
                        <ArrowIcon />
                      </>
                    )}
                  </button>
                </form>

                {/* Access note */}
                <div className="mt-6 flex items-start gap-3 border-t border-[#EDF0F6] pt-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EDF2FC] text-[#24478E]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-4.5 w-4.5"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"
                        strokeLinejoin="round"
                      />
                      <path
                        d="m9 12 2 2 4-4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#263654]">
                      Secure portal access
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your account permissions determine which learning
                      and administration features you can access.
                    </p>
                  </div>
                </div>
              </div>

              {/* Help text */}
              <p className="mt-6 text-center text-xs leading-5 text-slate-500">
                Having trouble signing in?{" "}
                <Link
                  href="/forgot-password"
                  className="font-semibold text-[#24478E] underline-offset-4 transition hover:text-[#B78A14] hover:underline"
                >
                  Reset your password
                </Link>
              </p>
            </div>
          </div>

          {/* Mobile footer */}
          <footer className="flex items-center justify-center border-t border-[#E7EBF3] px-6 py-5 lg:hidden">
            <p className="text-center text-xs text-slate-500">
              © {new Date().getFullYear()} Nugi Innovations. All rights
              reserved.
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <LoginPageContent />;
}
