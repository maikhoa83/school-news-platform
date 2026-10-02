-- ==============================================================================
-- SCHOOL NEWS PLATFORM - MIGRATION 20260112000000_step08_media_module.sql
-- Step 08: Media Module (Thư viện hình ảnh & Đa phương tiện)
-- Schema: media_folders, media, albums, album_items, RLS, Storage policies, triggers
-- Enforcing:
--   1. PRIVATE 'media' storage bucket with controlled published object access
--   2. RBAC Least Privilege: AUTHOR (media.upload only), EDITOR (+media.edit), ADMIN (all)
--   3. Minimal relational MVP with strict constraints & identity audit triggers
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. MEDIA FOLDERS TABLE (Phân loại thư mục lưu trữ media)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.media_folders(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_media_folders_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_media_folders_slug_not_empty CHECK (length(trim(slug)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_media_folders_parent_id ON public.media_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_slug ON public.media_folders(slug);

-- ------------------------------------------------------------------------------
-- 2. MEDIA TABLE (Tệp đa phương tiện, hình ảnh, video)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'image',
    width INT,
    height INT,
    alt_text TEXT,
    caption TEXT,
    folder_id UUID REFERENCES public.media_folders(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_media_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT chk_media_file_name_not_empty CHECK (length(trim(file_name)) > 0),
    CONSTRAINT chk_media_file_path_not_empty CHECK (length(trim(file_path)) > 0),
    CONSTRAINT chk_media_file_size_positive CHECK (file_size > 0),
    CONSTRAINT chk_media_file_type CHECK (file_type IN ('image', 'video', 'document')),
    CONSTRAINT chk_media_dimensions CHECK (
        (width IS NULL OR width > 0) AND (height IS NULL OR height > 0)
    )
);

CREATE INDEX IF NOT EXISTS idx_media_folder_id ON public.media(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON public.media(file_type);
CREATE INDEX IF NOT EXISTS idx_media_is_published ON public.media(is_published);
CREATE INDEX IF NOT EXISTS idx_media_created_by ON public.media(created_by);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. ALBUMS TABLE (Bộ sưu tập hình ảnh sự kiện / chuyên đề)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_media_id UUID REFERENCES public.media(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_albums_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT chk_albums_slug_not_empty CHECK (length(trim(slug)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_albums_slug ON public.albums(slug);
CREATE INDEX IF NOT EXISTS idx_albums_is_published ON public.albums(is_published);
CREATE INDEX IF NOT EXISTS idx_albums_created_at ON public.albums(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_albums_cover_media_id ON public.albums(cover_media_id);

-- ------------------------------------------------------------------------------
-- 4. ALBUM ITEMS TABLE (Quan hệ nhiều-nhiều giữa Album và Media)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.album_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0,
    caption TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT uq_album_items_album_media UNIQUE (album_id, media_id),
    CONSTRAINT chk_album_items_sort_order CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS idx_album_items_album_id ON public.album_items(album_id);
CREATE INDEX IF NOT EXISTS idx_album_items_media_id ON public.album_items(media_id);
CREATE INDEX IF NOT EXISTS idx_album_items_sort ON public.album_items(album_id, sort_order ASC);

-- ------------------------------------------------------------------------------
-- 5. IDENTITY & TIMESTAMP TRIGGERS
-- ------------------------------------------------------------------------------

-- 5.1 updated_at auto-updater triggers
DROP TRIGGER IF EXISTS trg_media_folders_updated_at ON public.media_folders;
CREATE TRIGGER trg_media_folders_updated_at
    BEFORE UPDATE ON public.media_folders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_media_updated_at ON public.media;
CREATE TRIGGER trg_media_updated_at
    BEFORE UPDATE ON public.media
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_albums_updated_at ON public.albums;
CREATE TRIGGER trg_albums_updated_at
    BEFORE UPDATE ON public.albums
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 5.2 Identity Enforcement trigger for media
CREATE OR REPLACE FUNCTION public.handle_media_audit_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    current_auth_uid UUID;
BEGIN
    current_auth_uid := auth.uid();

    IF TG_OP = 'INSERT' THEN
        IF current_auth_uid IS NOT NULL AND NEW.created_by IS NULL THEN
            NEW.created_by := current_auth_uid;
        END IF;
        NEW.created_at := COALESCE(NEW.created_at, NOW());
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- Prevent client forgery of ownership
        NEW.created_by := OLD.created_by;
        NEW.created_at := OLD.created_at;
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_media_audit_fields ON public.media;
CREATE TRIGGER trg_media_audit_fields
    BEFORE INSERT OR UPDATE ON public.media
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_media_audit_fields();

-- 5.3 Identity Enforcement trigger for albums
CREATE OR REPLACE FUNCTION public.handle_albums_audit_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    current_auth_uid UUID;
BEGIN
    current_auth_uid := auth.uid();

    IF TG_OP = 'INSERT' THEN
        IF current_auth_uid IS NOT NULL AND NEW.created_by IS NULL THEN
            NEW.created_by := current_auth_uid;
        END IF;

        IF NEW.is_published = TRUE AND NEW.published_at IS NULL THEN
            NEW.published_at := NOW();
        END IF;

        NEW.created_at := COALESCE(NEW.created_at, NOW());
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        NEW.created_by := OLD.created_by;
        NEW.created_at := OLD.created_at;

        IF NEW.is_published = TRUE AND OLD.is_published = FALSE AND NEW.published_at IS NULL THEN
            NEW.published_at := NOW();
        ELSIF NEW.is_published = FALSE THEN
            NEW.published_at := NULL;
        END IF;

        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_albums_audit_fields ON public.albums;
CREATE TRIGGER trg_albums_audit_fields
    BEFORE INSERT OR UPDATE ON public.albums
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_albums_audit_fields();

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS across all 4 tables
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_items ENABLE ROW LEVEL SECURITY;

-- 6.1 MEDIA FOLDERS POLICIES
DROP POLICY IF EXISTS "Staff can view media folders" ON public.media_folders;
CREATE POLICY "Staff can view media folders"
    ON public.media_folders FOR SELECT
    TO AUTHENTICATED
    USING (
        public.has_permission('media.view')
        OR public.has_permission('media.upload')
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "Staff can create media folders" ON public.media_folders;
CREATE POLICY "Staff can create media folders"
    ON public.media_folders FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
        public.has_permission('media.upload')
        OR public.has_permission('media.edit')
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "Staff can update media folders" ON public.media_folders;
CREATE POLICY "Staff can update media folders"
    ON public.media_folders FOR UPDATE
    TO AUTHENTICATED
    USING (
        public.has_permission('media.edit')
        OR public.is_super_admin()
    )
    WITH CHECK (
        public.has_permission('media.edit')
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "Staff can delete media folders" ON public.media_folders;
CREATE POLICY "Staff can delete media folders"
    ON public.media_folders FOR DELETE
    TO AUTHENTICATED
    USING (
        public.has_permission('media.delete')
        OR public.is_super_admin()
    );

-- 6.2 MEDIA POLICIES
-- Public can ONLY read published media
DROP POLICY IF EXISTS "Public can view published media" ON public.media;
CREATE POLICY "Public can view published media"
    ON public.media FOR SELECT
    TO PUBLIC
    USING (is_published = TRUE);

-- Authenticated staff can view published media, or if they have media.view, or own it
DROP POLICY IF EXISTS "Staff can view media" ON public.media;
CREATE POLICY "Staff can view media"
    ON public.media FOR SELECT
    TO AUTHENTICATED
    USING (
        is_published = TRUE
        OR public.has_permission('media.view')
        OR created_by = auth.uid()
        OR public.is_super_admin()
    );

-- Staff with media.upload can insert media
DROP POLICY IF EXISTS "Staff can insert media" ON public.media;
CREATE POLICY "Staff can insert media"
    ON public.media FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
        (public.has_permission('media.upload') OR public.is_super_admin())
        AND (created_by = auth.uid() OR created_by IS NULL)
    );

-- Staff with media.edit (or owner of unpublished media) can update
DROP POLICY IF EXISTS "Staff can update media" ON public.media;
CREATE POLICY "Staff can update media"
    ON public.media FOR UPDATE
    TO AUTHENTICATED
    USING (
        public.has_permission('media.edit')
        OR (created_by = auth.uid() AND is_published = FALSE)
        OR public.is_super_admin()
    )
    WITH CHECK (
        public.has_permission('media.edit')
        OR (created_by = auth.uid() AND is_published = FALSE)
        OR public.is_super_admin()
    );

-- Staff with media.delete can delete
DROP POLICY IF EXISTS "Staff can delete media" ON public.media;
CREATE POLICY "Staff can delete media"
    ON public.media FOR DELETE
    TO AUTHENTICATED
    USING (
        public.has_permission('media.delete')
        OR public.is_super_admin()
    );

-- 6.3 ALBUMS POLICIES
-- Public can only view published albums
DROP POLICY IF EXISTS "Public can view published albums" ON public.albums;
CREATE POLICY "Public can view published albums"
    ON public.albums FOR SELECT
    TO PUBLIC
    USING (is_published = TRUE);

-- Staff can view published albums or all albums if having media.view or own it
DROP POLICY IF EXISTS "Staff can view albums" ON public.albums;
CREATE POLICY "Staff can view albums"
    ON public.albums FOR SELECT
    TO AUTHENTICATED
    USING (
        is_published = TRUE
        OR public.has_permission('media.view')
        OR created_by = auth.uid()
        OR public.is_super_admin()
    );

-- Staff with media.edit can create albums
DROP POLICY IF EXISTS "Staff can insert albums" ON public.albums;
CREATE POLICY "Staff can insert albums"
    ON public.albums FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
        (public.has_permission('media.edit') OR public.is_super_admin())
        AND (created_by = auth.uid() OR created_by IS NULL)
    );

-- Staff with media.edit can update albums
DROP POLICY IF EXISTS "Staff can update albums" ON public.albums;
CREATE POLICY "Staff can update albums"
    ON public.albums FOR UPDATE
    TO AUTHENTICATED
    USING (
        public.has_permission('media.edit')
        OR public.is_super_admin()
    )
    WITH CHECK (
        public.has_permission('media.edit')
        OR public.is_super_admin()
    );

-- Staff with media.delete can delete albums
DROP POLICY IF EXISTS "Staff can delete albums" ON public.albums;
CREATE POLICY "Staff can delete albums"
    ON public.albums FOR DELETE
    TO AUTHENTICATED
    USING (
        public.has_permission('media.delete')
        OR public.is_super_admin()
    );

-- 6.4 ALBUM ITEMS POLICIES
-- Public can view album items if the album is published AND media is published
DROP POLICY IF EXISTS "Public can view published album items" ON public.album_items;
CREATE POLICY "Public can view published album items"
    ON public.album_items FOR SELECT
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM public.albums a
            WHERE a.id = album_items.album_id
              AND a.is_published = TRUE
        )
        AND EXISTS (
            SELECT 1 FROM public.media m
            WHERE m.id = album_items.media_id
              AND m.is_published = TRUE
        )
    );

-- Staff can view album items if album is viewable
DROP POLICY IF EXISTS "Staff can view album items" ON public.album_items;
CREATE POLICY "Staff can view album items"
    ON public.album_items FOR SELECT
    TO AUTHENTICATED
    USING (
        EXISTS (
            SELECT 1 FROM public.albums a
            WHERE a.id = album_items.album_id
              AND (
                  a.is_published = TRUE
                  OR public.has_permission('media.view')
                  OR a.created_by = auth.uid()
                  OR public.is_super_admin()
              )
        )
    );

-- Staff with media.edit can manage album items (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Staff can insert album items" ON public.album_items;
CREATE POLICY "Staff can insert album items"
    ON public.album_items FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
        public.has_permission('media.edit')
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "Staff can update album items" ON public.album_items;
CREATE POLICY "Staff can update album items"
    ON public.album_items FOR UPDATE
    TO AUTHENTICATED
    USING (
        public.has_permission('media.edit')
        OR public.is_super_admin()
    )
    WITH CHECK (
        public.has_permission('media.edit')
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "Staff can delete album items" ON public.album_items;
CREATE POLICY "Staff can delete album items"
    ON public.album_items FOR DELETE
    TO AUTHENTICATED
    USING (
        public.has_permission('media.delete')
        OR public.has_permission('media.edit')
        OR public.is_super_admin()
    );

-- ------------------------------------------------------------------------------
-- 7. STORAGE BUCKET & HARDENED STORAGE POLICIES
-- ------------------------------------------------------------------------------

-- 7.1 Ensure 'media' bucket exists with public = FALSE (PRIVATE BUCKET)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media',
    'media',
    FALSE,
    52428800, -- 50MB
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
        'video/mp4',
        'video/webm'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = FALSE,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
        'video/mp4',
        'video/webm'
    ];

-- 7.2 Ensure 'site-assets' bucket exists (PUBLIC for school branding)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'site-assets',
    'site-assets',
    TRUE,
    10485760, -- 10MB
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'image/x-icon'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = TRUE,
    file_size_limit = 10485760;

-- 7.3 Storage Policies for 'media' bucket
-- Public read policy: ONLY objects linked to published media in database
DROP POLICY IF EXISTS "Public can only view published media objects" ON storage.objects;
CREATE POLICY "Public can only view published media objects"
    ON storage.objects FOR SELECT
    TO PUBLIC
    USING (
        bucket_id = 'media'
        AND EXISTS (
            SELECT 1 FROM public.media m
            WHERE m.is_published = TRUE
              AND m.file_path = storage.objects.name
        )
    );

-- Authorized staff read policy
DROP POLICY IF EXISTS "Authorized staff can view media storage" ON storage.objects;
CREATE POLICY "Authorized staff can view media storage"
    ON storage.objects FOR SELECT
    TO AUTHENTICATED
    USING (
        bucket_id = 'media'
        AND (
            public.has_permission('media.view')
            OR public.has_permission('media.upload')
            OR public.is_super_admin()
        )
    );

-- Authorized staff upload policy (media.upload)
DROP POLICY IF EXISTS "Authorized staff can upload media storage" ON storage.objects;
CREATE POLICY "Authorized staff can upload media storage"
    ON storage.objects FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
        bucket_id = 'media'
        AND (
            public.has_permission('media.upload')
            OR public.is_super_admin()
        )
    );

-- Authorized staff update policy (media.edit)
DROP POLICY IF EXISTS "Authorized staff can update media storage" ON storage.objects;
CREATE POLICY "Authorized staff can update media storage"
    ON storage.objects FOR UPDATE
    TO AUTHENTICATED
    USING (
        bucket_id = 'media'
        AND (
            public.has_permission('media.edit')
            OR public.is_super_admin()
        )
    );

-- Authorized staff delete policy (media.delete)
DROP POLICY IF EXISTS "Authorized staff can delete media storage" ON storage.objects;
CREATE POLICY "Authorized staff can delete media storage"
    ON storage.objects FOR DELETE
    TO AUTHENTICATED
    USING (
        bucket_id = 'media'
        AND (
            public.has_permission('media.delete')
            OR public.is_super_admin()
        )
    );

-- ------------------------------------------------------------------------------
-- 8. RBAC LEAST PRIVILEGE RECONCILIATION
-- ------------------------------------------------------------------------------

-- Ensure all 4 media permissions exist
INSERT INTO public.permissions (code, resource, action, description)
VALUES
    ('media.view', 'media', 'view', 'Xem thư viện hình ảnh và đa phương tiện'),
    ('media.upload', 'media', 'upload', 'Tải tệp hình ảnh và đa phương tiện lên hệ thống'),
    ('media.edit', 'media', 'edit', 'Chỉnh sửa thông tin hình ảnh và quản lý album'),
    ('media.delete', 'media', 'delete', 'Xóa hình ảnh và album khỏi hệ thống')
ON CONFLICT (code) DO NOTHING;

-- Grant to ADMIN and SUPER_ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code IN ('ADMIN', 'SUPER_ADMIN')
  AND p.code IN ('media.view', 'media.upload', 'media.edit', 'media.delete')
ON CONFLICT DO NOTHING;

-- Grant media.edit to EDITOR (EDITOR already has media.view and media.upload)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code = 'media.edit'
WHERE r.code = 'EDITOR'
ON CONFLICT DO NOTHING;

-- AUTHOR retains media.upload ONLY (Least privilege: NO media.view granted)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code = 'media.upload'
WHERE r.code = 'AUTHOR'
ON CONFLICT DO NOTHING;
