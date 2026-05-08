"use client";

import AuthPagesWrapper from "@/components/layout/AuthWrapper";
import { Button } from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { AuthUser } from "@/lib/interfaces/auth";

import { loginUser } from "@/lib/api/auth/index";
import { LoginData } from "@/lib/interfaces/auth";
import useAuthStore from "@/lib/store/auth";
import {
  MOCK_ADMIN_USER,
  MOCK_PREVIEW_TOKEN,
} from "@/lib/dev/mock-admin-user";
import { showSuccess } from "@/lib/utils/error-handler";
import { saveOtpSession } from "@/lib/utils/auth/otp-session";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeLogin = useAuthStore((s) => s.login);

  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  const { email, password } = loginData;
  const [visible, setVisible] = useState(false);

  const handlers = {
    onChange({ target }: React.ChangeEvent<HTMLInputElement>) {
      const { name, value } = target;
      setLoginData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },

    handleToggle() {
      setVisible((prev) => !prev);
    },

    async handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      const emailTrim = loginData.email.trim();

      const response = await loginUser({
        email: emailTrim,
        password: loginData.password,
        rememberMe,
      });

      // ── OTP flow ─────────────────────────────────────────────────────────────
      if (response.requiresOtp) {
        // Store credentials temporarily so the OTP page can complete the login.
        // They are cleared immediately after use on the verify-otp page.
        saveOtpSession(emailTrim, loginData.password, rememberMe);
        router.push(`/verify-otp`);
        return;
      }

      // ── Direct login ──────────────────────────────────────────────────────────
      if (!response.token || !response.user) {
        throw new Error("Invalid login response: missing token or user");
      }
      storeLogin(response.user, response.token);
      showSuccess("Login successful!");

      if (rememberMe && typeof window !== "undefined") {
        try {
          window.localStorage.setItem("peppcruise_admin_remember", "7d");
        } catch {}
      }

      const redirectTo = searchParams.get("redirect") || "/dashboard/overview";
      router.push(redirectTo);
    },
  };

  return (
    <AuthPagesWrapper>
      <>
        <div className="space-y-2 text-left">
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight text-white">
            Admin Login
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-white/55 md:text-base">
            Sign in to manage rides, drivers, payments, and platform operations.
          </p>
        </div>
        <form
          className="mt-8 md:mt-10 space-y-5"
          onSubmit={(e) => handlers.handleSubmit(e)}
        >
          <InputField
            label="Email Address"
            name="email"
            placeholder="Enter authorised email"
            handlers={handlers}
            wrapperCss="col-span-1"
            error={undefined}
            value={email}
            authDark
            inputIcon="mail"
          />

          <InputField
            label="Password"
            name="password"
            placeholder="Input password"
            handlers={handlers}
            wrapperCss="col-span-1"
            error={undefined}
            value={password}
            visible={visible}
            authDark
            inputIcon="lock"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 -mt-1">
            <label className="inline-flex cursor-pointer select-none items-center gap-2.5 text-sm text-white/90">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-[18px] shrink-0 rounded border border-white/25 bg-transparent accent-zinc-300 focus:ring-2 focus:ring-white/20 focus:ring-offset-0"
              />
              Remember me for 7 days
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-white/70 underline-offset-4 hover:text-white hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-auto py-3.5 mt-2 cursor-pointer rounded-xl font-semibold bg-[#8A4AF3] hover:bg-[#7a3fe0] shadow-lg shadow-[#8A4AF3]/20"
            size="lg"
          >
            Login
          </Button>
        </form>
      </>
    </AuthPagesWrapper>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={<div className="login-page-landing min-h-[100dvh] w-full flex items-center justify-center text-white/60">Loading...</div>}>
      <Login />
    </Suspense>
  );
};

export default LoginPage;
