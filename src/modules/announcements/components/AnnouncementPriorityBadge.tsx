/**
 * Priority Badge for Announcements
 * School News Platform - Step 07 Thông báo điều hành
 */

import React from 'react';
import { AlertTriangle, AlertCircle, Bell } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { AnnouncementPriority, getPriorityLabel } from '../types/announcement';

interface AnnouncementPriorityBadgeProps {
  priority: AnnouncementPriority;
  showIcon?: boolean;
  className?: string;
}

export const AnnouncementPriorityBadge: React.FC<AnnouncementPriorityBadgeProps> = ({
  priority,
  showIcon = true,
  className = '',
}) => {
  if (priority === 'urgent') {
    return (
      <Badge
        variant="danger"
        className={`font-semibold tracking-wide ${className}`}
        icon={showIcon ? <AlertTriangle className="h-3 w-3 text-red-600 shrink-0" /> : undefined}
      >
        {getPriorityLabel('urgent')}
      </Badge>
    );
  }

  if (priority === 'important') {
    return (
      <Badge
        variant="warning"
        className={`font-semibold ${className}`}
        icon={showIcon ? <AlertCircle className="h-3 w-3 text-amber-700 shrink-0" /> : undefined}
      >
        {getPriorityLabel('important')}
      </Badge>
    );
  }

  return (
    <Badge
      variant="default"
      className={`text-slate-600 border-slate-200 ${className}`}
      icon={showIcon ? <Bell className="h-3 w-3 text-slate-400 shrink-0" /> : undefined}
    >
      {getPriorityLabel('normal')}
    </Badge>
  );
};
