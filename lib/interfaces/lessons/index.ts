export interface CreateLessonDto {
  programmeId: string;
  title: string;
  description: string;
  sequence: number;
  durationMinutes: number;
}

export interface CreatedLesson {
  id: string;
  programmeId: string;
  title: string;
  description: string;
  sequence: number;
  durationMinutes: number;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface CreateLessonApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: CreatedLesson;
}
