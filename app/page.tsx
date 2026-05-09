"use client";

import AuthPagesWrapper from "@/components/layout/AuthWrapper";
import { Button } from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { LoginData } from "@/lib/interfaces/auth";
import { useLogin } from "@/lib/hooks/auth/use-login";

const Login = () => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [visible, setVisible] = useState(false);

  const { email, password } = loginData;

  const { mutate: submitLogin, isPending } = useLogin();

  const handlers = {
    onChange({ target }: React.ChangeEvent<HTMLInputElement>) {
      const { name, value } = target;
      setLoginData((prev) => ({ ...prev, [name]: value }));
    },
    handleToggle() {
      setVisible((prev) => !prev);
    },
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitLogin({
      email: email.trim(),
      password,
      rememberMe,
    });
  }

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
          onSubmit={handleSubmit}
          noValidate
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
            disabled={isPending}
            className="w-full h-auto py-3.5 mt-2 cursor-pointer rounded-xl font-semibold bg-[#8A4AF3] hover:bg-[#7a3fe0] shadow-lg shadow-[#8A4AF3]/20 disabled:cursor-not-allowed disabled:opacity-70"
            size="lg"
          >
            {isPending ? "Signing in…" : "Login"}
          </Button>
        </form>
      </>
    </AuthPagesWrapper>
  );
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="login-page-landing min-h-[100dvh] w-full flex items-center justify-center text-white/60">
          Loading...
        </div>
      }
    >
      <Login />
    </Suspense>
  );
}