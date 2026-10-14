"use client";

import React, { Fragment, useState } from "react";
import * as yup from "yup";
import { Button } from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import AuthPagesWrapper from "@/components/layout/AuthWrapper";
import Headers from "@/components/ui/Form/Headers";
import authValidations from "@/lib/validations/auth";
import { useForgetPassword } from "@/lib/hooks/auth/use-forget-password";
import { showValidationError } from "@/lib/utils/error-handler";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { mutate: forgetPassword, isPending: forgetPasswordLoading } =
    useForgetPassword();

  const handlers = {
    onChange({ target }: React.ChangeEvent<HTMLInputElement>) {
      setEmail(target.value);
    },

    async handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setError("");
      try {
        // Validation
        await authValidations.forgotPassword({ email });
        setLoading(true);

        // Call the forget password mutation
        forgetPassword({ email });
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const validationErrors: { email?: string } = {};
          error.inner.forEach((err) => {
            if (err.path) {
              validationErrors[err.path as keyof typeof validationErrors] =
                err.message;
            }
          });
          setError(validationErrors.email || "");
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
          leadingText="Forgot your password?"
          subText="Enter the email address linked to your Nugi Innovations account and we’ll send you secure reset instructions."
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
            error={error}
            value={email}
            authDark
            inputIcon="mail"
          />

          <Button
            type="submit"
            disabled={loading || forgetPasswordLoading}
            className="mt-5 h-auto w-full cursor-pointer rounded-xl border border-[#f5c542] bg-[#f5c542] py-3.5 font-semibold text-[#101d49] shadow-sm transition-colors hover:border-[#edb92e] hover:bg-[#edb92e]"
            size="lg"
          >
            {loading || forgetPasswordLoading
              ? "Loading..."
              : "Send Reset Link"}
          </Button>
        </form>
      </Fragment>
    </AuthPagesWrapper>
  );
};

export default ForgotPassword;
