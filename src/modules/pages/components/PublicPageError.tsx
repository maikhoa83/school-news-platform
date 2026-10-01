/**
 * Public Page Error State Component
 * Friendly, production-safe public error display with retry capability
 * School News Platform - Step 09.6A
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface PublicPageErrorProps {
  error?: unknown;
  onRetry?: () => void;
}

export const PublicPageError: React.FC<PublicPageErrorProps> = ({ error, onRetry }) => {
  // Never expose raw database errors or stack traces to public visitors
  const friendlyMessage =
    error instanceof Error && error.message && !error.message.includes('violates') && !error.message.includes('postgres')
      ? error.message
      : 'Không thể tải nội dung trang thông tin lúc này. Vui lòng thử lại sau.';

  return (
    <div
      id="page-error-state"
      role="alert"
      className="min-h-[50vh] flex items-center justify-center px-4 py-12"
    >
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center space-y-4 shadow-xs">
        <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Đã xảy ra lỗi khi tải trang
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">{friendlyMessage}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Thử lại</span>
            </Button>
          )}

          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" size="sm" className="w-full">
              <Home className="w-3.5 h-3.5 mr-1.5" />
              <span>Về Trang chủ</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
