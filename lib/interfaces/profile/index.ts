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
