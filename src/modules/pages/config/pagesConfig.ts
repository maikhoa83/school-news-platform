/**
 * Pages Module Configuration & Constants
 * School News Platform - Step 09.4A
 */

import type { PageStatus, PageTemplate, PageSortField } from '../types/page';

export const PAGE_STATUS_CONFIG: Record<
  PageStatus,
  { label: string; description: string; badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  draft: {
    label: 'Bản nháp',
    description: 'Trang đang biên soạn, chỉ nhân sự có quyền mới xem được',
    badgeVariant: 'secondary',
  },
  published: {
    label: 'Đã xuất bản',
    description: 'Trang thông tin hiển thị công khai trên website trường',
    badgeVariant: 'default',
  },
  archived: {
    label: 'Đã lưu trữ',
    description: 'Trang đã ngừng hiển thị công khai nhưng được lưu trữ cho mục đích nội bộ',
    badgeVariant: 'outline',
  },
};

export const PAGE_TEMPLATE_CONFIG: Record<
  PageTemplate,
  { label: string; description: string }
> = {
  default: {
    label: 'Mặc định (Standard)',
    description: 'Bố cục bài viết chuẩn với độ rộng văn bản tối ưu',
  },
  fullwidth: {
    label: 'Toàn màn hình (Full Width)',
    description: 'Bố cục tràn khung phù hợp cho trang giới thiệu đồ họa lớn hoặc landing',
  },
  sidebar: {
    label: 'Kèm thanh điều hướng (With Sidebar)',
    description: 'Bố cục kèm menu trang phụ bên cạnh cho tài liệu hướng dẫn',
  },
  contact: {
    label: 'Trang liên hệ (Contact)',
    description: 'Bố cục hiển thị biểu đồ, bản đồ và thông tin liên hệ nhà trường',
  },
};

export const PAGE_SORT_OPTIONS: Array<{ value: PageSortField; label: string }> = [
  { value: 'sort_order', label: 'Thứ tự sắp xếp' },
  { value: 'published_at', label: 'Ngày xuất bản' },
  { value: 'created_at', label: 'Ngày tạo' },
  { value: 'updated_at', label: 'Cập nhật gần nhất' },
  { value: 'title', label: 'Tiêu đề (A-Z)' },
];

export const PAGE_PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
