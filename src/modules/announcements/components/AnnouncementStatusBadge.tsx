/**
 * Derived Status Badge for Announcements CMS
 * School News Platform - Step 07 Thông báo điều hành
 */

import React from 'react';
import { CheckCircle2, Clock, FileText, AlertCircle } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import {
  AnnouncementItem,
  AnnouncementDerivedStatus,
  getDerivedAnnouncementStatus,
  getDerivedStatusLabel,
} from '../types/announcement';

interface AnnouncementStatusBadgeProps {
  announcement?: Pick<AnnouncementItem, 'status' | 'published_at' | 'expires_at'>;
  derivedStatus?: AnnouncementDerivedStatus;
  className?: string;
}

export const AnnouncementStatusBadge: React.FC<AnnouncementStatusBadgeProps> = ({
  announcement,
  derivedStatus: explicitStatus,
  className = '',
}) => {
  const status =
    explicitStatus ||
    (announcement ? getDerivedAnnouncementStatus(announcement) : 'draft');

  switch (status) {
    case 'published':
      return (
        <Badge
          variant="success"
          className={className}
          icon={<CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />}
        >
          {getDerivedStatusLabel('published')}
        </Badge>
      );
    case 'scheduled':
      return (
        <Badge
          variant="primary"
          className={className}
          icon={<Clock className="h-3 w-3 text-blue-600 shrink-0" />}
        >
          {getDerivedStatusLabel('scheduled')}
        </Badge>
      );
    case 'expired':
      return (
        <Badge
          variant="outline"
          className={`text-slate-500 bg-slate-50 border-slate-300 ${className}`}
          icon={<AlertCircle className="h-3 w-3 text-slate-400 shrink-0" />}
        >
          {getDerivedStatusLabel('expired')}
        </Badge>
      );
    case 'draft':
    default:
      return (
        <Badge
          variant="default"
          className={`text-slate-600 ${className}`}
          icon={<FileText className="h-3 w-3 text-slate-400 shrink-0" />}
        >
          {getDerivedStatusLabel('draft')}
        </Badge>
      );
  }
};
