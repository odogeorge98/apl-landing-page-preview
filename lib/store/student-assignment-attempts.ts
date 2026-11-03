import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  StudentAssignment,
  StudentAssignmentSubmissionRecord,
} from "@/lib/interfaces/assignments";

const MAX_REMEMBERED_ASSIGNMENTS = 50;

export interface LocalAssignmentDraft {
  answerText: string;
  updatedAt: string;
}

interface RememberedAssignment {
  assignment: StudentAssignment;
  rememberedAt: string;
}

interface StudentAssignmentAttemptState {
  rememberedAssignments: Record<string, RememberedAssignment>;
  drafts: Record<string, LocalAssignmentDraft>;
  submissionReceipts: Record<string, StudentAssignmentSubmissionRecord>;
  hasHydrated: boolean;
  rememberAssignment: (assignment: StudentAssignment) => void;
  saveDraft: (assignmentId: string, answerText: string) => void;
  clearDraft: (assignmentId: string) => void;
  saveSubmissionReceipt: (assignmentId: string, submission: StudentAssignmentSubmissionRecord) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

/**
 * Device-local attempt support. Drafts are never sent to the API; only the
 * explicit submit action creates a server-side attempt.
 */
const useStudentAssignmentAttemptStore = create<StudentAssignmentAttemptState>()(
  persist(
    (set) => ({
      rememberedAssignments: {},
      drafts: {},
      submissionReceipts: {},
      hasHydrated: false,
      rememberAssignment: (assignment) =>
        set((state) => {
          const rememberedAssignments = {
            ...state.rememberedAssignments,
            [assignment.id]: { assignment, rememberedAt: new Date().toISOString() },
          };
          const entries = Object.entries(rememberedAssignments)
            .sort(([, left], [, right]) => left.rememberedAt.localeCompare(right.rememberedAt))
            .slice(-MAX_REMEMBERED_ASSIGNMENTS);
          const retainedIds = new Set(entries.map(([id]) => id));

          return {
            rememberedAssignments: Object.fromEntries(entries),
            // Keep draft and receipt records only as long as their assignment
            // context is retained, preventing unbounded localStorage growth.
            drafts: Object.fromEntries(Object.entries(state.drafts).filter(([id]) => retainedIds.has(id))),
            submissionReceipts: Object.fromEntries(
              Object.entries(state.submissionReceipts).filter(([id]) => retainedIds.has(id)),
            ),
          };
        }),
      saveDraft: (assignmentId, answerText) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [assignmentId]: { answerText, updatedAt: new Date().toISOString() },
          },
        })),
      clearDraft: (assignmentId) =>
        set((state) => {
          const drafts = { ...state.drafts };
          delete drafts[assignmentId];
          return { drafts };
        }),
      saveSubmissionReceipt: (assignmentId, submission) =>
        set((state) => {
          const drafts = { ...state.drafts };
          delete drafts[assignmentId];
          return {
            drafts,
            submissionReceipts: { ...state.submissionReceipts, [assignmentId]: submission },
          };
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "nugi-student-assignment-attempts-v1",
      skipHydration: true,
      partialize: (state) => ({
        rememberedAssignments: state.rememberedAssignments,
        drafts: state.drafts,
        submissionReceipts: state.submissionReceipts,
      }) as StudentAssignmentAttemptState,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

export default useStudentAssignmentAttemptStore;
