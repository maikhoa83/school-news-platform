-- ==============================================================================
-- SCHOOL NEWS PLATFORM - MIGRATION 20260114000000_step09_rls_permissions.sql
-- Step 09.3B: Row Level Security (RLS) & Permissions Implementation
-- Compatible with PostgreSQL 15+ / Supabase
-- Target Tables: public.pages, public.menus, public.menu_items, public.seo_settings
-- 
-- Architecture Principles:
--   1. ONE CODEBASE -> ONE SCHOOL INSTALLATION -> ONE DATABASE -> ZERO MULTI-TENANCY
--   2. Default Deny on all tables; explicit allow policies for Public and Staff
--   3. Public visitor can ONLY read published pages (status = 'published')
--   4. Reuse existing authorization framework: public.has_permission()
--   5. Reuse approved baseline permissions (pages.view, pages.create, pages.edit, pages.delete, settings.edit)
--   6. Protect author_id integrity: prevent author spoofing and unauthorized reassignment
--   7. Strict boundary: NO changes to existing modules (News, Documents, Announcements, Media)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PERMISSIONS & ROLE PERMISSION MAPPING (STEP 09 PAGES)
-- Reusing existing baseline permissions defined in seed contract
-- ------------------------------------------------------------------------------

-- Ensure baseline page permissions exist in public.permissions
INSERT INTO public.permissions (code, resource, action, description)
VALUES
    ('pages.view', 'pages', 'view', 'Xem danh sách và chi tiết trang tĩnh quản trị'),
    ('pages.create', 'pages', 'create', 'Tạo trang thông tin tĩnh mới cho nhà trường'),
    ('pages.edit', 'pages', 'edit', 'Chỉnh sửa nội dung và thông tin trang tĩnh'),
    ('pages.delete', 'pages', 'delete', 'Xóa trang thông tin tĩnh khỏi hệ thống')
ON CONFLICT (code) DO UPDATE SET
    description = EXCLUDED.description;

-- Grant page permissions to ADMIN & SUPER_ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code IN ('ADMIN', 'SUPER_ADMIN')
  AND p.code IN ('pages.view', 'pages.create', 'pages.edit', 'pages.delete')
ON CONFLICT DO NOTHING;

-- Grant page view, create, edit to EDITOR (Ban biên tập trường)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'EDITOR'
  AND p.code IN ('pages.view', 'pages.create', 'pages.edit')
ON CONFLICT DO NOTHING;

-- Note on AUTHOR role:
-- Tuân thủ triệt để D04: "Không tự ý mở rộng quyền AUTHOR".
-- Vai trò AUTHOR là cộng tác viên tin bài, không có quyền quản trị hay tạo trang tĩnh của trường học.

-- ------------------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY
-- ------------------------------------------------------------------------------

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. RLS POLICIES FOR PUBLIC.PAGES
-- ------------------------------------------------------------------------------

-- Policy 1: Public SELECT (Anonymous & Visitors)
-- Only published pages with valid published_at timestamp
DROP POLICY IF EXISTS "Public can view published pages" ON public.pages;
CREATE POLICY "Public can view published pages"
    ON public.pages FOR SELECT
    TO PUBLIC
    USING (
        status = 'published'
        AND (published_at IS NULL OR published_at <= NOW())
    );

-- Policy 2: Staff SELECT
-- Staff with pages.view permission or Super Admin can view all pages (draft, published, archived)
DROP POLICY IF EXISTS "Staff can view all pages" ON public.pages;
CREATE POLICY "Staff can view all pages"
    ON public.pages FOR SELECT
    TO authenticated
    USING (public.has_permission('pages.view'));

-- Policy 3: Staff INSERT
-- Staff with pages.create permission can create pages; author_id must be the authenticated user
DROP POLICY IF EXISTS "Staff can insert pages" ON public.pages;
CREATE POLICY "Staff can insert pages"
    ON public.pages FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_permission('pages.create')
        AND author_id = auth.uid()
    );

-- Policy 4: Staff UPDATE
-- Staff with pages.edit permission can update pages
-- author_id cannot be reassigned to another user unless by Super Admin
DROP POLICY IF EXISTS "Staff can update pages" ON public.pages;
CREATE POLICY "Staff can update pages"
    ON public.pages FOR UPDATE
    TO authenticated
    USING (public.has_permission('pages.edit'))
    WITH CHECK (
        public.has_permission('pages.edit')
        AND (
            author_id = (SELECT p.author_id FROM public.pages p WHERE p.id = pages.id)
            OR public.is_super_admin()
        )
    );

-- Policy 5: Staff DELETE
-- Strictly restricted to users with pages.delete permission (ADMIN / SUPER_ADMIN)
DROP POLICY IF EXISTS "Staff can delete pages" ON public.pages;
CREATE POLICY "Staff can delete pages"
    ON public.pages FOR DELETE
    TO authenticated
    USING (public.has_permission('pages.delete'));

-- ------------------------------------------------------------------------------
-- 4. RLS POLICIES FOR PUBLIC.MENUS
-- Reusing existing settings.view and settings.edit permissions (D02 / D04)
-- ------------------------------------------------------------------------------

-- Policy 1: Public SELECT
-- Visitors can view active menus
DROP POLICY IF EXISTS "Public can view active menus" ON public.menus;
CREATE POLICY "Public can view active menus"
    ON public.menus FOR SELECT
    TO PUBLIC
    USING (is_active = TRUE);

