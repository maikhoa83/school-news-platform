/**
 * Page Template Badge Component
 * Renders visual labels for layout templates: default, fullwidth, sidebar, contact.
 * School News Platform - Step 09.5A
 */

import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { PAGE_TEMPLATE_CONFIG } from '../config/pagesConfig';
import type { PageTemplate } from '../types/page';

interface PageTemplateBadgeProps {
  template: PageTemplate;
  className?: string;
}

export const PageTemplateBadge: React.FC<PageTemplateBadgeProps> = ({ template, className }) => {
  const config = PAGE_TEMPLATE_CONFIG[template] || {
    label: template,
    description: '',
  };

  return (
    <Badge
      variant="default"
      className={className}
      title={config.description}
    >
      {config.label}
    </Badge>
  );
};
