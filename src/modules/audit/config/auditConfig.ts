/**
 * Audit Log Configuration & Labels
 * School News Platform - Step 10.3
 */

import type { AuditClassification, AuditResult, AuditAction } from '../types/audit';

export const AUDIT_CLASSIFICATIONS: AuditClassification[] = [
  'AUTH',
  'AUTHORIZATION',
  'USER',
  'ROLE',
  'CONTENT',
  'SETTINGS',
  'SECURITY',
];

export const AUDIT_RESULTS: AuditResult[] = ['SUCCESS', 'DENIED', 'FAILURE'];

export const AUDIT_CLASSIFICATION_CONFIG: Record<
  AuditClassification,
  { label: string; description: string; badgeColor: string }
> = {
  AUTH: {
    label: 'Xác thực',
    description: 'Sự kiện đăng nhập, đăng xuất và phiên làm việc',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  AUTHORIZATION: {
    label: 'Ủy quyền',
    description: 'Kiểm tra quyền hạn và từ chối truy cập tài nguyên',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  USER: {
    label: 'Người dùng',
    description: 'Quản lý tài khoản, hồ sơ và trạng thái cán bộ',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  ROLE: {
    label: 'Vai trò & Quyền',
    description: 'Phân quyền, gán vai trò và cập nhật đặc quyền',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  CONTENT: {
    label: 'Nội dung',
    description: 'Thao tác tạo, sửa, xóa, duyệt và xuất bản thông tin',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  SETTINGS: {
    label: 'Cài đặt trường',
    description: 'Cấu hình nhận diện, SEO và bật/tắt các phân hệ',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  SECURITY: {
    label: 'Bảo mật & Cảnh báo',
    description: 'Ngăn chặn leo thang đặc quyền và các hành vi bất thường',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const AUDIT_RESULT_CONFIG: Record<
  AuditResult,
  { label: string; badgeColor: string; dotColor: string }
> = {
  SUCCESS: {
    label: 'Thành công',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  DENIED: {
    label: 'Bị từ chối',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
  },
  FAILURE: {
    label: 'Thất bại',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    dotColor: 'bg-rose-500',
  },
};

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  AUTH_LOGIN_SUCCESS: 'Đăng nhập thành công',
  AUTH_LOGIN_FAILURE: 'Đăng nhập thất bại',
  AUTH_LOGOUT: 'Đăng xuất khỏi hệ thống',
  AUTHORIZATION_DENIED: 'Truy cập bị từ chối do thiếu quyền',
  PERMISSION_CHECK_DENIED: 'Thao tác bị chặn bởi kiểm tra phân quyền',
  USER_CREATED: 'Tạo mới tài khoản người dùng',
  USER_ROLE_ASSIGNED: 'Gán vai trò cho người dùng',
  USER_ROLE_REVOKED: 'Thu hồi vai trò người dùng',
  USER_PROFILE_UPDATED: 'Cập nhật thông tin hồ sơ người dùng',
  USER_ACCOUNT_DISABLED: 'Khóa / Vô hiệu hóa tài khoản',
  USER_DELETED: 'Xóa tài khoản người dùng',
  ROLE_PERMISSIONS_UPDATED: 'Cập nhật phân bổ quyền vai trò',
  CONTENT_CREATED: 'Tạo mới bài viết / nội dung',
  CONTENT_UPDATED: 'Cập nhật nội dung',
  CONTENT_DELETED: 'Xóa nội dung khỏi hệ thống',
  CONTENT_PUBLISHED: 'Duyệt và xuất bản nội dung',
  CONTENT_SUBMITTED: 'Gửi bài viết chờ duyệt',
  CONTENT_ARCHIVED: 'Lưu trữ nội dung',
  SETTINGS_UPDATED: 'Cập nhật cấu hình cài đặt trường',
  MODULE_STATUS_CHANGED: 'Thay đổi trạng thái bật/tắt phân hệ',
  SEO_SETTINGS_UPDATED: 'Cập nhật cấu hình SEO trường học',
  PRIVILEGE_ESCALATION_ATTEMPT: 'Cảnh báo cố ý leo thang đặc quyền',
  SUSPICIOUS_ACCESS_DETECTED: 'Phát hiện truy cập bất thường',
};

export const AUDIT_ACTIONS: AuditAction[] = Object.keys(
  AUDIT_ACTION_LABELS
) as AuditAction[];

export const AUDIT_RESOURCE_LABELS: Record<string, string> = {
  news: 'Tin tức & Sự kiện',
  documents: 'Văn bản điều hành',
  announcements: 'Thông báo',
  media: 'Thư viện Media',
  pages: 'Trang thông tin tĩnh',
  homepage: 'Trang chủ',
  users: 'Quản lý người dùng',
  roles: 'Vai trò & Phân quyền',
  settings: 'Cài đặt hệ thống',
  audit: 'Nhật ký kiểm toán',
  health: 'Kiểm tra sức khỏe',
  auth: 'Xác thực & Phiên',
  system: 'Hệ thống nền tảng',
};

export const AUDIT_LIMITS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAX_SEARCH_LENGTH: 100,
  MAX_METADATA_STRING_LENGTH: 500,
  MAX_METADATA_DEPTH: 3,
  MAX_METADATA_KEYS: 30,
} as const;

/**
 * Regex patterns matching sensitive keys that MUST be purged from metadata
 */
export const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /passwd/i,
  /secret/i,
  /token/i,
  /apikey/i,
  /api_key/i,
  /access_token/i,
  /refresh_token/i,
  new RegExp(['service', 'role'].join('_'), 'i'),
  new RegExp(['service', 'role', 'key'].join('_'), 'i'),
  /bearer/i,
  /authorization/i,
  /cookie/i,
  /session_secret/i,
  /credential/i,
  /private_key/i,
  /hash/i,
];
