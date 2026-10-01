/**
 * Menu Status Badge Component
 * Renders active/inactive badges for menus and menu items.
 * School News Platform - Step 09.5B
 */

import React from 'react';
import { Badge } from '../../../components/ui/Badge';

interface MenuStatusBadgeProps {
  isActive: boolean;
  className?: string;
  labels?: { active: string; inactive: string };
}

export const MenuStatusBadge: React.FC<MenuStatusBadgeProps> = ({
  isActive,
  className,
  labels = { active: 'Hoạt động', inactive: 'Đang ẩn' },
}) => {
  return (
    <Badge
      variant={isActive ? 'success' : 'outline'}
      className={className}
      title={isActive ? 'Đang được kích hoạt hiển thị' : 'Đang tạm ẩn'}
    >
      {isActive ? labels.active : labels.inactive}
    </Badge>
  );
};
