/**
 * Page Status Badge Component
 * Renders standardized badges for page statuses: draft, published, archived.
 * School News Platform - Step 09.5A
 */

import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { PAGE_STATUS_CONFIG } from '../config/pagesConfig';
import type { PageStatus } from '../types/page';

interface PageStatusBadgeProps {
  status: PageStatus;
  className?: string;
}

export const PageStatusBadge: React.FC<PageStatusBadgeProps> = ({ status, className }) => {
  const config = PAGE_STATUS_CONFIG[status] || {
    label: status,
    description: '',
    badgeVariant: 'secondary' as const,
  };

  // Map config variant to our Badge component variants
  let badgeVariant: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline' = 'default';

  switch (status) {
    case 'published':
      badgeVariant = 'success';
      break;
    case 'draft':
      badgeVariant = 'warning';
      break;
    case 'archived':
      badgeVariant = 'outline';
      break;
    default:
      badgeVariant = 'default';
  }

  return (
    <Badge
      variant={badgeVariant}
      className={className}
      title={config.description}
    >
      {config.label}
    </Badge>
  );
};
