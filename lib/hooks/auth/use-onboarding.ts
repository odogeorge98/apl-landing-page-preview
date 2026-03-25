import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { onboardUser } from "@/lib/api/auth";
import { OnboardingData, OnboardingResponse } from "@/lib/interfaces/auth";
import { showError, showSuccess } from "@/lib/utils/error-handler";
import useAuthStore from "@/lib/store/auth";

interface UseOnboardingOptions {
  onSuccess?: (data: OnboardingResponse) => void;
  onError?: (error: Error) => void;
}

export const useOnboarding = (options?: UseOnboardingOptions) => {
  const router = useRouter();
  const { login, setRequestLoading, setToken } = useAuthStore();

  return useMutation<OnboardingResponse, Error, OnboardingData>({
    mutationFn: onboardUser,
    onSuccess: (data) => {
      showSuccess(data.message || "Onboarding successful!");
      options?.onSuccess?.(data);

      router.push("/login");
    },
    onError: (error) => {
      setRequestLoading(false);
      showError(error.message);
      options?.onError?.(error);
    },
    onMutate: () => {
      setRequestLoading(true);
    },
  });
};
