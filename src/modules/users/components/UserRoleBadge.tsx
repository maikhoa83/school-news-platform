/**
 * User Role Badge Component
 * School News Platform - Step 10.1 Users + RBAC Foundation
 */

import React from 'react';
import { ShieldCheck, ShieldAlert, Shield, PenTool, FileCheck, User } from 'lucide-react';
import { BASELINE_ROLES } from '../config/userConfig';
import { RoleCode } from '../types/user';

interface UserRoleBadgeProps {
  role: RoleCode | string;
  className?: string;
  showIcon?: boolean;
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({
  role,
  className = '',
  showIcon = true,
}) => {
  const meta = BASELINE_ROLES[role as RoleCode];

  let badgeStyle = 'bg-slate-100 text-slate-800 border-slate-200';
  let IconComponent = User;

  if (role === 'SUPER_ADMIN') {
    badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200';
    IconComponent = ShieldAlert;
  } else if (role === 'ADMIN') {
    badgeStyle = 'bg-blue-50 text-blue-800 border-blue-200';
    IconComponent = ShieldCheck;
  } else if (role === 'EDITOR') {
    badgeStyle = 'bg-purple-50 text-purple-800 border-purple-200';
    IconComponent = FileCheck;
  } else if (role === 'AUTHOR') {
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
    IconComponent = PenTool;
  } else if (role === 'PUBLIC_VISITOR') {
    badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
    IconComponent = User;
  }

  const label = meta ? meta.name : role;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${badgeStyle} ${className}`}
      title={meta?.description || label}
    >
      {showIcon && <IconComponent className="h-3.5 w-3.5 shrink-0" />}
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
};
