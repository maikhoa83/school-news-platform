-- ==============================================================================
-- SCHOOL NEWS PLATFORM - MIGRATION 20260102000000_step03_foundation.sql
-- Step 03: Configuration + Setup Foundation
-- Enhancements: Setup State, Module Settings Normalization, Granular RLS & has_permission
-- ==============================================================================

-- 1. NORMALIZE MODULE_SETTINGS (Add id and created_at while preserving module_key PK)
ALTER TABLE public.module_settings
    ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4() UNIQUE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill UUIDs for any existing rows where id might be null
UPDATE public.module_settings
SET id = uuid_generate_v4()
WHERE id IS NULL;

-- 2. SETUP_STATE TABLE (Single-Row Pattern for installation setup tracking & locking)
CREATE TABLE IF NOT EXISTS public.setup_state (
    id TEXT PRIMARY KEY DEFAULT 'current',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    current_step TEXT NOT NULL DEFAULT 'welcome',
    completed_at TIMESTAMPTZ,
    step_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT single_setup_state_row CHECK (id = 'current')
);

-- Seed initial setup_state record if not exists
INSERT INTO public.setup_state (id, is_completed, current_step, step_data)
VALUES ('current', FALSE, 'welcome', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. FUNCTION: public.has_permission(required_permission TEXT)
-- Authoritative security function resolving permissions strictly via auth.uid()
CREATE OR REPLACE FUNCTION public.has_permission(required_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Unauthorized if no active authenticated user session
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Super Admin has global bypass authorization
    IF EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.code = 'SUPER_ADMIN'
    ) THEN
        RETURN TRUE;
    END IF;

    -- Granular permission check: user -> user_roles -> role_permissions -> permissions
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = auth.uid()
          AND p.code = required_permission
    );
END;
$$;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES FOR SETUP_STATE
ALTER TABLE public.setup_state ENABLE ROW LEVEL SECURITY;

-- Allow public read of setup state (needed by public shell & setup guard)
DROP POLICY IF EXISTS "Public read setup_state" ON public.setup_state;
CREATE POLICY "Public read setup_state"
    ON public.setup_state FOR SELECT
    TO PUBLIC
    USING (TRUE);

-- Update allowed while not completed, or by Super Admin
DROP POLICY IF EXISTS "Update setup_state when not completed or super_admin" ON public.setup_state;
CREATE POLICY "Update setup_state when not completed or super_admin"
    ON public.setup_state FOR UPDATE
    USING (is_completed = FALSE OR public.is_super_admin())
    WITH CHECK (is_completed = FALSE OR public.is_super_admin());

-- Insert/Delete restricted to Super Admin
DROP POLICY IF EXISTS "Super admin can manage setup_state" ON public.setup_state;
CREATE POLICY "Super admin can manage setup_state"
    ON public.setup_state FOR ALL
    USING (public.is_super_admin());

-- 5. REVISE POLICIES FOR SITE_SETTINGS & MODULE_SETTINGS
-- Enable users with 'settings.edit' permission or Super Admin to update site settings
DROP POLICY IF EXISTS "Authorized users can update site settings" ON public.site_settings;
CREATE POLICY "Authorized users can update site settings"
    ON public.site_settings FOR UPDATE
    USING (public.has_permission('settings.edit'))
    WITH CHECK (public.has_permission('settings.edit'));

DROP POLICY IF EXISTS "Authorized users can insert site settings" ON public.site_settings;
CREATE POLICY "Authorized users can insert site settings"
    ON public.site_settings FOR INSERT
    WITH CHECK (public.has_permission('settings.edit'));

-- Enable users with 'settings.edit' permission or Super Admin to update module settings
DROP POLICY IF EXISTS "Authorized users can update module settings" ON public.module_settings;
CREATE POLICY "Authorized users can update module settings"
    ON public.module_settings FOR UPDATE
    USING (public.has_permission('settings.edit'))
    WITH CHECK (public.has_permission('settings.edit'));

-- 6. SEED STANDARD 15 MODULE ENTRIES (if missing)
INSERT INTO public.module_settings (module_key, is_enabled, config)
VALUES
    ('news', TRUE, '{}'::jsonb),
    ('categories', TRUE, '{}'::jsonb),
    ('documents', TRUE, '{}'::jsonb),
    ('announcements', TRUE, '{}'::jsonb),
    ('media', TRUE, '{}'::jsonb),
    ('albums', TRUE, '{}'::jsonb),
    ('pages', TRUE, '{}'::jsonb),
    ('menu', TRUE, '{}'::jsonb),
    ('homepage', TRUE, '{}'::jsonb),
    ('users', TRUE, '{}'::jsonb),
    ('roles', TRUE, '{}'::jsonb),
    ('settings', TRUE, '{}'::jsonb),
    ('seo', TRUE, '{}'::jsonb),
    ('audit', TRUE, '{}'::jsonb),
    ('health', TRUE, '{}'::jsonb)
ON CONFLICT (module_key) DO NOTHING;
