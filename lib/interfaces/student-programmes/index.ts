export interface EnrolmentRelatedEntity {
  id: string;
  name: string;
}

export interface StudentProgrammeEnrolment {
  id: string;
  studentId: string;
  programmeId: string;
  createdAt: string;
  updatedAt: string;
  /** Included by the admin enrolment endpoint. Optional for older responses. */
  student?: EnrolmentRelatedEntity | null;
  /** Included by the admin enrolment endpoint. Optional for older responses. */
  programme?: EnrolmentRelatedEntity | null;
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

/** Filters accepted by the admin GET /student-programmes endpoint. */
export interface GetAllStudentProgrammeEnrolmentsParams {
  search?: string;
  /** Number of records to request (API page size is 1–50). */
  limit?: number;
  /** Opaque cursor returned by the previous response. */
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
