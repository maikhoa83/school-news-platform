-- ==============================================================================
-- SCHOOL NEWS PLATFORM - MIGRATION 20260104000000_step05_news_module.sql
-- Step 05: News Module (Categories, Tags, News, Relations, Comments, Full-Text Search)
-- ==============================================================================

-- 1. NEWS_CATEGORIES TABLE (Hierarchical category structure)
CREATE TABLE IF NOT EXISTS public.news_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.news_categories(id) ON DELETE SET NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_categories_slug ON public.news_categories(slug);
CREATE INDEX IF NOT EXISTS idx_news_categories_parent ON public.news_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_news_categories_sort ON public.news_categories(sort_order);

-- 2. NEWS_TAGS TABLE
CREATE TABLE IF NOT EXISTS public.news_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    usage_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_tags_slug ON public.news_tags(slug);
CREATE INDEX IF NOT EXISTS idx_news_tags_usage ON public.news_tags(usage_count DESC);

-- 3. NEWS TABLE
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    thumbnail TEXT,
    category_id UUID NOT NULL REFERENCES public.news_categories(id) ON DELETE RESTRICT,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'archived')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INT NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON public.news(status);
CREATE INDEX IF NOT EXISTS idx_news_category_status ON public.news(category_id, status);
CREATE INDEX IF NOT EXISTS idx_news_author_status ON public.news(author_id, status);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_news_is_featured ON public.news(is_featured) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_news_search_vector ON public.news USING gin(search_vector);

