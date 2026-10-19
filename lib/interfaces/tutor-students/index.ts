/** Student record returned by GET /tutors/students. */
export interface TutorStudent {
  id: string;
  name: string;
  gender: string | null;
  photoUrl: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    phoneNo: string | null;
    isActive: boolean;
  };
}

export interface TutorStudentsData {
  items: TutorStudent[];
  nextCursor: string | null;
}

export interface TutorStudentsApiResponse {
  status: "success" | string;
  statusCode: number;
  message: string;
  data: TutorStudentsData;
}

export interface GetTutorStudentsParams {
  search?: string;
  /** Items per page, supported range 1–50. */
  limit?: number;
  /** Opaque cursor returned by the previous page. */
  cursor?: string | null;
}
