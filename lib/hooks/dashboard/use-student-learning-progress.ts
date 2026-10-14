import { useQuery } from "@tanstack/react-query";
import { fetchStudentLearningProgress } from "@/lib/api/dashboard";

export const STUDENT_LEARNING_PROGRESS_QUERY_KEY = [
  "student",
  "learning-progress",
] as const;

export function useStudentLearningProgress() {
  return useQuery({
    queryKey: STUDENT_LEARNING_PROGRESS_QUERY_KEY,
    queryFn: fetchStudentLearningProgress,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error instanceof Error && "status" in error) {
        const status = Number(
          (error as Error & { status?: number }).status,
        );

        if (status >= 400 && status < 500) {
          return false;
        }
      }

      return failureCount < 2;
    },
  });
}
