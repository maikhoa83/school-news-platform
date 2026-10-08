/**
 * Setup Guard Component
 * Enforces Installation Locking (when is_completed = true)
 * School News Platform - Step 03 Foundation
 */

import React from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useConfig } from '../../hooks/useConfig';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface SetupGuardProps {
  children?: React.ReactNode;
}

export function SetupGuard({ children }: SetupGuardProps) {
  const { setupState, isLoadingConfig } = useConfig();
  const [searchParams] = useSearchParams();
  const isForce = searchParams.get('force') === 'true' || searchParams.get('reinstall') === 'true';

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

  // If setup has already been locked and completed, disallow wizard access unless forced
  if (setupState?.is_completed && !isForce) {
    return <Navigate to="/admin" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
