-- ==============================================================================
-- SCHOOL NEWS PLATFORM - MIGRATION 20260113000000_step09_pages_menu_seo.sql
-- Step 09.3A: Database Schema & Migration Implementation
-- Relational Models: pages, menus, menu_items, seo_settings
-- Enforcing:
--   1. Strict single-school installation architecture (Zero multi-tenancy)
--   2. Strict relational models for Menus & Menu Items (No JSONB replacement)
--   3. Strict relational model for SEO Settings (Single-Row Pattern)
--   4. Referential integrity: pages.author_id, pages.parent_id, menu_items.menu_id, menu_items.page_id
--   5. Idempotent migration with optimal indexes and constraints
--   6. DATABASE-ONLY: No RLS policies (reserved for Step 09.3B), no RBAC mutations, zero credentials
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. PREREQUISITES & EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure timestamp updater function exists (idempotent definition)
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- 1. PAGES TABLE (Trang thông tin tĩnh)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL DEFAULT '',
    excerpt TEXT,
    featured_image TEXT,
    parent_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
    template TEXT NOT NULL DEFAULT 'default',
    status TEXT NOT NULL DEFAULT 'draft',
    sort_order INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- SEO Metadata tích hợp trên từng trang
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    og_image TEXT,
    canonical_url TEXT,
    no_index BOOLEAN NOT NULL DEFAULT FALSE,

    -- Full-text search vector
    search_vector TSVECTOR,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_pages_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT chk_pages_slug_not_empty CHECK (length(trim(slug)) > 0),
    CONSTRAINT chk_pages_status CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT chk_pages_template CHECK (template IN ('default', 'fullwidth', 'sidebar', 'contact')),
    CONSTRAINT chk_pages_view_count_non_negative CHECK (view_count >= 0),
    CONSTRAINT chk_pages_parent_not_self CHECK (parent_id IS NULL OR parent_id != id)
);

-- Indexes for Pages
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON public.pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_status_published ON public.pages(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON public.pages(parent_id);
CREATE INDEX IF NOT EXISTS idx_pages_author_id ON public.pages(author_id);
CREATE INDEX IF NOT EXISTS idx_pages_sort_order ON public.pages(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_pages_search_vector ON public.pages USING gin(search_vector);

-- Triggers for Pages
DROP TRIGGER IF EXISTS trg_pages_updated_at ON public.pages;
CREATE TRIGGER trg_pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Full-text search trigger & function for Pages
CREATE OR REPLACE FUNCTION public.pages_generate_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.excerpt, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.content, '')), 'C');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pages_search_vector ON public.pages;
CREATE TRIGGER trg_pages_search_vector
    BEFORE INSERT OR UPDATE OF title, excerpt, content ON public.pages
    FOR EACH ROW
    EXECUTE FUNCTION public.pages_generate_search_vector();

-- ------------------------------------------------------------------------------
-- 2. MENUS TABLE (Danh mục Menu & Vị trí điều hướng)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL DEFAULT 'header',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_menus_code_not_empty CHECK (length(trim(code)) > 0),
    CONSTRAINT chk_menus_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_menus_location CHECK (location IN ('header', 'footer', 'sidebar'))
);

-- Indexes for Menus
CREATE INDEX IF NOT EXISTS idx_menus_code ON public.menus(code);
CREATE INDEX IF NOT EXISTS idx_menus_location ON public.menus(location);
CREATE INDEX IF NOT EXISTS idx_menus_is_active ON public.menus(is_active);

-- Trigger for Menus
DROP TRIGGER IF EXISTS trg_menus_updated_at ON public.menus;
CREATE TRIGGER trg_menus_updated_at
    BEFORE UPDATE ON public.menus
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ------------------------------------------------------------------------------
-- 3. MENU ITEMS TABLE (Mục điều hướng liên kết trong Menu)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    target TEXT NOT NULL DEFAULT '_self',
    sort_order INT NOT NULL DEFAULT 0,
    icon TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_menu_items_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT chk_menu_items_url_not_empty CHECK (length(trim(url)) > 0),
    CONSTRAINT chk_menu_items_target CHECK (target IN ('_self', '_blank')),
    CONSTRAINT chk_menu_items_parent_not_self CHECK (parent_id IS NULL OR parent_id != id)
);

-- Indexes for Menu Items
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON public.menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON public.menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_page_id ON public.menu_items(page_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_ordering ON public.menu_items(menu_id, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON public.menu_items(is_active);

-- Trigger for Menu Items
DROP TRIGGER IF EXISTS trg_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER trg_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ------------------------------------------------------------------------------
-- 4. SEO SETTINGS TABLE (Cấu hình SEO toàn trường - Single-Row Relational Model)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    meta_title_pattern TEXT NOT NULL DEFAULT '%s | School News Portal',
    meta_description_default TEXT,
    meta_keywords_default TEXT,
    og_image_default TEXT,
    canonical_base_url TEXT,
    robots_txt_content TEXT,
    sitemap_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    structured_data_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    google_site_verification TEXT,
    bing_site_verification TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Enforce Single-Row Architecture per school installation
    CONSTRAINT single_seo_settings_row CHECK (id = 'default')
);

-- Trigger for SEO Settings
DROP TRIGGER IF EXISTS trg_seo_settings_updated_at ON public.seo_settings;
CREATE TRIGGER trg_seo_settings_updated_at
    BEFORE UPDATE ON public.seo_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Seed initial baseline configuration row if not present
INSERT INTO public.seo_settings (
    id,
    meta_title_pattern,
    meta_description_default,
    sitemap_enabled,
    structured_data_enabled
)
VALUES (
    'default',
    '%s | Cổng thông tin điện tử trường học',
    'Cổng thông tin điện tử chính thức của nhà trường, cung cấp tin tức, thông báo, văn bản điều hành và các hoạt động giáo dục.',
    TRUE,
    TRUE
)
ON CONFLICT (id) DO NOTHING;
