export interface StudentProgrammeEnrolment {
  id: string;
  studentId: string;
  programmeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgrammeEnrolmentsData {
  items: StudentProgrammeEnrolment[];
  nextCursor: string | null;
}

export interface StudentProgrammeEnrolmentsApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: StudentProgrammeEnrolmentsData;
}

export interface GetStudentProgrammeEnrolmentsParams {
  /** Opaque cursor returned by the previous page. */
  cursor?: string | null;
}

export interface CreateStudentProgrammeEnrolmentDto {
  programmeId: string;
}

export interface CreateStudentProgrammeEnrolmentApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: StudentProgrammeEnrolment;
}