-- Policy 2: Staff SELECT
-- Staff with settings.view or settings.edit can view all menus (active and inactive)
DROP POLICY IF EXISTS "Staff can view all menus" ON public.menus;
CREATE POLICY "Staff can view all menus"
    ON public.menus FOR SELECT
    TO authenticated
    USING (
        public.has_permission('settings.view')
        OR public.has_permission('settings.edit')
    );

-- Policy 3: Staff INSERT
-- Staff with settings.edit can create new menus
DROP POLICY IF EXISTS "Staff can insert menus" ON public.menus;
CREATE POLICY "Staff can insert menus"
    ON public.menus FOR INSERT
    TO authenticated
    WITH CHECK (public.has_permission('settings.edit'));

-- Policy 4: Staff UPDATE
-- Staff with settings.edit can update existing menus
DROP POLICY IF EXISTS "Staff can update menus" ON public.menus;
CREATE POLICY "Staff can update menus"
    ON public.menus FOR UPDATE
    TO authenticated
    USING (public.has_permission('settings.edit'))
    WITH CHECK (public.has_permission('settings.edit'));

-- Policy 5: Staff DELETE
-- Staff with settings.edit can delete menus
DROP POLICY IF EXISTS "Staff can delete menus" ON public.menus;
CREATE POLICY "Staff can delete menus"
    ON public.menus FOR DELETE
    TO authenticated
    USING (public.has_permission('settings.edit'));

-- ------------------------------------------------------------------------------
-- 5. RLS POLICIES FOR PUBLIC.MENU_ITEMS
-- Reusing existing settings.view and settings.edit permissions (D02 / D04)
-- Relationship security: prevent tampering and orphan items
-- ------------------------------------------------------------------------------

-- Policy 1: Public SELECT
-- Visitors can only view active menu items that belong to active menus
DROP POLICY IF EXISTS "Public can view active menu items" ON public.menu_items;
CREATE POLICY "Public can view active menu items"
    ON public.menu_items FOR SELECT
    TO PUBLIC
    USING (
        is_active = TRUE
        AND EXISTS (
            SELECT 1 FROM public.menus m
            WHERE m.id = menu_items.menu_id
              AND m.is_active = TRUE
        )
    );

-- Policy 2: Staff SELECT
-- Staff with settings.view or settings.edit can view all menu items
DROP POLICY IF EXISTS "Staff can view all menu items" ON public.menu_items;
CREATE POLICY "Staff can view all menu items"
    ON public.menu_items FOR SELECT
    TO authenticated
    USING (
        public.has_permission('settings.view')
        OR public.has_permission('settings.edit')
    );

-- Policy 3: Staff INSERT
-- Staff with settings.edit can insert menu items
-- Enforces that menu_id exists, parent_id belongs to same menu_id
DROP POLICY IF EXISTS "Staff can insert menu items" ON public.menu_items;
CREATE POLICY "Staff can insert menu items"
    ON public.menu_items FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_permission('settings.edit')
        AND EXISTS (
            SELECT 1 FROM public.menus m
            WHERE m.id = menu_items.menu_id
        )
        AND (
            parent_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.menu_items pi
                WHERE pi.id = menu_items.parent_id
                  AND pi.menu_id = menu_items.menu_id
            )
        )
    );

-- Policy 4: Staff UPDATE
-- Staff with settings.edit can update menu items
DROP POLICY IF EXISTS "Staff can update menu items" ON public.menu_items;
CREATE POLICY "Staff can update menu items"
    ON public.menu_items FOR UPDATE
    TO authenticated
    USING (public.has_permission('settings.edit'))
    WITH CHECK (
        public.has_permission('settings.edit')
        AND EXISTS (
            SELECT 1 FROM public.menus m
            WHERE m.id = menu_items.menu_id
        )
        AND (
            parent_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.menu_items pi
                WHERE pi.id = menu_items.parent_id
                  AND pi.menu_id = menu_items.menu_id
            )
        )
    );

-- Policy 5: Staff DELETE
-- Staff with settings.edit can delete menu items
DROP POLICY IF EXISTS "Staff can delete menu items" ON public.menu_items;
CREATE POLICY "Staff can delete menu items"
    ON public.menu_items FOR DELETE
    TO authenticated
    USING (public.has_permission('settings.edit'));

-- ------------------------------------------------------------------------------
-- 6. RLS POLICIES FOR PUBLIC.SEO_SETTINGS
-- Global school configuration: Reusing settings.view and settings.edit
-- Single-Row Pattern: id = 'default'
-- ------------------------------------------------------------------------------

-- Policy 1: Public SELECT
-- All SEO meta tags and site verification tokens are public by design for search crawlers
DROP POLICY IF EXISTS "Public can view seo settings" ON public.seo_settings;
CREATE POLICY "Public can view seo settings"
    ON public.seo_settings FOR SELECT
    TO PUBLIC
    USING (TRUE);

-- Policy 2: Staff UPDATE
-- Staff with settings.edit can update school SEO configuration
DROP POLICY IF EXISTS "Staff can update seo settings" ON public.seo_settings;
CREATE POLICY "Staff can update seo settings"
    ON public.seo_settings FOR UPDATE
    TO authenticated
    USING (public.has_permission('settings.edit'))
    WITH CHECK (public.has_permission('settings.edit'));

-- Policy 3: Staff INSERT
-- Restricted to settings.edit and id = 'default'
DROP POLICY IF EXISTS "Staff can insert seo settings" ON public.seo_settings;
CREATE POLICY "Staff can insert seo settings"
    ON public.seo_settings FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_permission('settings.edit')
        AND id = 'default'
    );

-- Note on DELETE:
-- No DELETE policy is created for public.seo_settings.
-- Under PostgreSQL RLS default deny, deleting the single-row SEO configuration is completely blocked.
