import { useMutation } from "@tanstack/react-query";
import { forgetPassword } from "@/lib/api/auth";
import {
  ForgetPasswordData,
  ForgetPasswordResponse,
} from "@/lib/interfaces/auth";
import { showError, showSuccess } from "@/lib/utils/error-handler";

interface UseForgetPasswordOptions {
  onSuccess?: (data: ForgetPasswordResponse) => void;
  onError?: (error: Error) => void;
}

export const useForgetPassword = (options?: UseForgetPasswordOptions) => {
  return useMutation<ForgetPasswordResponse, Error, ForgetPasswordData>({
    mutationFn: forgetPassword,
    onSuccess: (data) => {
      showSuccess(data.message || "Password reset email sent successfully!");
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      showError(error.message);
      options?.onError?.(error);
    },
  });
};
