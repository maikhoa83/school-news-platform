-- ==============================================================================
-- SCHOOL NEWS PLATFORM - MIGRATION 20260110000000_step07_security_integrity_fix.sql
-- Step 07: Security & Data Integrity Hardening for Announcements Module
-- 1. Automatic authenticated identity trigger for created_by and published_by
-- 2. Prevent client forgery of created_by / published_by / created_at
-- 3. Hardened RLS policies for Author ownership lifecycle and publish privileges
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. AUDIT & IDENTITY ENFORCEMENT FUNCTION & TRIGGER
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_announcements_audit_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_auth_uid UUID;
BEGIN
    current_auth_uid := auth.uid();

    -- 1.1 INSERT LIFECYCLE
    IF TG_OP = 'INSERT' THEN
        -- Strictly enforce created_by to authenticated user identity if logged in
        IF current_auth_uid IS NOT NULL THEN
            NEW.created_by := current_auth_uid;
        END IF;

        -- Handle published state on insertion
        IF NEW.status = 'published' THEN
            IF current_auth_uid IS NOT NULL THEN
                NEW.published_by := current_auth_uid;
            END IF;
            IF NEW.published_at IS NULL THEN
                NEW.published_at := NOW();
            END IF;
        ELSE
            -- Drafts must not have published_by
            NEW.published_by := NULL;
        END IF;

        NEW.created_at := COALESCE(NEW.created_at, NOW());
        NEW.updated_at := NOW();

        RETURN NEW;
    END IF;

    -- 1.2 UPDATE LIFECYCLE
    IF TG_OP = 'UPDATE' THEN
        -- Prevent client forgery: created_by and created_at can NEVER be altered
        NEW.created_by := OLD.created_by;
        NEW.created_at := OLD.created_at;

        -- Transitioning from draft to published
        IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published' OR OLD.published_by IS NULL) THEN
            IF current_auth_uid IS NOT NULL THEN
                NEW.published_by := current_auth_uid;
            END IF;
            IF NEW.published_at IS NULL THEN
                NEW.published_at := NOW();
            END IF;
        -- Transitioning back to draft (unpublish)
        ELSIF NEW.status = 'draft' THEN
            NEW.published_by := NULL;
        -- Maintaining published status
        ELSE
            -- Preserve original publisher unless explicitly updated by authorized editor
            IF current_auth_uid IS NOT NULL AND NEW.published_by IS DISTINCT FROM OLD.published_by THEN
                NEW.published_by := OLD.published_by;
            END IF;
        END IF;

        NEW.updated_at := NOW();

        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_announcements_audit_fields ON public.announcements;
CREATE TRIGGER trg_announcements_audit_fields
    BEFORE INSERT OR UPDATE ON public.announcements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_announcements_audit_fields();


-- ------------------------------------------------------------------------------
-- 2. HARDENED ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Ensure RLS is active
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 2.1 Public read access: ONLY active published announcements
-- Public cannot view drafts, future scheduled, or expired announcements
DROP POLICY IF EXISTS "Public can view active published announcements" ON public.announcements;
CREATE POLICY "Public can view active published announcements"
    ON public.announcements FOR SELECT
    TO PUBLIC
    USING (
        status = 'published'
        AND published_at <= NOW()
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- 2.2 Authenticated staff view access
-- Staff can view published items, announcements they created, or all if they have announcements.view
DROP POLICY IF EXISTS "Staff can view announcements" ON public.announcements;
CREATE POLICY "Staff can view announcements"
    ON public.announcements FOR SELECT
    TO AUTHENTICATED
    USING (
        (status = 'published' AND published_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW()))
        OR public.has_permission('announcements.view')
        OR created_by = auth.uid()
    );

-- 2.3 Authenticated staff insert access
-- User must have announcements.create permission.
-- Can only insert as draft unless they also have announcements.publish permission.
DROP POLICY IF EXISTS "Staff can insert announcements" ON public.announcements;
CREATE POLICY "Staff can insert announcements"
    ON public.announcements FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
        public.has_permission('announcements.create')
        AND (
            status = 'draft'
            OR (status = 'published' AND public.has_permission('announcements.publish'))
        )
    );

-- 2.4 Authenticated staff update access
-- Super Admin or users with announcements.edit can edit any announcement.
-- Authors (created_by = auth.uid()) without announcements.edit can ONLY edit their own DRAFTS,
-- and cannot transition their draft to published without announcements.publish.
DROP POLICY IF EXISTS "Staff can update announcements" ON public.announcements;
CREATE POLICY "Staff can update announcements"
    ON public.announcements FOR UPDATE
    TO AUTHENTICATED
    USING (
        public.is_super_admin()
        OR public.has_permission('announcements.edit')
        OR (created_by = auth.uid() AND status = 'draft')
    )
    WITH CHECK (
        public.is_super_admin()
        OR (
            public.has_permission('announcements.edit')
            AND (
                status = 'draft'
                OR (status = 'published' AND public.has_permission('announcements.publish'))
            )
        )
        OR (
            created_by = auth.uid()
            AND status = 'draft'
        )
    );

-- 2.5 Authenticated staff delete access
-- Users with announcements.delete can delete announcements.
-- Authors without announcements.delete can ONLY delete their own DRAFTS.
DROP POLICY IF EXISTS "Staff can delete announcements" ON public.announcements;
CREATE POLICY "Staff can delete announcements"
    ON public.announcements FOR DELETE
    TO AUTHENTICATED
    USING (
        public.is_super_admin()
        OR public.has_permission('announcements.delete')
        OR (created_by = auth.uid() AND status = 'draft')
    );
