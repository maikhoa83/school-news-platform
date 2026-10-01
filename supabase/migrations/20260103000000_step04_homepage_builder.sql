-- ==============================================================================
-- SCHOOL NEWS PLATFORM - MIGRATION 20260103000000_step04_homepage_builder.sql
-- Step 04: Homepage Builder Foundation
-- Entities: homepage_layouts, homepage_blocks
-- Constraints, Indexes, Timestamps, RLS with has_permission('homepage.*')
-- ==============================================================================

-- 1. HOMEPAGE_LAYOUTS TABLE (Manages Draft vs Published Layout states)
CREATE TABLE IF NOT EXISTS public.homepage_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT 'Bố cục trang chủ chuẩn',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 2. HOMEPAGE_BLOCKS TABLE (Zone-based block items: 'main' 8 cols | 'right' 4 cols)
CREATE TABLE IF NOT EXISTS public.homepage_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layout_id UUID NOT NULL REFERENCES public.homepage_layouts(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL,
    zone TEXT NOT NULL CHECK (zone IN ('main', 'right')),
    sort_order INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES & PUBLISHED INVARIANT
-- At most ONE published layout can exist across the entire installation
CREATE UNIQUE INDEX IF NOT EXISTS idx_homepage_layouts_single_published
    ON public.homepage_layouts(status)
    WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_homepage_layouts_status
    ON public.homepage_layouts(status);

CREATE INDEX IF NOT EXISTS idx_homepage_blocks_layout_zone_order
    ON public.homepage_blocks(layout_id, zone, sort_order);

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.homepage_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_blocks ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES FOR HOMEPAGE_LAYOUTS
-- Public can read published layouts
DROP POLICY IF EXISTS "Public can view published homepage layouts" ON public.homepage_layouts;
CREATE POLICY "Public can view published homepage layouts"
    ON public.homepage_layouts FOR SELECT
    TO PUBLIC
    USING (status = 'published');

-- Authorized staff can read all layouts (draft, published, archived)
DROP POLICY IF EXISTS "Staff can read all homepage layouts" ON public.homepage_layouts;
CREATE POLICY "Staff can read all homepage layouts"
    ON public.homepage_layouts FOR SELECT
    TO AUTHENTICATED
    USING (public.has_permission('homepage.view'));

-- Users with 'homepage.edit' can create draft layouts ONLY
DROP POLICY IF EXISTS "Staff with edit can insert homepage layouts" ON public.homepage_layouts;
CREATE POLICY "Staff with edit can insert homepage layouts"
    ON public.homepage_layouts FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
        public.has_permission('homepage.edit')
        AND status = 'draft'
    );

-- Users with 'homepage.edit' can update DRAFT layouts ONLY
DROP POLICY IF EXISTS "Staff with edit/publish can update homepage layouts" ON public.homepage_layouts;
DROP POLICY IF EXISTS "Staff with edit can update draft homepage layouts" ON public.homepage_layouts;
CREATE POLICY "Staff with edit can update draft homepage layouts"
    ON public.homepage_layouts FOR UPDATE
    TO AUTHENTICATED
    USING (
        status = 'draft'
        AND public.has_permission('homepage.edit')
    )
    WITH CHECK (
        status = 'draft'
        AND public.has_permission('homepage.edit')
    );

-- Delete restricted to DRAFT layouts by users with 'homepage.edit'
DROP POLICY IF EXISTS "Staff with edit can delete homepage layouts" ON public.homepage_layouts;
DROP POLICY IF EXISTS "Staff with edit can delete draft homepage layouts" ON public.homepage_layouts;
CREATE POLICY "Staff with edit can delete draft homepage layouts"
    ON public.homepage_layouts FOR DELETE
    TO AUTHENTICATED
    USING (
        status = 'draft'
        AND public.has_permission('homepage.edit')
    );

-- 6. RLS POLICIES FOR HOMEPAGE_BLOCKS
-- Public can view visible blocks belonging to published layouts
DROP POLICY IF EXISTS "Public can view blocks of published layouts" ON public.homepage_blocks;
CREATE POLICY "Public can view blocks of published layouts"
    ON public.homepage_blocks FOR SELECT
    TO PUBLIC
    USING (
        is_visible = TRUE
        AND EXISTS (
            SELECT 1 FROM public.homepage_layouts hl
            WHERE hl.id = homepage_blocks.layout_id
              AND hl.status = 'published'
        )
    );

-- Staff with 'homepage.view' can view all blocks
DROP POLICY IF EXISTS "Staff can view all blocks" ON public.homepage_blocks;
CREATE POLICY "Staff can view all blocks"
    ON public.homepage_blocks FOR SELECT
    TO AUTHENTICATED
    USING (public.has_permission('homepage.view'));

