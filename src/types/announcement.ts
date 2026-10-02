/**
 * Announcements Module Domain Types & Helpers
 * School News Platform - Step 07 Thông báo điều hành
 */

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export type AnnouncementStatus = 'draft' | 'published';

export type AnnouncementDerivedStatus = 'draft' | 'scheduled' | 'published' | 'expired';

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string; // Plain-text only
  priority: AnnouncementPriority;
  is_pinned: boolean;
  status: AnnouncementStatus;
  published_at: string | null;
  expires_at: string | null;
  created_by?: string | null;
  published_by?: string | null;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    full_name: string;
    email?: string;
  } | null;
  publisher?: {
    id: string;
    full_name: string;
    email?: string;
  } | null;
}

export interface AnnouncementFilterParams {
  searchQuery?: string;
  priority?: AnnouncementPriority | 'all';
  status?: AnnouncementStatus | 'all';
  derivedStatus?: AnnouncementDerivedStatus | 'all';
  isPinned?: boolean;
  page?: number;
  limit?: number;
  sort?: 'default' | 'latest' | 'oldest' | 'priority';
}

export interface AnnouncementPaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  is_pinned: boolean;
  publish_mode: 'draft' | 'publish_now' | 'schedule';
  published_at?: string | null;
  has_expiry: boolean;
  expires_at?: string | null;
}

/**
 * Derives the visual/human-friendly lifecycle status of an announcement
 */
export function getDerivedAnnouncementStatus(
  announcement: Pick<AnnouncementItem, 'status' | 'published_at' | 'expires_at'>,
  now: Date = new Date()
): AnnouncementDerivedStatus {
  if (announcement.status === 'draft') {
    return 'draft';
  }

  const nowTime = now.getTime();

  // Check scheduled in future
  if (announcement.published_at) {
    const pubTime = new Date(announcement.published_at).getTime();
    if (pubTime > nowTime) {
      return 'scheduled';
    }
  }

  // Check expired
  if (announcement.expires_at) {
    const expTime = new Date(announcement.expires_at).getTime();
    if (expTime <= nowTime) {
      return 'expired';
    }
  }

  return 'published';
}

/**
 * Checks if an announcement satisfies public visibility conditions
 */
export function isAnnouncementPublic(
  announcement: Pick<AnnouncementItem, 'status' | 'published_at' | 'expires_at'>,
  now: Date = new Date()
): boolean {
  if (announcement.status !== 'published') return false;

  const nowTime = now.getTime();

  if (!announcement.published_at) return false;
  const pubTime = new Date(announcement.published_at).getTime();
  if (pubTime > nowTime) return false;

  if (announcement.expires_at) {
    const expTime = new Date(announcement.expires_at).getTime();
    if (expTime <= nowTime) return false;
  }

  return true;
}

export function getPriorityLabel(priority: AnnouncementPriority): string {
  switch (priority) {
    case 'urgent':
      return 'Khẩn cấp';
    case 'important':
      return 'Quan trọng';
    case 'normal':
    default:
      return 'Bình thường';
  }
}

export function getDerivedStatusLabel(status: AnnouncementDerivedStatus): string {
  switch (status) {
    case 'published':
      return 'Đang hiển thị';
    case 'scheduled':
      return 'Lên lịch';
    case 'draft':
      return 'Bản nháp';
    case 'expired':
      return 'Đã hết hạn';
  }
}
