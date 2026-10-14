import { UserType } from "@/lib/types/users";

export interface AdminAccount {
  id: string;
  email: string;
  phoneNo: string | null;
  role: UserType.ADMIN;
  isActive: boolean;
}

export interface AdminRecord {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: AdminAccount;
}

export interface AdminsListData {
  items: AdminRecord[];
  nextCursor: string | null;
}

export interface AdminsListApiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: AdminsListData;
}

export interface GetAdminsParams {
  search?: string;
  limit?: number;
  cursor?: string | null;
}
