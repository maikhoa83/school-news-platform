-- ==============================================================================
-- SCHOOL NEWS PLATFORM - MIGRATION 20260111000000_step07_author_authorization_fix.sql
-- Step 07: Micro-fix S07-F04-R — AUTHOR Cross-User Draft Disclosure
-- 1. Revoke announcements.view permission from AUTHOR role assignment
-- 2. Ensure RLS SELECT policy strictly enforces isolation for drafts/scheduled/expired
-- ==============================================================================

-- 1. REVOKE announcements.view FROM AUTHOR ROLE
-- announcements.view semantically grants global announcement CMS read privileges.
-- AUTHOR should ONLY possess announcements.create for the announcement module,
-- accessing their own drafts via row-level ownership: created_by = auth.uid().
DELETE FROM public.role_permissions
WHERE role_id = (SELECT id FROM public.roles WHERE code = 'AUTHOR')
  AND permission_id = (SELECT id FROM public.permissions WHERE code = 'announcements.view');

-- 2. REVISE / HARDEN SELECT RLS POLICIES FOR ANNOUNCEMENTS
-- 2.1 Public read access: ONLY active published announcements
DROP POLICY IF EXISTS "Public can view active published announcements" ON public.announcements;
CREATE POLICY "Public can view active published announcements"
    ON public.announcements FOR SELECT
    TO PUBLIC
    USING (
        status = 'published'
        AND published_at <= NOW()
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- 2.2 Authenticated view access:
-- - Active published announcements (publicly visible)
-- - OR own records (created_by = auth.uid())
-- - OR global view permission (public.has_permission('announcements.view') -> EDITOR, ADMIN)
-- - OR super admin bypass (public.is_super_admin())
DROP POLICY IF EXISTS "Staff can view announcements" ON public.announcements;
CREATE POLICY "Staff can view announcements"
    ON public.announcements FOR SELECT
    TO AUTHENTICATED
    USING (
        (status = 'published' AND published_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW()))
        OR created_by = auth.uid()
        OR public.has_permission('announcements.view')
        OR public.is_super_admin()
    );
