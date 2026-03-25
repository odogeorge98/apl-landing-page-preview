"use client";

import AuthPagesWrapper from "@/components/layout/AuthWrapper";
import { Button } from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import React, { useState, Suspense } from "react";
import * as yup from "yup";
import Link from "next/link";

import { useLogin } from "@/lib/hooks/auth/use-login";
import { LoginData } from "@/lib/interfaces/auth";
import { showValidationError } from "@/lib/utils/error-handler";

const Login = () => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  const {
    mutate: login,
    isPending: loginLoading,
  } = useLogin({
    onSuccess: (data) => {
      console.log(data);
      if (rememberMe && typeof window !== "undefined") {
        try {
          window.localStorage.setItem("peppcruise_admin_remember", "7d");
        } catch {
          /* ignore */
        }
      }
    },
  });
  const { email, password } = loginData;
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const handlers = {
    onChange({ target }: React.ChangeEvent<HTMLInputElement>) {
      const { name, value } = target;
      setLoginData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },

    async validation(payload: LoginData) {
      const schema = yup.object({
        email: yup
          .string()
          .email("Please enter a valid email address")
          .required("Email is required"),
        password: yup
          .string()
          .min(8, "Password must be at least 8 characters long")
          .matches(
            /[A-Z]/,
            "Password must contain at least one uppercase letter"
          )
          .matches(
            /[a-z]/,
            "Password must contain at least one lowercase letter"
          )
          .matches(/\d/, "Password must contain at least one number")
          .matches(
            /[!@#$%^&*(),.?":{}|<>]/,
            "Password must contain at least one special character"
          ),
      });

      return await schema.validate(payload, { abortEarly: false });
    },

    handleToggle() {
      setVisible((prev) => !prev);
    },

    async handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setErrors({});
      setLoading(true);
      try {
        await handlers.validation(loginData);
        login(loginData);
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const validationErrors: { email?: string; password?: string } = {};
          error.inner.forEach((err) => {
            if (err.path) {
              validationErrors[err.path as keyof typeof validationErrors] =
                err.message;
            }
          });
          setErrors(validationErrors);
          showValidationError(validationErrors);
        }
      } finally {
        setLoading(false);
      }
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
            error={errors.email}
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
            error={errors.password}
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
                className="size-[18px] shrink-0 rounded border border-white/25 bg-transparent accent-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/50 focus:ring-offset-0"
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
            disabled={loading || loginLoading}
            className="w-full h-auto py-3.5 mt-2 cursor-pointer rounded-xl border-0 bg-[#8247E5] font-semibold text-white shadow-lg shadow-[#8247E5]/30 hover:bg-[#7139d4]"
            size="lg"
          >
            {loading || loginLoading ? "Loading..." : "Login"}
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
