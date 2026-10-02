/**
 * Users & RBAC Configuration & Constants
 * School News Platform - Step 10.1 Users + RBAC Foundation
 *
 * Strict Compliance:
 * - Exactly 5 baseline roles: SUPER_ADMIN, ADMIN, EDITOR, AUTHOR, PUBLIC_VISITOR
 * - Zero invented permissions: strictly uses approved catalog
 */

import { RoleCode } from '../types/user';

export interface RoleMetadata {
  code: RoleCode;
  name: string;
  description: string;
  badge: string;
  variant: 'destructive' | 'primary' | 'accent' | 'secondary' | 'outline';
  weight: number; // Higher number = higher privilege
}

export const BASELINE_ROLES: Record<RoleCode, RoleMetadata> = {
  SUPER_ADMIN: {
    code: 'SUPER_ADMIN',
    name: 'Quản trị viên tối cao',
    description: 'Quản trị hệ thống, toàn quyền cấu hình và bảo trì cài đặt trường',
    badge: 'Toàn quyền (*)',
    variant: 'destructive',
    weight: 100,
  },
  ADMIN: {
    code: 'ADMIN',
    name: 'Quản trị viên trường',
    description: 'Ban giám hiệu, cán bộ phụ trách CNTT quản trị nội dung và người dùng',
    badge: 'Quản trị viên',
    variant: 'primary',
    weight: 80,
  },
  EDITOR: {
    code: 'EDITOR',
    name: 'Biên tập viên',
    description: 'Tổ trưởng chuyên môn, ban biên tập duyệt và xuất bản bài viết',
    badge: 'Biên tập viên',
    variant: 'accent',
    weight: 60,
  },
  AUTHOR: {
    code: 'AUTHOR',
    name: 'Cộng tác viên / Tác giả',
    description: 'Giáo viên, cán bộ có quyền tạo bài viết và gửi duyệt',
    badge: 'Tác giả',
    variant: 'secondary',
    weight: 40,
  },
  PUBLIC_VISITOR: {
    code: 'PUBLIC_VISITOR',
    name: 'Khách vãng lai',
    description: 'Người truy cập công khai website nhà trường, phụ huynh, học sinh',
    badge: 'Khách',
    variant: 'outline',
    weight: 10,
  },
};

export const ROLE_HIERARCHY: RoleCode[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'EDITOR',
  'AUTHOR',
  'PUBLIC_VISITOR',
];

export const RESOURCE_LABELS: Record<string, string> = {
  news: 'Tin tức & Bài viết',
  documents: 'Văn bản - Tài liệu',
  announcements: 'Thông báo điều hành',
  media: 'Thư viện hình ảnh',
  pages: 'Trang thông tin tĩnh',
  homepage: 'Giao diện trang chủ',
  users: 'Người dùng & Phân quyền',
  settings: 'Cấu hình hệ thống',
  audit: 'Nhật ký hoạt động',
  health: 'Kiểm tra hệ thống',
};

export const USER_LIMITS = {
  FULL_NAME_MIN: 2,
  FULL_NAME_MAX: 100,
  PHONE_MAX: 20,
  AVATAR_URL_MAX: 2048,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
} as const;

export const USER_QUERY_KEYS = {
  ALL: ['users'] as const,
  LIST: (params?: unknown) => ['users', 'list', params] as const,
  DETAIL: (id: string) => ['users', 'detail', id] as const,
  STATS: ['users', 'stats'] as const,
  ROLES: ['roles', 'all'] as const,
  PERMISSIONS: ['permissions', 'all'] as const,
};
