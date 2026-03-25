"use client";

import AuthPagesWrapper from "@/components/layout/AuthWrapper";
import { Button } from "@/components/ui/Button";
import Headers from "@/components/ui/Form/Headers";
import InputField from "@/components/ui/InputField";
import React, { useState, Suspense, useEffect } from "react";
import * as yup from "yup";
import { useSearchParams } from "next/navigation";
import { useOnboardAdmin } from "@/lib/hooks/auth/use-onboard-admin";
import { AdminOnboardingData } from "@/lib/interfaces/auth";
import { showValidationError } from "@/lib/utils/error-handler";

const AdminOnboard = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [onboardData, setOnboardData] = useState<AdminOnboardingData>({
    token: token,
    email: "",
    password: "",
    confirmPassword: "",
  });

  const {
    mutate: onboard,
    isPending: onboardLoading,
    error: onboardError,
  } = useOnboardAdmin();

  const { email, password, confirmPassword } = onboardData;
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    // Update token from URL params if it changes
    if (token) {
      setOnboardData((prev) => ({ ...prev, token }));
    }
  }, [token]);

  const handlers = {
    onChange({ target }: React.ChangeEvent<HTMLInputElement>) {
      const { name, value } = target;
      setOnboardData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },

    async validation(payload: AdminOnboardingData) {
      const schema = yup.object({
        token: yup.string().required("Token is required"),
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
          )
          .required("Password is required"),
        confirmPassword: yup
          .string()
          .oneOf([yup.ref("password")], "Passwords must match")
          .required("Please confirm your password"),
      });

      return await schema.validate(payload, { abortEarly: false });
    },

    handleToggle(field?: string) {
      if (field === "password") {
        setVisible((prev) => !prev);
      } else if (field === "confirmPassword") {
        setConfirmVisible((prev) => !prev);
      }
    },

    async handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setErrors({});
      try {
        // Validation
        await handlers.validation(onboardData);
        setLoading(true);

        // Call the onboard mutation
        onboard(onboardData);
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const validationErrors: {
            email?: string;
            password?: string;
            confirmPassword?: string;
          } = {};
          error.inner.forEach((err) => {
            if (err.path) {
              validationErrors[
                err.path as keyof typeof validationErrors
              ] = err.message;
            }
          });
          setErrors(validationErrors);
          // Show validation error toast
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
        <Headers
          authDark
          leadingText="Complete Your Admin Onboarding"
          subText="Please set up your admin account to get started."
        />
        <form
          className="mt-10 space-y-4"
          onSubmit={(e) => handlers.handleSubmit(e)}
        >
          <InputField
            label={"Email"}
            name={"email"}
            placeholder={"Enter your email..."}
            handlers={handlers}
            wrapperCss={"col-span-1"}
            error={errors.email}
            value={email}
            authDark
            inputIcon="mail"
          />

          <div className="relative">
            <InputField
              label={"Password"}
              name={"password"}
              placeholder={"Enter password"}
              handlers={handlers}
              wrapperCss={"col-span-1"}
              error={errors.password}
              value={password}
              visible={visible}
              authDark
              inputIcon="lock"
            />
          </div>

          <div className="relative">
            <InputField
              label={"Confirm Password"}
              name={"confirmPassword"}
              placeholder={"Confirm your password"}
              handlers={handlers}
              wrapperCss={"col-span-1"}
              error={errors.confirmPassword}
              value={confirmPassword}
              visible={confirmVisible}
              authDark
              inputIcon="lock"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || onboardLoading || !token}
            className="w-full h-auto py-3.5 mt-2 cursor-pointer rounded-xl border border-white/10 bg-[#e4e4e8] font-semibold text-[#141216] shadow-sm hover:bg-[#f0f0f3]"
            size="lg"
          >
            {loading || onboardLoading ? "Setting up account..." : "Complete Onboarding"}
          </Button>
        </form>
      </>
    </AuthPagesWrapper>
  );
};

const AdminOnboardPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminOnboard />
    </Suspense>
  );
};

export default AdminOnboardPage;
