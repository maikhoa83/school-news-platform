/**
 * School News Platform - Centralized Role/Permission Matrix Reference
 * Step 10.2: Authoritative Metadata and Permission Matrix
 *
 * Strict Compliance:
 * - Exactly 40 AppPermission entries.
 * - Exactly 5 System Roles (SUPER_ADMIN, ADMIN, EDITOR, AUTHOR, PUBLIC_VISITOR).
 * - Deterministic Action Categorization: READ, WRITE, PUBLISH, DELETE, MANAGE.
 * - Reflects database seeds and migrations source of truth.
 * - Database RLS and public.has_permission() remain the final security enforcement boundary.
 */

import type {
  AppPermission,
  AppRole,
  PermissionDefinition,
  RoleDefinition,
} from './types';

/**
 * The 5 Immutable Baseline Roles
 */
export const APP_ROLES: readonly RoleDefinition[] = [
  {
    code: 'SUPER_ADMIN',
    name: 'Quản trị viên tối cao',
    description: 'Quản trị hệ thống, toàn quyền cấu hình và bảo trì cài đặt trường',
    hierarchy: 100,
    is_system: true,
  },
  {
    code: 'ADMIN',
    name: 'Quản trị viên trường',
    description: 'Ban giám hiệu, cán bộ phụ trách CNTT quản trị nội dung và người dùng',
    hierarchy: 80,
    is_system: true,
  },
  {
    code: 'EDITOR',
    name: 'Biên tập viên',
    description: 'Tổ trưởng chuyên môn, ban biên tập duyệt và xuất bản bài viết',
    hierarchy: 60,
    is_system: true,
  },
  {
    code: 'AUTHOR',
    name: 'Cộng tác viên / Tác giả',
    description: 'Giáo viên, cán bộ có quyền tạo bài viết và gửi duyệt',
    hierarchy: 40,
    is_system: true,
  },
  {
    code: 'PUBLIC_VISITOR',
    name: 'Khách vãng lai',
    description: 'Người truy cập công khai website nhà trường, phụ huynh, học sinh',
    hierarchy: 10,
    is_system: true,
  },
] as const;

/**
 * The 40 Verified Permissions across 10 Resources
 */