-- Staff with 'homepage.edit' can insert blocks ONLY if parent layout status = 'draft'
DROP POLICY IF EXISTS "Staff with edit can insert blocks" ON public.homepage_blocks;
CREATE POLICY "Staff with edit can insert draft blocks"
    ON public.homepage_blocks FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
        public.has_permission('homepage.edit')
        AND EXISTS (
            SELECT 1 FROM public.homepage_layouts hl
            WHERE hl.id = homepage_blocks.layout_id
              AND hl.status = 'draft'
        )
    );

-- Staff with 'homepage.edit' can update blocks ONLY if parent layout status = 'draft'
DROP POLICY IF EXISTS "Staff with edit can update blocks" ON public.homepage_blocks;
CREATE POLICY "Staff with edit can update draft blocks"
    ON public.homepage_blocks FOR UPDATE
    TO AUTHENTICATED
    USING (
        public.has_permission('homepage.edit')
        AND EXISTS (
            SELECT 1 FROM public.homepage_layouts hl
            WHERE hl.id = homepage_blocks.layout_id
              AND hl.status = 'draft'
        )
    )
    WITH CHECK (
        public.has_permission('homepage.edit')
        AND EXISTS (
            SELECT 1 FROM public.homepage_layouts hl
            WHERE hl.id = homepage_blocks.layout_id
              AND hl.status = 'draft'
        )
    );

-- Staff with 'homepage.edit' can delete blocks ONLY if parent layout status = 'draft'
DROP POLICY IF EXISTS "Staff with edit can delete blocks" ON public.homepage_blocks;
CREATE POLICY "Staff with edit can delete draft blocks"
    ON public.homepage_blocks FOR DELETE
    TO AUTHENTICATED
    USING (
        public.has_permission('homepage.edit')
        AND EXISTS (
            SELECT 1 FROM public.homepage_layouts hl
            WHERE hl.id = homepage_blocks.layout_id
              AND hl.status = 'draft'
        )
    );

