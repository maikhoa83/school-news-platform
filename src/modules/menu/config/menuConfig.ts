/**
 * Menu Module Configurations & Constants
 * School News Platform - Step 09.4B
 */

import type { MenuLocation, MenuItemTarget, MenuSortField, MenuItemSortField } from '../types/menu';

export const MENU_LOCATIONS: readonly MenuLocation[] = ['header', 'footer', 'sidebar'] as const;

export const MENU_LOCATION_CONFIG: Record<
  MenuLocation,
  { label: string; description: string }
> = {
  header: {
    label: 'Đầu trang (Header)',
    description: 'Thanh điều hướng chính xuất hiện ở đầu tất cả các trang.',
  },
  footer: {
    label: 'Chân trang (Footer)',
    description: 'Liên kết phụ trợ xuất hiện ở chân trang.',
  },
  sidebar: {
    label: 'Thanh bên (Sidebar)',
    description: 'Menu dạng cây xuất hiện ở cột bên trái hoặc phải.',
  },
};

export const MENU_ITEM_TARGETS: readonly MenuItemTarget[] = ['_self', '_blank'] as const;

export const MENU_ITEM_TARGET_CONFIG: Record<
  MenuItemTarget,
  { label: string; description: string }
> = {
  _self: {
    label: 'Mở trên tab hiện tại (_self)',
    description: 'Điều hướng ngay trong trang đang xem.',
  },
  _blank: {
    label: 'Mở tab mới (_blank)',
    description: 'Mở liên kết trong một tab hoặc cửa sổ mới.',
  },
};

export const MENU_SORT_OPTIONS: Array<{ value: MenuSortField; label: string }> = [
  { value: 'name', label: 'Tên menu (A-Z)' },
  { value: 'code', label: 'Mã menu (code)' },
  { value: 'location', label: 'Vị trí hiển thị' },
  { value: 'created_at', label: 'Ngày tạo' },
  { value: 'updated_at', label: 'Ngày cập nhật' },
];

export const MENU_ITEM_SORT_OPTIONS: Array<{ value: MenuItemSortField; label: string }> = [
  { value: 'sort_order', label: 'Thứ tự ưu tiên (sort_order)' },
  { value: 'title', label: 'Tiêu đề (A-Z)' },
  { value: 'created_at', label: 'Ngày tạo' },
];

/**
 * Standard convention identifiers for public menus
 * School News Platform - Step 09.6B
 */
export const PUBLIC_HEADER_MENU_CODE = 'header-main';
export const PUBLIC_FOOTER_MENU_CODE = 'footer-links';

