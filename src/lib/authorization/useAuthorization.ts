/**
 * School News Platform - Centralized Authorization Hook
 * Step 10.2: Fail-Closed React Authorization Hook
 *
 * Strict Compliance:
 * - Fail-Closed: isLoading === true OR isAuthenticated === false -> all checks return false.
 * - Empty permission/role checks fail closed (return false).
 * - SUPER_ADMIN wildcard '*' bypasses all valid AppPermissions.
 * - Zero direct Supabase access: consumes snapshot from AuthContext.
 */

import { useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { AppPermission, AppRole, UseAuthorizationResult } from './types';

export function useAuthorization(): UseAuthorizationResult {
  const { roles, permissions, isAuthenticated, isLoading } = useAuth();

  const isSuperAdmin = useMemo<boolean>(() => {
    if (isLoading || !isAuthenticated) return false;
    return roles.includes('SUPER_ADMIN');
  }, [isLoading, isAuthenticated, roles]);

  const isAdmin = useMemo<boolean>(() => {
    if (isLoading || !isAuthenticated) return false;
    return roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
  }, [isLoading, isAuthenticated, roles]);

  /**
   * Check if current user has a specific permission.
   * Fail-closed: Denies if loading, unauthenticated, or permission missing.
   */
  const can = useCallback(
    (permission: AppPermission): boolean => {
      // 1. Fail-closed: Loading or Unauthenticated -> DENY
      if (isLoading || !isAuthenticated) {
        return false;
      }

      // 2. Super Admin wildcard bypass
      if (isSuperAdmin || permissions.includes('*')) {
        return true;
      }

      // 3. Granular permission check against loaded snapshot
      return permissions.includes(permission);
    },
    [isLoading, isAuthenticated, isSuperAdmin, permissions]
  );

  /**
   * Check if current user possesses ANY of the specified permissions.
   * Fail-closed: Empty array -> false.
   */
  const canAny = useCallback(
    (targetPermissions: readonly AppPermission[]): boolean => {
      // Fail-closed guards
      if (isLoading || !isAuthenticated || !targetPermissions || targetPermissions.length === 0) {
        return false;
      }

      if (isSuperAdmin || permissions.includes('*')) {
        return true;
      }

      return targetPermissions.some((p) => permissions.includes(p));
    },
    [isLoading, isAuthenticated, isSuperAdmin, permissions]
  );

  /**
   * Check if current user possesses ALL of the specified permissions.
   * Fail-closed: Empty array -> false.
   */
  const canAll = useCallback(
    (targetPermissions: readonly AppPermission[]): boolean => {
      // Fail-closed guards
      if (isLoading || !isAuthenticated || !targetPermissions || targetPermissions.length === 0) {
        return false;
      }

      if (isSuperAdmin || permissions.includes('*')) {
        return true;
      }

      return targetPermissions.every((p) => permissions.includes(p));
    },
    [isLoading, isAuthenticated, isSuperAdmin, permissions]
  );

  /**
   * Check if current user possesses a specific role.
   * Fail-closed: Loading or Unauthenticated -> false.
   */
  const hasRole = useCallback(
    (role: AppRole): boolean => {
      if (isLoading || !isAuthenticated) {
        return false;
      }
      return roles.includes(role);
    },
    [isLoading, isAuthenticated, roles]
  );

  /**
   * Check if current user possesses ANY of the specified roles.
   * Fail-closed: Empty array -> false.
   */
  const hasAnyRole = useCallback(
    (targetRoles: readonly AppRole[]): boolean => {
      if (isLoading || !isAuthenticated || !targetRoles || targetRoles.length === 0) {
        return false;
      }
      return targetRoles.some((r) => roles.includes(r));
    },
    [isLoading, isAuthenticated, roles]
  );

  return useMemo(
    () => ({
      can,
      canAny,
      canAll,
      hasRole,
      hasAnyRole,
      isSuperAdmin,
      isAdmin,
      isLoading,
      isAuthenticated,
      roles,
      permissions,
    }),
    [
      can,
      canAny,
      canAll,
      hasRole,
      hasAnyRole,
      isSuperAdmin,
      isAdmin,
      isLoading,
      isAuthenticated,
      roles,
      permissions,
    ]
  );
}
