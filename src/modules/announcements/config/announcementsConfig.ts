/**
 * Announcements Module Configuration
 * School News Platform - Step 07 Thông báo điều hành
 */

import { AnnouncementPriority } from '../types/announcement';

export const ANNOUNCEMENTS_CONFIG = {
  moduleKey: 'announcements',
  moduleName: 'Thông báo điều hành',
  publicRoute: '/thong-bao',
  publicRouteAlias: '/announcements',
  adminRoute: '/admin/announcements',
  adminCreateRoute: '/admin/announcements/new',
  defaultPublicLimit: 10,
  defaultAdminLimit: 10,
  defaultHomepageLimit: 4,
  priorities: [
    {
      value: 'normal' as AnnouncementPriority,
      label: 'Bình thường',
      color: 'slate',
      badgeVariant: 'neutral' as const,
      description: 'Thông báo thông tin chung, kế hoạch tuần và hoạt động định kỳ',
    },
    {
      value: 'important' as AnnouncementPriority,
      label: 'Quan trọng',
      color: 'amber',
      badgeVariant: 'warning' as const,
      description: 'Lịch thi, họp phụ huynh, thông báo học vụ và tài chính',
    },
    {
      value: 'urgent' as AnnouncementPriority,
      label: 'Khẩn cấp',
      color: 'red',
      badgeVariant: 'danger' as const,
      description: 'Nghỉ học đột xuất, thay đổi thời tiết, thông báo phòng chống dịch/bão',
    },
  ],
} as const;
