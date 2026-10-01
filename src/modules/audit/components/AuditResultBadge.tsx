/**
 * Audit Result Status Badge Component
 * School News Platform - Step 10.3
 */

import React from 'react';
import type { AuditResult } from '../types/audit';
import { AUDIT_RESULT_CONFIG } from '../config/auditConfig';

interface AuditResultBadgeProps {
  result: AuditResult;
  size?: 'sm' | 'md';
}

export const AuditResultBadge: React.FC<AuditResultBadgeProps> = ({
  result,
  size = 'md',
}) => {
  const config = AUDIT_RESULT_CONFIG[result] || {
    label: result,
    badgeColor: 'bg-gray-50 text-gray-700 border-gray-200',
    dotColor: 'bg-gray-400',
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      id={`audit-result-badge-${result.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap ${sizeClasses} ${config.badgeColor}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
};
