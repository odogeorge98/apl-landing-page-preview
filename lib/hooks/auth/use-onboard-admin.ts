import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { onboardAdmin } from "@/lib/api/auth";
import { AdminOnboardingData, AdminOnboardingResponse } from "@/lib/interfaces/auth";
import { showError, showSuccess } from "@/lib/utils/error-handler";
import useAuthStore from "@/lib/store/auth";

interface UseOnboardAdminOptions {
  onSuccess?: (data: AdminOnboardingResponse) => void;
  onError?: (error: Error) => void;
}

export const useOnboardAdmin = (options?: UseOnboardAdminOptions) => {
  const router = useRouter();
  const { login, setRequestLoading } = useAuthStore();

  return useMutation<AdminOnboardingResponse, Error, AdminOnboardingData>({
    mutationFn: onboardAdmin,
    onSuccess: (data) => {
      if (data.user && data.token) {
        login(data.user, data.token);
      }

      showSuccess(data.message || "Onboarding successful!");
      options?.onSuccess?.(data);

      // Redirect to dashboard after successful onboarding
      router.push("/dashboard/overview");
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