export const APP_PERMISSIONS: readonly PermissionDefinition[] = [
  // 1. NEWS (10)
  {
    code: 'news.view',
    resource: 'news',
    action: 'view',
    actionGroup: 'READ',
    description: 'Xem danh sách và chi tiết bài viết tin tức',
  },
  {
    code: 'news.create',
    resource: 'news',
    action: 'create',
    actionGroup: 'WRITE',
    description: 'Soạn thảo bài viết mới',
  },
  {
    code: 'news.edit_own',
    resource: 'news',
    action: 'edit_own',
    actionGroup: 'WRITE',
    description: 'Chỉnh sửa bài viết do chính mình tạo',
  },
  {
    code: 'news.edit',
    resource: 'news',
    action: 'edit',
    actionGroup: 'WRITE',
    description: 'Chỉnh sửa bài viết của mọi tác giả',
  },
  {
    code: 'news.submit',
    resource: 'news',
    action: 'submit',
    actionGroup: 'PUBLISH',
    description: 'Gửi bài viết lên ban biên tập chờ duyệt',
  },
  {
    code: 'news.publish',
    resource: 'news',
    action: 'publish',
    actionGroup: 'PUBLISH',
    description: 'Duyệt và xuất bản bài viết lên website',
  },
  {
    code: 'news.delete',
    resource: 'news',
    action: 'delete',
    actionGroup: 'DELETE',
    description: 'Xóa bài viết',
  },
  {
    code: 'news.manage_categories',
    resource: 'news',
    action: 'manage_categories',
    actionGroup: 'MANAGE',
    description: 'Quản trị danh mục chuyên mục tin tức',
  },
  {
    code: 'news.manage_tags',
    resource: 'news',
    action: 'manage_tags',
    actionGroup: 'MANAGE',
    description: 'Quản trị hệ thống thẻ tag tin tức',
  },
  {
    code: 'news.manage_comments',
    resource: 'news',
    action: 'manage_comments',
    actionGroup: 'MANAGE',
    description: 'Kiểm duyệt và quản lý bình luận tin tức',
  },

  // 2. DOCUMENTS (6)
  {
    code: 'documents.view',
    resource: 'documents',
    action: 'view',
    actionGroup: 'READ',
    description: 'Xem và tải văn bản, công văn, biểu mẫu',
  },
  {
    code: 'documents.create',
    resource: 'documents',
    action: 'create',
    actionGroup: 'WRITE',
    description: 'Thêm mới văn bản hành chính',
  },
  {
    code: 'documents.edit',
    resource: 'documents',
    action: 'edit',
    actionGroup: 'WRITE',
    description: 'Chỉnh sửa văn bản hành chính',
  },
  {
    code: 'documents.publish',
    resource: 'documents',
    action: 'publish',
    actionGroup: 'PUBLISH',
    description: 'Duyệt và xuất bản văn bản hành chính lên website',
  },
  {
    code: 'documents.upload',
    resource: 'documents',
    action: 'upload',
    actionGroup: 'WRITE',
    description: 'Tải tệp văn bản và biểu mẫu lên hệ thống',
  },
  {
    code: 'documents.delete',
    resource: 'documents',
    action: 'delete',
    actionGroup: 'DELETE',
    description: 'Xóa văn bản',
  },

  // 3. ANNOUNCEMENTS (5)
  {
    code: 'announcements.view',
    resource: 'announcements',
    action: 'view',
    actionGroup: 'READ',
    description: 'Xem danh sách và chi tiết thông báo điều hành',
  },
  {
    code: 'announcements.create',
    resource: 'announcements',
    action: 'create',
    actionGroup: 'WRITE',
    description: 'Tạo mới bản nháp thông báo điều hành',
  },
  {
    code: 'announcements.edit',
    resource: 'announcements',
    action: 'edit',
    actionGroup: 'WRITE',
    description: 'Chỉnh sửa nội dung, ghim và mức độ ưu tiên thông báo',
  },
  {
    code: 'announcements.publish',
    resource: 'announcements',
    action: 'publish',
    actionGroup: 'PUBLISH',
    description: 'Xuất bản hoặc lên lịch thông báo điều hành',
  },
  {
    code: 'announcements.delete',
    resource: 'announcements',
    action: 'delete',
    actionGroup: 'DELETE',
    description: 'Xóa thông báo điều hành khỏi hệ thống',
  },

  // 4. MEDIA (4)
  {
    code: 'media.view',
    resource: 'media',
    action: 'view',
    actionGroup: 'READ',
    description: 'Xem thư viện hình ảnh và đa phương tiện',
  },
  {
    code: 'media.upload',
    resource: 'media',
    action: 'upload',
    actionGroup: 'WRITE',
    description: 'Tải tệp hình ảnh và đa phương tiện lên hệ thống',
  },
  {
    code: 'media.edit',
    resource: 'media',
    action: 'edit',
    actionGroup: 'WRITE',
    description: 'Chỉnh sửa thông tin hình ảnh và quản lý album',
  },
  {
    code: 'media.delete',
    resource: 'media',
    action: 'delete',
    actionGroup: 'DELETE',
    description: 'Xóa hình ảnh và album khỏi hệ thống',
  },

  // 5. PAGES (4)
  {
    code: 'pages.view',
    resource: 'pages',
    action: 'view',
    actionGroup: 'READ',
    description: 'Xem danh sách và chi tiết trang tĩnh quản trị',
  },
  {
    code: 'pages.create',
    resource: 'pages',
    action: 'create',
    actionGroup: 'WRITE',
    description: 'Tạo trang thông tin tĩnh mới cho nhà trường',
  },
  {
    code: 'pages.edit',
    resource: 'pages',
    action: 'edit',
    actionGroup: 'WRITE',
    description: 'Chỉnh sửa nội dung và thông tin trang tĩnh',
  },
  {
    code: 'pages.delete',
    resource: 'pages',
    action: 'delete',
    actionGroup: 'DELETE',
    description: 'Xóa trang thông tin tĩnh khỏi hệ thống',
  },

  // 6. HOMEPAGE (3)
  {
    code: 'homepage.view',
    resource: 'homepage',
    action: 'view',
    actionGroup: 'READ',
    description: 'Xem cấu hình bố cục trang chủ',
  },
  {
    code: 'homepage.edit',
    resource: 'homepage',
    action: 'edit',
    actionGroup: 'WRITE',
    description: 'Chỉnh sửa và sắp xếp các khối trang chủ',
  },
  {
    code: 'homepage.publish',
    resource: 'homepage',
    action: 'publish',
    actionGroup: 'PUBLISH',
    description: 'Xuất bản bố cục trang chủ ra ngoài',
  },

  // 7. USERS (4)
  {
    code: 'users.view',
    resource: 'users',
    action: 'view',
    actionGroup: 'READ',
    description: 'Xem danh sách tài khoản người dùng',
  },
  {
    code: 'users.create',
    resource: 'users',
    action: 'create',
    actionGroup: 'WRITE',
    description: 'Tạo tài khoản giáo viên/cán bộ mới',
  },
  {
    code: 'users.edit',
    resource: 'users',
    action: 'edit',
    actionGroup: 'MANAGE',
    description: 'Phân quyền và chỉnh sửa tài khoản',
  },
  {
    code: 'users.delete',
    resource: 'users',
    action: 'delete',
    actionGroup: 'DELETE',
    description: 'Khóa hoặc xóa tài khoản người dùng',
  },

  // 8. SETTINGS (2)
  {
    code: 'settings.view',
    resource: 'settings',
    action: 'view',
    actionGroup: 'READ',
    description: 'Xem thông tin cấu hình trường',
  },
  {
    code: 'settings.edit',
    resource: 'settings',
    action: 'edit',
    actionGroup: 'MANAGE',
    description: 'Cập nhật cấu hình nhận diện và hệ thống',
  },

  // 9. AUDIT (1)
  {
    code: 'audit.view',
    resource: 'audit',
    action: 'view',
    actionGroup: 'READ',
    description: 'Xem nhật ký hoạt động hệ thống',
  },

  // 10. HEALTH (1)
  {
    code: 'health.view',
    resource: 'health',
    action: 'view',
    actionGroup: 'READ',
    description: 'Xem trạng thái kiểm tra hệ thống',
  },
] as const;

