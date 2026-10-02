/**
 * Audit Classification Category Badge Component
 * School News Platform - Step 10.3
 */

import React from 'react';
import type { AuditClassification } from '../types/audit';
import { AUDIT_CLASSIFICATION_CONFIG } from '../config/auditConfig';

interface AuditClassificationBadgeProps {
  classification: AuditClassification;
}

export const AuditClassificationBadge: React.FC<AuditClassificationBadgeProps> = ({
  classification,
}) => {
  const config = AUDIT_CLASSIFICATION_CONFIG[classification] || {
    label: classification,
    description: '',
    badgeColor: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <span
      id={`audit-classification-badge-${classification.toLowerCase()}`}
      title={config.description}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${config.badgeColor}`}
    >
      {config.label}
    </span>
  );
};
