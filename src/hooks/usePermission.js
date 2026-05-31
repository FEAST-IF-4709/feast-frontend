import { hasPermission, getPermissions } from '../api/auth';

export function usePermission(codename) {
  return hasPermission(codename);
}

export function useAnyPermission(codenames) {
  const perms = getPermissions();
  return codenames.some((c) => perms.has(c));
}

export function useAllPermissions(codenames) {
  const perms = getPermissions();
  return codenames.every((c) => perms.has(c));
}
