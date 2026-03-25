"use client";

import React, { Fragment, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import * as yup from "yup";
import { Button } from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import AuthPagesWrapper from "@/components/layout/AuthWrapper";
import Headers from "@/components/ui/Form/Headers";
import authValidations from "@/lib/validations/auth";
import { useResetPassword } from "@/lib/hooks/auth/use-reset-password";
import { showValidationError } from "@/lib/utils/error-handler";

const ResetPassword = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [resetData, setResetData] = useState({
    password: "",
    confirmPassword: "",
  });
  const { password, confirmPassword } = resetData;
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState<any>({
    password: false,
    confirmPassword: false,
  });

  const { mutate: resetPassword, isPending: resetPasswordLoading } =
    useResetPassword();

  useEffect(() => {
    if (!token) {
      // Redirect to forgot password page if no token
      window.location.href = "/forgot-password";
    }
  }, [token]);

  const handlers = {
    onChange({ target }: React.ChangeEvent<HTMLInputElement>) {
      const { name, value } = target;
      setResetData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },

    handleToggle(type?: string) {
      setVisible((prev: any) => ({
        ...prev,
        [`${type}`]: !visible[type as string],
      }));
    },

    async handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setErrors({});

      if (!token) {
        setErrors({ password: "Invalid reset token" });
        return;
      }

      try {
        // Validation
        await authValidations.resetPassword({
          token,
          password,
          confirmPassword,
        });
        setLoading(true);

        // Call the reset password mutation
        resetPassword({
          token,
          password,
          confirmPassword,
        });
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const validationErrors: {
            password?: string;
            confirmPassword?: string;
          } = {};
          error.inner.forEach((err) => {
            if (err.path) {
              validationErrors[err.path as keyof typeof validationErrors] =
                err.message;
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
      <Fragment>
        <Headers
          authDark
          leadingText="Reset your password"
          subText="Enter a new password below to regain access to your account."
          subTextClass="max-w-xs md:max-w-sm mx-auto"
        />
        <form
          className="mt-10 space-y-4"
          onSubmit={(e) => handlers.handleSubmit(e)}
        >
          <InputField
            label={"New Password"}
            name={"password"}
            placeholder={"Enter password"}
            handlers={handlers}
            wrapperCss={"col-span-1 relative"}
            error={errors.password}
            value={password}
            visible={visible.password}
            authDark
            inputIcon="lock"
          />

          <InputField
            label={"Confirm Password"}
            name={"confirmPassword"}
            placeholder={"Enter password"}
            handlers={handlers}
            wrapperCss={"col-span-1 relative"}
            error={errors.confirmPassword}
            value={confirmPassword}
            visible={visible.confirmPassword}
            authDark
            inputIcon="lock"
          />

          <Button
            type="submit"
            disabled={loading || resetPasswordLoading}
            className="w-full h-auto py-3.5 mt-5 cursor-pointer rounded-xl border border-white/10 bg-[#e4e4e8] font-semibold text-[#141216] shadow-sm hover:bg-[#f0f0f3]"
            size="lg"
          >
            {loading || resetPasswordLoading ? "Loading..." : "Reset password"}
          </Button>
        </form>
      </Fragment>
    </AuthPagesWrapper>
  );
};

export default ResetPassword;
