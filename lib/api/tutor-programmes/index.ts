import { http } from "@/lib/utils/http";
import type {
  GetTutorProgrammesParams,
  TutorProgrammeAssignment,
  TutorProgrammesApiResponse,
  TutorProgrammesData,
} from "@/lib/interfaces/tutor-programmes";

function isTutorProgrammeAssignment(
  value: unknown,
): value is TutorProgrammeAssignment {
  if (!value || typeof value !== "object") return false;

  const assignment = value as Record<string, unknown>;
  const programme = assignment.programme;
  if (!programme || typeof programme !== "object") return false;

  const programmeRecord = programme as Record<string, unknown>;
  return (
    typeof assignment.id === "string" &&
    typeof assignment.tutorId === "string" &&
    typeof assignment.programmeId === "string" &&
    typeof assignment.status === "string" &&
    typeof assignment.createdAt === "string" &&
    typeof assignment.updatedAt === "string" &&
    typeof programmeRecord.id === "string" &&
    typeof programmeRecord.name === "string" &&
    typeof programmeRecord.description === "string" &&
    typeof programmeRecord.hours === "number" &&
    Number.isFinite(programmeRecord.hours)
  );
}

/** GET /tutor-programmes/my-programmes — assigned programmes for this tutor. */
export const tutorProgrammesApi = {
  listMyProgrammes: async (
    params: GetTutorProgrammesParams = {},
  ): Promise<TutorProgrammesData> => {
    const cursor = params.cursor?.trim();
    const queryParams: Record<string, string> = {};
    if (cursor) queryParams.cursor = cursor;

    const response = await http.get<TutorProgrammesApiResponse>(
      "/tutor-programmes/my-programmes",
      { params: queryParams },
    );

    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to retrieve your courses.");
    }

    const data = result.data;
    if (
      !data ||
      !Array.isArray(data.items) ||
      !(data.nextCursor === null || typeof data.nextCursor === "string") ||
      !data.items.every(isTutorProgrammeAssignment)
    ) {
      throw new Error("The tutor courses response was incomplete or invalid.");
    }

    return data;
  },
};
