/**
 * Module Guard Component
 * Enforces dynamic enablement state from module_settings table
 * School News Platform - Step 03 Foundation
 */

import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Settings } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import { usePermissions } from '../../hooks/usePermissions';
import { Button } from '../ui/Button';

interface ModuleGuardProps {
  moduleKey: string;
  moduleName?: string;
  children?: React.ReactNode;
}

export function ModuleGuard({ moduleKey, moduleName, children }: ModuleGuardProps) {
  const { isModuleEnabled, isLoadingConfig } = useConfig();
  const { hasPermission } = usePermissions();

  if (isLoadingConfig) {
    return null;
  }

  const enabled = isModuleEnabled(moduleKey);

  if (!enabled) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-4 shadow-xs">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Module Tạm Thời Bị Vô Hiệu Hóa
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tính năng <strong>{moduleName || moduleKey}</strong> hiện đang được tắt trong cấu hình hệ thống nhà trường. Toàn bộ dữ liệu vẫn được bảo toàn an toàn.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Link to="/admin">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Về bảng điều khiển
              </Button>
            </Link>

            {hasPermission('settings.edit') && (
              <Link to="/admin/settings">
                <Button variant="primary" size="sm" className="w-full sm:w-auto">
                  <Settings className="h-4 w-4 mr-1.5" />
                  Kích hoạt lại module
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
