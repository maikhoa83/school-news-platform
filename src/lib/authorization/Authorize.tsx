/**
 * School News Platform - Declarative Authorization Component
 * Step 10.2: <Authorize> UI Guard
 *
 * Strict Compliance:
 * - Declarative UI authorization gating (mode: 'hide' | 'disable').
 * - Zero direct Supabase access: uses useAuthorization hook.
 * - Supports single permission, multiple permissions (any/all), or role requirements.
 * - Fail-closed: unauthorized by default during loading or unauthenticated.
 */

import React from 'react';
import { useAuthorization } from './useAuthorization';
import type { AuthorizeProps } from './types';

export function Authorize({
  permission,
  permissions,
  strategy = 'all',
  role,
  roles,
  mode = 'hide',
  fallback = null,
  disabledReason,
  children,
}: AuthorizeProps): React.ReactElement | null {
  const { can, canAny, canAll, hasRole, hasAnyRole, isLoading, isAuthenticated } =
    useAuthorization();

  // 1. Fail-closed: If loading or not authenticated, deny immediately
  let isAuthorized = !isLoading && isAuthenticated;

  if (isAuthorized) {
    // Check permission requirements
    if (permission) {
      isAuthorized = can(permission);
    }

    if (isAuthorized && permissions && permissions.length > 0) {
      isAuthorized = strategy === 'any' ? canAny(permissions) : canAll(permissions);
    }

    // Check role requirements
    if (isAuthorized && role) {
      isAuthorized = hasRole(role);
    }

    if (isAuthorized && roles && roles.length > 0) {
      isAuthorized = hasAnyRole(roles);
    }
  }

  // 2. Render when authorized
  if (isAuthorized) {
    if (typeof children === 'function') {
      return <>{children({ isAuthorized: true })}</>;
    }
    return <>{children}</>;
  }

  // 3. Render when NOT authorized
  if (mode === 'disable') {
    if (typeof children === 'function') {
      return <>{children({ isAuthorized: false })}</>;
    }

    // Render with disabled envelope and pointer-events neutralized
    return (
      <span
        className="inline-block cursor-not-allowed opacity-50 pointer-events-none select-none"
        aria-disabled="true"
        title={disabledReason || 'Bạn không có quyền thực hiện thao tác này'}
      >
        {children}
      </span>
    );
  }

  // Default mode === 'hide': render fallback or nothing
  return fallback ? <>{fallback}</> : null;
}
