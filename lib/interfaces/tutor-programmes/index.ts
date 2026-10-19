export interface TutorProgrammeSummary {
  id: string;
  name: string;
  description: string;
  hours: number;
}

/** A programme assignment belonging to the authenticated tutor. */
export interface TutorProgrammeAssignment {
  id: string;
  tutorId: string;
  programmeId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  programme: TutorProgrammeSummary;
}

export interface TutorProgrammesData {
  items: TutorProgrammeAssignment[];
  nextCursor: string | null;
}

export interface TutorProgrammesApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: TutorProgrammesData;
}

export interface GetTutorProgrammesParams {
  /** Opaque cursor returned by the previous response. */
  cursor?: string | null;
}
