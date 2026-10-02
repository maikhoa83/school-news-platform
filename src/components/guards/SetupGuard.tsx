/**
 * Setup Guard Component
 * Enforces Installation Locking (when is_completed = true)
 * School News Platform - Step 03 Foundation
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useConfig } from '../../hooks/useConfig';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface SetupGuardProps {
  children?: React.ReactNode;
}

export function SetupGuard({ children }: SetupGuardProps) {
  const { setupState, isLoadingConfig } = useConfig();

  if (isLoadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">
            Đang kiểm tra trạng thái cài đặt hệ thống...
          </p>
        </div>
      </div>
    );
  }

  // If setup has already been locked and completed, disallow wizard access
  if (setupState?.is_completed) {
    return <Navigate to="/admin" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
