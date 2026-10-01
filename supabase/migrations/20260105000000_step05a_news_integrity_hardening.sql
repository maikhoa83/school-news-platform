-- ============================================================
-- STEP 05A: NEWS MODULE DATA INTEGRITY & SECURITY HARDENING
-- 1. Category Hierarchy Cycle Prevention (Self-parent & recursive cycle)
-- 2. Cross-Article Comment Parent Relational Integrity
-- ============================================================

-- ------------------------------------------------------------
-- 1. CATEGORY INTEGRITY: PREVENT SELF-PARENT & HIERARCHY CYCLES
-- ------------------------------------------------------------

-- 1.1 Add CHECK constraint preventing category self-parenting (A -> A)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_news_category_no_self_parent'
    ) THEN
        ALTER TABLE public.news_categories
            ADD CONSTRAINT check_news_category_no_self_parent
            CHECK (parent_id IS NULL OR parent_id <> id);
    END IF;
END $$;

-- 1.2 Function and Trigger to prevent recursive cycles (A -> B -> A, A -> B -> C -> A)
CREATE OR REPLACE FUNCTION public.check_news_category_cycle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    curr_parent UUID;
    visited UUID[] := ARRAY[NEW.id];
BEGIN
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.parent_id = NEW.id THEN
        RAISE EXCEPTION 'Category cannot be its own parent (id: %)', NEW.id;
    END IF;

    curr_parent := NEW.parent_id;
    WHILE curr_parent IS NOT NULL LOOP
        IF curr_parent = NEW.id THEN
            RAISE EXCEPTION 'Category hierarchy cycle detected: category % cannot have descendant % as parent', NEW.id, NEW.parent_id;
        END IF;

        IF curr_parent = ANY(visited) THEN
            RAISE EXCEPTION 'Category hierarchy cycle loop detected in ancestor chain for category %', NEW.id;
        END IF;
        visited := array_append(visited, curr_parent);

        SELECT parent_id INTO curr_parent
        FROM public.news_categories
        WHERE id = curr_parent;
    END LOOP;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_news_category_cycle ON public.news_categories;
CREATE TRIGGER trg_check_news_category_cycle
    BEFORE INSERT OR UPDATE OF parent_id ON public.news_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.check_news_category_cycle();


-- ------------------------------------------------------------
-- 2. COMMENT INTEGRITY: PREVENT CROSS-ARTICLE COMMENT REPLIES
-- ------------------------------------------------------------

-- 2.1 Add UNIQUE constraint on (id, news_id) in news_comments to allow composite FK referencing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'news_comments_id_news_id_unique'
    ) THEN
        ALTER TABLE public.news_comments
            ADD CONSTRAINT news_comments_id_news_id_unique UNIQUE (id, news_id);
    END IF;
END $$;

-- 2.2 Add CHECK constraint preventing comment self-parenting (id = parent_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_news_comment_no_self_parent'
    ) THEN
        ALTER TABLE public.news_comments
            ADD CONSTRAINT check_news_comment_no_self_parent
            CHECK (parent_id IS NULL OR parent_id <> id);
    END IF;
END $$;

-- 2.3 Drop legacy single-column parent FK and replace with composite (parent_id, news_id) FK
DO $$
BEGIN
    -- Drop legacy foreign key if exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'news_comments_parent_id_fkey'
    ) THEN
        ALTER TABLE public.news_comments DROP CONSTRAINT news_comments_parent_id_fkey;
    END IF;

    -- Add composite foreign key constraint: parent comment MUST belong to the same news_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'news_comments_parent_id_news_id_fkey'
    ) THEN
        ALTER TABLE public.news_comments
            ADD CONSTRAINT news_comments_parent_id_news_id_fkey
            FOREIGN KEY (parent_id, news_id)
            REFERENCES public.news_comments(id, news_id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- 2.4 Index for optimized composite parent lookup and join performance
CREATE INDEX IF NOT EXISTS idx_news_comments_parent_news ON public.news_comments(parent_id, news_id);
