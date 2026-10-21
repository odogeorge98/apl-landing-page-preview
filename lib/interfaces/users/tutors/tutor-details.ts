
export interface TutorDetailsProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TutorDetailsOverview {
  totalCourses: number;
  totalStudents: number;
  totalAssignments: number;
  totalSubmissions: number;
  pendingReviews: number;
  upcomingSessions: number;
  completedSessions: number;
}

export interface TutorDetailsCourse {
  id: string;
  tutorId: string;
  programmeId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  programme: {
    id: string;
    name: string;
    description: string;
    hours: number;
  };
}

export interface TutorDetailsStudent {
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

export interface TutorDetailsRecord {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface TutorDetailsData {
  profile: TutorDetailsProfile;
  overview: TutorDetailsOverview;
  courses: TutorDetailsCourse[];
  recentAssignments: TutorDetailsRecord[];
  students: TutorDetailsStudent[];
  pendingSubmissions: TutorDetailsRecord[];
  upcomingSessions: TutorDetailsRecord[];
}

export interface TutorDetailsApiResponse {
  status: "success" | "failure";
  statusCode: number;
  message: string;
  data: TutorDetailsData;
}
