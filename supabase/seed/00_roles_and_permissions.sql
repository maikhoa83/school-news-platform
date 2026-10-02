-- ==============================================================================
-- SCHOOL NEWS PLATFORM - SEED 00_roles_and_permissions.sql
-- Baseline Roles and Permissions for School News Platform
-- ==============================================================================

-- Insert Standard System Roles
INSERT INTO public.roles (code, name, description, is_system)
VALUES
    ('PUBLIC_VISITOR', 'Khách vãng lai', 'Người truy cập công khai website nhà trường, phụ huynh, học sinh', TRUE),
    ('AUTHOR', 'Cộng tác viên / Tác giả', 'Giáo viên, cán bộ có quyền tạo bài viết và gửi duyệt', TRUE),
    ('EDITOR', 'Biên tập viên', 'Tổ trưởng chuyên môn, ban biên tập duyệt và xuất bản bài viết', TRUE),
    ('ADMIN', 'Quản trị viên trường', 'Ban giám hiệu, cán bộ phụ trách CNTT quản trị nội dung và người dùng', TRUE),
    ('SUPER_ADMIN', 'Quản trị viên tối cao', 'Quản trị hệ thống, toàn quyền cấu hình và bảo trì cài đặt trường', TRUE)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Insert Baseline Permissions
INSERT INTO public.permissions (code, resource, action, description)
VALUES
    ('news.view', 'news', 'view', 'Xem danh sách và chi tiết bài viết tin tức'),
    ('news.create', 'news', 'create', 'Soạn thảo bài viết mới'),
    ('news.edit_own', 'news', 'edit_own', 'Chỉnh sửa bài viết do chính mình tạo'),
    ('news.edit', 'news', 'edit', 'Chỉnh sửa bài viết của mọi tác giả'),
    ('news.submit', 'news', 'submit', 'Gửi bài viết lên ban biên tập chờ duyệt'),
    ('news.publish', 'news', 'publish', 'Duyệt và xuất bản bài viết lên website'),
    ('news.delete', 'news', 'delete', 'Xóa bài viết'),
    ('news.manage_categories', 'news', 'manage_categories', 'Quản trị danh mục chuyên mục tin tức'),
    ('news.manage_tags', 'news', 'manage_tags', 'Quản trị hệ thống thẻ tag tin tức'),
    ('news.manage_comments', 'news', 'manage_comments', 'Kiểm duyệt và quản lý bình luận tin tức'),

    ('documents.view', 'documents', 'view', 'Xem và tải văn bản, công văn, biểu mẫu'),
    ('documents.create', 'documents', 'create', 'Thêm mới văn bản hành chính'),
    ('documents.edit', 'documents', 'edit', 'Chỉnh sửa văn bản hành chính'),
    ('documents.delete', 'documents', 'delete', 'Xóa văn bản'),
    ('documents.publish', 'documents', 'publish', 'Duyệt và xuất bản văn bản hành chính lên website'),
    ('documents.upload', 'documents', 'upload', 'Tải tệp văn bản và biểu mẫu lên hệ thống'),

    ('announcements.view', 'announcements', 'view', 'Xem danh sách thông báo nhà trường'),
    ('announcements.create', 'announcements', 'create', 'Đăng thông báo mới'),
    ('announcements.edit', 'announcements', 'edit', 'Chỉnh sửa thông báo'),
    ('announcements.publish', 'announcements', 'publish', 'Xuất bản hoặc lên lịch thông báo điều hành'),
    ('announcements.delete', 'announcements', 'delete', 'Xóa thông báo'),

    ('media.view', 'media', 'view', 'Xem thư viện ảnh và đa phương tiện'),
    ('media.upload', 'media', 'upload', 'Tải tệp và hình ảnh lên thư viện'),
    ('media.edit', 'media', 'edit', 'Chỉnh sửa thông tin hình ảnh/album'),
    ('media.delete', 'media', 'delete', 'Xóa hình ảnh khỏi thư viện'),

    ('pages.view', 'pages', 'view', 'Xem trang tĩnh giới thiệu'),
    ('pages.create', 'pages', 'create', 'Tạo trang tĩnh mới'),
    ('pages.edit', 'pages', 'edit', 'Chỉnh sửa nội dung trang tĩnh'),
    ('pages.delete', 'pages', 'delete', 'Xóa trang tĩnh'),

    ('homepage.view', 'homepage', 'view', 'Xem cấu hình bố cục trang chủ'),
    ('homepage.edit', 'homepage', 'edit', 'Chỉnh sửa và sắp xếp các khối trang chủ'),
    ('homepage.publish', 'homepage', 'publish', 'Xuất bản bố cục trang chủ ra ngoài'),

    ('users.view', 'users', 'view', 'Xem danh sách tài khoản người dùng'),
    ('users.create', 'users', 'create', 'Tạo tài khoản giáo viên/cán bộ mới'),
    ('users.edit', 'users', 'edit', 'Phân quyền và chỉnh sửa tài khoản'),
    ('users.delete', 'users', 'delete', 'Khóa hoặc xóa tài khoản người dùng'),

    ('settings.view', 'settings', 'view', 'Xem thông tin cấu hình trường'),
    ('settings.edit', 'settings', 'edit', 'Cập nhật cấu hình nhận diện và hệ thống'),

    ('audit.view', 'audit', 'view', 'Xem nhật ký hoạt động hệ thống'),
    ('health.view', 'health', 'view', 'Xem trạng thái kiểm tra hệ thống')
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- Canonical Role Permissions Bootstrap
-- Derived strictly from project baseline migrations & authorization matrix
-- ==============================================================================

-- 1. Grant all baseline permissions to ADMIN and SUPER_ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code IN ('ADMIN', 'SUPER_ADMIN')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 2. Grant canonical editorial and review permissions to EDITOR
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'EDITOR'
  AND p.code IN (
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
    'health.view'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 3. Grant canonical drafting and contributor permissions to AUTHOR
-- Note: 'announcements.view' is strictly excluded per migration 20260111000000 (S07-F04-R)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'AUTHOR'
  AND p.code IN (
    'news.view',
    'news.create',
    'news.edit_own',
    'news.submit',
    'documents.view',
    'documents.create',
    'documents.upload',
    'announcements.create',
    'media.upload'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Initial School Identity Default Setting (Sample placeholder for seed)
INSERT INTO public.site_settings (key, value, is_public)
VALUES (
    'school_identity',
    '{
        "school_name": "TRƯỜNG TRUNG HỌC PHỔ THÔNG MẪU",
        "short_name": "THPT MẪU",
        "slogan": "Tri thức - Trách nhiệm - Tương lai",
        "logo_url": "/logo.svg",
        "favicon_url": "/favicon.ico",
        "primary_color": "#1e3a8a",
        "secondary_color": "#d97706",
        "phone": "024 3825 xxxx",
        "email": "c3phothong@moet.edu.vn",
        "address": "Số 1 Đường Giáo Dục, Quận Hoàn Kiếm, Hà Nội",
        "website": "https://thptmau.edu.vn",
        "social_links": {
            "facebook": "https://facebook.com/thptmau",
            "youtube": "https://youtube.com/@thptmau"
        }
    }'::jsonb,
    TRUE
) ON CONFLICT (key) DO NOTHING;
