import { UserType } from "@/lib/types/users";
export type AdminProfileRole = UserType.ADMIN;

export interface AdminProfile {
  id: string;
  email: string;
  role: AdminProfileRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfileApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: AdminProfile;
}

export type StudentProfileGender = "male" | "female";

export interface StudentProfileProgramme {
  id: string;
  name: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  guardianPhoneOrEmail: string | null;
  gender: StudentProfileGender | null;
  photoUrl: string | null;
  role: UserType.STUDENT;
  isActive: boolean;
  programmes: StudentProfileProgramme[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfileApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: StudentProfile;
}

export interface TutorProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserType.TUTOR;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TutorProfileApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: TutorProfile;
}
