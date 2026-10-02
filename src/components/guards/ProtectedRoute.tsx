/**
 * Protected Route Guard
 * Enforces authoritative authentication and granular permission checks
 * School News Platform - Step 10.2 Hardening
 */

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthorization } from '../../lib/authorization/useAuthorization';
import { isKnownPermission } from '../../lib/authorization/matrix';
import type { AppPermission } from '../../lib/authorization/types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { AccessDeniedPage } from '../../pages/common/AccessDeniedPage';

interface ProtectedRouteProps {
  requiredPermission?: AppPermission | AppPermission[] | string | string[];
  children?: React.ReactNode;
}

export function ProtectedRoute({ requiredPermission, children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, can, isSuperAdmin, permissions } = useAuthorization();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">
            Đang kiểm tra phiên làm việc bảo mật...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If permission check is required
  if (requiredPermission) {
    const checkSinglePermission = (perm: string): boolean => {
      if (isSuperAdmin || permissions.includes('*')) return true;
      if (isKnownPermission(perm)) {
        return can(perm);
      }
      return permissions.includes(perm);
    };

    const hasAccess = Array.isArray(requiredPermission)
      ? requiredPermission.some((perm) => checkSinglePermission(perm))
      : checkSinglePermission(requiredPermission);

    if (!hasAccess) {
      const displayPermission = Array.isArray(requiredPermission)
        ? requiredPermission.join(' hoặc ')
        : requiredPermission;
      return <AccessDeniedPage requiredPermission={displayPermission} />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}

