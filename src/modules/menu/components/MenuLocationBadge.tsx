/**
 * Menu Location Badge Component
 * Renders standardized badges for menu locations: header, footer, sidebar.
 * School News Platform - Step 09.5B
 */

import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { MENU_LOCATION_CONFIG } from '../config/menuConfig';
import type { MenuLocation } from '../types/menu';

interface MenuLocationBadgeProps {
  location: MenuLocation;
  className?: string;
}

export const MenuLocationBadge: React.FC<MenuLocationBadgeProps> = ({ location, className }) => {
  const config = MENU_LOCATION_CONFIG[location] || {
    label: location,
    description: '',
  };

  let badgeVariant: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline' = 'default';

  switch (location) {
    case 'header':
      badgeVariant = 'primary';
      break;
    case 'footer':
      badgeVariant = 'accent';
      break;
    case 'sidebar':
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
