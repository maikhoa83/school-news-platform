/**
 * Access Denied (HTTP 403) Page
 * School News Platform - Step 03 Foundation
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogIn } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface AccessDeniedPageProps {
  requiredPermission?: string;
}

export function AccessDeniedPage({ requiredPermission }: AccessDeniedPageProps) {
  const navigate = useNavigate();
  const { user, roles, isAuthenticated } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-wider text-amber-800 uppercase bg-amber-100/70 py-1 px-2.5 rounded-full">
            Truy Cập Bị Giới Hạn (403 Forbidden)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Bạn Không Có Quyền Truy Cập
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Khu vực này yêu cầu đặc quyền hạn nghiệp vụ cụ thể. Tài khoản của bạn hiện chưa được phân quyền để thực hiện hành động này.
          </p>
        </div>

        {/* Diagnostic info for authenticated user */}
        {isAuthenticated && user && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Tài khoản:</span>
              <span className="font-medium text-slate-800 truncate max-w-[200px]">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vai trò (Roles):</span>
              <span className="font-semibold text-blue-800">
                {roles.length > 0 ? roles.join(', ') : 'Chưa gán vai trò'}
              </span>
            </div>
            {requiredPermission && (
              <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px]">
                <span className="text-slate-400">Quyền hạn yêu cầu:</span>
                <code className="text-amber-700 font-mono bg-amber-50 px-1 rounded">
                  {requiredPermission}
                </code>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Quay lại
          </Button>

          {isAuthenticated ? (
            <Link to="/admin" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full">
                <Home className="h-4 w-4 mr-1.5" />
                Bảng điều khiển
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full">
                <LogIn className="h-4 w-4 mr-1.5" />
                Đăng nhập lại
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
