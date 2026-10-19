/** A programme available in the course catalogue. */
export interface Programme {
  id: string;
  name: string;
  description: string;
  hours: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgrammeMetrics {
  totalStudents: number;
  activeStudents: number;
  activeTutors: number;
  totalLessons: number;
  publishedLessons: number;
  lessonCompletions: number;
  totalAssignments: number;
  publishedAssignments: number;
  totalSubmissions: number;
  pendingReviews: number;
  upcomingSessions: number;
}

export interface ProgrammeDetailsData {
  programme: Programme;
  metrics: ProgrammeMetrics;
}

export interface ProgrammeDetailsApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: ProgrammeDetailsData;
}

export interface ProgrammesData {
  items: Programme[];
  /** Opaque cursor for the next page, or null when the catalogue is complete. */
  nextCursor: string | null;
}

export interface ProgrammesApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: ProgrammesData;
}

export interface GetProgrammesParams {
  /** Search by programme name or description. */
  search?: string;
  /** Number of programmes to request (API accepts 1–50). */
  limit?: number;
  /** Opaque cursor returned by the previous page. */
  cursor?: string | null;
}
