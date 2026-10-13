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
