import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/api/auth";
import { LoginData, LoginResponse } from "@/lib/interfaces/auth";
import { showError, showSuccess } from "@/lib/utils/error-handler";
import useAuthStore from "@/lib/store/auth";

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error) => void;
}

export const useLogin = (options?: UseLoginOptions) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, setRequestLoading } = useAuthStore();

  return useMutation<LoginResponse, Error, LoginData>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data.user && data.token) {
        login(data.user, data.token);
      }

      showSuccess(data.message || "Login successful!");
      options?.onSuccess?.(data);

      const redirectTo = searchParams.get("redirect") || "/dashboard/overview";
      router.push(redirectTo);
    },
    onError: (error) => {
      setRequestLoading(false);
      showError(error.message);
      options?.onError?.(error);
    },
    onMutate: () => {
      setRequestLoading(true);
    },
    onSettled: () => {
      setRequestLoading(false);
    },
  });
};