/**
 * Fast lookup set of all 40 valid permission codes
 */
export const VALID_PERMISSION_CODES: ReadonlySet<string> = new Set(
  APP_PERMISSIONS.map((p) => p.code)
);

/**
 * Type guard to verify if an arbitrary string is a valid AppPermission
 */
export function isKnownPermission(code: string): code is AppPermission {
  return VALID_PERMISSION_CODES.has(code);
}

/**
 * Static Role x Permission Matrix Reference
 * Mapped according to the PostgreSQL migrations and baseline seeds.
 */
export const ROLE_PERMISSIONS_MATRIX: Record<
  AppRole,
  { readonly wildcard: boolean; readonly permissions: readonly AppPermission[] }
> = {
  SUPER_ADMIN: {
    wildcard: true,
    permissions: APP_PERMISSIONS.map((p) => p.code),
  },
  ADMIN: {
    wildcard: false,
    permissions: [
      // ADMIN possesses all 40 baseline permissions
      'news.view',
      'news.create',
      'news.edit_own',
      'news.edit',
      'news.submit',
      'news.publish',
      'news.delete',
      'news.manage_categories',
      'news.manage_tags',
      'news.manage_comments',
      'documents.view',
      'documents.create',
      'documents.edit',
      'documents.publish',
      'documents.upload',
      'documents.delete',
      'announcements.view',
      'announcements.create',
      'announcements.edit',
      'announcements.publish',
      'announcements.delete',
      'media.view',
      'media.upload',
      'media.edit',
      'media.delete',
      'pages.view',
      'pages.create',
      'pages.edit',
      'pages.delete',
      'homepage.view',
      'homepage.edit',
      'homepage.publish',
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'settings.view',
      'settings.edit',
      'audit.view',
      'health.view',
    ],
  },
  EDITOR: {
    wildcard: false,
    permissions: [
      'news.view',
      'news.create',
      'news.edit',
      'news.submit',
      'news.publish',
      'news.manage_categories',
      'news.manage_tags',
      'news.manage_comments',
      'documents.view',
      'documents.create',
      'documents.edit',
      'documents.publish',
      'documents.upload',
      'announcements.view',
      'announcements.create',
      'announcements.edit',
      'announcements.publish',
      'media.view',
      'media.upload',
      'media.edit',
      'pages.view',
      'pages.create',
      'pages.edit',
      'homepage.view',
      'health.view',
    ],
  },
  AUTHOR: {
    wildcard: false,
    permissions: [
      'news.view',
      'news.create',
      'news.edit_own',
      'news.submit',
      'documents.view',
      'documents.create',
      'documents.upload',
      'announcements.create',
      'media.upload',
    ],
  },
  PUBLIC_VISITOR: {
    wildcard: false,
    permissions: [],
  },
} as const;

/**
 * Helper to check if a specific role possesses a permission according to the reference matrix
 */
export function hasRolePermission(role: AppRole, permission: AppPermission): boolean {
  const roleConfig = ROLE_PERMISSIONS_MATRIX[role];
  if (!roleConfig) return false;
  if (roleConfig.wildcard) return true;
  return roleConfig.permissions.includes(permission);
}

/**
 * Helper to retrieve all permissions of a role
 */
export function getRolePermissions(role: AppRole): readonly AppPermission[] {
  const roleConfig = ROLE_PERMISSIONS_MATRIX[role];
  if (!roleConfig) return [];
  return roleConfig.permissions;
}
