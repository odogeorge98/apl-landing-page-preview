// export type UserType = "ADMIN" | "TUTOR" | "STUDENT";

export enum UserType {
  ADMIN = "ADMIN",
  TUTOR = "TUTOR",
  STUDENT = "STUDENT"
}

export interface User {
  id: string,
  email: string,
  phoneNo: string,
  role: UserType,
  isActive: boolean;
}