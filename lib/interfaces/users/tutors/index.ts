import { UserType, User } from "@/lib/types/users";

interface TutorUser extends User {
  role: UserType.TUTOR
}

export interface Tutor {
  id: string;
  userId: string
  name: string;
  createdAt: string;
  updatedAt: string;
  user: TutorUser;
}

export interface TutorsListData {
  items: Tutor[];
  nextCursor: string | null;
}

export interface TutorsListApiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: TutorsListData;
}

export interface CreateTutorDto {
  name: string;
  email: string;
  phone?: string;
}

export interface CreateTutorResponseData {
  name: string;
  email: string;
  phone?: string | null;
}

export interface CreateTutorApiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: CreateTutorResponseData;
}

export interface GetTutorsParams {
  search?: string;
  limit?: number;
  cursor?: string | null;
}