-- 4. NEWS_TAG_RELATIONS (Many-to-Many Table)
CREATE TABLE IF NOT EXISTS public.news_tag_relations (
    news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.news_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (news_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_news_tag_relations_tag ON public.news_tag_relations(tag_id);

-- 5. NEWS_COMMENTS TABLE (Threaded Comments with parent_id)
CREATE TABLE IF NOT EXISTS public.news_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.news_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_comments_news ON public.news_comments(news_id);
CREATE INDEX IF NOT EXISTS idx_news_comments_parent ON public.news_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_news_comments_status ON public.news_comments(status);

-- 6. FULL-TEXT SEARCH TRIGGER & FUNCTION
CREATE OR REPLACE FUNCTION public.news_generate_search_vector()
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

DROP TRIGGER IF EXISTS trg_news_search_vector ON public.news;
CREATE TRIGGER trg_news_search_vector
BEFORE INSERT OR UPDATE OF title, excerpt, content ON public.news
FOR EACH ROW EXECUTE FUNCTION public.news_generate_search_vector();

-- 7. TAG USAGE COUNT SYNCHRONIZATION TRIGGER
CREATE OR REPLACE FUNCTION public.sync_news_tag_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.news_tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.news_tags SET usage_count = GREATEST(0, usage_count - 1) WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_news_tag_usage ON public.news_tag_relations;
CREATE TRIGGER trg_sync_news_tag_usage
AFTER INSERT OR DELETE ON public.news_tag_relations
FOR EACH ROW EXECUTE FUNCTION public.sync_news_tag_usage();

-- 8. RPC: INCREMENT NEWS VIEWS
CREATE OR REPLACE FUNCTION public.increment_news_views(p_news_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.news
    SET view_count = view_count + 1
    WHERE id = p_news_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_news_views(UUID) TO PUBLIC;

-- 9. RPC: ATOMIC PUBLISH NEWS (Requires news.publish permission)
CREATE OR REPLACE FUNCTION public.publish_news_item(p_news_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_uid UUID;
    v_news RECORD;
BEGIN
    -- Permission verification
    IF NOT public.has_permission('news.publish') THEN
        RAISE EXCEPTION 'Forbidden: Requires news.publish permission'
            USING ERRCODE = '42501';
    END IF;

    v_caller_uid := auth.uid();

    SELECT * INTO v_news FROM public.news WHERE id = p_news_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'News item % not found', p_news_id USING ERRCODE = 'P0002';
    END IF;

    UPDATE public.news
    SET status = 'published',
        published_at = COALESCE(published_at, NOW()),
        published_by = v_caller_uid,
        updated_at = NOW()
    WHERE id = p_news_id;

    RETURN jsonb_build_object(
        'success', true,
        'news_id', p_news_id,
        'status', 'published',
        'published_by', v_caller_uid,
        'published_at', NOW()
    );
END;
$$;
GRANT EXECUTE ON FUNCTION public.publish_news_item(UUID) TO AUTHENTICATED;

-- 10. RPC: SERVER-SIDE FULL-TEXT SEARCH
CREATE OR REPLACE FUNCTION public.search_news_fts(
    p_query TEXT,
    p_category_id UUID DEFAULT NULL,
    p_tag_id UUID DEFAULT NULL,
    p_limit INT DEFAULT 12,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    thumbnail TEXT,
    category_id UUID,
    author_id UUID,
    view_count INT,
    published_at TIMESTAMPTZ,
    rank REAL,
    total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_query_tsquery TSQUERY;
BEGIN
    IF p_query IS NOT NULL AND trim(p_query) != '' THEN
        v_query_tsquery := plainto_tsquery('simple', trim(p_query));
    END IF;

    RETURN QUERY
    WITH filtered_items AS (
        SELECT
            n.id,
            n.title,
            n.slug,
            n.excerpt,
            n.thumbnail,
            n.category_id,
            n.author_id,
            n.view_count,
            n.published_at,
            CASE
                WHEN v_query_tsquery IS NOT NULL THEN ts_rank_cd(n.search_vector, v_query_tsquery)
                ELSE 0.0::REAL
            END AS rank,
            COUNT(*) OVER() AS total_count
        FROM public.news n
        WHERE n.status = 'published'
          AND (p_category_id IS NULL OR n.category_id = p_category_id)
          AND (p_tag_id IS NULL OR EXISTS (
              SELECT 1 FROM public.news_tag_relations ntr
              WHERE ntr.news_id = n.id AND ntr.tag_id = p_tag_id
          ))
          AND (
              v_query_tsquery IS NULL
              OR n.search_vector @@ v_query_tsquery
              OR n.title ILIKE '%' || p_query || '%'
          )
    )
    SELECT *
    FROM filtered_items
    ORDER BY
        CASE WHEN v_query_tsquery IS NOT NULL THEN rank END DESC NULLS LAST,
        published_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
GRANT EXECUTE ON FUNCTION public.search_news_fts(TEXT, UUID, UUID, INT, INT) TO PUBLIC;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;

-- 11. CATEGORIES RLS
DROP POLICY IF EXISTS "Public can view active categories" ON public.news_categories;
CREATE POLICY "Public can view active categories"
    ON public.news_categories FOR SELECT
    TO PUBLIC
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Staff with news.view can view all categories" ON public.news_categories;
CREATE POLICY "Staff with news.view can view all categories"
    ON public.news_categories FOR SELECT
    TO AUTHENTICATED
    USING (public.has_permission('news.view') OR public.has_permission('news.manage_categories'));

DROP POLICY IF EXISTS "Staff with manage_categories can insert categories" ON public.news_categories;
CREATE POLICY "Staff with manage_categories can insert categories"
    ON public.news_categories FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (public.has_permission('news.manage_categories'));

DROP POLICY IF EXISTS "Staff with manage_categories can update categories" ON public.news_categories;
CREATE POLICY "Staff with manage_categories can update categories"
    ON public.news_categories FOR UPDATE
    TO AUTHENTICATED
    USING (public.has_permission('news.manage_categories'))
    WITH CHECK (public.has_permission('news.manage_categories'));

DROP POLICY IF EXISTS "Staff with manage_categories can delete categories" ON public.news_categories;
CREATE POLICY "Staff with manage_categories can delete categories"
    ON public.news_categories FOR DELETE
    TO AUTHENTICATED
    USING (public.has_permission('news.manage_categories'));

-- 12. TAGS RLS
DROP POLICY IF EXISTS "Public can view tags" ON public.news_tags;
CREATE POLICY "Public can view tags"
    ON public.news_tags FOR SELECT
    TO PUBLIC
    USING (TRUE);

DROP POLICY IF EXISTS "Staff can insert tags" ON public.news_tags;
CREATE POLICY "Staff can insert tags"
    ON public.news_tags FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (public.has_permission('news.manage_tags') OR public.has_permission('news.create'));

DROP POLICY IF EXISTS "Staff can update tags" ON public.news_tags;
CREATE POLICY "Staff can update tags"
    ON public.news_tags FOR UPDATE
    TO AUTHENTICATED
    USING (public.has_permission('news.manage_tags'))
    WITH CHECK (public.has_permission('news.manage_tags'));

DROP POLICY IF EXISTS "Staff can delete tags" ON public.news_tags;
CREATE POLICY "Staff can delete tags"
    ON public.news_tags FOR DELETE
    TO AUTHENTICATED
    USING (public.has_permission('news.manage_tags'));

-- 13. NEWS RLS
DROP POLICY IF EXISTS "Public can view published news" ON public.news;
CREATE POLICY "Public can view published news"
    ON public.news FOR SELECT
    TO PUBLIC
    USING (status = 'published');

DROP POLICY IF EXISTS "Staff view news" ON public.news;
CREATE POLICY "Staff view news"
    ON public.news FOR SELECT
    TO AUTHENTICATED
    USING (
        status = 'published'
        OR author_id = auth.uid()
        OR public.has_permission('news.view')
    );

DROP POLICY IF EXISTS "Authors can insert draft or pending news" ON public.news;
CREATE POLICY "Authors can insert draft or pending news"
    ON public.news FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
        public.has_permission('news.create')
        AND author_id = auth.uid()
        AND (
            status IN ('draft', 'pending')
            OR (status = 'published' AND public.has_permission('news.publish'))
        )
    );

DROP POLICY IF EXISTS "Authors can update own draft news" ON public.news;
CREATE POLICY "Authors can update own draft news"
    ON public.news FOR UPDATE
    TO AUTHENTICATED
    USING (
        (
            author_id = auth.uid()
            AND status IN ('draft', 'pending')
            AND (public.has_permission('news.edit_own') OR public.has_permission('news.create'))
        )
        OR public.has_permission('news.edit')
    )
    WITH CHECK (
        (
            -- Author updating own draft/pending: cannot directly publish unless having news.publish
            author_id = auth.uid()
            AND (
                (status IN ('draft', 'pending'))
                OR (status = 'published' AND public.has_permission('news.publish'))
            )
        )
        OR (
            public.has_permission('news.edit')
            AND (
                status IN ('draft', 'pending', 'archived')
                OR (status = 'published' AND public.has_permission('news.publish'))
            )
        )
    );

DROP POLICY IF EXISTS "Staff can delete news" ON public.news;
CREATE POLICY "Staff can delete news"
    ON public.news FOR DELETE
    TO AUTHENTICATED
    USING (
        public.has_permission('news.delete')
        OR (
            author_id = auth.uid()
            AND status = 'draft'
            AND public.has_permission('news.edit_own')
        )
    );

-- 14. NEWS_TAG_RELATIONS RLS
DROP POLICY IF EXISTS "Public can view tag relations" ON public.news_tag_relations;
CREATE POLICY "Public can view tag relations"
    ON public.news_tag_relations FOR SELECT
    TO PUBLIC
    USING (TRUE);

DROP POLICY IF EXISTS "Staff can manage tag relations" ON public.news_tag_relations;
CREATE POLICY "Staff can manage tag relations"
    ON public.news_tag_relations FOR ALL
    TO AUTHENTICATED
    USING (
        EXISTS (
            SELECT 1 FROM public.news n
            WHERE n.id = news_tag_relations.news_id
              AND (
                  n.author_id = auth.uid()
                  OR public.has_permission('news.edit')
              )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.news n
            WHERE n.id = news_tag_relations.news_id
              AND (
                  n.author_id = auth.uid()
                  OR public.has_permission('news.edit')
              )
        )
    );

-- 15. COMMENTS RLS
DROP POLICY IF EXISTS "Public can view approved comments" ON public.news_comments;
CREATE POLICY "Public can view approved comments"
    ON public.news_comments FOR SELECT
    TO PUBLIC
    USING (status = 'approved');

DROP POLICY IF EXISTS "Staff can view all comments" ON public.news_comments;
CREATE POLICY "Staff can view all comments"
    ON public.news_comments FOR SELECT
    TO AUTHENTICATED
    USING (
        status = 'approved'
        OR author_id = auth.uid()
        OR public.has_permission('news.manage_comments')
    );

DROP POLICY IF EXISTS "Authenticated users can post comments" ON public.news_comments;
CREATE POLICY "Authenticated users can post comments"
    ON public.news_comments FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
        auth.uid() = author_id
        -- New comment default status must be approved or pending
        AND status IN ('approved', 'pending')
    );

DROP POLICY IF EXISTS "Moderators can update comments" ON public.news_comments;
CREATE POLICY "Moderators can update comments"
    ON public.news_comments FOR UPDATE
    TO AUTHENTICATED
    USING (public.has_permission('news.manage_comments'))
    WITH CHECK (public.has_permission('news.manage_comments'));

DROP POLICY IF EXISTS "Moderators or authors can delete comments" ON public.news_comments;
CREATE POLICY "Moderators or authors can delete comments"
    ON public.news_comments FOR DELETE
    TO AUTHENTICATED
    USING (
        author_id = auth.uid()
        OR public.has_permission('news.manage_comments')
    );

-- 16. SEED ESSENTIAL PERMISSIONS
INSERT INTO public.permissions (code, resource, action, description)
VALUES
    ('news.manage_categories', 'news', 'manage_categories', 'Quản trị danh mục chuyên mục tin tức'),
    ('news.manage_tags', 'news', 'manage_tags', 'Quản trị hệ thống thẻ tag tin tức'),
    ('news.manage_comments', 'news', 'manage_comments', 'Kiểm duyệt và quản lý bình luận tin tức')
ON CONFLICT (code) DO NOTHING;

-- Grant newly seeded permissions to ADMIN and SUPER_ADMIN roles
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code IN ('ADMIN', 'SUPER_ADMIN')
  AND p.code IN ('news.manage_categories', 'news.manage_tags', 'news.manage_comments')
ON CONFLICT DO NOTHING;

-- Grant news.submit to AUTHOR role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code = 'news.submit'
WHERE r.code = 'AUTHOR'
ON CONFLICT DO NOTHING;
