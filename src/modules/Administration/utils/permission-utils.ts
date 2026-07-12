import type { UserProfile } from 'types/user-profile';

export function hasPermission(user: UserProfile | null | undefined, code: string): boolean {
  return Boolean(user?.permissions?.some((permission) => permission === code));
}

export function hasAnyPermission(user: UserProfile | null | undefined, codes: readonly string[]): boolean {
  return codes.some((code) => hasPermission(user, code));
}

export function hasAllPermissions(user: UserProfile | null | undefined, codes: readonly string[]): boolean {
  return codes.every((code) => hasPermission(user, code));
}
