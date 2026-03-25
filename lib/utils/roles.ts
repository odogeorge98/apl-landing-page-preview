
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SONA_ADMIN = 'SONA_ADMIN',
  ADMIN = 'ADMIN',
}

export enum OrganizationRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}


export function isAdminRole(role: string): boolean {
  return role === UserRole.SUPER_ADMIN || 
         role === UserRole.SONA_ADMIN || 
         role === UserRole.ADMIN;
}

export function isSuperAdminRole(role: string): boolean {
  return role === UserRole.SUPER_ADMIN;
}

export function isSonaAdminRole(role: string): boolean {
  return role === UserRole.SONA_ADMIN;
}

export function getAdminRoles(): string[] {
  return [UserRole.SUPER_ADMIN, UserRole.SONA_ADMIN, UserRole.ADMIN];
}

export function getSuperAdminRoles(): string[] {
  return [UserRole.SUPER_ADMIN, UserRole.SONA_ADMIN];
}