-- 7. ATOMIC PUBLISH RPC FUNCTION
-- Single database transaction enforcing permissions, invariants, and state transition
CREATE OR REPLACE FUNCTION public.publish_homepage_layout(p_draft_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_draft RECORD;
    v_block_count INT;
    v_caller_uid UUID;
    v_new_draft_id UUID := gen_random_uuid();
BEGIN
    -- 1. Permission check: strictly requires homepage.publish
    IF NOT public.has_permission('homepage.publish') THEN
        RAISE EXCEPTION 'Forbidden: Requires homepage.publish permission'
            USING ERRCODE = '42501';
    END IF;

    v_caller_uid := auth.uid();

    -- 2. Validate draft layout existence and status
    SELECT * INTO v_draft
    FROM public.homepage_layouts
    WHERE id = p_draft_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Draft layout with ID % not found', p_draft_id
            USING ERRCODE = 'P0002';
    END IF;

    IF v_draft.status != 'draft' THEN
        RAISE EXCEPTION 'Layout % has status % (must be draft to publish)', p_draft_id, v_draft.status
            USING ERRCODE = '22023';
    END IF;

    -- 3. Validate blocks: ensure draft contains at least one block
    SELECT COUNT(*) INTO v_block_count
    FROM public.homepage_blocks
    WHERE layout_id = p_draft_id;

    IF v_block_count = 0 THEN
        RAISE EXCEPTION 'Cannot publish draft layout %: it contains no blocks', p_draft_id
            USING ERRCODE = '22023';
    END IF;

    -- 4. Demote existing published layout(s) to 'archived'
    -- Enforces invariant: at most one layout can have status = 'published'
    UPDATE public.homepage_layouts
    SET status = 'archived',
        updated_at = NOW()
    WHERE status = 'published' AND id != p_draft_id;

    -- 5. Promote draft layout to 'published'
    UPDATE public.homepage_layouts
    SET status = 'published',
        published_at = NOW(),
        published_by = v_caller_uid,
        updated_at = NOW()
    WHERE id = p_draft_id;

    -- 6. Atomically provision a fresh draft layout cloned from the newly published layout
    INSERT INTO public.homepage_layouts (id, title, status, created_at, updated_at)
    VALUES (v_new_draft_id, v_draft.title, 'draft', NOW(), NOW());

    INSERT INTO public.homepage_blocks (layout_id, block_type, zone, sort_order, is_visible, config, created_at, updated_at)
    SELECT v_new_draft_id, block_type, zone, sort_order, is_visible, config, NOW(), NOW()
    FROM public.homepage_blocks
    WHERE layout_id = p_draft_id;

    RETURN jsonb_build_object(
        'success', true,
        'published_id', p_draft_id,
        'published_at', NOW(),
        'published_by', v_caller_uid,
        'new_draft_id', v_new_draft_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_homepage_layout(UUID) TO AUTHENTICATED;

-- 8. SEED INITIAL STARTER HOMEPAGE LAYOUTS (DRAFT & PUBLISHED)
DO $$
DECLARE
    v_published_layout_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
    v_draft_layout_id UUID := '00000000-0000-0000-0000-000000000002'::uuid;
BEGIN
    -- Insert Default Published Layout
    INSERT INTO public.homepage_layouts (id, title, status, published_at)
    VALUES (v_published_layout_id, 'Bố cục trang chủ mặc định (Xuất bản)', 'published', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- Insert Default Draft Layout
    INSERT INTO public.homepage_layouts (id, title, status)
    VALUES (v_draft_layout_id, 'Bố cục trang chủ (Bản nháp)', 'draft')
    ON CONFLICT (id) DO NOTHING;

    -- Seed Blocks for Published Layout
    -- MAIN ZONE (8 columns)
    INSERT INTO public.homepage_blocks (layout_id, block_type, zone, sort_order, is_visible, config)
    VALUES
        (v_published_layout_id, 'featured', 'main', 0, TRUE, '{"title": "Tiêu điểm hoạt động", "variant": "banner", "dataSource": {"module": "news", "query": {"limit": 1}}}'::jsonb),
        (v_published_layout_id, 'news-grid', 'main', 1, TRUE, '{"title": "Tin tức & Hoạt động nổi bật", "presentation": {"columns": 2}, "dataSource": {"module": "news", "query": {"limit": 4}}}'::jsonb),
        (v_published_layout_id, 'spacer', 'main', 2, TRUE, '{"height": "md"}'::jsonb),
        (v_published_layout_id, 'news-list', 'main', 3, TRUE, '{"title": "Tin giáo dục & phong trào thi đua", "presentation": {"showDate": true, "showExcerpt": true}, "dataSource": {"module": "news", "query": {"limit": 5}}}'::jsonb)
    ON CONFLICT DO NOTHING;

    -- RIGHT ZONE (4 columns)
    INSERT INTO public.homepage_blocks (layout_id, block_type, zone, sort_order, is_visible, config)
    VALUES
        (v_published_layout_id, 'announcements', 'right', 0, TRUE, '{"title": "Thông báo điều hành", "presentation": {"maxItems": 4}, "dataSource": {"module": "announcements", "query": {"limit": 4}}}'::jsonb),
        (v_published_layout_id, 'documents', 'right', 1, TRUE, '{"title": "Văn bản & Biểu mẫu mới", "presentation": {"maxItems": 4}, "dataSource": {"module": "documents", "query": {"limit": 4}}}'::jsonb)
    ON CONFLICT DO NOTHING;

    -- Seed Blocks for Draft Layout (Initial identical copy for immediate editing)
    INSERT INTO public.homepage_blocks (layout_id, block_type, zone, sort_order, is_visible, config)
    VALUES
        (v_draft_layout_id, 'featured', 'main', 0, TRUE, '{"title": "Tiêu điểm hoạt động", "variant": "banner", "dataSource": {"module": "news", "query": {"limit": 1}}}'::jsonb),
        (v_draft_layout_id, 'news-grid', 'main', 1, TRUE, '{"title": "Tin tức & Hoạt động nổi bật", "presentation": {"columns": 2}, "dataSource": {"module": "news", "query": {"limit": 4}}}'::jsonb),
        (v_draft_layout_id, 'spacer', 'main', 2, TRUE, '{"height": "md"}'::jsonb),
        (v_draft_layout_id, 'news-list', 'main', 3, TRUE, '{"title": "Tin giáo dục & phong trào thi đua", "presentation": {"showDate": true, "showExcerpt": true}, "dataSource": {"module": "news", "query": {"limit": 5}}}'::jsonb),
        (v_draft_layout_id, 'announcements', 'right', 0, TRUE, '{"title": "Thông báo điều hành", "presentation": {"maxItems": 4}, "dataSource": {"module": "announcements", "query": {"limit": 4}}}'::jsonb),
        (v_draft_layout_id, 'documents', 'right', 1, TRUE, '{"title": "Văn bản & Biểu mẫu mới", "presentation": {"maxItems": 4}, "dataSource": {"module": "documents", "query": {"limit": 4}}}'::jsonb)
    ON CONFLICT DO NOTHING;
END $$;
