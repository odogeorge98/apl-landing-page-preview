import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";
import {
  ResetPasswordData,
  ResetPasswordResponse,
} from "@/lib/interfaces/auth";
import { showError, showSuccess } from "@/lib/utils/error-handler";

interface UseResetPasswordOptions {
  onSuccess?: (data: ResetPasswordResponse) => void;
  onError?: (error: Error) => void;
}

export const useResetPassword = (options?: UseResetPasswordOptions) => {
  const router = useRouter();

  return useMutation<ResetPasswordResponse, Error, ResetPasswordData>({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      showSuccess(data.message || "Password reset successfully!");
      options?.onSuccess?.(data);
      router.push("/login");
    },
    onError: (error) => {
      showError(error.message);
      options?.onError?.(error);
    },
  });
};
