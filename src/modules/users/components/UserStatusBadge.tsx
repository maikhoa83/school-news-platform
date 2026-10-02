/**
 * User Status Badge Component
 * School News Platform - Step 10.1 Users + RBAC Foundation
 */

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface UserStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  isActive,
  className = '',
}) => {
  if (isActive) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
        <span>Hoạt động</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
      <span>Đã khóa</span>
    </span>
  );
};
