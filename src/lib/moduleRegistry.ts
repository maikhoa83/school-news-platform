import { ModuleDefinition, ModuleKey } from '../types';

/**
 * Baseline Module Registry for School News Platform
 * Specifies static module contracts, permissions, category, and metadata.
 * NOTE: Dynamic enabled state is strictly managed via module_settings table.
 */
export const MODULE_REGISTRY: Record<ModuleKey, ModuleDefinition> = {
  news: {
    key: 'news',
    name: 'Tin tức & Bài viết',
    description: 'Quản lý bài viết tin tức, hoạt động giảng dạy và sự kiện nhà trường',
    category: 'content',
    requiredPermissions: ['news.view'],
    publicRoute: '/tin-tuc',
    adminRoute: '/admin/news',
    navIconName: 'Newspaper',
  },
  categories: {
    key: 'categories',
    name: 'Chuyên mục',
    description: 'Hệ thống phân cấp chuyên mục bài viết và tài liệu',
    category: 'content',
    requiredPermissions: ['news.create'],
    adminRoute: '/admin/categories',
    navIconName: 'FolderTree',
  },
  documents: {
    key: 'documents',
    name: 'Văn bản & Biểu mẫu',
    description: 'Công văn, quyết định, kế hoạch năm học và biểu mẫu hành chính',
    category: 'content',
    requiredPermissions: ['documents.view'],
    publicRoute: '/van-ban',
    adminRoute: '/admin/documents',
    navIconName: 'FileText',
  },
  announcements: {
    key: 'announcements',
    name: 'Thông báo',
    description: 'Bản tin thông báo khẩn, thông báo học vụ và thời khóa biểu',
    category: 'content',
    requiredPermissions: ['announcements.view'],
    publicRoute: '/thong-bao',
    adminRoute: '/admin/announcements',
    navIconName: 'Bell',
  },
  media: {
    key: 'media',
    name: 'Thư viện Đa phương tiện',
    description: 'Kho lưu trữ hình ảnh, video clip và tư liệu số của trường',
    category: 'content',
    requiredPermissions: ['media.view'],
    adminRoute: '/admin/media',
    navIconName: 'Image',
  },
  albums: {
    key: 'albums',
    name: 'Album Hoạt động',
    description: 'Bộ sưu tập ảnh sự kiện, lễ kỷ niệm và phong trào đoàn đội',
    category: 'content',
    requiredPermissions: ['media.view'],
    publicRoute: '/thu-vien-anh',
    adminRoute: '/admin/albums',
    navIconName: 'Camera',
  },
  pages: {
    key: 'pages',
    name: 'Trang Tĩnh',
    description: 'Giới thiệu nhà trường, sơ đồ tổ chức, truyền thống và liên hệ',
    category: 'content',
    requiredPermissions: ['pages.view'],
    adminRoute: '/admin/pages',
    navIconName: 'BookOpen',
  },
  menu: {
    key: 'menu',
    name: 'Quản lý Menu',
    description: 'Cấu hình menu chính đa cấp trên Header và liên kết chân trang',
    category: 'core',
    requiredPermissions: ['settings.edit'],
    adminRoute: '/admin/menu',
    navIconName: 'Menu',
  },
  homepage: {
    key: 'homepage',
    name: 'Trang chủ (Homepage Builder)',
    description: 'Xây dựng bố cục 12 cột block-based linh hoạt cho trang chủ',
    category: 'core',
    requiredPermissions: ['homepage.view'],
    adminRoute: '/admin/homepage-builder',
    navIconName: 'LayoutTemplate',
  },
  users: {
    key: 'users',
    name: 'Tài khoản & Giáo viên',
    description: 'Quản lý người dùng, ban biên tập và giáo viên phụ trách chuyên mục',
    category: 'administration',
    requiredPermissions: ['users.view'],
    adminRoute: '/admin/users',
    navIconName: 'Users',
  },
  roles: {
    key: 'roles',
    name: 'Vai trò & Phân quyền',
    description: 'Hệ thống phân quyền theo vai trò (RBAC) chi tiết từng hành động',
    category: 'administration',
    requiredPermissions: ['users.edit'],
    adminRoute: '/admin/roles',
    navIconName: 'ShieldCheck',
  },
  settings: {
    key: 'settings',
    name: 'Cấu hình Hệ thống',
    description: 'Thông tin nhận diện trường, giao diện, liên hệ và email',
    category: 'administration',
    requiredPermissions: ['settings.view'],
    adminRoute: '/admin/settings',
    navIconName: 'Settings',
  },
  seo: {
    key: 'seo',
    name: 'Cấu hình SEO & MXH',
    description: 'Thẻ meta, OpenGraph, sitemap tự động và Schema JSON-LD',
    category: 'administration',
    requiredPermissions: ['settings.edit'],
    adminRoute: '/admin/seo',
    navIconName: 'Globe',
  },
  audit: {
    key: 'audit',
    name: 'Nhật ký Hoạt động (Audit Log)',
    description: 'Theo dõi lịch sử đăng nhập, xuất bản và thao tác dữ liệu',
    category: 'administration',
    requiredPermissions: ['audit.view'],
    adminRoute: '/admin/audit',
    navIconName: 'History',
  },
  health: {
    key: 'health',
    name: 'Kiểm tra Hệ thống (Health Check)',
    description: 'Giám sát kết nối cơ sở dữ liệu, dung lượng lưu trữ và trạng thái dịch vụ',
    category: 'administration',
    requiredPermissions: ['health.view'],
    adminRoute: '/admin/health',
    navIconName: 'Activity',
  },
};

export function getAllModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY);
}

export function getModuleDefinition(key: ModuleKey): ModuleDefinition | undefined {
  return MODULE_REGISTRY[key];
}

/**
 * Backward compatibility
 */
export const getModuleContract = getModuleDefinition;

