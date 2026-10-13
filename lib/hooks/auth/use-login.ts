
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/lib/api/auth";
import {
  LoginData,
  LoginResponse,
} from "@/lib/interfaces/auth";
import {
  showError,
  showSuccess,
} from "@/lib/utils/error-handler";
import useAuthStore from "@/lib/store/auth";

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error) => void;
}

export const useLogin = (options?: UseLoginOptions) => {
  const { login, setRequestLoading } = useAuthStore();

  return useMutation<LoginResponse, Error, LoginData>({
    mutationFn: loginUser,

    onMutate: () => {
      setRequestLoading(true);
    },

    onSuccess: (data) => {
      if (!data.success || !data.user || !data.token) {
        showError(
          data.message || "The server returned an invalid login response.",
        );
        return;
      }

      // Persist the authenticated identity and token.
      login(data.user, data.token);

      showSuccess(data.message || "Login successful!");

      options?.onSuccess?.(data);

      // Navigation intentionally remains in AuthProvider.
      // It can process ?redirect= and fall back to the portal dashboard.
    },

    onError: (error) => {
      showError(error.message || "Login failed. Please try again.");
      options?.onError?.(error);
    },

    onSettled: () => {
      setRequestLoading(false);
    },
  });
};
