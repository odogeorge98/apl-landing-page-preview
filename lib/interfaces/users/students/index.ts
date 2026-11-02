import { UserType, User } from "@/lib/types/users";
export type StudentGender = "male" | "female";

interface StudentUser extends User {
  role: UserType.STUDENT
}


export interface Student {
  id: string;
  userId: string;
  name: string;
  guardianPhoneOrEmail: string | null;
  gender: StudentGender | null;
  photoUrl: string | null;
  createdAt: string;
  user: StudentUser
}

export interface StudentsListData {
  items: Student[];
  nextCursor: string | null;
}

export interface StudentsListApiResponse {
  status: "success" | string;
  statusCode: number;
  message: string;
  data: StudentsListData;
}

export interface GetStudentsParams {
  search?: string;
  gender?: StudentGender;
  limit?: number;
  cursor?: string | null;
}

export interface StudentDetails {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    guardianPhoneOrEmail: string | null;
    gender: StudentGender | null;
    photoUrl: string | null;
    role: string;
    isActive: boolean;
    emailVerifiedAt: string | null;
    phoneNoVerifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };

  overview: {
    totalProgrammes: number;
    totalProgrammeHours: number;
    learning: {
      lessonsCompleted: number;
      publishedLessons: number;
      progressPercentage: number;
    };
    assignments: {
      totalAvailable: number;
      submitted: number;
      pending: number;
    };
    submissions: {
      total: number;
      pendingReview: number;
    };
    reports: {
      submitted: number;
      openProblems: number;
      feedbackReceived: number;
    };
  };

  programmes: {
    id: string;
    name: string;
    description: string;
    hours: number;
    enrolledAt: string;
    lessonsCompleted: number;
    publishedLessons: number;
    progressPercentage: number | null;
  }[];

  recentSubmissions: {
    id: string;
    assignmentId: string;
    programmeId: string;
    attemptNumber: number;
    status: string;
    submittedAt: string;
    score: string | null;
    createdAt: string;
    assignment: {
      id: string;
      title: string;
    };
    programme: {
      id: string;
      name: string;
    };
    tutor: {
      id: string;
      name: string;
    };
  }[];

  recentReports: {
    id: string;
    programmeId: string;
    tutorId: string;
    reportDate: string;
    status: string;
    problemStatus: string;
    blockerDescription: string | null;
    submittedAt: string;
    reviewedAt: string | null;
    createdAt: string;
    feedbackCount: string;
    programme: {
      id: string;
      name: string;
    };
    tutor: {
      id: string;
      name: string;
    };
  }[];
}

export interface StudentDetailsApiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: StudentDetails;
}