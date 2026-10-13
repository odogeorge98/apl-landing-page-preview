
import { UserType } from "@/lib/types/users";

export function isUserType(value: unknown): value is UserType {
  return (
    value === UserType.ADMIN ||
    value === UserType.TUTOR ||
    value === UserType.STUDENT
  );
}

export function hasAnyRole(
  userRole: UserType | undefined,
  allowedRoles: readonly UserType[],
): boolean {
  return Boolean(
    userRole && allowedRoles.includes(userRole),
  );
}

export const ROLE_PERMISSIONS = {
  manageUsers: [UserType.ADMIN],
  managePlatformSettings: [UserType.ADMIN],
  manageAllCourses: [UserType.ADMIN],
  manageAssignedCourses: [UserType.ADMIN, UserType.TUTOR],
  gradeSubmissions: [UserType.ADMIN, UserType.TUTOR],
  accessEnrolledCourses: [UserType.ADMIN, UserType.TUTOR, UserType.STUDENT],
  viewOwnProgress: [UserType.STUDENT],
  viewCertificates: [UserType.ADMIN, UserType.STUDENT],
} as const satisfies Record<string, readonly UserType[]>;

export type Permission = keyof typeof ROLE_PERMISSIONS;

export function hasPermission(
  role: UserType | undefined,
  permission: Permission,
): boolean {
  return hasAnyRole(role, ROLE_PERMISSIONS[permission]);
}
