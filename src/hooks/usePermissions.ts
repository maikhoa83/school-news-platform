/**
 * Permissions & Authorization Hook Facade
 * School News Platform - Step 10.2 Hardening
 *
 * Backward-compatible facade delegating to centralized useAuthorization()
 * Preserves existing signatures: hasPermission, can(resource, action), hasRole(role | role[])
 * Exposes new capabilities: canAny, canAll, hasAnyRole
 */

import { useCallback } from 'react';
import { useAuthorization } from '../lib/authorization/useAuthorization';
import { isKnownPermission } from '../lib/authorization/matrix';
import type { AppPermission, AppRole } from '../lib/authorization/types';
import type { RoleCode } from '../types/auth';

export function usePermissions() {
  const auth = useAuthorization();

  /**
   * Backward-compatible check for permission string (e.g. 'settings.edit', 'news.create')
   * Fail-closed: returns false if loading, unauthenticated, or permission not held.
   */
  const hasPermission = useCallback(
    (permissionCode: string): boolean => {
      if (auth.isLoading || !auth.isAuthenticated) return false;
      if (auth.isSuperAdmin || auth.permissions.includes('*')) return true;
      if (isKnownPermission(permissionCode)) {
        return auth.can(permissionCode);
      }
      return auth.permissions.includes(permissionCode);
    },
    [auth]
  );

  /**
   * Backward-compatible check if user possesses one or more specific roles
   */
  const hasRole = useCallback(
    (roleCode: RoleCode | RoleCode[]): boolean => {
      if (auth.isLoading || !auth.isAuthenticated) return false;
      if (Array.isArray(roleCode)) {
        return auth.hasAnyRole(roleCode as readonly AppRole[]);
      }
      return auth.hasRole(roleCode as AppRole);
    },
    [auth]
  );

  /**
   * Backward-compatible Resource / Action helper (e.g. can('news', 'edit') or can('news.edit'))
   */
  const can = useCallback(
    (resourceOrPermission: string, action?: string): boolean => {
      if (action) {
        return hasPermission(`${resourceOrPermission}.${action}`);
      }
      return hasPermission(resourceOrPermission);
    },
    [hasPermission]
  );

  return {
    ...auth,
    hasPermission,
    hasRole,
    can,
  };
}

